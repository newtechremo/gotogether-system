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
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { FacilityRepairService } from './facility-repair.service';
import {
  CreateFacilityRepairDto,
  UpdateFacilityRepairDto,
  FacilityRepairResponseDto,
  RepairListQueryDto,
} from '../common/dto/facility-repair.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ApiSuccessResponse } from '../common/dto/auth-response.dto';

@ApiTags('Facility Repairs')
@Controller('facility/repairs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityRepairController {
  constructor(private readonly repairService: FacilityRepairService) {}

  @Get()
  @ApiOperation({ summary: '수리 목록 조회' })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '장비 코드 검색',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityRepairResponseDto],
  })
  async findAll(
    @User() user: any,
    @Query() query: RepairListQueryDto,
  ): Promise<ApiSuccessResponse> {
    const repairs = await this.repairService.findAll(user.facilityId, query);
    return {
      success: true,
      data: repairs,
    };
  }

  @Get('in-progress')
  @ApiOperation({ summary: '수리중인 항목 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityRepairResponseDto],
  })
  async getRepairsInProgress(@User() user: any): Promise<ApiSuccessResponse> {
    const repairs = await this.repairService.getRepairsInProgress(
      user.facilityId,
    );
    return {
      success: true,
      data: repairs,
    };
  }

  @Get('completed')
  @ApiOperation({ summary: '완료된 수리 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityRepairResponseDto],
  })
  async getCompletedRepairs(@User() user: any): Promise<ApiSuccessResponse> {
    const repairs = await this.repairService.getCompletedRepairs(
      user.facilityId,
    );
    return {
      success: true,
      data: repairs,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '수리 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: FacilityRepairResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const repair = await this.repairService.findOne(id, user.facilityId);
    return {
      success: true,
      data: repair,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 수리 등록' })
  @ApiResponse({
    status: 201,
    description: '수리 등록 성공',
    type: FacilityRepairResponseDto,
  })
  async create(
    @Body() createDto: CreateFacilityRepairDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const repair = await this.repairService.create(user.facilityId, createDto);
    return {
      success: true,
      data: repair,
      message: '수리가 등록되었습니다.',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '수리 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: FacilityRepairResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacilityRepairDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const repair = await this.repairService.update(
      id,
      user.facilityId,
      updateDto,
    );
    return {
      success: true,
      data: repair,
      message: '수리 정보가 수정되었습니다.',
    };
  }


  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '수리 삭제' })
  @ApiResponse({
    status: 204,
    description: '삭제 성공',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<void> {
    await this.repairService.remove(id, user.facilityId);
  }
}
