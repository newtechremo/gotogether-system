import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Facility } from '../entities/facility.entity';
import { FacilityModule } from '../facility/facility.module';
import { KioskRental } from '../entities/kiosk-rental.entity';
import { KioskDevice } from '../entities/kiosk-device.entity';
import { Kiosk } from '../kiosk/entities/kiosk.entity';

/**
 * 관리자 모듈
 * 대시보드 통계, 전체 시스템 관리 기능 제공
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([Facility, KioskRental, KioskDevice, Kiosk]),
    FacilityModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
