import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { FacilityDevice } from '../entities/facility-device.entity';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import {
  CreateFacilityDeviceDto,
  UpdateFacilityDeviceDto,
  UpdateDeviceItemDto,
} from '../common/dto/facility-device.dto';

@Injectable()
export class FacilityDeviceService {
  constructor(
    @InjectRepository(FacilityDevice)
    private facilityDeviceRepository: Repository<FacilityDevice>,
    @InjectRepository(FacilityDeviceItem)
    private facilityDeviceItemRepository: Repository<FacilityDeviceItem>,
    private dataSource: DataSource,
  ) {}

  /**
   * 시설의 모든 장비 조회 (장비 아이템 포함)
   */
  async findAllByFacility(facilityId: number) {
    const devices = await this.facilityDeviceRepository.find({
      where: { facilityId },
      relations: ['deviceItems'],
      order: { id: 'ASC' },
    });

    return devices;
  }

  /**
   * 특정 장비 상세 조회
   */
  async findOne(id: number, facilityId: number) {
    const device = await this.facilityDeviceRepository.findOne({
      where: { id, facilityId },
      relations: ['deviceItems'],
    });

    if (!device) {
      throw new NotFoundException('장비를 찾을 수 없습니다.');
    }

    return device;
  }

  /**
   * 새 장비 등록 (장비 아이템 포함)
   */
  async create(facilityId: number, createDto: CreateFacilityDeviceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 해당 시설에 해당 장비 타입이 이미 있는지 확인
      let facilityDevice = await queryRunner.manager.findOne(FacilityDevice, {
        where: {
          facilityId,
          deviceType: createDto.deviceType,
        },
      });

      // 2. 없으면 생성
      if (!facilityDevice) {
        facilityDevice = queryRunner.manager.create(FacilityDevice, {
          facilityId,
          deviceType: createDto.deviceType,
          qtyTotal: 0,
          qtyAvailable: 0,
          qtyRented: 0,
          qtyBroken: 0,
          memo: createDto.memo,
        });
        facilityDevice = await queryRunner.manager.save(facilityDevice);
      }

      // 3. 장비 코드 중복 체크
      for (const itemDto of createDto.deviceItems) {
        const existingItem = await queryRunner.manager.findOne(
          FacilityDeviceItem,
          {
            where: { deviceCode: itemDto.deviceCode },
          },
        );
        if (existingItem) {
          throw new ConflictException(
            `장비 코드 '${itemDto.deviceCode}'가 이미 존재합니다.`,
          );
        }
      }

      // 4. 장비 아이템 생성
      const deviceItems: FacilityDeviceItem[] = [];
      for (const itemDto of createDto.deviceItems) {
        const deviceItem = queryRunner.manager.create(FacilityDeviceItem, {
          facilityDeviceId: facilityDevice.id,
          deviceCode: itemDto.deviceCode,
          serialNumber: itemDto.serialNumber,
          status: 'available',
          registrationDate:
            itemDto.registrationDate || new Date().toISOString().split('T')[0],
          notes: itemDto.notes,
        });
        const savedItem = await queryRunner.manager.save(deviceItem);
        deviceItems.push(savedItem);
      }

      // 5. 수량 업데이트
      facilityDevice.qtyTotal += deviceItems.length;
      facilityDevice.qtyAvailable += deviceItems.length;
      await queryRunner.manager.save(facilityDevice);

      await queryRunner.commitTransaction();

      // 6. 결과 조회
      return await this.findOne(facilityDevice.id, facilityId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 장비 정보 수정 (메모만)
   */
  async update(
    id: number,
    facilityId: number,
    updateDto: UpdateFacilityDeviceDto,
  ) {
    const device = await this.findOne(id, facilityId);

    if (updateDto.memo !== undefined) {
      device.memo = updateDto.memo;
    }

    await this.facilityDeviceRepository.save(device);
    return await this.findOne(id, facilityId);
  }

  /**
   * 장비 아이템 수정
   */
  async updateDeviceItem(
    itemId: number,
    facilityId: number,
    updateDto: UpdateDeviceItemDto,
  ) {
    const deviceItem = await this.facilityDeviceItemRepository.findOne({
      where: { id: itemId },
      relations: ['facilityDevice'],
    });

    if (!deviceItem || deviceItem.facilityDevice.facilityId !== facilityId) {
      throw new NotFoundException('장비 아이템을 찾을 수 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const oldStatus = deviceItem.status;

      // 장비 코드 변경 시 중복 체크
      if (
        updateDto.deviceCode &&
        updateDto.deviceCode !== deviceItem.deviceCode
      ) {
        const existingItem = await queryRunner.manager.findOne(
          FacilityDeviceItem,
          {
            where: { deviceCode: updateDto.deviceCode },
          },
        );
        if (existingItem) {
          throw new ConflictException(
            `장비 코드 '${updateDto.deviceCode}'가 이미 존재합니다.`,
          );
        }
        deviceItem.deviceCode = updateDto.deviceCode;
      }

      if (updateDto.serialNumber !== undefined) {
        deviceItem.serialNumber = updateDto.serialNumber;
      }
      if (updateDto.registrationDate !== undefined) {
        deviceItem.registrationDate = updateDto.registrationDate;
      }
      if (updateDto.notes !== undefined) {
        deviceItem.notes = updateDto.notes;
      }

      // 상태 변경 시 수량 업데이트
      if (updateDto.status && updateDto.status !== oldStatus) {
        deviceItem.status = updateDto.status;

        const facilityDevice = await queryRunner.manager.findOne(
          FacilityDevice,
          {
            where: { id: deviceItem.facilityDeviceId },
          },
        );

        if (!facilityDevice) {
          throw new NotFoundException('장비를 찾을 수 없습니다.');
        }

        // 이전 상태에서 차감
        if (oldStatus === 'available') facilityDevice.qtyAvailable--;
        else if (oldStatus === 'rented') facilityDevice.qtyRented--;
        else if (oldStatus === 'broken' || oldStatus === 'maintenance')
          facilityDevice.qtyBroken--;

        // 새 상태로 추가
        if (updateDto.status === 'available') facilityDevice.qtyAvailable++;
        else if (updateDto.status === 'rented') facilityDevice.qtyRented++;
        else if (
          updateDto.status === 'broken' ||
          updateDto.status === 'maintenance'
        )
          facilityDevice.qtyBroken++;

        await queryRunner.manager.save(facilityDevice);
      }

      await queryRunner.manager.save(deviceItem);
      await queryRunner.commitTransaction();

      return deviceItem;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 장비 아이템 삭제
   */
  async removeDeviceItem(itemId: number, facilityId: number) {
    const deviceItem = await this.facilityDeviceItemRepository.findOne({
      where: { id: itemId },
      relations: ['facilityDevice'],
    });

    if (!deviceItem || deviceItem.facilityDevice.facilityId !== facilityId) {
      throw new NotFoundException('장비 아이템을 찾을 수 없습니다.');
    }

    // 대여 중인 장비는 삭제 불가
    if (deviceItem.status === 'rented') {
      throw new BadRequestException('대여 중인 장비는 삭제할 수 없습니다.');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const facilityDevice = await queryRunner.manager.findOne(FacilityDevice, {
        where: { id: deviceItem.facilityDeviceId },
      });

      if (!facilityDevice) {
        throw new NotFoundException('장비를 찾을 수 없습니다.');
      }

      // 수량 업데이트
      facilityDevice.qtyTotal--;
      if (deviceItem.status === 'available') facilityDevice.qtyAvailable--;
      else if (
        deviceItem.status === 'broken' ||
        deviceItem.status === 'maintenance'
      )
        facilityDevice.qtyBroken--;

      await queryRunner.manager.save(facilityDevice);
      await queryRunner.manager.remove(deviceItem);

      await queryRunner.commitTransaction();

      return { deleted: true, id: itemId };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 장비 삭제 (모든 아이템 포함)
   */
  async remove(id: number, facilityId: number) {
    const device = await this.findOne(id, facilityId);

    // 대여 중인 장비가 있으면 삭제 불가
    if (device.qtyRented > 0) {
      throw new BadRequestException(
        '대여 중인 장비가 있어 삭제할 수 없습니다.',
      );
    }

    await this.facilityDeviceRepository.remove(device);
    return { deleted: true, id };
  }

  /**
   * 장비 통계 조회
   */
  async getStats(facilityId: number) {
    const devices = await this.findAllByFacility(facilityId);

    const stats = {
      totalDevices: 0,
      availableDevices: 0,
      rentedDevices: 0,
      brokenDevices: 0,
      byType: {} as Record<string, any>,
    };

    devices.forEach((device) => {
      stats.totalDevices += device.qtyTotal;
      stats.availableDevices += device.qtyAvailable;
      stats.rentedDevices += device.qtyRented;
      stats.brokenDevices += device.qtyBroken;

      stats.byType[device.deviceType] = {
        total: device.qtyTotal,
        available: device.qtyAvailable,
        rented: device.qtyRented,
        broken: device.qtyBroken,
      };
    });

    return stats;
  }
}
