import { ApiProperty } from '@nestjs/swagger';

export class OverdueRentalDto {
  @ApiProperty({ description: '대여 ID' })
  id: number;

  @ApiProperty({ description: '키오스크 ID' })
  kioskId: number;

  @ApiProperty({ description: '키오스크 이름' })
  kioskName: string;

  @ApiProperty({ description: '설치 장소' })
  location: string;

  @ApiProperty({ description: '장비 이름 (시리얼 번호)' })
  deviceName: string;

  @ApiProperty({ description: '장비 종류', enum: ['AR_GLASS', 'BONE_CONDUCTION', 'SMARTPHONE'] })
  deviceType: string;

  @ApiProperty({ description: '대여 시간' })
  rentalTime: string;

  @ApiProperty({ description: '경과 시간 (시간 단위)' })
  elapsedHours: number;

  @ApiProperty({ description: '대여자 이름' })
  renterName: string;

  @ApiProperty({ description: '대여자 전화번호' })
  renterPhone: string;

  @ApiProperty({ description: '심각도', enum: ['critical', 'warning'] })
  severity: 'critical' | 'warning';
}

export class OverdueRentalsResponseDto {
  @ApiProperty({ description: '성공 여부' })
  success: boolean;

  @ApiProperty({ description: '장기 미반납 목록', type: [OverdueRentalDto] })
  data: OverdueRentalDto[];
}
