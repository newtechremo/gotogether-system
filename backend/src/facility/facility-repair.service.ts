import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between } from 'typeorm';
import { FacilityRepair } from '../entities/facility-repair.entity';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import { FacilityDevice } from '../entities/facility-device.entity';
import {
  CreateFacilityRepairDto,
  UpdateFacilityRepairDto,
  CompleteRepairDto,
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
      .leftJoinAndSelect('deviceItem.facilityDevice', 'facilityDevice')
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
      relations: ['deviceItem', 'deviceItem.facilityDevice'],
    });

    if (!repair) {
      throw new NotFoundException('수리 정보를 찾을 수 없습니다.');
    }

    return repair;
  }

  /**
   * 새 수리 등록
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
        relations: ['facilityDevice'],
      });

      if (!deviceItem) {
        throw new NotFoundException('장비 아이템을 찾을 수 없습니다.');
      }

      if (deviceItem.facilityDevice.facilityId !== facilityId) {
        throw new BadRequestException('해당 시설의 장비가 아닙니다.');
      }

      // 이미 고장 상태인지 확인
      if (deviceItem.status === 'broken') {
        // 이미 수리중인지 확인
        const existingRepair = await queryRunner.manager.findOne(
          FacilityRepair,
          {
            where: {
              deviceItemId: deviceItem.id,
              status: '수리중',
            },
          },
        );

        if (existingRepair) {
          throw new BadRequestException('이미 수리 중인 장비입니다.');
        }
      }

      // 2. 수리 레코드 생성
      const repair = queryRunner.manager.create(FacilityRepair, {
        facilityId,
        deviceItemId: createDto.facilityDeviceItemId,
        deviceType: deviceItem.facilityDevice.deviceType,
        repairStartDate: new Date(createDto.repairDate),
        status: '수리중',
        issueDescription: createDto.repairDescription,
        repairCost: createDto.repairCost,
        repairVendor: createDto.repairCompany,
        repairNotes: createDto.memo,
      });

      const savedRepair = await queryRunner.manager.save(repair);

      // 3. 장비 아이템 상태를 'broken'으로 변경
      const previousStatus = deviceItem.status;
      deviceItem.status = 'broken';
      await queryRunner.manager.save(deviceItem);

      // 4. 장비 수량 업데이트
      const facilityDevice = deviceItem.facilityDevice;

      // 이전 상태에 따라 수량 조정
      if (previousStatus === 'available') {
        facilityDevice.qtyAvailable -= 1;
        facilityDevice.qtyBroken += 1;
      } else if (previousStatus === 'rented') {
        facilityDevice.qtyRented -= 1;
        facilityDevice.qtyBroken += 1;
      }
      // 이미 'broken' 상태였다면 수량 변경 없음

      await queryRunner.manager.save(facilityDevice);

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
   * 수리 정보 수정
   */
  async update(
    id: number,
    facilityId: number,
    updateDto: UpdateFacilityRepairDto,
  ): Promise<FacilityRepair> {
    console.log('=== REPAIR UPDATE START ===');
    console.log('Repair ID:', id);
    console.log('Facility ID:', facilityId);
    console.log('Update DTO:', JSON.stringify(updateDto, null, 2));

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repair = await queryRunner.manager.findOne(FacilityRepair, {
        where: { id, facilityId },
        relations: ['deviceItem', 'deviceItem.facilityDevice'],
      });

      if (!repair) {
        throw new NotFoundException('수리 정보를 찾을 수 없습니다.');
      }

      const previousStatus = repair.status;
      console.log('Previous Status:', previousStatus);

      // Map DTO fields to entity fields
      if (updateDto.repairStatus !== undefined) {
        repair.status = updateDto.repairStatus;
      }
      if (updateDto.repairDescription !== undefined) {
        repair.issueDescription = updateDto.repairDescription;
      }
      if (updateDto.repairCost !== undefined) {
        repair.repairCost = updateDto.repairCost;
      }
      if (updateDto.repairCompany !== undefined) {
        repair.repairVendor = updateDto.repairCompany;
      }
      if (updateDto.completionDate !== undefined) {
        repair.repairEndDate = new Date(updateDto.completionDate);
      }
      if (updateDto.memo !== undefined) {
        repair.repairNotes = updateDto.memo;
      }

      console.log('New Status:', repair.status);

      await queryRunner.manager.save(repair);

      // 상태가 실제로 변경된 경우에만 장비 수량 업데이트
      if (previousStatus === repair.status) {
        console.log(
          '❌ NO STATUS CHANGE - Same status, skipping device update',
        );
      }
      // 상태가 '수리중'에서 '수리완료'로 변경된 경우 장비 상태 업데이트
      else if (previousStatus === '수리중' && repair.status === '수리완료') {
        console.log('✅ STATUS CHANGE: 수리중 → 수리완료');
        const deviceItem = repair.deviceItem;
        const facilityDevice = deviceItem.facilityDevice;

        console.log('Before - Device Item Status:', deviceItem.status);
        console.log('Before - Device Quantities:', {
          qtyAvailable: facilityDevice.qtyAvailable,
          qtyBroken: facilityDevice.qtyBroken,
          qtyRented: facilityDevice.qtyRented,
        });

        // 장비 아이템 상태를 'available'로 변경
        deviceItem.status = 'available';
        await queryRunner.manager.save(deviceItem);

        // 장비 수량 복구
        facilityDevice.qtyBroken -= 1;
        facilityDevice.qtyAvailable += 1;
        await queryRunner.manager.save(facilityDevice);

        console.log('After - Device Item Status:', deviceItem.status);
        console.log('After - Device Quantities:', {
          qtyAvailable: facilityDevice.qtyAvailable,
          qtyBroken: facilityDevice.qtyBroken,
          qtyRented: facilityDevice.qtyRented,
        });
      }
      // 상태가 '수리완료'에서 '수리중'으로 되돌린 경우
      else if (previousStatus === '수리완료' && repair.status === '수리중') {
        console.log('✅ STATUS CHANGE: 수리완료 → 수리중');
        const deviceItem = repair.deviceItem;
        const facilityDevice = deviceItem.facilityDevice;

        console.log('Before - Device Item Status:', deviceItem.status);
        console.log('Before - Device Quantities:', {
          qtyAvailable: facilityDevice.qtyAvailable,
          qtyBroken: facilityDevice.qtyBroken,
          qtyRented: facilityDevice.qtyRented,
        });

        // 장비 아이템 상태를 'broken'으로 변경
        deviceItem.status = 'broken';
        await queryRunner.manager.save(deviceItem);

        // 장비 수량 다시 고장으로 표시
        facilityDevice.qtyAvailable -= 1;
        facilityDevice.qtyBroken += 1;
        await queryRunner.manager.save(facilityDevice);

        console.log('After - Device Item Status:', deviceItem.status);
        console.log('After - Device Quantities:', {
          qtyAvailable: facilityDevice.qtyAvailable,
          qtyBroken: facilityDevice.qtyBroken,
          qtyRented: facilityDevice.qtyRented,
        });
      } else {
        console.log('❌ NO STATUS CHANGE - Condition not met');
        console.log('Previous:', previousStatus, '/ New:', repair.status);
      }

      await queryRunner.commitTransaction();
      console.log('✅ TRANSACTION COMMITTED');
      console.log('=== REPAIR UPDATE END ===');

      return this.findOne(id, facilityId);
    } catch (error) {
      console.error('❌ TRANSACTION ROLLBACK - Error:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 수리 완료 처리
   */
  async completeRepair(
    id: number,
    facilityId: number,
    completeDto: CompleteRepairDto,
  ): Promise<FacilityRepair> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repair = await queryRunner.manager.findOne(FacilityRepair, {
        where: { id, facilityId },
        relations: ['deviceItem', 'deviceItem.facilityDevice'],
      });

      if (!repair) {
        throw new NotFoundException('수리 정보를 찾을 수 없습니다.');
      }

      if (repair.status === '수리완료') {
        throw new BadRequestException('이미 완료된 수리입니다.');
      }

      // 1. 수리 상태 업데이트
      repair.status = '수리완료';
      repair.repairEndDate = completeDto.completionDate
        ? new Date(completeDto.completionDate)
        : new Date();

      if (completeDto.repairCost !== undefined) {
        repair.repairCost = completeDto.repairCost;
      }

      if (completeDto.completionMemo) {
        repair.repairNotes = repair.repairNotes
          ? `${repair.repairNotes}\n[완료] ${completeDto.completionMemo}`
          : `[완료] ${completeDto.completionMemo}`;
      }

      await queryRunner.manager.save(repair);

      // 2. 장비 아이템 상태를 'available'로 변경
      const deviceItem = repair.deviceItem;
      deviceItem.status = 'available';
      await queryRunner.manager.save(deviceItem);

      // 3. 장비 수량 복구
      const facilityDevice = deviceItem.facilityDevice;
      facilityDevice.qtyBroken -= 1;
      facilityDevice.qtyAvailable += 1;
      await queryRunner.manager.save(facilityDevice);

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
   * 수리 삭제
   */
  async remove(id: number, facilityId: number): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repair = await queryRunner.manager.findOne(FacilityRepair, {
        where: { id, facilityId },
        relations: ['deviceItem', 'deviceItem.facilityDevice'],
      });

      if (!repair) {
        throw new NotFoundException('수리 정보를 찾을 수 없습니다.');
      }

      // 수리중인 경우 장비 상태 복구
      if (repair.status === '수리중') {
        const deviceItem = repair.deviceItem;
        const facilityDevice = deviceItem.facilityDevice;

        // 장비 아이템 상태를 'available'로 변경
        deviceItem.status = 'available';
        await queryRunner.manager.save(deviceItem);

        // 장비 수량 복구
        facilityDevice.qtyBroken -= 1;
        facilityDevice.qtyAvailable += 1;
        await queryRunner.manager.save(facilityDevice);
      }

      // 수리 레코드 삭제
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
   * 수리중인 항목 조회
   */
  async getRepairsInProgress(facilityId: number): Promise<FacilityRepair[]> {
    return this.repairRepository.find({
      where: {
        facilityId,
        status: '수리중',
      },
      relations: ['deviceItem', 'deviceItem.facilityDevice'],
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
      relations: ['deviceItem', 'deviceItem.facilityDevice'],
      order: {
        repairEndDate: 'DESC',
      },
      take: 50, // 최근 50건만
    });
  }
}
