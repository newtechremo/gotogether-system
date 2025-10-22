import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, Like, In } from 'typeorm';
import { FacilityRental } from '../entities/facility-rental.entity';
import { FacilityRentalDevice } from '../entities/facility-rental-device.entity';
import { FacilityDevice } from '../entities/facility-device.entity';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import {
  CreateFacilityRentalDto,
  UpdateFacilityRentalDto,
  ReturnRentalDto,
  RentalListQueryDto,
} from '../common/dto/facility-rental.dto';

@Injectable()
export class FacilityRentalService {
  constructor(
    @InjectRepository(FacilityRental)
    private rentalRepository: Repository<FacilityRental>,
    @InjectRepository(FacilityRentalDevice)
    private rentalDeviceRepository: Repository<FacilityRentalDevice>,
    @InjectRepository(FacilityDevice)
    private facilityDeviceRepository: Repository<FacilityDevice>,
    @InjectRepository(FacilityDeviceItem)
    private facilityDeviceItemRepository: Repository<FacilityDeviceItem>,
    private dataSource: DataSource,
  ) {}

  /**
   * 대여 목록 조회 (필터링 지원)
   */
  async findAll(
    facilityId: number,
    query: RentalListQueryDto,
  ): Promise<FacilityRental[]> {
    const queryBuilder = this.rentalRepository
      .createQueryBuilder('rental')
      .leftJoinAndSelect('rental.rentalDevices', 'rentalDevices')
      .where('rental.facilityId = :facilityId', { facilityId })
      .orderBy('rental.createdAt', 'DESC');

    // 상태 필터
    if (query.status) {
      queryBuilder.andWhere('rental.status = :status', {
        status: query.status,
      });
    }

    // 날짜 범위 필터
    if (query.startDate && query.endDate) {
      queryBuilder.andWhere(
        'rental.rentalDate BETWEEN :startDate AND :endDate',
        {
          startDate: query.startDate,
          endDate: query.endDate,
        },
      );
    }

    // 검색어 (이름 또는 전화번호)
    if (query.search) {
      queryBuilder.andWhere(
        '(rental.borrowerName LIKE :search OR rental.borrowerPhone LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * 대여 상세 조회
   */
  async findOne(id: number, facilityId: number): Promise<FacilityRental> {
    const rental = await this.rentalRepository.findOne({
      where: { id, facilityId },
      relations: ['rentalDevices'],
    });

    if (!rental) {
      throw new NotFoundException('대여 정보를 찾을 수 없습니다.');
    }

    return rental;
  }

  /**
   * 새 대여 등록
   */
  async create(
    facilityId: number,
    createDto: CreateFacilityRentalDto,
  ): Promise<FacilityRental> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 각 장비 타입별 재고 확인 및 가용 장비 아이템 확보
      const deviceItemsToRent: { [deviceType: string]: FacilityDeviceItem[] } =
        {};

      for (const deviceDto of createDto.devices) {
        // 특정 장비 아이템이 지정된 경우
        if (deviceDto.deviceItemIds && deviceDto.deviceItemIds.length > 0) {
          const specifiedItems = await queryRunner.manager.find(
            FacilityDeviceItem,
            {
              where: {
                id: In(deviceDto.deviceItemIds), // In 연산자로 여러 ID 확인
                facilityId,
                deviceType: deviceDto.deviceType,
                status: 'available',
              },
            },
          );

          if (specifiedItems.length !== deviceDto.deviceItemIds.length) {
            throw new BadRequestException(
              `지정된 ${deviceDto.deviceType} 장비 아이템이 대여 불가능합니다. (가능: ${specifiedItems.length}, 요청: ${deviceDto.deviceItemIds.length})`,
            );
          }

          deviceItemsToRent[deviceDto.deviceType] = specifiedItems;
        } else {
          // 자동으로 사용 가능한 장비 선택
          const availableItems = await queryRunner.manager.find(
            FacilityDeviceItem,
            {
              where: {
                facilityId,
                deviceType: deviceDto.deviceType,
                status: 'available',
              },
              take: deviceDto.quantity,
            },
          );

          if (availableItems.length < deviceDto.quantity) {
            throw new BadRequestException(
              `${deviceDto.deviceType} 장비의 사용 가능한 아이템이 부족합니다. (가능: ${availableItems.length}, 요청: ${deviceDto.quantity})`,
            );
          }

          deviceItemsToRent[deviceDto.deviceType] = availableItems;
        }
      }

      // 2. 대여 레코드 생성
      // Calculate rental weekday from rental date
      const rentalDateObj = new Date(createDto.rentalDate);
      const weekdays = [
        '일요일',
        '월요일',
        '화요일',
        '수요일',
        '목요일',
        '금요일',
        '토요일',
      ];
      const rentalWeekday = weekdays[rentalDateObj.getDay()];

      const rental = queryRunner.manager.create(FacilityRental, {
        facilityId,
        borrowerName: createDto.renterName,
        borrowerPhone: createDto.renterPhone,
        disabilityType: createDto.renterDisabilityId,
        rentalType: createDto.rentalType,
        expectedUsers: createDto.expectedUsers,
        rentalDate: createDto.rentalDate,
        rentalWeekday: rentalWeekday,
        returnDate: createDto.returnDate,
        rentalPurpose: createDto.purpose,
        region: createDto.region,
        residence: createDto.region,
        ageGroup: createDto.ageGroup,
        gender: createDto.gender,
        status: '대여중',
        notes: createDto.memo,
      });

      const savedRental = await queryRunner.manager.save(rental);

      // 3. 대여 장비 레코드 생성 및 장비 상태 업데이트
      for (const deviceDto of createDto.devices) {
        const itemsToRent = deviceItemsToRent[deviceDto.deviceType];

        // 각 장비 아이템에 대해 대여 장비 레코드 생성
        for (const item of itemsToRent) {
          const rentalDevice = queryRunner.manager.create(
            FacilityRentalDevice,
            {
              rentalId: savedRental.id,
              deviceType: deviceDto.deviceType,
              quantity: 1,
              deviceItemId: item.id,
            },
          );
          await queryRunner.manager.save(rentalDevice);

          // 장비 아이템 상태를 'rented'로 변경
          item.status = 'rented';
          await queryRunner.manager.save(item);
        }

        // 4. 장비 수량 업데이트
        const facilityDevice = await queryRunner.manager.findOne(
          FacilityDevice,
          {
            where: { facilityId, deviceType: deviceDto.deviceType },
          },
        );

        if (facilityDevice) {
          facilityDevice.qtyAvailable -= deviceDto.quantity;
          facilityDevice.qtyRented += deviceDto.quantity;
          await queryRunner.manager.save(facilityDevice);
        }
      }

      await queryRunner.commitTransaction();

      // 최종 결과 조회
      return this.findOne(savedRental.id, facilityId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 대여 정보 수정
   */
  async update(
    id: number,
    facilityId: number,
    updateDto: UpdateFacilityRentalDto,
  ): Promise<FacilityRental> {
    const rental = await this.findOne(id, facilityId);

    // 반납 완료된 대여는 수정 불가
    if (rental.status === '반납완료') {
      throw new BadRequestException('반납 완료된 대여는 수정할 수 없습니다.');
    }

    Object.assign(rental, updateDto);
    await this.rentalRepository.save(rental);

    return this.findOne(id, facilityId);
  }

  /**
   * 반납 처리
   */
  async returnRental(
    id: number,
    facilityId: number,
    returnDto: ReturnRentalDto,
  ): Promise<FacilityRental> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const rental = await queryRunner.manager.findOne(FacilityRental, {
        where: { id, facilityId },
        relations: ['rentalDevices'],
      });

      if (!rental) {
        throw new NotFoundException('대여 정보를 찾을 수 없습니다.');
      }

      if (rental.status === '반납완료') {
        throw new BadRequestException('이미 반납 처리된 대여입니다.');
      }

      // 1. 대여 상태 업데이트
      rental.status = '반납완료';
      rental.actualReturnDate = returnDto.actualReturnDate
        ? new Date(returnDto.actualReturnDate)
        : new Date();

      if (returnDto.returnMemo) {
        rental.notes = rental.notes
          ? `${rental.notes}\n[반납] ${returnDto.returnMemo}`
          : `[반납] ${returnDto.returnMemo}`;
      }

      await queryRunner.manager.save(rental);

      // 2. 각 대여 장비에 대해 처리
      const deviceQuantities: { [deviceType: string]: number } = {};

      for (const rentalDevice of rental.rentalDevices) {
        // 장비 수량 집계
        deviceQuantities[rentalDevice.deviceType] =
          (deviceQuantities[rentalDevice.deviceType] || 0) +
          rentalDevice.quantity;

        // facility_rental_devices 테이블의 반납 상태 업데이트
        rentalDevice.isReturned = true;
        rentalDevice.returnDatetime = rental.actualReturnDate;
        rentalDevice.returnCondition = returnDto.returnCondition || 'normal';
        await queryRunner.manager.save(rentalDevice);

        // 장비 아이템 상태를 'available'로 변경
        if (rentalDevice.deviceItemId) {
          // device_item_id가 있는 경우: 특정 기기 업데이트
          const deviceItem = await queryRunner.manager.findOne(
            FacilityDeviceItem,
            {
              where: { id: rentalDevice.deviceItemId },
            },
          );

          if (deviceItem && deviceItem.status === 'rented') {
            deviceItem.status = 'available';
            await queryRunner.manager.save(deviceItem);
          }
        } else {
          // device_item_id가 NULL인 경우: 해당 타입의 rented 상태인 기기들을 quantity만큼 available로 변경
          const rentedItems = await queryRunner.manager.find(
            FacilityDeviceItem,
            {
              where: {
                facilityId,
                deviceType: rentalDevice.deviceType,
                status: 'rented',
              },
              take: rentalDevice.quantity,
            },
          );

          for (const item of rentedItems) {
            item.status = 'available';
            await queryRunner.manager.save(item);
          }
        }
      }

      // 3. 장비 타입별 수량 복구
      for (const [deviceType, quantity] of Object.entries(deviceQuantities)) {
        const facilityDevice = await queryRunner.manager.findOne(
          FacilityDevice,
          {
            where: { facilityId, deviceType },
          },
        );

        if (facilityDevice) {
          facilityDevice.qtyRented -= quantity;
          facilityDevice.qtyAvailable += quantity;
          await queryRunner.manager.save(facilityDevice);
        }
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
   * 대여 삭제 (대여중인 경우만 가능)
   */
  async remove(id: number, facilityId: number): Promise<void> {
    const rental = await this.findOne(id, facilityId);

    if (rental.status === '대여중') {
      throw new BadRequestException(
        '대여중인 항목은 삭제할 수 없습니다. 먼저 반납 처리하거나 취소해주세요.',
      );
    }

    await this.rentalRepository.remove(rental);
  }

  /**
   * 현재 대여중인 항목 조회
   */
  async getCurrentRentals(facilityId: number): Promise<FacilityRental[]> {
    return this.rentalRepository.find({
      where: {
        facilityId,
        status: '대여중',
      },
      relations: ['rentalDevices'],
      order: {
        rentalDate: 'DESC',
      },
    });
  }

  /**
   * 연체 대여 조회
   */
  async getOverdueRentals(facilityId: number): Promise<FacilityRental[]> {
    return this.rentalRepository.find({
      where: {
        facilityId,
        status: '연체',
      },
      relations: ['rentalDevices'],
      order: {
        returnDate: 'ASC',
      },
    });
  }
}
