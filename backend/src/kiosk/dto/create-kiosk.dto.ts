import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateKioskDto {
  @ApiProperty({ description: '키오스크 이름', example: 'Go Together 1호' })
  @IsString()
  name: string;

  @ApiProperty({ description: '설치 장소', example: '서울 메가박스 강남점' })
  @IsString()
  location: string;

  @ApiProperty({
    description: '담당자명',
    example: '홍길동',
    required: false,
  })
  @IsOptional()
  @IsString()
  managerName?: string;

  @ApiProperty({
    description: '담당자 연락처',
    example: '010-1234-5678',
    required: false,
  })
  @IsOptional()
  @IsString()
  managerPhone?: string;

  @ApiProperty({
    description: '설치일',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  installationDate?: string;

  @ApiProperty({
    description: '키오스크 상태',
    enum: ['active', 'inactive', 'maintenance'],
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'maintenance'])
  status?: string;

  @ApiProperty({ description: '비고', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
