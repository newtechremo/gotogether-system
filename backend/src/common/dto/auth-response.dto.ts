import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'admin' })
  username: string;

  @ApiProperty({ example: '관리자' })
  name: string;

  @ApiProperty({ example: 'super_admin' })
  role?: string;

  @ApiProperty({ example: ['all'] })
  permissions?: string[];

  @ApiProperty({ example: 1, required: false })
  facilityId?: number;

  @ApiProperty({ example: '서울시각장애인복지관', required: false })
  facilityName?: string;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIs...' })
  refresh_token: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ example: 3600 })
  expires_in: number;
}

export class ApiSuccessResponse<T = any> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: 'Success', required: false })
  message?: string;
}

export class ApiErrorResponse {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({
    type: 'object',
    properties: {
      code: { type: 'string', example: 'AUTH_001' },
      message: { type: 'string', example: 'Authentication failed' },
    },
  })
  error: {
    code: string;
    message: string;
  };
}
