import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsEnum,
  IsDate,
  Min,
  IsNumber,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum DeviceTypeEnum {
  AR_GLASS = 'AR글라스',
  BONE_CONDUCTION = '골전도 이어폰',
  SMARTPHONE = '스마트폰',
}

export enum DeviceItemStatusEnum {
  AVAILABLE = 'available',
  RENTED = 'rented',
  BROKEN = 'broken',
  MAINTENANCE = 'maintenance',
}

// DTO for creating a device item
export class CreateDeviceItemDto {
  @ApiProperty({ description: '장비 코드', example: 'AR-001' })
  @IsString()
  deviceCode: string;

  @ApiPropertyOptional({ description: '시리얼 번호', example: 'SN202400001' })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: '등록일',
    example: '2024-01-15',
    type: String,
  })
  @IsString()
  @IsOptional()
  registrationDate?: string;

  @ApiPropertyOptional({ description: '비고' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO for creating a facility device (with items)
export class CreateFacilityDeviceDto {
  @ApiProperty({
    description: '장비 유형',
    enum: DeviceTypeEnum,
    example: DeviceTypeEnum.AR_GLASS,
  })
  @IsEnum(DeviceTypeEnum)
  deviceType: DeviceTypeEnum;

  @ApiProperty({
    description: '추가할 장비 아이템 목록',
    type: [CreateDeviceItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateDeviceItemDto)
  deviceItems: CreateDeviceItemDto[];

  @ApiPropertyOptional({ description: '메모' })
  @IsString()
  @IsOptional()
  memo?: string;
}

// DTO for updating device item
export class UpdateDeviceItemDto {
  @ApiPropertyOptional({ description: '장비 코드' })
  @IsString()
  @IsOptional()
  deviceCode?: string;

  @ApiPropertyOptional({ description: '시리얼 번호' })
  @IsString()
  @IsOptional()
  serialNumber?: string;

  @ApiPropertyOptional({
    description: '상태',
    enum: DeviceItemStatusEnum,
  })
  @IsEnum(DeviceItemStatusEnum)
  @IsOptional()
  status?: DeviceItemStatusEnum;

  @ApiPropertyOptional({ description: '등록일', type: String })
  @IsString()
  @IsOptional()
  registrationDate?: string;

  @ApiPropertyOptional({ description: '비고' })
  @IsString()
  @IsOptional()
  notes?: string;
}

// DTO for updating facility device
export class UpdateFacilityDeviceDto {
  @ApiPropertyOptional({ description: '메모' })
  @IsString()
  @IsOptional()
  memo?: string;
}

// Response DTO
export class DeviceItemResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  deviceCode: string;

  @ApiProperty()
  serialNumber: string;

  @ApiProperty({ enum: DeviceItemStatusEnum })
  status: string;

  @ApiProperty()
  registrationDate: string;

  @ApiProperty()
  notes: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class FacilityDeviceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  facilityId: number;

  @ApiProperty({ enum: DeviceTypeEnum })
  deviceType: string;

  @ApiProperty()
  qtyTotal: number;

  @ApiProperty()
  qtyAvailable: number;

  @ApiProperty()
  qtyRented: number;

  @ApiProperty()
  qtyBroken: number;

  @ApiProperty()
  memo: string;

  @ApiProperty({ type: [DeviceItemResponseDto] })
  deviceItems: DeviceItemResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
