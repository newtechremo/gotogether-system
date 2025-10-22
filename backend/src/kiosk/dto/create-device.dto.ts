import {
  IsEnum,
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { KioskDeviceType } from '../../entities/kiosk-device.entity';

export class CreateDeviceDto {
  @ValidateIf((o) => o.kioskId !== undefined)
  @IsOptional()
  @IsInt()
  kioskId?: number; // Set from URL param

  @ApiProperty({
    description: '장비 종류',
    enum: KioskDeviceType,
    example: KioskDeviceType.AR_GLASS,
  })
  @IsEnum(KioskDeviceType)
  deviceType: KioskDeviceType;

  @ApiProperty({
    description: '시리얼 번호',
    example: 'AR-001-2024',
  })
  @IsString()
  serialNumber: string;

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
    example: '신규 입고',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
