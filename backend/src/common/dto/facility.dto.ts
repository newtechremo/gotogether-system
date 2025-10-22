import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNotEmpty, MinLength } from 'class-validator';

export class CreateFacilityDto {
  @ApiProperty({ description: '시설 코드', example: 'FAC001' })
  @IsString()
  @IsNotEmpty()
  facilityCode: string;

  @ApiProperty({ description: '시설명', example: '서울시각장애인복지관' })
  @IsString()
  @IsNotEmpty()
  facilityName: string;

  @ApiProperty({ description: '로그인 아이디', example: 'facility001' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: '비밀번호', example: 'password123' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ description: '담당자명', example: '김철수', required: false })
  @IsString()
  @IsOptional()
  managerName?: string;

  @ApiProperty({
    description: '담당자 연락처',
    example: '010-1234-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  managerPhone?: string;

  @ApiProperty({
    description: '주소',
    example: '서울시 강남구 ...',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateFacilityDto {
  @ApiProperty({ description: '시설 코드', example: 'FAC001', required: false })
  @IsString()
  @IsOptional()
  facilityCode?: string;

  @ApiProperty({
    description: '시설명',
    example: '서울시각장애인복지관',
    required: false,
  })
  @IsString()
  @IsOptional()
  facilityName?: string;

  @ApiProperty({
    description: '로그인 아이디',
    example: 'facility001',
    required: false,
  })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({
    description: '비밀번호',
    example: 'password123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiProperty({ description: '담당자명', example: '김철수', required: false })
  @IsString()
  @IsOptional()
  managerName?: string;

  @ApiProperty({
    description: '담당자 연락처',
    example: '010-1234-5678',
    required: false,
  })
  @IsString()
  @IsOptional()
  managerPhone?: string;

  @ApiProperty({
    description: '주소',
    example: '서울시 강남구 ...',
    required: false,
  })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ description: '활성 상태', example: true, required: false })
  @IsOptional()
  isActive?: boolean;
}
