import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';
import {
  KioskDeviceType,
  KioskDeviceStatus,
} from '../../entities/kiosk-device.entity';

export class CreateKioskDto {
  @ApiProperty({
    description: '기기 시리얼 번호',
    example: 'KSK-AR-001',
  })
  @IsString()
  @IsNotEmpty()
  device_serial: string;

  @ApiProperty({
    description: '기기 유형',
    enum: KioskDeviceType,
    example: KioskDeviceType.AR_GLASS,
  })
  @IsEnum(KioskDeviceType)
  @IsNotEmpty()
  device_type: KioskDeviceType;

  @ApiProperty({
    description: '모델명',
    example: 'AR Glass Pro 2024',
  })
  @IsString()
  @IsNotEmpty()
  model_name: string;

  @ApiProperty({
    description: '시설 ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  facility_id: number;

  @ApiProperty({
    description: '기기 상태',
    enum: KioskDeviceStatus,
    example: KioskDeviceStatus.AVAILABLE,
    required: false,
  })
  @IsEnum(KioskDeviceStatus)
  @IsOptional()
  status?: KioskDeviceStatus;

  @ApiProperty({
    description: '등록일',
    example: '2024-01-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  registration_date?: string;

  @ApiProperty({
    description: '비고',
    example: '초기 등록',
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateKioskDto extends PartialType(CreateKioskDto) {
  @ApiProperty({
    description: '최근 점검일',
    example: '2024-03-15',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  last_maintenance_date?: string;
}

export class KioskResponseDto {
  @ApiProperty({ description: '키오스크 기기 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '기기 시리얼 번호', example: 'KSK-AR-001' })
  deviceSerial: string;

  @ApiProperty({
    description: '기기 유형',
    enum: KioskDeviceType,
    example: KioskDeviceType.AR_GLASS,
  })
  deviceType: KioskDeviceType;

  @ApiProperty({ description: '모델명', example: 'AR Glass Pro 2024' })
  modelName: string;

  @ApiProperty({ description: '시설 ID', example: 1 })
  facilityId: number;

  @ApiProperty({
    description: '기기 상태',
    enum: KioskDeviceStatus,
    example: KioskDeviceStatus.AVAILABLE,
  })
  status: KioskDeviceStatus;

  @ApiProperty({ description: '등록일', example: '2024-01-15', nullable: true })
  registrationDate: Date;

  @ApiProperty({
    description: '최근 점검일',
    example: '2024-03-15',
    nullable: true,
  })
  lastMaintenanceDate: Date;

  @ApiProperty({ description: '비고', example: '초기 등록', nullable: true })
  notes: string;

  @ApiProperty({ description: '생성일시', example: '2024-01-15T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2024-03-15T14:20:00Z' })
  updatedAt: Date;

  @ApiProperty({
    description: '시설 정보',
    nullable: true,
    example: {
      id: 1,
      facilityCode: 'FAC001',
      facilityName: '서울시각장애인복지관',
    },
  })
  facility?: {
    id: number;
    facilityCode: string;
    facilityName: string;
  };
}

export class KioskStatsDto {
  @ApiProperty({ description: '시설 ID', example: 1 })
  facilityId: number;

  @ApiProperty({ description: '시설명', example: '서울시각장애인복지관' })
  facilityName: string;

  @ApiProperty({ description: '전체 기기 수', example: 20 })
  totalDevices: number;

  @ApiProperty({ description: '대여 가능', example: 15 })
  available: number;

  @ApiProperty({ description: '대여 중', example: 3 })
  rented: number;

  @ApiProperty({ description: '점검 중', example: 1 })
  maintenance: number;

  @ApiProperty({ description: '고장', example: 1 })
  broken: number;
}

export class KioskListResponseDto {
  @ApiProperty({
    description: '키오스크 기기 목록',
    type: [KioskResponseDto],
  })
  items: KioskResponseDto[];

  @ApiProperty({ description: '전체 개수', example: 100 })
  total: number;

  @ApiProperty({ description: '현재 페이지', example: 1 })
  page: number;

  @ApiProperty({ description: '페이지당 개수', example: 10 })
  limit: number;

  @ApiProperty({ description: '전체 페이지 수', example: 10 })
  totalPages: number;
}
