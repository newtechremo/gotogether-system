import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';
import { FacilityProfileController } from './facility-profile.controller';
import { FacilityDeviceController } from './facility-device.controller';
import { FacilityDeviceService } from './facility-device.service';
import { FacilityStatisticsController } from './facility-statistics.controller';
import { FacilityStatisticsService } from './facility-statistics.service';
import { FacilityRentalController } from './facility-rental.controller';
import { FacilityRentalService } from './facility-rental.service';
import { FacilityRepairController } from './facility-repair.controller';
import { FacilityRepairService } from './facility-repair.service';
import { Facility } from '../entities/facility.entity';
import { FacilityDevice } from '../entities/facility-device.entity';
import { FacilityDeviceItem } from '../entities/facility-device-item.entity';
import { FacilityRental } from '../entities/facility-rental.entity';
import { FacilityRentalDevice } from '../entities/facility-rental-device.entity';
import { FacilityRepair } from '../entities/facility-repair.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Facility,
      FacilityDevice,
      FacilityDeviceItem,
      FacilityRental,
      FacilityRentalDevice,
      FacilityRepair,
    ]),
    AuthModule,
  ],
  controllers: [
    FacilityController,
    FacilityProfileController,
    FacilityDeviceController,
    FacilityStatisticsController,
    FacilityRentalController,
    FacilityRepairController,
  ],
  providers: [
    FacilityService,
    FacilityDeviceService,
    FacilityStatisticsService,
    FacilityRentalService,
    FacilityRepairService,
  ],
  exports: [
    FacilityService,
    FacilityDeviceService,
    FacilityStatisticsService,
    FacilityRentalService,
    FacilityRepairService,
  ],
})
export class FacilityModule {}
