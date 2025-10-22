import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  Matches,
} from 'class-validator';

/**
 * 전체관리자용 시설 비밀번호 재설정 요청 DTO
 */
export class ResetFacilityPasswordDto {
  @ApiProperty({
    description: '새 비밀번호 (autoGenerate가 true면 무시됨)',
    example: 'newSecurePassword123',
    required: false,
  })
  @IsString()
  @IsOptional()
  @MinLength(8, { message: '비밀번호는 최소 8자 이상이어야 합니다.' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message: '비밀번호는 영문과 숫자를 포함해야 합니다.',
  })
  newPassword?: string;

  @ApiProperty({
    description: '비밀번호 자동 생성 여부 (true면 newPassword 무시)',
    example: true,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  autoGenerate?: boolean;
}

/**
 * 비밀번호 재설정 응답 DTO
 */
export class ResetFacilityPasswordResponseDto {
  @ApiProperty({
    description: '재설정된 비밀번호 (평문, 1회만 표시됨)',
    example: 'SecurePass123!',
  })
  newPassword: string;

  @ApiProperty({
    description: '메시지',
    example:
      '비밀번호가 재설정되었습니다. 이 비밀번호는 다시 표시되지 않습니다.',
  })
  message: string;
}
