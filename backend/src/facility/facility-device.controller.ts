import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
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
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { FacilityDeviceService } from './facility-device.service';
import {
  CreateFacilityDeviceDto,
  UpdateFacilityDeviceDto,
  UpdateDeviceItemDto,
  FacilityDeviceResponseDto,
} from '../common/dto/facility-device.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ApiSuccessResponse } from '../common/dto/auth-response.dto';

@ApiTags('Facility Devices')
@Controller('facility/devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityDeviceController {
  constructor(private readonly deviceService: FacilityDeviceService) {}

  @Get()
  @ApiOperation({ summary: '시설의 모든 장비 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityDeviceResponseDto],
  })
  async findAll(@User() user: any): Promise<ApiSuccessResponse> {
    const devices = await this.deviceService.findAllByFacility(user.facilityId);
    return {
      success: true,
      data: devices,
    };
  }

  @Get('stats')
  @ApiOperation({ summary: '장비 통계 조회' })
  @ApiResponse({ status: 200, description: '조회 성공' })
  async getStats(@User() user: any): Promise<ApiSuccessResponse> {
    const stats = await this.deviceService.getStats(user.facilityId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '특정 장비 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: FacilityDeviceResponseDto,
  })
  @ApiResponse({ status: 404, description: '장비를 찾을 수 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const device = await this.deviceService.findOne(id, user.facilityId);
    return {
      success: true,
      data: device,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 장비 등록 (장비 아이템 포함)' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: FacilityDeviceResponseDto,
  })
  @ApiResponse({ status: 409, description: '장비 코드 중복' })
  async create(
    @Body() createDto: CreateFacilityDeviceDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const device = await this.deviceService.create(user.facilityId, createDto);
    return {
      success: true,
      data: device,
      message: '장비가 등록되었습니다.',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '장비 정보 수정 (메모)' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: FacilityDeviceResponseDto,
  })
  @ApiResponse({ status: 404, description: '장비를 찾을 수 없음' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacilityDeviceDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const device = await this.deviceService.update(
      id,
      user.facilityId,
      updateDto,
    );
    return {
      success: true,
      data: device,
      message: '장비 정보가 수정되었습니다.',
    };
  }

  @Put('items/:itemId')
  @ApiOperation({ summary: '장비 아이템 수정' })
  @ApiResponse({ status: 200, description: '수정 성공' })
  @ApiResponse({ status: 404, description: '장비 아이템을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '장비 코드 중복' })
  async updateItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @Body() updateDto: UpdateDeviceItemDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const deviceItem = await this.deviceService.updateDeviceItem(
      itemId,
      user.facilityId,
      updateDto,
    );
    return {
      success: true,
      data: deviceItem,
      message: '장비 아이템이 수정되었습니다.',
    };
  }

  @Delete('items/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장비 아이템 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '장비 아이템을 찾을 수 없음' })
  @ApiResponse({
    status: 400,
    description: '대여 중인 장비는 삭제할 수 없음',
  })
  async removeItem(
    @Param('itemId', ParseIntPipe) itemId: number,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const result = await this.deviceService.removeDeviceItem(
      itemId,
      user.facilityId,
    );
    return {
      success: true,
      data: result,
      message: '장비 아이템이 삭제되었습니다.',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장비 삭제 (모든 아이템 포함)' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '장비를 찾을 수 없음' })
  @ApiResponse({
    status: 400,
    description: '대여 중인 장비가 있어 삭제할 수 없음',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const result = await this.deviceService.remove(id, user.facilityId);
    return {
      success: true,
      data: result,
      message: '장비가 삭제되었습니다.',
    };
  }
}
