import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KioskController } from './kiosk.controller';
import { KioskService } from './kiosk.service';
import { KioskDevice } from '../entities/kiosk-device.entity';
import { KioskRental } from '../entities/kiosk-rental.entity';
import { Kiosk } from './entities/kiosk.entity';
import { KioskExamination } from './entities/kiosk-examination.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Kiosk,
      KioskDevice,
      KioskRental,
      KioskExamination,
    ]),
    AuthModule,
  ],
  controllers: [KioskController],
  providers: [KioskService],
  exports: [KioskService],
})
export class KioskModule {}
