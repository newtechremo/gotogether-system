import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Facility } from '../entities/facility.entity';
import { DashboardStatsDto } from '../common/dto/dashboard.dto';
import {
  ResetFacilityPasswordDto,
  ResetFacilityPasswordResponseDto,
} from '../common/dto/reset-facility-password.dto';
import { generateSecurePassword } from '../common/utils/password-generator';
import { KioskRental, KioskRentalStatus } from '../entities/kiosk-rental.entity';
import { KioskDevice, KioskDeviceType } from '../entities/kiosk-device.entity';
import { Kiosk } from '../kiosk/entities/kiosk.entity';
import { OverdueRentalDto } from '../common/dto/overdue-rentals.dto';

/**
 * 관리자 기능 서비스
 * 대시보드 통계, 전체 시스템 관리 기능 제공
 */
@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Facility)
    private facilityRepository: Repository<Facility>,
    @InjectRepository(KioskRental)
    private kioskRentalRepository: Repository<KioskRental>,
    @InjectRepository(KioskDevice)
    private kioskDeviceRepository: Repository<KioskDevice>,
    @InjectRepository(Kiosk)
    private kioskRepository: Repository<Kiosk>,
  ) {}

  // FacilityService는 순환 참조 방지를 위해 필요시 forwardRef 사용하거나
  // 직접 주입하지 않고 필요한 로직만 여기서 구현합니다.

  /**
   * 대시보드 KPI 통계 조회
   *
   * TODO: 현재 목업 데이터 사용 중
   * - totalKiosks: 키오스크 테이블 구현 후 실제 DB 조회로 변경 필요
   * - todayRentals: kiosk_rentals + facility_rentals 테이블 조회로 변경 필요
   * - overdueRentals: 연체 상태 체크 로직 구현 필요
   *
   * @returns 대시보드 통계 데이터
   */
  async getDashboardStats(): Promise<DashboardStatsDto> {
    // 실제 DB에서 총 시설 수 조회
    const totalFacilities = await this.facilityRepository.count({
      where: { isActive: true },
    });

    // TODO: 키오스크 엔티티 구현 후 실제 조회로 변경
    const totalKiosks = 15; // 현재 목업 데이터

    // TODO: kiosk_rentals, facility_rentals 테이블 구현 후 실제 조회로 변경
    // 오늘 대여 건수: SELECT COUNT(*) FROM kiosk_rentals WHERE DATE(rental_start_datetime) = CURDATE()
    //                + SELECT COUNT(*) FROM facility_rentals WHERE rental_date = CURDATE()
    const todayRentals = 45; // 현재 목업 데이터

    // TODO: 연체 상태 체크 로직 구현 후 실제 조회로 변경
    // 연체 건수: SELECT COUNT(*) FROM kiosk_rentals WHERE status = 'overdue'
    //           + SELECT COUNT(*) FROM facility_rentals WHERE status = '연체'
    const overdueRentals = 3; // 현재 목업 데이터

    return {
      totalKiosks,
      totalFacilities,
      todayRentals,
      overdueRentals,
    };
  }

  /**
   * 시설 비밀번호 재설정 (전체관리자 전용)
   *
   * @param facilityId 시설 ID
   * @param resetPasswordDto 비밀번호 재설정 옵션
   * @returns 새 비밀번호 (평문)
   */
  async resetFacilityPassword(
    facilityId: number,
    resetPasswordDto: ResetFacilityPasswordDto,
  ): Promise<ResetFacilityPasswordResponseDto> {
    const facility = await this.facilityRepository.findOne({
      where: { id: facilityId, isActive: true },
    });

    if (!facility) {
      throw new NotFoundException('시설 정보를 찾을 수 없습니다.');
    }

    let newPassword: string;

    // 자동 생성 또는 직접 입력
    if (resetPasswordDto.autoGenerate) {
      newPassword = generateSecurePassword(12);
    } else {
      if (!resetPasswordDto.newPassword) {
        throw new BadRequestException(
          '새 비밀번호를 입력하거나 자동 생성을 선택해주세요.',
        );
      }
      newPassword = resetPasswordDto.newPassword;
    }

    // 비밀번호 해싱 및 저장
    facility.password = await bcrypt.hash(newPassword, 10);
    await this.facilityRepository.save(facility);

    return {
      newPassword,
      message:
        '비밀번호가 재설정되었습니다. 이 비밀번호는 다시 표시되지 않습니다.',
    };
  }

  /**
   * 키오스크 목록 조회
   *
   * @returns 키오스크 목록
   */
  async getKiosks() {
    const kiosks = await this.kioskRepository.find({
      where: { deletedAt: IsNull() },
      order: { id: 'ASC' },
    });

    return kiosks.map((kiosk) => ({
      id: kiosk.id,
      name: kiosk.name,
      location: kiosk.location,
      status: kiosk.status,
    }));
  }

  /**
   * 장기 미반납 목록 조회
   *
   * @returns 장기 미반납 목록
   */
  async getOverdueRentals(): Promise<OverdueRentalDto[]> {
    // 현재 시간 기준으로 연체된 대여 건 조회
    const now = new Date();

    const overdueRentals = await this.kioskRentalRepository.find({
      where: {
        status: KioskRentalStatus.RENTED,
        expectedReturnDatetime: LessThan(now),
      },
      relations: ['device', 'kiosk'],
      order: {
        rentalDatetime: 'ASC', // 오래된 순
      },
    });

    // DTO 매핑
    return overdueRentals.map((rental) => {
      const elapsedHours = Math.floor(
        (now.getTime() - new Date(rental.expectedReturnDatetime).getTime()) /
          (1000 * 60 * 60),
      );

      // 심각도 판단: 72시간(3일) 이상이면 critical, 그 외 warning
      const severity = elapsedHours >= 72 ? 'critical' : 'warning';

      // 장비 타입을 한글로 변환
      let deviceTypeKorean: string = rental.device.deviceType;
      if (rental.device.deviceType === KioskDeviceType.AR_GLASS) {
        deviceTypeKorean = 'AR글라스';
      } else if (rental.device.deviceType === KioskDeviceType.BONE_CONDUCTION) {
        deviceTypeKorean = '골전도 이어폰';
      } else if (rental.device.deviceType === KioskDeviceType.SMARTPHONE) {
        deviceTypeKorean = '스마트폰';
      }

      return {
        id: rental.id,
        kioskId: rental.kiosk.id,
        kioskName: rental.kiosk.name,
        location: rental.kiosk.location,
        deviceName: rental.device.serialNumber,
        deviceType: deviceTypeKorean,
        rentalTime: rental.rentalDatetime.toISOString().replace('T', ' ').substring(0, 19),
        elapsedHours,
        renterName: rental.renterName,
        renterPhone: rental.renterPhone,
        severity: severity as 'critical' | 'warning',
      };
    });
  }
}
