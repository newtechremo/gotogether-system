import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExaminationDto {
  @ApiProperty({ description: '키오스크 ID', example: 1, required: false })
  @IsOptional()
  @IsInt()
  kioskId?: number;

  @ApiProperty({ description: '점검 일자', example: '2024-01-01' })
  @IsDateString()
  examinationDate: string;

  @ApiProperty({
    description: '점검 결과',
    enum: ['pass', 'fail', 'pending'],
    example: 'pass',
    required: false,
  })
  @IsOptional()
  @IsEnum(['pass', 'fail', 'pending'])
  result?: string;

  @ApiProperty({
    description: '점검 상태',
    enum: ['normal', 'warning', 'critical'],
    example: 'normal',
    required: false,
  })
  @IsOptional()
  @IsEnum(['normal', 'warning', 'critical'])
  status?: string;

  @ApiProperty({ description: '비고', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
