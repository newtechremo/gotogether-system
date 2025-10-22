import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { FacilityModule } from './facility/facility.module';
import { AdminModule } from './admin/admin.module';
import { KioskModule } from './kiosk/kiosk.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ConfigModule을 전역으로 사용
      envFilePath: '.env', // .env 파일 경로
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql' as const,
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get<string>('DB_USERNAME', 'gt_db'),
        password: configService.get<string>('DB_PASSWORD', 'password'),
        database: configService.get<string>('DB_NAME', 'gotogether'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') === 'development',
        logging: configService.get<string>('NODE_ENV') === 'development',
        charset: 'utf8mb4',
        timezone: '+09:00',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    FacilityModule,
    AdminModule,
    KioskModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
