import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import {
  CreateDeviceItemDto,
  UpdateDeviceItemDto,
} from '../common/dto/facility-device.dto';

@Injectable()
export class FacilityDeviceService {
  constructor(
    @InjectRepository(FacilityDeviceItem)
    private facilityDeviceItemRepository: Repository<FacilityDeviceItem>,
  ) {}

  /**
   * 시설의 모든 장비 아이템 조회
   */
  async findAllByFacility(facilityId: number) {
    const deviceItems = await this.facilityDeviceItemRepository.find({
      where: { facilityId },
      order: { createdAt: 'DESC' },
    });

    return deviceItems;
  }

  /**
   * 특정 장비 아이템 상세 조회
   */
  async findOne(id: number, facilityId: number) {
    const deviceItem = await this.facilityDeviceItemRepository.findOne({
      where: { id, facilityId },
    });

    if (!deviceItem) {
      throw new NotFoundException('장비를 찾을 수 없습니다.');
    }

    return deviceItem;
  }

  /**
   * 새 장비 아이템 등록
   */
  async create(facilityId: number, createDto: CreateDeviceItemDto) {
    // 장비 코드 중복 체크
    const existingItem = await this.facilityDeviceItemRepository.findOne({
      where: { deviceCode: createDto.deviceCode },
    });

    if (existingItem) {
      throw new ConflictException(
        `장비 코드 '${createDto.deviceCode}'가 이미 존재합니다.`,
      );
    }

    // 장비 아이템 생성
    const deviceItem = this.facilityDeviceItemRepository.create({
      facilityId,
      deviceType: createDto.deviceType,
      deviceCode: createDto.deviceCode,
      notes: createDto.notes,
      serialNumber: createDto.serialNumber,
      status: 'available',
      registrationDate:
        createDto.registrationDate || new Date().toISOString().split('T')[0],
    });

    const savedItem = await this.facilityDeviceItemRepository.save(deviceItem);
    return savedItem;
  }

  /**
   * 장비 아이템 수정
   */
  async update(
    id: number,
    facilityId: number,
    updateDto: UpdateDeviceItemDto,
  ) {
    const deviceItem = await this.findOne(id, facilityId);

    // 장비 코드 변경 시 중복 체크
    if (updateDto.deviceCode && updateDto.deviceCode !== deviceItem.deviceCode) {
      const existingItem = await this.facilityDeviceItemRepository.findOne({
        where: { deviceCode: updateDto.deviceCode },
      });
      if (existingItem) {
        throw new ConflictException(
          `장비 코드 '${updateDto.deviceCode}'가 이미 존재합니다.`,
        );
      }
    }

    // 필드 업데이트
    if (updateDto.deviceType !== undefined) {
      deviceItem.deviceType = updateDto.deviceType;
    }
    if (updateDto.deviceCode !== undefined) {
      deviceItem.deviceCode = updateDto.deviceCode;
    }
    if (updateDto.notes !== undefined) {
      deviceItem.notes = updateDto.notes;
    }
    if (updateDto.serialNumber !== undefined) {
      deviceItem.serialNumber = updateDto.serialNumber;
    }
    if (updateDto.status !== undefined) {
      deviceItem.status = updateDto.status;
    }
    if (updateDto.registrationDate !== undefined) {
      deviceItem.registrationDate = updateDto.registrationDate;
    }

    const updated = await this.facilityDeviceItemRepository.save(deviceItem);
    return updated;
  }

  /**
   * 장비 아이템 삭제
   */
  async remove(id: number, facilityId: number) {
    const deviceItem = await this.findOne(id, facilityId);

    // 대여 중인 장비는 삭제 불가
    if (deviceItem.status === 'rented') {
      throw new BadRequestException('대여 중인 장비는 삭제할 수 없습니다.');
    }

    await this.facilityDeviceItemRepository.remove(deviceItem);
    return { deleted: true, id };
  }

  /**
   * 장비 통계 조회
   */
  async getStats(facilityId: number) {
    const deviceItems = await this.findAllByFacility(facilityId);

    const stats = {
      totalDevices: deviceItems.length,
      availableDevices: 0,
      rentedDevices: 0,
      brokenDevices: 0,
      maintenanceDevices: 0,
      byType: {} as Record<string, any>,
    };

    deviceItems.forEach((item) => {
      // 전체 상태 카운트
      if (item.status === 'available') stats.availableDevices++;
      else if (item.status === 'rented') stats.rentedDevices++;
      else if (item.status === 'broken') stats.brokenDevices++;
      else if (item.status === 'maintenance') stats.maintenanceDevices++;

      // 타입별 카운트
      if (!stats.byType[item.deviceType]) {
        stats.byType[item.deviceType] = {
          total: 0,
          available: 0,
          rented: 0,
          broken: 0,
          maintenance: 0,
        };
      }

      stats.byType[item.deviceType].total++;
      if (item.status === 'available')
        stats.byType[item.deviceType].available++;
      else if (item.status === 'rented') stats.byType[item.deviceType].rented++;
      else if (item.status === 'broken') stats.byType[item.deviceType].broken++;
      else if (item.status === 'maintenance')
        stats.byType[item.deviceType].maintenance++;
    });

    return stats;
  }
}
