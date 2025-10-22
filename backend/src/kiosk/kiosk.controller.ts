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
import { KioskService } from './kiosk.service';
import { CreateKioskDto } from './dto/create-kiosk.dto';
import { UpdateKioskDto } from './dto/update-kiosk.dto';
import { CreateExaminationDto } from './dto/create-examination.dto';
import { UpdateExaminationDto } from './dto/update-examination.dto';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../common/dto/auth-response.dto';

@ApiTags('Admin - Kiosks')
@Controller('admin/kiosks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin', 'admin')
@ApiBearerAuth()
export class KioskController {
  constructor(private readonly kioskService: KioskService) {}

  // NOTE: Old facility-based device management endpoints removed
  // Kiosks and facilities are now completely separate

  @Get('rentals/current')
  @ApiOperation({ summary: '현재 대여 중인 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  async getCurrentRentals(): Promise<ApiSuccessResponse> {
    const rentals = await this.kioskService.getCurrentRentals();
    return {
      success: true,
      data: rentals,
    };
  }

  @Get('rentals/overdue')
  @ApiOperation({ summary: '연체된 대여 목록 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
  })
  async getOverdueRentals(): Promise<ApiSuccessResponse> {
    const rentals = await this.kioskService.getOverdueRentals();
    return {
      success: true,
      data: rentals,
    };
  }

  @Post('rentals/:id/force-return')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '강제 반납 처리' })
  @ApiResponse({ status: 200, description: '강제 반납 성공' })
  @ApiResponse({
    status: 404,
    description: '대여 기록을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async forceReturn(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.forceReturn(id);
    return {
      success: true,
      data: result,
      message: '강제 반납이 처리되었습니다.',
    };
  }

  // =============== 키오스크 위치 관리 ===============

  @Get('locations')
  @ApiOperation({ summary: '키오스크 위치 목록 조회' })
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
    name: 'date',
    required: false,
    type: String,
    description: '조회 날짜 (YYYY-MM-DD 형식, 기본값: 현재 날짜)',
  })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getAllKiosks(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('date') date?: string,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.getAllKiosks(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      date,
    );
    return {
      success: true,
      data: result,
    };
  }

  @Get('locations/:id')
  @ApiOperation({ summary: '키오스크 위치 상세 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async getKioskDetail(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.getKioskDetail(id);
    return {
      success: true,
      data: result,
    };
  }

  @Post('locations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '키오스크 위치 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  async createKioskLocation(
    @Body() createKioskDto: CreateKioskDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.createKioskLocation(createKioskDto);
    return {
      success: true,
      data: result,
      message: '키오스크가 생성되었습니다.',
    };
  }

  @Put('locations/:id')
  @ApiOperation({ summary: '키오스크 위치 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async updateKioskLocation(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateKioskDto: UpdateKioskDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.updateKioskLocation(
      id,
      updateKioskDto,
    );
    return {
      success: true,
      data: result,
      message: '키오스크가 수정되었습니다.',
    };
  }

  @Delete('locations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '키오스크 위치 삭제 (소프트 삭제)' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 400,
    description: '활성화된 장비가 있어 삭제 불가',
    type: ApiErrorResponse,
  })
  async deleteKioskLocation(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.deleteKioskLocation(id);
    return {
      success: true,
      data: result,
      message: '키오스크가 삭제되었습니다.',
    };
  }

  // =============== 키오스크 점검 관리 ===============

  @Post('locations/:kioskId/examinations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '키오스크 점검 기록 생성' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async createExamination(
    @Param('kioskId', ParseIntPipe) kioskId: number,
    @Body() createExaminationDto: CreateExaminationDto,
  ): Promise<ApiSuccessResponse> {
    // kioskId를 DTO에 설정
    createExaminationDto.kioskId = kioskId;
    const result =
      await this.kioskService.createExamination(createExaminationDto);
    return {
      success: true,
      data: result,
      message: '점검 기록이 생성되었습니다.',
    };
  }

  @Get('locations/:kioskId/examinations')
  @ApiOperation({ summary: '키오스크 점검 기록 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async getExaminationsByKiosk(
    @Param('kioskId', ParseIntPipe) kioskId: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.getExaminationsByKiosk(kioskId);
    return {
      success: true,
      data: result,
    };
  }

  @Put('examinations/:id')
  @ApiOperation({ summary: '점검 기록 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({
    status: 404,
    description: '점검 기록을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async updateExamination(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExaminationDto: UpdateExaminationDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.updateExamination(
      id,
      updateExaminationDto,
    );
    return {
      success: true,
      data: result,
      message: '점검 기록이 수정되었습니다.',
    };
  }

  @Delete('examinations/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '점검 기록 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({
    status: 404,
    description: '점검 기록을 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async deleteExamination(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.deleteExamination(id);
    return {
      success: true,
      data: result,
      message: '점검 기록이 삭제되었습니다.',
    };
  }

  // =============== 키오스크 장비 관리 ===============

  @Get('locations/:kioskId/devices')
  @ApiOperation({ summary: '키오스크 장비 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async getDevicesByKiosk(
    @Param('kioskId', ParseIntPipe) kioskId: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.getDevicesByKiosk(kioskId);
    return {
      success: true,
      data: result,
    };
  }

  @Post('locations/:kioskId/devices')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '키오스크 장비 등록' })
  @ApiResponse({ status: 201, description: '생성 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 409,
    description: '이미 등록된 시리얼 번호',
    type: ApiErrorResponse,
  })
  async createDevice(
    @Param('kioskId', ParseIntPipe) kioskId: number,
    @Body() createDeviceDto: CreateDeviceDto,
  ): Promise<ApiSuccessResponse> {
    createDeviceDto.kioskId = kioskId;
    const result = await this.kioskService.createDevice(createDeviceDto);
    return {
      success: true,
      data: result,
      message: '장비가 등록되었습니다.',
    };
  }

  @Put('devices/:id')
  @ApiOperation({ summary: '키오스크 장비 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({
    status: 404,
    description: '장비를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async updateDevice(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDeviceDto: UpdateDeviceDto,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.updateDevice(id, updateDeviceDto);
    return {
      success: true,
      data: result,
      message: '장비가 수정되었습니다.',
    };
  }

  @Delete('devices/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '키오스크 장비 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({
    status: 404,
    description: '장비를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  @ApiResponse({
    status: 400,
    description: '대여 중인 장비는 삭제 불가',
    type: ApiErrorResponse,
  })
  async deleteDevice(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.deleteDevice(id);
    return {
      success: true,
      data: result,
      message: '장비가 삭제되었습니다.',
    };
  }

  // =============== 키오스크 대여 관리 ===============

  @Get('locations/:kioskId/rentals')
  @ApiOperation({ summary: '특정 키오스크의 대여 목록 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  @ApiResponse({
    status: 404,
    description: '키오스크를 찾을 수 없음',
    type: ApiErrorResponse,
  })
  async getRentalsByKiosk(
    @Param('kioskId', ParseIntPipe) kioskId: number,
  ): Promise<ApiSuccessResponse> {
    const result = await this.kioskService.getRentalsByKiosk(kioskId);
    return {
      success: true,
      data: result,
    };
  }
}
