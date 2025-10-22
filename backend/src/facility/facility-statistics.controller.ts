import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FacilityStatisticsService } from './facility-statistics.service';
import {
  DashboardStatsDto,
  DeviceTypeStatsDto,
  MonthlyStatsDto,
  DailyStatsDto,
  DeviceUsageDto,
} from '../common/dto/facility-statistics.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ApiSuccessResponse } from '../common/dto/auth-response.dto';

@ApiTags('Facility Statistics')
@Controller('facility/statistics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityStatisticsController {
  constructor(private readonly statisticsService: FacilityStatisticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: DashboardStatsDto,
  })
  async getDashboardStats(@User() user: any): Promise<ApiSuccessResponse> {
    const stats = await this.statisticsService.getDashboardStats(
      user.facilityId,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @Get('device-types')
  @ApiOperation({ summary: '장비 타입별 통계' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [DeviceTypeStatsDto],
  })
  async getDeviceTypeStats(@User() user: any): Promise<ApiSuccessResponse> {
    const stats = await this.statisticsService.getDeviceTypeStats(
      user.facilityId,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @Get('monthly')
  @ApiOperation({ summary: '월별 통계' })
  @ApiQuery({ name: 'year', required: false, type: Number })
  @ApiQuery({ name: 'month', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: MonthlyStatsDto,
  })
  async getMonthlyStats(
    @User() user: any,
    @Query('year', new ParseIntPipe({ optional: true })) year?: number,
    @Query('month', new ParseIntPipe({ optional: true })) month?: number,
  ): Promise<ApiSuccessResponse> {
    const stats = await this.statisticsService.getMonthlyStats(
      user.facilityId,
      year,
      month,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @Get('daily')
  @ApiOperation({ summary: '일별 통계 (기간)' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    example: '2024-10-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    example: '2024-10-31',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [DailyStatsDto],
  })
  async getDailyStats(
    @User() user: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<ApiSuccessResponse> {
    const stats = await this.statisticsService.getDailyStats(
      user.facilityId,
      startDate,
      endDate,
    );
    return {
      success: true,
      data: stats,
    };
  }

  @Get('device-usage')
  @ApiOperation({ summary: '장비 이용 현황 (개별 장비별)' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [DeviceUsageDto],
  })
  async getDeviceUsage(@User() user: any): Promise<ApiSuccessResponse> {
    const stats = await this.statisticsService.getDeviceUsage(user.facilityId);
    return {
      success: true,
      data: stats,
    };
  }
}
