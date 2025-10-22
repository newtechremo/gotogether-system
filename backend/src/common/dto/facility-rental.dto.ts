import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  Min,
  IsPhoneNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

// Enums
export enum RentalTypeEnum {
  INDIVIDUAL = '개인',
  GROUP = '단체',
}

export enum RentalStatusEnum {
  RENTED = '대여중',
  RETURNED = '반납완료',
  OVERDUE = '연체',
}

export enum DisabilityTypeEnum {
  VISUAL = '시각장애',
  HEARING = '청각장애',
  PHYSICAL = '지체장애',
  INTELLECTUAL = '지적장애',
  OTHER = '기타',
}

export enum AgeGroupEnum {
  TEENS = '10대',
  TWENTIES = '20대',
  THIRTIES = '30대',
  FORTIES = '40대',
  FIFTIES = '50대',
  SIXTIES = '60대',
  SEVENTIES_PLUS = '70대이상',
}

export enum GenderEnum {
  MALE = '남성',
  FEMALE = '여성',
  OTHER = '기타',
}

// 대여할 장비 정보
export class RentalDeviceDto {
  @ApiProperty({ description: '장비 유형', example: 'AR글라스' })
  @IsString()
  @IsNotEmpty()
  deviceType: string;

  @ApiProperty({ description: '수량', example: 2 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    description: '특정 장비 아이템 ID 배열 (선택사항)',
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  deviceItemIds?: number[];
}

// 대여 신청 DTO
export class CreateFacilityRentalDto {
  @ApiProperty({ description: '대여자 이름', example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  renterName: string;

  @ApiProperty({ description: '대여자 전화번호', example: '010-1234-5678' })
  @IsString()
  @IsNotEmpty()
  renterPhone: string;

  @ApiProperty({
    description: '대여자 장애 유형',
    enum: DisabilityTypeEnum,
    example: DisabilityTypeEnum.VISUAL,
  })
  @IsEnum(DisabilityTypeEnum)
  renterDisabilityId: DisabilityTypeEnum;

  @ApiPropertyOptional({
    description: '장애인 등록번호',
    example: '12-345678',
  })
  @IsOptional()
  @IsString()
  renterDisabilityNumber?: string;

  @ApiProperty({
    description: '대여 유형',
    enum: RentalTypeEnum,
    example: RentalTypeEnum.INDIVIDUAL,
  })
  @IsEnum(RentalTypeEnum)
  rentalType: RentalTypeEnum;

  @ApiPropertyOptional({
    description: '예상 이용 인원 (단체 대여시)',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  expectedUsers?: number;

  @ApiProperty({ description: '대여 시작일', example: '2025-01-15' })
  @IsDateString()
  rentalDate: string;

  @ApiProperty({ description: '반납 예정일', example: '2025-01-20' })
  @IsDateString()
  returnDate: string;

  @ApiProperty({
    description: '대여 목적',
    example: '영화 관람',
  })
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty({ description: '지역', example: '서울' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({
    description: '연령대',
    enum: AgeGroupEnum,
    example: AgeGroupEnum.THIRTIES,
  })
  @IsEnum(AgeGroupEnum)
  ageGroup: AgeGroupEnum;

  @ApiProperty({
    description: '성별',
    enum: GenderEnum,
    example: GenderEnum.MALE,
  })
  @IsEnum(GenderEnum)
  gender: GenderEnum;

  @ApiProperty({
    description: '대여할 장비 목록',
    type: [RentalDeviceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RentalDeviceDto)
  devices: RentalDeviceDto[];

  @ApiPropertyOptional({ description: '메모', example: '배송 필요' })
  @IsOptional()
  @IsString()
  memo?: string;
}

// 대여 정보 수정 DTO
export class UpdateFacilityRentalDto {
  @ApiPropertyOptional({ description: '대여자 이름' })
  @IsOptional()
  @IsString()
  renterName?: string;

  @ApiPropertyOptional({ description: '대여자 전화번호' })
  @IsOptional()
  @IsString()
  renterPhone?: string;

  @ApiPropertyOptional({
    description: '반납 예정일',
    example: '2025-01-25',
  })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({
    description: '상태',
    enum: RentalStatusEnum,
  })
  @IsOptional()
  @IsEnum(RentalStatusEnum)
  status?: RentalStatusEnum;

  @ApiPropertyOptional({ description: '메모' })
  @IsOptional()
  @IsString()
  memo?: string;
}

// 반납 처리 DTO
export class ReturnRentalDto {
  @ApiPropertyOptional({
    description: '실제 반납일 (미입력시 오늘 날짜)',
    example: '2025-01-20',
  })
  @IsOptional()
  @IsDateString()
  actualReturnDate?: string;

  @ApiPropertyOptional({
    description: '반납 메모',
    example: '정상 반납',
  })
  @IsOptional()
  @IsString()
  returnMemo?: string;
}

// 대여 장비 응답 DTO
export class RentalDeviceResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  deviceType: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional()
  facilityDeviceItemId?: number;
}

// 대여 응답 DTO
export class FacilityRentalResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  facilityId: number;

  @ApiProperty()
  renterName: string;

  @ApiProperty()
  renterPhone: string;

  @ApiProperty()
  renterDisabilityId: string;

  @ApiPropertyOptional()
  renterDisabilityNumber?: string;

  @ApiProperty()
  rentalType: string;

  @ApiPropertyOptional()
  expectedUsers?: number;

  @ApiProperty()
  rentalDate: string;

  @ApiProperty()
  returnDate: string;

  @ApiProperty()
  purpose: string;

  @ApiProperty()
  region: string;

  @ApiProperty()
  ageGroup: string;

  @ApiProperty()
  gender: string;

  @ApiProperty()
  status: string;

  @ApiPropertyOptional()
  actualReturnDate?: Date;

  @ApiPropertyOptional()
  rentalPeriod?: number;

  @ApiPropertyOptional()
  rentalWeekday?: string;

  @ApiPropertyOptional()
  memo?: string;

  @ApiProperty({ type: [RentalDeviceResponseDto] })
  rentalDevices: RentalDeviceResponseDto[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

// 대여 목록 조회 쿼리 DTO
export class RentalListQueryDto {
  @ApiPropertyOptional({ description: '상태 필터', enum: RentalStatusEnum })
  @IsOptional()
  @IsEnum(RentalStatusEnum)
  status?: RentalStatusEnum;

  @ApiPropertyOptional({ description: '시작일' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: '종료일' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: '검색어 (대여자명, 전화번호)' })
  @IsOptional()
  @IsString()
  search?: string;
}
