import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

// 대시보드 통계 응답
export class DashboardStatsDto {
  @ApiProperty({ description: '총 장비 수' })
  totalDevices: number;

  @ApiProperty({ description: '사용 가능 장비 수' })
  availableDevices: number;

  @ApiProperty({ description: '대여 중 장비 수' })
  rentedDevices: number;

  @ApiProperty({ description: '고장 장비 수' })
  brokenDevices: number;

  @ApiProperty({ description: '현재 대여 건수' })
  currentRentals: number;

  @ApiProperty({ description: '오늘 대여 건수' })
  todayRentals: number;

  @ApiProperty({ description: '오늘 반납 건수' })
  todayReturns: number;

  @ApiProperty({ description: '연체 중인 대여 건수' })
  overdueRentals: number;
}

// 장비 타입별 통계
export class DeviceTypeStatsDto {
  @ApiProperty({ description: '장비 유형' })
  deviceType: string;

  @ApiProperty({ description: '총 수량' })
  total: number;

  @ApiProperty({ description: '사용 가능' })
  available: number;

  @ApiProperty({ description: '대여 중' })
  rented: number;

  @ApiProperty({ description: '고장' })
  broken: number;

  @ApiProperty({ description: '사용률 (%)' })
  utilizationRate: number;
}

// 월별 통계 쿼리
export class MonthlyStatsQueryDto {
  @ApiPropertyOptional({ description: '년도', example: 2024 })
  @IsOptional()
  year?: number;

  @ApiPropertyOptional({ description: '월', example: 10 })
  @IsOptional()
  month?: number;
}

// 월별 통계 응답
export class MonthlyStatsDto {
  @ApiProperty({ description: '년도' })
  year: number;

  @ApiProperty({ description: '월' })
  month: number;

  @ApiProperty({ description: '총 대여 건수' })
  totalRentals: number;

  @ApiProperty({ description: '총 반납 건수' })
  totalReturns: number;

  @ApiProperty({ description: '개인 대여' })
  individualRentals: number;

  @ApiProperty({ description: '단체 대여' })
  groupRentals: number;

  @ApiProperty({ description: '대여한 총 인원' })
  totalUsers: number;

  @ApiProperty({ description: '장비 타입별 대여 수', type: Object })
  byDeviceType: Record<string, number>;
}

// 일별 통계 쿼리
export class DailyStatsQueryDto {
  @ApiPropertyOptional({ description: '시작일', example: '2024-10-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료일', example: '2024-10-31' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// 일별 통계 응답
export class DailyStatsDto {
  @ApiProperty({ description: '날짜' })
  date: string;

  @ApiProperty({ description: '대여 건수' })
  rentals: number;

  @ApiProperty({ description: '반납 건수' })
  returns: number;
}

// 장비 이용 현황
export class DeviceUsageDto {
  @ApiProperty({ description: '장비 ID' })
  deviceId: number;

  @ApiProperty({ description: '장비 코드' })
  deviceCode: string;

  @ApiProperty({ description: '장비 유형' })
  deviceType: string;

  @ApiProperty({ description: '총 대여 횟수' })
  totalRentals: number;

  @ApiProperty({ description: '현재 상태' })
  currentStatus: string;

  @ApiProperty({ description: '최근 대여일' })
  lastRentalDate: string | null;
}
