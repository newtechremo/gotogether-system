import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FacilityService } from './facility.service';
import {
  CreateFacilityDto,
  UpdateFacilityDto,
} from '../common/dto/facility.dto';
import {
  ResetFacilityPasswordDto,
} from '../common/dto/reset-facility-password.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/dto/auth-response.dto';

@ApiTags('Facilities')
@Controller('facilities')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Get()
  @ApiOperation({ summary: '시설 목록 조회' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: '페이지 번호 (기본값: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: '페이지당 항목 수 (기본값: 10)',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: '검색어 (시설명, 시설코드, 담당자명)',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      search,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '시설 상세 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.findOne(id);
    return {
      success: true,
      data: result,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '시설 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({
    status: 409,
    description: '중복된 시설 코드 또는 아이디',
    type: ApiErrorResponse,
  })
  async create(
    @Body() createFacilityDto: CreateFacilityDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.create(
      createFacilityDto,
      user.userId,
    );
    return {
      success: true,
      data: result,
      message: '시설이 생성되었습니다.',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '시설 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description: '중복된 시설 코드 또는 아이디',
    type: ApiErrorResponse,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFacilityDto: UpdateFacilityDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.update(id, updateFacilityDto);
    return {
      success: true,
      data: result,
      message: '시설이 수정되었습니다.',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '시설 삭제 (소프트 삭제)' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.remove(id);
    return {
      success: true,
      data: result,
      message: '시설이 삭제되었습니다.',
    };
  }

  @Put(':id/reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '시설 비밀번호 재설정 (전체관리자용)' })
  @ApiResponse({ status: 200, description: '비밀번호 재설정 성공' })
  @ApiResponse({
    status: 404,
    description: '시설을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
    @Body() resetPasswordDto: ResetFacilityPasswordDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.facilityService.resetPassword(id, resetPasswordDto);
    return {
      success: true,
      data: result,
      message: result.message,
    };
  }
}
