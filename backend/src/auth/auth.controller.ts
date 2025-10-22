import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/login.dto';
import {
  AuthResponseDto,
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/dto/auth-response.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '전체관리자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  async adminLogin(@Body() loginDto: LoginDto): Promise<ApiSuccessResponse> {
    const result = await this.authService.adminLogin(loginDto);
    return {
      success: true,
      data: result,
    };
  }

  @Public()
  @Post('facility/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '시설관리자 로그인' })
  @ApiResponse({
    status: 200,
    description: '로그인 성공',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  async facilityLogin(@Body() loginDto: LoginDto): Promise<ApiSuccessResponse> {
    const result = await this.authService.facilityLogin(loginDto);
    return {
      success: true,
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: '현재 로그인 사용자 정보 조회' })
  @ApiResponse({
    status: 200,
    description: '사용자 정보 조회 성공',
  })
  async getCurrentUser(@User() user: any): Promise<ApiSuccessResponse> {
    // JWT payload의 필드명을 프론트엔드 타입과 일치시키기
    const { userId, sub, ...rest } = user;
    return {
      success: true,
      data: {
        id: userId || sub, // userId 또는 sub를 id로 매핑
        ...rest,
      },
    };
  }
}
