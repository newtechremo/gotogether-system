import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { FacilityDevice } from '../entities/facility-device.entity';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import { FacilityRental } from '../entities/facility-rental.entity';
import {
  DashboardStatsDto,
  DeviceTypeStatsDto,
  MonthlyStatsDto,
  DailyStatsDto,
  DeviceUsageDto,
} from '../common/dto/facility-statistics.dto';

@Injectable()
export class FacilityStatisticsService {
  constructor(
    @InjectRepository(FacilityDevice)
    private facilityDeviceRepository: Repository<FacilityDevice>,
    @InjectRepository(FacilityDeviceItem)
    private facilityDeviceItemRepository: Repository<FacilityDeviceItem>,
    @InjectRepository(FacilityRental)
    private facilityRentalRepository: Repository<FacilityRental>,
  ) {}

  /**
   * 대시보드 통계 조회
   */
  async getDashboardStats(facilityId: number): Promise<DashboardStatsDto> {
    // 장비 통계
    const devices = await this.facilityDeviceRepository.find({
      where: { facilityId },
    });

    const deviceStats = devices.reduce(
      (acc, device) => {
        acc.totalDevices += device.qtyTotal;
        acc.availableDevices += device.qtyAvailable;
        acc.rentedDevices += device.qtyRented;
        acc.brokenDevices += device.qtyBroken;
        return acc;
      },
      {
        totalDevices: 0,
        availableDevices: 0,
        rentedDevices: 0,
        brokenDevices: 0,
      },
    );

    // 현재 대여 중인 장비 수량 합계
    const currentRentalsData = await this.facilityRentalRepository.find({
      where: {
        facilityId,
        status: '대여중',
      },
      relations: ['rentalDevices'],
    });

    // 모든 대여의 장비 수량을 합산
    const currentRentals = currentRentalsData.reduce((sum, rental) => {
      const rentalQuantity =
        rental.rentalDevices?.reduce(
          (deviceSum, device) => deviceSum + device.quantity,
          0,
        ) || 0;
      return sum + rentalQuantity;
    }, 0);

    // 오늘 대여 건수
    const today = new Date().toISOString().split('T')[0];
    const todayRentals = await this.facilityRentalRepository.count({
      where: {
        facilityId,
        rentalDate: today,
      },
    });

    // 오늘 반납 건수
    const todayReturns = await this.facilityRentalRepository.count({
      where: {
        facilityId,
        status: '반납완료',
        actualReturnDate: MoreThanOrEqual(new Date(today)),
      },
    });

    // 연체 건수
    const overdueRentals = await this.facilityRentalRepository.count({
      where: {
        facilityId,
        status: '연체',
      },
    });

    return {
      ...deviceStats,
      currentRentals,
      todayRentals,
      todayReturns,
      overdueRentals,
    };
  }

  /**
   * 장비 타입별 통계
   */
  async getDeviceTypeStats(facilityId: number): Promise<DeviceTypeStatsDto[]> {
    const devices = await this.facilityDeviceRepository.find({
      where: { facilityId },
    });

    return devices.map((device) => {
      const utilizationRate =
        device.qtyTotal > 0
          ? Math.round((device.qtyRented / device.qtyTotal) * 100)
          : 0;

      return {
        deviceType: device.deviceType,
        total: device.qtyTotal,
        available: device.qtyAvailable,
        rented: device.qtyRented,
        broken: device.qtyBroken,
        utilizationRate,
      };
    });
  }

  /**
   * 월별 통계
   */
  async getMonthlyStats(
    facilityId: number,
    year?: number,
    month?: number,
  ): Promise<MonthlyStatsDto> {
    const targetYear = year || new Date().getFullYear();
    const targetMonth = month || new Date().getMonth() + 1;

    // 해당 월의 시작일과 종료일
    const startDate = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`;
    const endDate = new Date(targetYear, targetMonth, 0)
      .toISOString()
      .split('T')[0];

    const rentals = await this.facilityRentalRepository.find({
      where: {
        facilityId,
        rentalDate: Between(startDate, endDate),
      },
      relations: ['rentalDevices'],
    });

    const totalRentals = rentals.length;
    const totalReturns = rentals.filter((r) => r.status === '반납완료').length;
    const individualRentals = rentals.filter(
      (r) => r.rentalType === '개인',
    ).length;
    const groupRentals = rentals.filter((r) => r.rentalType === '단체').length;
    const totalUsers = rentals.reduce(
      (sum, r) => sum + (r.expectedUsers || 1),
      0,
    );

    // 장비 타입별 대여 수
    const byDeviceType: Record<string, number> = {};
    rentals.forEach((rental) => {
      rental.rentalDevices?.forEach((rd) => {
        byDeviceType[rd.deviceType] =
          (byDeviceType[rd.deviceType] || 0) + rd.quantity;
      });
    });

    return {
      year: targetYear,
      month: targetMonth,
      totalRentals,
      totalReturns,
      individualRentals,
      groupRentals,
      totalUsers,
      byDeviceType,
    };
  }

  /**
   * 일별 통계 (기간)
   */
  async getDailyStats(
    facilityId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<DailyStatsDto[]> {
    const start =
      startDate ||
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    const rentals = await this.facilityRentalRepository.find({
      where: {
        facilityId,
        rentalDate: Between(start, end),
      },
    });

    // 날짜별로 그룹화
    const dailyMap = new Map<string, { rentals: number; returns: number }>();

    rentals.forEach((rental) => {
      // 대여일 카운트
      const rentalDate = rental.rentalDate;
      if (!dailyMap.has(rentalDate)) {
        dailyMap.set(rentalDate, { rentals: 0, returns: 0 });
      }
      dailyMap.get(rentalDate)!.rentals++;

      // 반납일 카운트
      if (rental.actualReturnDate) {
        const returnDate = rental.actualReturnDate.toISOString().split('T')[0];
        if (!dailyMap.has(returnDate)) {
          dailyMap.set(returnDate, { rentals: 0, returns: 0 });
        }
        dailyMap.get(returnDate)!.returns++;
      }
    });

    // 배열로 변환하고 정렬
    return Array.from(dailyMap.entries())
      .map(([date, stats]) => ({
        date,
        rentals: stats.rentals,
        returns: stats.returns,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * 장비 이용 현황 (개별 장비별)
   */
  async getDeviceUsage(facilityId: number): Promise<DeviceUsageDto[]> {
    const deviceItems = await this.facilityDeviceItemRepository
      .createQueryBuilder('item')
      .leftJoin('item.facilityDevice', 'device')
      .leftJoin('item.rentalDevices', 'rentalDevice')
      .leftJoin('rentalDevice.rental', 'rental')
      .where('device.facilityId = :facilityId', { facilityId })
      .select([
        'item.id as deviceId',
        'item.deviceCode as deviceCode',
        'item.status as currentStatus',
        'device.deviceType as deviceType',
        'COUNT(DISTINCT rental.id) as totalRentals',
        'MAX(rental.rentalDate) as lastRentalDate',
      ])
      .groupBy('item.id')
      .getRawMany();

    return deviceItems.map((item) => ({
      deviceId: item.deviceId,
      deviceCode: item.deviceCode,
      deviceType: item.deviceType,
      totalRentals: parseInt(item.totalRentals) || 0,
      currentStatus: item.currentStatus,
      lastRentalDate: item.lastRentalDate || null,
    }));
  }
}
