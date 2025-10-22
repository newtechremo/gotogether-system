import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsNumber,
  Min,
} from 'class-validator';

// Enums
export enum RepairStatusEnum {
  IN_REPAIR = '수리중',
  COMPLETED = '수리완료',
}

// 수리 등록 DTO
export class CreateFacilityRepairDto {
  @ApiProperty({
    description: '수리할 장비 아이템 ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  facilityDeviceItemId: number;

  @ApiProperty({
    description: '수리 시작일',
    example: '2025-01-15',
  })
  @IsDateString()
  repairDate: string;

  @ApiProperty({
    description: '수리 내용',
    example: '화면 깨짐으로 인한 디스플레이 교체',
  })
  @IsString()
  @IsNotEmpty()
  repairDescription: string;

  @ApiPropertyOptional({
    description: '예상 수리 비용 (원)',
    example: 150000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  repairCost?: number;

  @ApiPropertyOptional({
    description: '수리 업체',
    example: '(주)테크서비스',
  })
  @IsOptional()
  @IsString()
  repairCompany?: string;

  @ApiPropertyOptional({
    description: '메모',
    example: '보증 기간 내 수리',
  })
  @IsOptional()
  @IsString()
  memo?: string;
}

// 수리 정보 수정 DTO
export class UpdateFacilityRepairDto {
  @ApiPropertyOptional({
    description: '수리 상태',
    enum: RepairStatusEnum,
  })
  @IsOptional()
  @IsEnum(RepairStatusEnum)
  repairStatus?: RepairStatusEnum;

  @ApiPropertyOptional({
    description: '수리 내용',
  })
  @IsOptional()
  @IsString()
  repairDescription?: string;

  @ApiPropertyOptional({
    description: '수리 비용 (원)',
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  repairCost?: number;

  @ApiPropertyOptional({
    description: '수리 업체',
  })
  @IsOptional()
  @IsString()
  repairCompany?: string;

  @ApiPropertyOptional({
    description: '수리 완료일',
    example: '2025-01-20',
  })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional({
    description: '메모',
  })
  @IsOptional()
  @IsString()
  memo?: string;
}

// 수리 완료 처리 DTO
export class CompleteRepairDto {
  @ApiPropertyOptional({
    description: '수리 완료일 (미입력시 오늘 날짜)',
    example: '2025-01-20',
  })
  @IsOptional()
  @IsDateString()
  completionDate?: string;

  @ApiPropertyOptional({
    description: '최종 수리 비용 (원)',
    example: 150000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  repairCost?: number;

  @ApiPropertyOptional({
    description: '완료 메모',
    example: '정상적으로 수리 완료됨',
  })
  @IsOptional()
  @IsString()
  completionMemo?: string;
}

// 수리 응답 DTO
export class FacilityRepairResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  facilityId: number;

  @ApiProperty()
  facilityDeviceItemId: number;

  @ApiProperty()
  repairDate: string;

  @ApiProperty()
  repairStatus: string;

  @ApiProperty()
  repairDescription: string;

  @ApiPropertyOptional()
  repairCost?: number;

  @ApiPropertyOptional()
  repairCompany?: string;

  @ApiPropertyOptional()
  completionDate?: string;

  @ApiPropertyOptional()
  memo?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  // 장비 정보 (populated)
  @ApiPropertyOptional()
  deviceItem?: {
    id: number;
    deviceCode: string;
    deviceType: string;
    status: string;
  };
}

// 수리 목록 조회 쿼리 DTO
export class RepairListQueryDto {
  @ApiPropertyOptional({
    description: '상태 필터',
    enum: RepairStatusEnum,
  })
  @IsOptional()
  @IsEnum(RepairStatusEnum)
  status?: RepairStatusEnum;

  @ApiPropertyOptional({
    description: '시작일',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: '종료일',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: '장비 코드 검색',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
