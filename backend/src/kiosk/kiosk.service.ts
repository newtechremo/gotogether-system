import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import {
  KioskDevice,
  KioskDeviceStatus,
} from '../entities/kiosk-device.entity';
import {
  KioskRental,
  KioskRentalStatus,
} from '../entities/kiosk-rental.entity';
import { Kiosk } from './entities/kiosk.entity';
import { KioskExamination } from './entities/kiosk-examination.entity';
import { CreateKioskDto } from './dto/create-kiosk.dto';
import { UpdateKioskDto } from './dto/update-kiosk.dto';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';

@Injectable()
export class KioskService {
  constructor(
    @InjectRepository(Kiosk)
    private kioskRepository: Repository<Kiosk>,
    @InjectRepository(KioskExamination)
    private kioskExaminationRepository: Repository<KioskExamination>,
    @InjectRepository(KioskDevice)
    private kioskDeviceRepository: Repository<KioskDevice>,
    @InjectRepository(KioskRental)
    private kioskRentalRepository: Repository<KioskRental>,
  ) {}

  // NOTE: Old facility-based methods removed - kiosks and facilities are now completely separate
  // For kiosk location management, use getAllKiosks(), getKioskDetail(), createKioskLocation(), etc.
  // For rental management, use getCurrentRentals(), getOverdueRentals(), forceReturn() below

  /**
   * 현재 대여 중인 목록 조회
   */
  async getCurrentRentals() {
    const rentals = await this.kioskRentalRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.device', 'device')
      .leftJoinAndSelect('rental.kiosk', 'kiosk')
      .where('rental.status = :status', { status: KioskRentalStatus.RENTED })
      .orderBy('rental.rentalDatetime', 'DESC')
      .getMany();

    return rentals.map((rental) => ({
      id: rental.id,
      rentalNumber: rental.rentalNumber,
      deviceId: rental.deviceId,
      deviceSerial: rental.device?.serialNumber,
      deviceType: rental.device?.deviceType,
      boxNumber: rental.device?.boxNumber,
      kioskId: rental.kioskId,
      kioskName: rental.kiosk?.name,
      kioskLocation: rental.kiosk?.location,
      renterName: rental.renterName,
      renterPhone: this.maskPhoneNumber(rental.renterPhone),
      rentalDatetime: rental.rentalDatetime,
      expectedReturnDatetime: rental.expectedReturnDatetime,
      status: rental.status,
      notes: rental.notes,
    }));
  }

  /**
   * 연체된 대여 목록 조회
   */
  async getOverdueRentals() {
    const now = new Date();
    const rentals = await this.kioskRentalRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.device', 'device')
      .leftJoinAndSelect('rental.kiosk', 'kiosk')
      .where('rental.status = :status', { status: KioskRentalStatus.OVERDUE })
      .orWhere(
        '(rental.status = :rentedStatus AND rental.expectedReturnDatetime < :now)',
        { rentedStatus: KioskRentalStatus.RENTED, now },
      )
      .orderBy('rental.expectedReturnDatetime', 'ASC')
      .getMany();

    return rentals.map((rental) => {
      const hoursOverdue = Math.floor(
        (now.getTime() - new Date(rental.expectedReturnDatetime).getTime()) /
          (1000 * 60 * 60),
      );

      let severity: 'warning' | 'critical' | 'urgent';
      if (hoursOverdue >= 72) {
        severity = 'urgent';
      } else if (hoursOverdue >= 48) {
        severity = 'critical';
      } else {
        severity = 'warning';
      }

      return {
        id: rental.id,
        rentalNumber: rental.rentalNumber,
        deviceId: rental.deviceId,
        deviceSerial: rental.device?.serialNumber,
        deviceType: rental.device?.deviceType,
        boxNumber: rental.device?.boxNumber,
        kioskId: rental.kioskId,
        kioskName: rental.kiosk?.name,
        kioskLocation: rental.kiosk?.location,
        renterName: rental.renterName,
        renterPhone: this.maskPhoneNumber(rental.renterPhone),
        renterPhoneUnmasked: rental.renterPhone, // 연락용
        rentalDatetime: rental.rentalDatetime,
        expectedReturnDatetime: rental.expectedReturnDatetime,
        hoursOverdue,
        severity,
        status: rental.status,
        notes: rental.notes,
      };
    });
  }

  /**
   * 강제 반납 처리
   */
  async forceReturn(id: number) {
    const rental = await this.kioskRentalRepository.findOne({
      where: { id },
      relations: ['device'],
    });

    if (!rental) {
      throw new NotFoundException(`대여 기록을 찾을 수 없습니다. ID: ${id}`);
    }

    if (rental.status === KioskRentalStatus.RETURNED) {
      throw new BadRequestException('이미 반납 처리된 대여 기록입니다.');
    }

    // 반납 처리
    rental.actualReturnDatetime = new Date();
    rental.status = KioskRentalStatus.RETURNED;
    await this.kioskRentalRepository.save(rental);

    // 장비 상태 업데이트
    if (rental.device) {
      rental.device.status = KioskDeviceStatus.AVAILABLE;
      await this.kioskDeviceRepository.save(rental.device);
    }

    return {
      id: rental.id,
      rentalNumber: rental.rentalNumber,
      deviceId: rental.deviceId,
      actualReturnDatetime: rental.actualReturnDatetime,
      status: rental.status,
      message: '강제 반납이 처리되었습니다.',
    };
  }

  // ================== 키오스크 관리 메서드 ==================

  /**
   * 키오스크 목록 조회 (소프트 삭제 제외)
   * @param page 페이지 번호
   * @param limit 페이지당 항목 수
   * @param date 조회 날짜 (YYYY-MM-DD 형식, 미지정 시 현재 날짜)
   */
  async getAllKiosks(page: number = 1, limit: number = 10, date?: string) {
    const queryBuilder = this.kioskRepository
      .createQueryBuilder('kiosk')
      .leftJoinAndSelect('kiosk.devices', 'devices')
      .leftJoinAndSelect('kiosk.examinations', 'examinations')
      .where('kiosk.deletedAt IS NULL');

    const [items, total] = await queryBuilder
      .orderBy('kiosk.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    // 특정 날짜의 대여 상태를 조회하는 경우
    let targetDate: Date | null = null;
    if (date) {
      targetDate = new Date(date);
      targetDate.setHours(23, 59, 59, 999); // 해당 날짜의 끝 시점
    }

    // 각 키오스크의 장비별 대여 상태 계산
    const itemsWithRentalStatus = await Promise.all(
      items.map(async (kiosk) => {
        if (kiosk.devices && kiosk.devices.length > 0) {
          // 각 장비의 대여 상태 확인
          const devicesWithStatus = await Promise.all(
            kiosk.devices.map(async (device) => {
              let status = device.status;

              // 특정 날짜가 지정된 경우, 해당 날짜의 대여 상태 확인
              if (targetDate) {
                const rental = await this.kioskRentalRepository
                  .createQueryBuilder('rental')
                  .where('rental.deviceId = :deviceId', { deviceId: device.id })
                  .andWhere('rental.rentalDatetime <= :targetDate', {
                    targetDate,
                  })
                  .andWhere(
                    '(rental.actualReturnDatetime IS NULL OR rental.actualReturnDatetime > :targetDate)',
                    { targetDate },
                  )
                  .getOne();

                // 해당 날짜에 대여 중이었으면 'rented', 아니면 'available'로 표시
                status = rental
                  ? KioskDeviceStatus.RENTED
                  : KioskDeviceStatus.AVAILABLE;
              }

              return {
                ...device,
                status,
              };
            }),
          );

          return {
            ...kiosk,
            devices: devicesWithStatus,
            deviceCount: kiosk.devices.length,
            lastExamination: kiosk.examinations?.[0] || null,
          };
        }

        return {
          ...kiosk,
          deviceCount: 0,
          lastExamination: kiosk.examinations?.[0] || null,
        };
      }),
    );

    return {
      items: itemsWithRentalStatus,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      queryDate: date || new Date().toISOString().split('T')[0],
    };
  }

  /**
   * 키오스크 상세 조회
   */
  async getKioskDetail(id: number) {
    const kiosk = await this.kioskRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['devices', 'examinations', 'rentals'],
    });

    if (!kiosk) {
      throw new NotFoundException(`키오스크를 찾을 수 없습니다. ID: ${id}`);
    }

    return {
      ...kiosk,
      deviceCount: kiosk.devices?.length || 0,
      availableDeviceCount:
        kiosk.devices?.filter((d) => d.status === KioskDeviceStatus.AVAILABLE)
          .length || 0,
      examinations: kiosk.examinations?.slice(0, 10) || [],
    };
  }

  /**
   * 키오스크 생성
   */
  async createKioskLocation(createKioskDto: CreateKioskDto) {
    const kiosk = this.kioskRepository.create({
      name: createKioskDto.name,
      location: createKioskDto.location,
      managerName: createKioskDto.managerName,
      managerPhone: createKioskDto.managerPhone,
      installationDate: createKioskDto.installationDate
        ? new Date(createKioskDto.installationDate)
        : undefined,
      status: createKioskDto.status || 'active',
      notes: createKioskDto.notes,
    });

    return await this.kioskRepository.save(kiosk);
  }

  /**
   * 키오스크 수정
   */
  async updateKioskLocation(id: number, updateKioskDto: UpdateKioskDto) {
    const kiosk = await this.kioskRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!kiosk) {
      throw new NotFoundException(`키오스크를 찾을 수 없습니다. ID: ${id}`);
    }

    Object.assign(kiosk, updateKioskDto);

    if (updateKioskDto.installationDate) {
      kiosk.installationDate = new Date(updateKioskDto.installationDate);
    }

    return await this.kioskRepository.save(kiosk);
  }

  /**
   * 키오스크 소프트 삭제
   */
  async deleteKioskLocation(id: number) {
    const kiosk = await this.kioskRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['devices'],
    });

    if (!kiosk) {
      throw new NotFoundException(`키오스크를 찾을 수 없습니다. ID: ${id}`);
    }

    // 활성화된 장비가 있는지 확인
    const activeDevices = kiosk.devices?.filter(
      (d) => d.status !== KioskDeviceStatus.BROKEN,
    );
    if (activeDevices && activeDevices.length > 0) {
      throw new BadRequestException(
        '활성화된 장비가 등록된 키오스크는 삭제할 수 없습니다. 먼저 장비를 제거하거나 상태를 변경해주세요.',
      );
    }

    await this.kioskRepository.softDelete(id);

    return { message: '키오스크가 삭제되었습니다.' };
  }

  // ================== 키오스크 점검 관리 메서드 ==================

  /**
   * 키오스크 점검 기록 생성
   * 점검 결과에 따라 키오스크 상태를 자동으로 업데이트
   */
  async createExamination(createExaminationDto: CreateExaminationDto) {
    // 키오스크 존재 확인
    const kiosk = await this.kioskRepository.findOne({
      where: { id: createExaminationDto.kioskId, deletedAt: IsNull() },
    });

    if (!kiosk) {
      throw new NotFoundException(
        `키오스크를 찾을 수 없습니다. ID: ${createExaminationDto.kioskId}`,
      );
    }

    const examination = this.kioskExaminationRepository.create({
      kioskId: createExaminationDto.kioskId,
      examinationDate: new Date(createExaminationDto.examinationDate),
      result: createExaminationDto.result || 'pending',
      status: createExaminationDto.status || 'normal',
      notes: createExaminationDto.notes,
    });

    const savedExamination =
      await this.kioskExaminationRepository.save(examination);

    // 점검 결과에 따라 키오스크 상태 자동 업데이트
    if (createExaminationDto.result === 'fail') {
      kiosk.status = 'inactive';
      await this.kioskRepository.save(kiosk);
    } else if (createExaminationDto.result === 'pass') {
      kiosk.status = 'active';
      await this.kioskRepository.save(kiosk);
    }

    return savedExamination;
  }

  /**
   * 특정 키오스크의 점검 기록 조회
   */
  async getExaminationsByKiosk(kioskId: number) {
    const kiosk = await this.kioskRepository.findOne({
      where: { id: kioskId, deletedAt: IsNull() },
    });

    if (!kiosk) {
      throw new NotFoundException(
        `키오스크를 찾을 수 없습니다. ID: ${kioskId}`,
      );
    }

    const examinations = await this.kioskExaminationRepository.find({
      where: { kioskId },
      order: { examinationDate: 'DESC' },
    });

    return examinations;
  }

  /**
   * 점검 기록 수정
   */
  async updateExamination(
    id: number,
    updateExaminationDto: UpdateExaminationDto,
  ) {
    const examination = await this.kioskExaminationRepository.findOne({
      where: { id },
    });

    if (!examination) {
      throw new NotFoundException(`점검 기록을 찾을 수 없습니다. ID: ${id}`);
    }

    Object.assign(examination, updateExaminationDto);

    if (updateExaminationDto.examinationDate) {
      examination.examinationDate = new Date(
        updateExaminationDto.examinationDate,
      );
    }

    return await this.kioskExaminationRepository.save(examination);
  }

  /**
   * 점검 기록 삭제
   */
  async deleteExamination(id: number) {
    const examination = await this.kioskExaminationRepository.findOne({
      where: { id },
    });

    if (!examination) {
      throw new NotFoundException(`점검 기록을 찾을 수 없습니다. ID: ${id}`);
    }

    await this.kioskExaminationRepository.remove(examination);

    return { message: '점검 기록이 삭제되었습니다.' };
  }

  // ================== 키오스크 장비 관리 메서드 ==================

  /**
   * 특정 키오스크의 장비 목록 조회
   */
  async getDevicesByKiosk(kioskId: number) {
    const kiosk = await this.kioskRepository.findOne({
      where: { id: kioskId, deletedAt: IsNull() },
    });

    if (!kiosk) {
      throw new NotFoundException(
        `키오스크를 찾을 수 없습니다. ID: ${kioskId}`,
      );
    }

    const devices = await this.kioskDeviceRepository.find({
      where: { kioskId },
      order: { boxNumber: 'ASC' },
    });

    return devices;
  }

  /**
   * 키오스크 장비 등록
   */
  async createDevice(createDeviceDto: CreateDeviceDto) {
    // 키오스크 존재 확인
    const kiosk = await this.kioskRepository.findOne({
      where: { id: createDeviceDto.kioskId, deletedAt: IsNull() },
    });

    if (!kiosk) {
      throw new NotFoundException(
        `키오스크를 찾을 수 없습니다. ID: ${createDeviceDto.kioskId}`,
      );
    }

    // 시리얼 번호 중복 확인
    const existingDevice = await this.kioskDeviceRepository.findOne({
      where: { serialNumber: createDeviceDto.serialNumber },
    });

    if (existingDevice) {
      throw new ConflictException(
        `이미 등록된 시리얼 번호입니다: ${createDeviceDto.serialNumber}`,
      );
    }

    // 자동으로 다음 박스 번호 할당
    const maxBoxNumber = await this.kioskDeviceRepository
      .createQueryBuilder('device')
      .select('MAX(device.boxNumber)', 'max')
      .where('device.kioskId = :kioskId', { kioskId: createDeviceDto.kioskId })
      .getRawOne();

    const nextBoxNumber = (maxBoxNumber?.max || 0) + 1;

    const device = this.kioskDeviceRepository.create({
      kioskId: createDeviceDto.kioskId,
      deviceType: createDeviceDto.deviceType,
      serialNumber: createDeviceDto.serialNumber,
      boxNumber: nextBoxNumber,
      nfcTagId: createDeviceDto.nfcTagId,
      purchaseDate: createDeviceDto.purchaseDate
        ? new Date(createDeviceDto.purchaseDate)
        : undefined,
      notes: createDeviceDto.notes,
      status: KioskDeviceStatus.AVAILABLE,
    });

    return await this.kioskDeviceRepository.save(device);
  }

  /**
   * 키오스크 장비 수정
   */
  async updateDevice(id: number, updateDeviceDto: UpdateDeviceDto) {
    const device = await this.kioskDeviceRepository.findOne({
      where: { id },
    });

    if (!device) {
      throw new NotFoundException(`장비를 찾을 수 없습니다. ID: ${id}`);
    }

    // 시리얼 번호 변경 시 중복 확인
    if (
      updateDeviceDto.serialNumber &&
      updateDeviceDto.serialNumber !== device.serialNumber
    ) {
      const existingDevice = await this.kioskDeviceRepository.findOne({
        where: { serialNumber: updateDeviceDto.serialNumber },
      });

      if (existingDevice) {
        throw new ConflictException(
          `이미 등록된 시리얼 번호입니다: ${updateDeviceDto.serialNumber}`,
        );
      }
    }

    // 박스 번호 변경 시 중복 확인
    if (
      updateDeviceDto.boxNumber &&
      updateDeviceDto.boxNumber !== device.boxNumber
    ) {
      const existingBox = await this.kioskDeviceRepository.findOne({
        where: {
          kioskId: device.kioskId,
          boxNumber: updateDeviceDto.boxNumber,
        },
      });

      if (existingBox && existingBox.id !== device.id) {
        throw new ConflictException(
          `해당 키오스크에 이미 ${updateDeviceDto.boxNumber}번 박스가 사용 중입니다.`,
        );
      }
    }

    Object.assign(device, updateDeviceDto);

    if (updateDeviceDto.purchaseDate) {
      device.purchaseDate = new Date(updateDeviceDto.purchaseDate);
    }

    return await this.kioskDeviceRepository.save(device);
  }

  /**
   * 키오스크 장비 삭제
   */
  async deleteDevice(id: number) {
    const device = await this.kioskDeviceRepository.findOne({
      where: { id },
      relations: ['rentals'],
    });

    if (!device) {
      throw new NotFoundException(`장비를 찾을 수 없습니다. ID: ${id}`);
    }

    // 대여 중인 장비인지 확인
    if (device.status === KioskDeviceStatus.RENTED) {
      throw new BadRequestException('대여 중인 장비는 삭제할 수 없습니다.');
    }

    // 진행 중인 대여 기록이 있는지 확인
    const activeRental = await this.kioskRentalRepository.findOne({
      where: {
        deviceId: id,
        status: KioskRentalStatus.RENTED,
      },
    });

    if (activeRental) {
      throw new BadRequestException(
        '진행 중인 대여 기록이 있는 장비는 삭제할 수 없습니다.',
      );
    }

    await this.kioskDeviceRepository.remove(device);

    return { message: '장비가 삭제되었습니다.' };
  }

  // ================== 키오스크 대여 관리 메서드 ==================

  /**
   * 특정 키오스크의 대여 목록 조회
   */
  async getRentalsByKiosk(kioskId: number) {
    const kiosk = await this.kioskRepository.findOne({
      where: { id: kioskId, deletedAt: IsNull() },
    });

    if (!kiosk) {
      throw new NotFoundException(
        `키오스크를 찾을 수 없습니다. ID: ${kioskId}`,
      );
    }

    const rentals = await this.kioskRentalRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.device', 'device')
      .where('rental.kioskId = :kioskId', { kioskId })
      .orderBy('rental.rentalDatetime', 'DESC')
      .getMany();

    return rentals.map((rental) => ({
      id: rental.id,
      rentalNumber: rental.rentalNumber,
      deviceId: rental.deviceId,
      deviceSerial: rental.device?.serialNumber,
      deviceType: rental.device?.deviceType,
      deviceName: this.getDeviceTypeName(rental.device?.deviceType),
      boxNumber: rental.device?.boxNumber,
      status: rental.status,
      renterName: rental.renterName,
      renterPhone: rental.renterPhone, // 마스킹 안 함 (전화/SMS 기능 위해)
      renterPhoneMasked: this.maskPhoneNumber(rental.renterPhone),
      rentalDatetime: rental.rentalDatetime,
      expectedReturnDatetime: rental.expectedReturnDatetime,
      actualReturnDatetime: rental.actualReturnDatetime,
      notes: rental.notes,
    }));
  }

  /**
   * 전화번호 마스킹 (010-****-****)
   */
  private maskPhoneNumber(phone: string): string {
    if (!phone) return '';
    const cleaned = phone.replace(/-/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.substring(0, 3)}-****-****`;
    }
    return phone;
  }

  /**
   * 장비 타입 한글명 반환
   */
  private getDeviceTypeName(type: string): string {
    switch (type) {
      case 'AR_GLASS':
        return 'AR 글라스';
      case 'BONE_CONDUCTION':
        return '골전도 이어폰';
      case 'SMARTPHONE':
        return '스마트폰';
      default:
        return type;
    }
  }
}
