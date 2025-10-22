import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsNotEmpty,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * 시설관리자 프로필 조회 응답 DTO
 */
export class FacilityProfileResponseDto {
  @ApiProperty({ description: '시설 ID', example: 1 })
  id: number;

  @ApiProperty({ description: '시설 코드', example: 'FAC001' })
  facilityCode: string;

  @ApiProperty({ description: '시설명', example: '서울시각장애인복지관' })
  facilityName: string;

  @ApiProperty({ description: '로그인 아이디', example: 'facility001' })
  username: string;

  @ApiProperty({ description: '담당자명', example: '김철수' })
  managerName: string;

  @ApiProperty({ description: '담당자 연락처', example: '010-1234-5678' })
  managerPhone: string;

  @ApiProperty({ description: '주소', example: '서울시 강남구 ...' })
  address: string;

  @ApiProperty({ description: '생성일시', example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: '수정일시', example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

/**
 * 시설관리자 프로필 수정 DTO
 */
export class UpdateFacilityProfileDto {
  @ApiProperty({
    description: '담당자명',
    example: '김철수',
    required: false,
  })
  @IsString()
  @IsOptional()
  managerName?: string;

  @ApiProperty({
    description: '담당자 연락처 (010-XXXX-XXXX 형식)',
    example: '010-1234-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^01[0-9]-\d{4}-\d{4}$/, {
    message: '전화번호는 010-XXXX-XXXX 형식이어야 합니다.',
  })
  managerPhone?: string;

  @ApiProperty({
    description: '주소',
    example: '서울시 강남구 테헤란로 123',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}

/**
 * 시설관리자 비밀번호 변경 DTO
 */
export class ChangeFacilityPasswordDto {
  @ApiProperty({
    description: '현재 비밀번호',
    example: 'currentPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: '현재 비밀번호를 입력해주세요.' })
  currentPassword: string;

  @ApiProperty({
    description: '새 비밀번호 (최소 8자, 영문+숫자 조합)',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: '새 비밀번호를 입력해주세요.' })
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
  })
  newPassword: string;

  @ApiProperty({
    description: '새 비밀번호 확인',
    example: 'newPassword123',
  })
  @IsString()
  @IsNotEmpty({ message: '새 비밀번호 확인을 입력해주세요.' })
  confirmPassword: string;
}
