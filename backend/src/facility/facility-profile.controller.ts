import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FacilityService } from './facility.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { User } from '../common/decorators/user.decorator';
import {
  FacilityProfileResponseDto,
  UpdateFacilityProfileDto,
  ChangeFacilityPasswordDto,
} from '../common/dto/facility-profile.dto';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/dto/auth-response.dto';

/**
 * 시설관리자 프로필 관리 컨트롤러
 * 시설관리자 본인의 프로필 조회 및 수정 기능 제공
 */
@ApiTags('Facility Profile')
@Controller('facility/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FacilityProfileController {
  constructor(private readonly facilityService: FacilityService) {}

  /**
   * 시설관리자 본인 프로필 조회
   * GET /facility/profile
   */
  @Get()
  @Roles('facility')
  @ApiOperation({
    summary: '시설관리자 본인 프로필 조회',
    description: `현재 로그인한 시설관리자의 프로필 정보를 조회합니다.

    **반환 데이터:**
    - 시설 ID, 코드, 이름
    - 담당자명, 연락처, 주소
    - 생성일, 수정일

    **참고:**
    - 비밀번호는 반환되지 않습니다.
    - JWT 토큰의 facilityId를 사용하여 본인 정보만 조회 가능합니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 조회 성공',
    type: FacilityProfileResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (시설관리자만 접근 가능)',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '프로필을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async getProfile(@User() user: any): Promise<ApiSuccessResponse> {
    const profile = await this.facilityService.getProfile(user.facilityId);
    return {
      success: true,
      data: profile,
    };
  }

  /**
   * 시설관리자 본인 프로필 수정
   * PUT /facility/profile
   */
  @Put()
  @Roles('facility')
  @ApiOperation({
    summary: '시설관리자 본인 프로필 수정',
    description: `현재 로그인한 시설관리자의 프로필 정보를 수정합니다.

    **수정 가능 항목:**
    - 담당자명 (managerName)
    - 담당자 연락처 (managerPhone)
    - 주소 (address)

    **수정 불가 항목:**
    - 시설 코드, 시설명, 로그인 아이디, 비밀번호

    **참고:**
    - 비밀번호 변경은 별도 API 사용 (PUT /facility/profile/password)
    - JWT 토큰의 facilityId를 사용하여 본인 정보만 수정 가능합니다.`,
  })
  @ApiResponse({
    status: 200,
    description: '프로필 수정 성공',
    type: FacilityProfileResponseDto,
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
    description: '권한 없음 (시설관리자만 접근 가능)',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '프로필을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async updateProfile(
    @User() user: any,
    @Body() updateProfileDto: UpdateFacilityProfileDto,
  ): Promise<ApiSuccessResponse> {
    const profile = await this.facilityService.updateProfile(
      user.facilityId,
      updateProfileDto,
    );
    return {
      success: true,
      data: profile,
      message: '프로필이 수정되었습니다.',
    };
  }

  /**
   * 시설관리자 비밀번호 변경
   * PUT /facility/profile/password
   */
  @Put('password')
  @Roles('facility')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '시설관리자 비밀번호 변경',
    description: `현재 로그인한 시설관리자의 비밀번호를 변경합니다.

    **필수 입력:**
    - 현재 비밀번호 (currentPassword)
    - 새 비밀번호 (newPassword)
    - 새 비밀번호 확인 (confirmPassword)

    **비밀번호 요구사항:**
    - 최소 8자 이상
    - 영문과 숫자 조합
    - 특수문자 사용 가능 (@$!%*#?&)

    **참고:**
    - 현재 비밀번호 확인 필수
    - 새 비밀번호와 확인 비밀번호 일치 확인
    - 변경 후 기존 토큰은 유지되지만, 재로그인 권장`,
  })
  @ApiResponse({
    status: 200,
    description: '비밀번호 변경 성공',
  })
  @ApiResponse({
    status: 400,
    description: '잘못된 요청 (유효성 검사 실패, 비밀번호 불일치)',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 401,
    description: '인증 실패 또는 현재 비밀번호 불일치',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 403,
    description: '권한 없음 (시설관리자만 접근 가능)',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 404,
    description: '프로필을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async changePassword(
    @User() user: any,
    @Body() changePasswordDto: ChangeFacilityPasswordDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.changePassword(
      user.facilityId,
      changePasswordDto,
    );
    return {
      success: true,
      data: result,
      message: result.message,
    };
  }
}
