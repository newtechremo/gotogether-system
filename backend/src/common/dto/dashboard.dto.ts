import { ApiProperty } from '@nestjs/swagger';

/**
 * 대시보드 통계 응답 DTO
 * 관리자 대시보드 KPI 통계 정보
 */
export class DashboardStatsDto {
  @ApiProperty({
    example: 15,
    description: '총 키오스크 수 (현재 목업 데이터)',
  })
  totalKiosks: number;

  @ApiProperty({
    example: 0,
    description: '총 시설 수 (실제 DB 조회)',
  })
  totalFacilities: number;

  @ApiProperty({
    example: 45,
    description: '오늘 대여 건수 (현재 목업 데이터)',
  })
  todayRentals: number;

  @ApiProperty({
    example: 3,
    description: '연체 건수 (현재 목업 데이터)',
  })
  overdueRentals: number;
}

/**
 * 대시보드 통계 API 성공 응답
 */
export class DashboardStatsResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: DashboardStatsDto })
  data: DashboardStatsDto;
}
