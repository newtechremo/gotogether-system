import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  DashboardStatsResponseDto,
  DashboardStatsDto,
} from '../common/dto/dashboard.dto';
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from '../common/dto/auth-response.dto';
import {
  ResetFacilityPasswordDto,
  ResetFacilityPasswordResponseDto,
} from '../common/dto/reset-facility-password.dto';
import { OverdueRentalsResponseDto } from '../common/dto/overdue-rentals.dto';

/**
 * 관리자 API 컨트롤러
 * 대시보드 통계, 전체 시스템 관리 기능 제공
 */
@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * 대시보드 KPI 통계 조회
   * GET /admin/dashboard/stats
   *
   * @returns 대시보드 통계 데이터
   */
  @Get('dashboard/stats')
  @Roles('super_admin', 'admin')
  @ApiOperation({
    summary: '대시보드 KPI 통계 조회',
    description: `관리자 대시보드의 주요 지표(KPI) 통계를 조회합니다.

    **반환 데이터:**
    - totalKiosks: 총 키오스크 수 (현재 목업 값: 15)
    - totalFacilities: 총 시설 수 (실제 DB 조회)
    - todayRentals: 오늘 대여 건수 (현재 목업 값: 45)
    - overdueRentals: 연체 건수 (현재 목업 값: 3)

    **참고:**
    - 키오스크, 대여, 연체 데이터는 현재 목업 데이터 사용 중
    - 해당 엔티티 구현 후 실제 DB 조회로 변경 예정`,
  })
  @ApiResponse({
    status: 200,
    description: '통계 조회 성공',
    type: DashboardStatsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (관리자 권한 필요)',
    type: ApiErrorResponse,
  })
  async getDashboardStats(): Promise<{
    success: boolean;
    data: DashboardStatsDto;
  }> {
    const stats = await this.adminService.getDashboardStats();
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * 시설 비밀번호 재설정 (전체관리자 전용)
   * POST /admin/facilities/:id/reset-password
   *
   * @param id 시설 ID
   * @param resetPasswordDto 비밀번호 재설정 옵션
   * @returns 새 비밀번호 (평문, 1회만 표시)
   */
  @Post('facilities/:id/reset-password')
  @Roles('super_admin', 'admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '시설 비밀번호 재설정',
    description: `전체관리자가 시설의 비밀번호를 재설정합니다.

    **사용 시나리오:**
    - 시설관리자가 비밀번호를 분실한 경우
    - 보안상 비밀번호 강제 변경이 필요한 경우

    **재설정 방법:**
    1. 자동 생성: autoGenerate를 true로 설정하면 안전한 랜덤 비밀번호 생성 (12자, 영문+숫자+특수문자)
    2. 직접 입력: newPassword에 원하는 비밀번호 입력 (최소 8자, 영문+숫자 조합)

    **중요:**
    - 재설정된 비밀번호는 응답으로 1회만 표시됩니다.
    - 반드시 시설관리자에게 전달해야 하며, 안전하게 보관해야 합니다.
    - 재설정 후 해당 시설의 기존 세션은 유지됩니다 (재로그인 필요 없음).`,
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 재설정 성공',
    type: ResetFacilityPasswordResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효성 검사 실패)',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (전체관리자 권한 필요)',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async resetFacilityPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetFacilityPasswordDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.adminService.resetFacilityPassword(
      id,
      resetPasswordDto,
    );
    return {
      success: true,
      data: result,
      message: result.message,
    };
  }

  /**
   * 키오스크 목록 조회
   * GET /admin/kiosks
   *
   * @returns 키오스크 목록
   */
  @Get('kiosks')
  @Roles('super_admin', 'admin')
  @ApiOperation({
    summary: '키오스크 목록 조회',
    description: '전체 키오스크 목록을 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '키오스크 목록 조회 성공',
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (관리자 권한 필요)',
    type: ApiErrorResponse,
  })
  async getKiosks(): Promise<{
    success: boolean;
    data: any[];
  }> {
    const data = await this.adminService.getKiosks();
    return {
      success: true,
      data,
    };
  }

  /**
   * 장기 미반납 목록 조회
   * GET /admin/overdue-rentals
   *
   * @returns 장기 미반납 목록
   */
  @Get('overdue-rentals')
  @Roles('super_admin', 'admin')
  @ApiOperation({
    summary: '장기 미반납 목록 조회',
    description: `키오스크에서 반납 예정 시간을 초과한 대여 건을 조회합니다.

    **반환 데이터:**
    - 대여 ID, 키오스크 정보, 장비 정보, 대여자 정보
    - 경과 시간 (시간 단위)
    - 심각도: 72시간 이상 = critical, 그 외 = warning

    **정렬:**
    - 대여 시간 오름차순 (오래된 순)`,
  })
  @ApiResponse({
    status: 200,
    description: '장기 미반납 목록 조회 성공',
    type: OverdueRentalsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (관리자 권한 필요)',
    type: ApiErrorResponse,
  })
  async getOverdueRentals(): Promise<OverdueRentalsResponseDto> {
    const data = await this.adminService.getOverdueRentals();
    return {
      success: true,
      data,
    };
  }
}
