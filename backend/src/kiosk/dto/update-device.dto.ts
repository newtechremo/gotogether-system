import {
  IsEnum,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  KioskDeviceType,
  KioskDeviceStatus,
} from '../../entities/kiosk-device.entity';

export class UpdateDeviceDto {
  @ApiPropertyOptional({
    description: '장비 종류',
    enum: KioskDeviceType,
    example: KioskDeviceType.AR_GLASS,
  })
  @IsOptional()
  @IsEnum(KioskDeviceType)
  deviceType?: KioskDeviceType;

  @ApiPropertyOptional({
    description: '시리얼 번호',
    example: 'AR-001-2024',
  })
  @IsOptional()
  @IsString()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: '키오스크 보관함 번호',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  boxNumber?: number;

  @ApiPropertyOptional({
    description: '장비 상태',
    enum: KioskDeviceStatus,
    example: KioskDeviceStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(KioskDeviceStatus)
  status?: KioskDeviceStatus;

  @ApiPropertyOptional({
    description: 'NFC 태그 ID',
    example: 'NFC-TAG-001',
  })
  @IsOptional()
  @IsString()
  nfcTagId?: string;

  @ApiPropertyOptional({
    description: '구매일 (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsOptional()
  @IsDateString()
  purchaseDate?: string;

  @ApiPropertyOptional({
    description: '비고',
    example: '수리 완료',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
