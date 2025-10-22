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
  REPORTED = '신고접수',
  IN_REPAIR = '수리중',
  COMPLETED = '수리완료',
}

// 고장신고 등록 DTO
export class CreateFacilityRepairDto {
  @ApiProperty({
    description: '기기 종류',
    example: 'AR글라스',
  })
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty({
    description: '수리할 장비 아이템 ID',
    example: 1,
  })
  @IsInt()
  @IsNotEmpty()
  facilityDeviceItemId: number;

  @ApiProperty({
    description: '고장 증상',
    example: '화면이 깨져서 표시가 안됩니다',
  })
  @IsString()
  @IsNotEmpty()
  symptomDescription: string;
}

// 수리 정보 수정 DTO (상태 변경 및 수리 메모)
export class UpdateFacilityRepairDto {
  @ApiPropertyOptional({
    description: '수리 상태',
    enum: RepairStatusEnum,
  })
  @IsOptional()
  @IsEnum(RepairStatusEnum)
  repairStatus?: RepairStatusEnum;

  @ApiPropertyOptional({
    description: '수리 메모',
    example: '부품 주문 완료, 3일 내 수리 예정',
  })
  @IsOptional()
  @IsString()
  repairMemo?: string;
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
  deviceType: string;

  @ApiProperty()
  deviceCode: string;

  @ApiProperty()
  reportDate: string;

  @ApiProperty()
  repairStatus: string;

  @ApiProperty()
  symptomDescription: string;

  @ApiPropertyOptional()
  repairMemo?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
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
