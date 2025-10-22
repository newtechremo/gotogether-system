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
import { FacilityRentalService } from './facility-rental.service';
import {
  CreateFacilityRentalDto,
  UpdateFacilityRentalDto,
  ReturnRentalDto,
  FacilityRentalResponseDto,
  RentalListQueryDto,
} from '../common/dto/facility-rental.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { User } from '../common/decorators/user.decorator';
import { ApiSuccessResponse } from '../common/dto/auth-response.dto';

@ApiTags('Facility Rentals')
@Controller('facility/rentals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FacilityRentalController {
  constructor(private readonly rentalService: FacilityRentalService) {}

  @Get()
  @ApiOperation({ summary: '대여 목록 조회' })
  @ApiQuery({ name: 'status', required: false, description: '상태 필터' })
  @ApiQuery({ name: 'startDate', required: false, description: '시작일' })
  @ApiQuery({ name: 'endDate', required: false, description: '종료일' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: '검색어 (이름, 전화번호)',
  })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityRentalResponseDto],
  })
  async findAll(
    @User() user: any,
    @Query() query: RentalListQueryDto,
  ): Promise<ApiSuccessResponse> {
    const rentals = await this.rentalService.findAll(user.facilityId, query);
    return {
      success: true,
      data: rentals,
    };
  }

  @Get('current')
  @ApiOperation({ summary: '현재 대여중인 항목 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityRentalResponseDto],
  })
  async getCurrentRentals(@User() user: any): Promise<ApiSuccessResponse> {
    const rentals = await this.rentalService.getCurrentRentals(user.facilityId);
    return {
      success: true,
      data: rentals,
    };
  }

  @Get('overdue')
  @ApiOperation({ summary: '연체 대여 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: [FacilityRentalResponseDto],
  })
  async getOverdueRentals(@User() user: any): Promise<ApiSuccessResponse> {
    const rentals = await this.rentalService.getOverdueRentals(user.facilityId);
    return {
      success: true,
      data: rentals,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '대여 상세 조회' })
  @ApiResponse({
    status: 200,
    description: '조회 성공',
    type: FacilityRentalResponseDto,
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const rental = await this.rentalService.findOne(id, user.facilityId);
    return {
      success: true,
      data: rental,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: '새 대여 등록' })
  @ApiResponse({
    status: 201,
    description: '대여 등록 성공',
    type: FacilityRentalResponseDto,
  })
  async create(
    @Body() createDto: CreateFacilityRentalDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const rental = await this.rentalService.create(user.facilityId, createDto);
    return {
      success: true,
      data: rental,
      message: '대여가 등록되었습니다.',
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '대여 정보 수정' })
  @ApiResponse({
    status: 200,
    description: '수정 성공',
    type: FacilityRentalResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateFacilityRentalDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const rental = await this.rentalService.update(
      id,
      user.facilityId,
      updateDto,
    );
    return {
      success: true,
      data: rental,
      message: '대여 정보가 수정되었습니다.',
    };
  }

  @Post(':id/return')
  @ApiOperation({ summary: '반납 처리' })
  @ApiResponse({
    status: 200,
    description: '반납 처리 성공',
    type: FacilityRentalResponseDto,
  })
  async returnRental(
    @Param('id', ParseIntPipe) id: number,
    @Body() returnDto: ReturnRentalDto,
    @User() user: any,
  ): Promise<ApiSuccessResponse> {
    const rental = await this.rentalService.returnRental(
      id,
      user.facilityId,
      returnDto,
    );
    return {
      success: true,
      data: rental,
      message: '반납 처리가 완료되었습니다.',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '대여 삭제' })
  @ApiResponse({
    status: 204,
    description: '삭제 성공',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @User() user: any,
  ): Promise<void> {
    await this.rentalService.remove(id, user.facilityId);
  }
}
