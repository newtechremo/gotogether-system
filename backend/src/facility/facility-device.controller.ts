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
  CreateDeviceItemDto,
  UpdateDeviceItemDto,
  DeviceItemResponseDto,
} from '../common/dto/facility-device.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ApiSuccessResponse } from '../common/dto/auth-response.dto';

@ApiTags('Facility Device Items')
@Controller('facility/devices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityDeviceController {
  constructor(private readonly deviceService: FacilityDeviceService) {}

  @Get()
  @ApiOperation({ summary: '시설의 모든 장비 아이템 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [DeviceItemResponseDto],
  })
  async findAll(@User() user: any): Promise<ApiSuccessResponse> {
    const deviceItems = await this.deviceService.findAllByFacility(
      user.facilityId,
    );
    return {
      success: true,
      data: deviceItems,
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
  @ApiOperation({ summary: '특정 장비 아이템 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: DeviceItemResponseDto,
  })
  @ApiResponse({ status: 404, description: '장비를 찾을 수 없음' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const deviceItem = await this.deviceService.findOne(id, user.facilityId);
    return {
      success: true,
      data: deviceItem,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 장비 아이템 등록' })
  @ApiResponse({
    status: 201,
    description: '생성 성공',
    type: DeviceItemResponseDto,
  })
  @ApiResponse({ status: 409, description: '장비 코드 중복' })
  async create(
    @Body() createDto: CreateDeviceItemDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const deviceItem = await this.deviceService.create(
      user.facilityId,
      createDto,
    );
    return {
      success: true,
      data: deviceItem,
      message: '장비가 등록되었습니다.',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '장비 아이템 수정' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: DeviceItemResponseDto,
  })
  @ApiResponse({ status: 404, description: '장비를 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '장비 코드 중복' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateDeviceItemDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const deviceItem = await this.deviceService.update(
      id,
      user.facilityId,
      updateDto,
    );
    return {
      success: true,
      data: deviceItem,
      message: '장비가 수정되었습니다.',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '장비 아이템 삭제' })
  @ApiResponse({ status: 200, description: '삭제 성공' })
  @ApiResponse({ status: 404, description: '장비를 찾을 수 없음' })
  @ApiResponse({
    status: 400,
    description: '대여 중인 장비는 삭제할 수 없음',
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
