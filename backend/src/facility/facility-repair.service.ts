import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, In } from 'typeorm';
import { FacilityRepair } from '../entities/facility-repair.entity';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import { FacilityDevice } from '../entities/facility-device.entity';
import {
  CreateFacilityRepairDto,
  UpdateFacilityRepairDto,
  RepairListQueryDto,
} from '../common/dto/facility-repair.dto';

@Injectable()
export class FacilityRepairService {
  constructor(
    @InjectRepository(FacilityRepair)
    private repairRepository: Repository<FacilityRepair>,
    @InjectRepository(FacilityDeviceItem)
    private deviceItemRepository: Repository<FacilityDeviceItem>,
    @InjectRepository(FacilityDevice)
    private facilityDeviceRepository: Repository<FacilityDevice>,
    private dataSource: DataSource,
  ) {}

  /**
   * 수리 목록 조회 (필터링 지원)
   */
  async findAll(
    facilityId: number,
    query: RepairListQueryDto,
  ): Promise<FacilityRepair[]> {
    const queryBuilder = this.repairRepository
      .createQueryBuilder('repair')
      .leftJoinAndSelect('repair.deviceItem', 'deviceItem')
      .where('repair.facilityId = :facilityId', { facilityId })
      .orderBy('repair.repairStartDate', 'DESC');

    // 상태 필터
    if (query.status) {
      queryBuilder.andWhere('repair.status = :status', {
        status: query.status,
      });
    }

    // 날짜 범위 필터
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere(
        'repair.repairStartDate BETWEEN :startDate AND :endDate',
        {
          startDate: query.startDate,
          endDate: query.endDate,
        },
      );
    }

    // 장비 코드 검색
    if (query.search) {
      queryBuilder.andWhere('deviceItem.deviceCode LIKE :search', {
        search: `%${query.search}%`,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * 수리 상세 조회
   */
  async findOne(id: number, facilityId: number): Promise<FacilityRepair> {
    const repair = await this.repairRepository.findOne({
      where: { id, facilityId },
      relations: ['deviceItem'],
    });

    if (!repair) {
      throw new NotFoundException('수리 정보를 찾을 수 없습니다.');
    }

    return repair;
  }

  /**
   * 고장신고 등록 (신고접수 상태로 생성)
   */
  async create(
    facilityId: number,
    createDto: CreateFacilityRepairDto,
  ): Promise<FacilityRepair> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 장비 아이템 조회 및 검증
      const deviceItem = await queryRunner.manager.findOne(FacilityDeviceItem, {
        where: { id: createDto.facilityDeviceItemId },
      });

      if (!deviceItem) {
        throw new NotFoundException('장비 아이템을 찾을 수 없습니다.');
      }

      if (deviceItem.facilityId !== facilityId) {
        throw new BadRequestException('해당 시설의 장비가 아닙니다.');
      }

      if (deviceItem.deviceType !== createDto.deviceType) {
        throw new BadRequestException('선택한 기기 종류와 실제 기기가 일치하지 않습니다.');
      }

      // 이미 수리중/신고접수인 경우 확인
      const existingRepair = await queryRunner.manager.findOne(
        FacilityRepair,
        {
          where: {
            deviceItemId: deviceItem.id,
            status: In(['신고접수', '수리중']),
          },
        },
      );

      if (existingRepair) {
        throw new BadRequestException('이미 신고되었거나 수리 중인 장비입니다.');
      }

      // 2. 고장신고 레코드 생성 (신고접수 상태)
      const repair = queryRunner.manager.create(FacilityRepair, {
        facilityId,
        deviceItemId: createDto.facilityDeviceItemId,
        deviceType: createDto.deviceType,
        repairStartDate: new Date(), // 신고 접수일
        status: '신고접수',
        issueDescription: createDto.symptomDescription,
      });

      const savedRepair = await queryRunner.manager.save(repair);

      // 3. 장비 아이템 상태를 'broken'으로 변경
      deviceItem.status = 'broken';
      await queryRunner.manager.save(deviceItem);

      await queryRunner.commitTransaction();

      return this.findOne(savedRepair.id, facilityId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 고장신고 수정 (상태 변경 및 수리 메모)
   */
  async update(
    id: number,
    facilityId: number,
    updateDto: UpdateFacilityRepairDto,
  ): Promise<FacilityRepair> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repair = await queryRunner.manager.findOne(FacilityRepair, {
        where: { id, facilityId },
        relations: ['deviceItem'],
      });

      if (!repair) {
        throw new NotFoundException('고장신고 정보를 찾을 수 없습니다.');
      }

      const previousStatus = repair.status;

      // 상태 변경
      if (updateDto.repairStatus !== undefined) {
        repair.status = updateDto.repairStatus;

        // 상태가 '수리완료'로 변경되는 경우 완료일 자동 설정
        if (updateDto.repairStatus === '수리완료' && !repair.repairEndDate) {
          repair.repairEndDate = new Date();
        }
      }

      // 수리 메모 추가/수정
      if (updateDto.repairMemo !== undefined) {
        repair.repairNotes = updateDto.repairMemo;
      }

      await queryRunner.manager.save(repair);

      // 상태 변경에 따른 장비 상태 업데이트
      const deviceItem = repair.deviceItem;

      // 신고접수 또는 수리중 → 수리완료
      if ((previousStatus === '신고접수' || previousStatus === '수리중') && repair.status === '수리완료') {
        deviceItem.status = 'available';
        await queryRunner.manager.save(deviceItem);
      }
      // 수리완료 → 신고접수 또는 수리중
      else if (previousStatus === '수리완료' && (repair.status === '신고접수' || repair.status === '수리중')) {
        deviceItem.status = 'broken';
        await queryRunner.manager.save(deviceItem);
      }

      await queryRunner.commitTransaction();

      return this.findOne(id, facilityId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }


  /**
   * 고장신고 삭제
   */
  async remove(id: number, facilityId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repair = await queryRunner.manager.findOne(FacilityRepair, {
        where: { id, facilityId },
        relations: ['deviceItem'],
      });

      if (!repair) {
        throw new NotFoundException('고장신고 정보를 찾을 수 없습니다.');
      }

      // 신고접수 또는 수리중인 경우 장비 상태 복구
      if (repair.status === '신고접수' || repair.status === '수리중') {
        const deviceItem = repair.deviceItem;

        // 장비 아이템 상태를 'available'로 변경
        deviceItem.status = 'available';
        await queryRunner.manager.save(deviceItem);
      }

      // 고장신고 레코드 삭제
      await queryRunner.manager.remove(repair);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 신고접수 항목 조회
   */
  async getReportedRepairs(facilityId: number): Promise<FacilityRepair[]> {
    return this.repairRepository.find({
      where: {
        facilityId,
        status: '신고접수',
      },
      relations: ['deviceItem'],
      order: {
        repairStartDate: 'DESC',
      },
    });
  }

  /**
   * 수리중인 항목 조회
   */
  async getRepairsInProgress(facilityId: number): Promise<FacilityRepair[]> {
    return this.repairRepository.find({
      where: {
        facilityId,
        status: '수리중',
      },
      relations: ['deviceItem'],
      order: {
        repairStartDate: 'ASC',
      },
    });
  }

  /**
   * 완료된 수리 조회
   */
  async getCompletedRepairs(facilityId: number): Promise<FacilityRepair[]> {
    return this.repairRepository.find({
      where: {
        facilityId,
        status: '수리완료',
      },
      relations: ['deviceItem'],
      order: {
        repairEndDate: 'DESC',
      },
      take: 50, // 최근 50건만
    });
  }
}
