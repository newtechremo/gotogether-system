import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Facility } from '../entities/facility.entity';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
} from '../common/dto/facility.dto';
import {
  FacilityProfileResponseDto,
  UpdateFacilityProfileDto,
  ChangeFacilityPasswordDto,
} from '../common/dto/facility-profile.dto';
import {
  ResetFacilityPasswordDto,
  ResetFacilityPasswordResponseDto,
} from '../common/dto/reset-facility-password.dto';
import { generateSecurePassword } from '../common/utils/password-generator';

@Injectable()
export class FacilityService {
  constructor(
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
  ) {}

  /**
   * 시설 목록 조회 (페이지네이션)
   */
  async findAll(page: number = 1, limit: number = 10, search?: string) {
    const queryBuilder = this.facilityRepository.createQueryBuilder('facility');

    // 검색 조건
    if (search) {
      queryBuilder.where(
        'facility.facilityName LIKE :search OR facility.facilityCode LIKE :search OR facility.managerName LIKE :search',
        { search: `%${search}%` },
      );
    }

    // 삭제되지 않은 항목만
    queryBuilder.andWhere('facility.isActive = :isActive', { isActive: true });

    // 페이지네이션
    const [items, total] = await queryBuilder
      .orderBy('facility.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      items: items.map((facility) => this.excludePassword(facility)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 시설 상세 조회
   */
  async findOne(id: number) {
    const facility = await this.facilityRepository.findOne({
      where: { id, isActive: true },
      relations: ['creator'],
    });

    if (!facility) {
      throw new NotFoundException(`시설을 찾을 수 없습니다. ID: ${id}`);
    }

    return this.excludePassword(facility);
  }

  /**
   * 시설 생성
   */
  async create(createFacilityDto: CreateFacilityDto, createdBy: number) {
    // 시설 코드 중복 체크
    const existingByCode = await this.facilityRepository.findOne({
      where: { facilityCode: createFacilityDto.facilityCode },
    });
    if (existingByCode) {
      throw new ConflictException('이미 존재하는 시설 코드입니다.');
    }

    // 사용자명 중복 체크
    const existingByUsername = await this.facilityRepository.findOne({
      where: { username: createFacilityDto.username },
    });
    if (existingByUsername) {
      throw new ConflictException('이미 사용 중인 아이디입니다.');
    }

    // 비밀번호 해싱
    const hashedPassword = await bcrypt.hash(createFacilityDto.password, 10);

    // 시설 생성
    const facility = this.facilityRepository.create({
      ...createFacilityDto,
      password: hashedPassword,
      createdBy,
    });

    const savedFacility = await this.facilityRepository.save(facility);
    return this.excludePassword(savedFacility);
  }

  /**
   * 시설 수정
   */
  async update(id: number, updateFacilityDto: UpdateFacilityDto) {
    const facility = await this.facilityRepository.findOne({
      where: { id, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException(`시설을 찾을 수 없습니다. ID: ${id}`);
    }

    // 시설 코드 중복 체크 (다른 시설과)
    if (
      updateFacilityDto.facilityCode &&
      updateFacilityDto.facilityCode !== facility.facilityCode
    ) {
      const existingByCode = await this.facilityRepository.findOne({
        where: { facilityCode: updateFacilityDto.facilityCode },
      });
      if (existingByCode && existingByCode.id !== id) {
        throw new ConflictException('이미 존재하는 시설 코드입니다.');
      }
    }

    // 사용자명 중복 체크 (다른 시설과)
    if (
      updateFacilityDto.username &&
      updateFacilityDto.username !== facility.username
    ) {
      const existingByUsername = await this.facilityRepository.findOne({
        where: { username: updateFacilityDto.username },
      });
      if (existingByUsername && existingByUsername.id !== id) {
        throw new ConflictException('이미 사용 중인 아이디입니다.');
      }
    }

    // 비밀번호가 제공되면 해싱
    if (updateFacilityDto.password) {
      updateFacilityDto.password = await bcrypt.hash(
        updateFacilityDto.password,
        10,
      );
    }

    // 업데이트
    Object.assign(facility, updateFacilityDto);
    const updated = await this.facilityRepository.save(facility);

    return this.excludePassword(updated);
  }

  /**
   * 시설 소프트 삭제
   */
  async remove(id: number) {
    const facility = await this.facilityRepository.findOne({
      where: { id, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException(`시설을 찾을 수 없습니다. ID: ${id}`);
    }

    // 소프트 삭제 (isActive를 false로 변경)
    facility.isActive = false;
    await this.facilityRepository.save(facility);

    return { message: '시설이 삭제되었습니다.' };
  }

  /**
   * 비밀번호 필드 제외
   */
  private excludePassword(facility: Facility): Partial<Facility> {
    const { password, ...result } = facility;
    return result;
  }

  /**
   * 시설관리자 본인 프로필 조회
   */
  async getProfile(facilityId: number): Promise<FacilityProfileResponseDto> {
    const facility = await this.facilityRepository.findOne({
      where: { id: facilityId, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException('시설 정보를 찾을 수 없습니다.');
    }

    return {
      id: facility.id,
      facilityCode: facility.facilityCode,
      facilityName: facility.facilityName,
      username: facility.username,
      managerName: facility.managerName,
      managerPhone: facility.managerPhone,
      address: facility.address,
      createdAt: facility.createdAt,
      updatedAt: facility.updatedAt,
    };
  }

  /**
   * 시설관리자 본인 프로필 수정
   */
  async updateProfile(
    facilityId: number,
    updateProfileDto: UpdateFacilityProfileDto,
  ): Promise<FacilityProfileResponseDto> {
    const facility = await this.facilityRepository.findOne({
      where: { id: facilityId, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException('시설 정보를 찾을 수 없습니다.');
    }

    // 업데이트 가능한 필드만 수정
    if (updateProfileDto.managerName !== undefined) {
      facility.managerName = updateProfileDto.managerName;
    }
    if (updateProfileDto.managerPhone !== undefined) {
      facility.managerPhone = updateProfileDto.managerPhone;
    }
    if (updateProfileDto.address !== undefined) {
      facility.address = updateProfileDto.address;
    }

    const updated = await this.facilityRepository.save(facility);

    return this.getProfile(updated.id);
  }

  /**
   * 시설관리자 비밀번호 변경
   */
  async changePassword(
    facilityId: number,
    changePasswordDto: ChangeFacilityPasswordDto,
  ): Promise<{ message: string }> {
    const facility = await this.facilityRepository.findOne({
      where: { id: facilityId, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException('시설 정보를 찾을 수 없습니다.');
    }

    // 현재 비밀번호 확인
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      facility.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('현재 비밀번호가 일치하지 않습니다.');
    }

    // 새 비밀번호와 확인 비밀번호 일치 확인
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new BadRequestException(
        '새 비밀번호와 확인 비밀번호가 일치하지 않습니다.',
      );
    }

    // 현재 비밀번호와 새 비밀번호가 같은지 확인
    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        '현재 비밀번호와 새 비밀번호가 동일합니다.',
      );
    }

    // 새 비밀번호 해싱 및 저장
    facility.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    await this.facilityRepository.save(facility);

    return { message: '비밀번호가 성공적으로 변경되었습니다.' };
  }

  /**
   * 전체관리자용: 시설 비밀번호 재설정
   */
  async resetPassword(
    facilityId: number,
    resetPasswordDto: ResetFacilityPasswordDto,
  ): Promise<ResetFacilityPasswordResponseDto> {
    const facility = await this.facilityRepository.findOne({
      where: { id: facilityId, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException('시설 정보를 찾을 수 없습니다.');
    }

    let newPassword: string;

    // 자동 생성 또는 직접 입력
    if (resetPasswordDto.autoGenerate) {
      newPassword = generateSecurePassword(12);
    } else {
      if (!resetPasswordDto.newPassword) {
        throw new BadRequestException(
          '새 비밀번호를 입력하거나 자동 생성을 선택해주세요.',
        );
      }
      newPassword = resetPasswordDto.newPassword;
    }

    // 비밀번호 해싱 및 저장
    facility.password = await bcrypt.hash(newPassword, 10);
    await this.facilityRepository.save(facility);

    return {
      newPassword,
      message:
        '비밀번호가 재설정되었습니다. 이 비밀번호는 다시 표시되지 않습니다.',
    };
  }
}
