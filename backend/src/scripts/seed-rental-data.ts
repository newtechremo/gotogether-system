import { DataSource } from 'typeorm';
import {
  KioskRental,
  KioskRentalStatus,
} from '../entities/kiosk-rental.entity';
import {
  KioskDevice,
  KioskDeviceStatus,
} from '../entities/kiosk-device.entity';
import { Kiosk } from '../kiosk/entities/kiosk.entity';
import { config } from 'dotenv';

// .env 파일 로드
config();

// 데이터베이스 연결 설정
const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gotogether',
  entities: [KioskRental, KioskDevice, Kiosk],
  synchronize: false,
});

async function seedRentalData() {
  try {
    console.log('🔌 데이터베이스 연결 중...');
    await AppDataSource.initialize();
    console.log('✅ 데이터베이스 연결 완료');

    const kioskDeviceRepository = AppDataSource.getRepository(KioskDevice);
    const kioskRentalRepository = AppDataSource.getRepository(KioskRental);

    // 1. 사용 가능한 장비 조회 (kiosk_id = 1)
    const availableDevices = await kioskDeviceRepository.find({
      where: {
        kioskId: 1,
        status: KioskDeviceStatus.AVAILABLE,
      },
      take: 4, // 4개의 장비만 가져오기
    });

    if (availableDevices.length < 4) {
      console.log(
        `⚠️  사용 가능한 장비가 ${availableDevices.length}개 밖에 없습니다. 최소 4개 필요합니다.`,
      );
      console.log('먼저 장비를 등록해주세요.');
      await AppDataSource.destroy();
      return;
    }

    console.log(`\n📦 ${availableDevices.length}개의 장비를 찾았습니다.`);

    // 2. 현재 시간 기준 설정
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

    // 3. 테스트 대여 데이터 생성
    const rentalData = [
      {
        device: availableDevices[0],
        rentalNumber: `RENT-${Date.now()}-001`,
        renterName: '김철수',
        renterPhone: '010-1234-5678',
        rentalDatetime: yesterday,
        expectedReturnDatetime: tomorrow,
        actualReturnDatetime: null,
        status: KioskRentalStatus.RENTED,
        notes: '테스트 대여 데이터 1 - 대여중',
      },
      {
        device: availableDevices[1],
        rentalNumber: `RENT-${Date.now()}-002`,
        renterName: '이영희',
        renterPhone: '010-2345-6789',
        rentalDatetime: twoDaysAgo,
        expectedReturnDatetime: tomorrow,
        actualReturnDatetime: null,
        status: KioskRentalStatus.RENTED,
        notes: '테스트 대여 데이터 2 - 대여중',
      },
      {
        device: availableDevices[2],
        rentalNumber: `RENT-${Date.now()}-003`,
        renterName: '박민수',
        renterPhone: '010-3456-7890',
        rentalDatetime: threeDaysAgo,
        expectedReturnDatetime: yesterday,
        actualReturnDatetime: null,
        status: KioskRentalStatus.OVERDUE,
        notes: '테스트 대여 데이터 3 - 연체',
      },
      {
        device: availableDevices[3],
        rentalNumber: `RENT-${Date.now()}-004`,
        renterName: '최지은',
        renterPhone: '010-4567-8901',
        rentalDatetime: threeDaysAgo,
        expectedReturnDatetime: yesterday,
        actualReturnDatetime: yesterday,
        status: KioskRentalStatus.RETURNED,
        notes: '테스트 대여 데이터 4 - 반납완료',
      },
    ];

    console.log('\n📝 대여 데이터 생성 중...');

    for (let i = 0; i < rentalData.length; i++) {
      const data = rentalData[i];

      // 대여 레코드 생성 (actualReturnDatetime은 null 가능하므로 조건부로 추가)
      const rentalPayload: any = {
        rentalNumber: data.rentalNumber,
        deviceId: data.device.id,
        kioskId: data.device.kioskId,
        renterName: data.renterName,
        renterPhone: data.renterPhone,
        rentalDatetime: data.rentalDatetime,
        expectedReturnDatetime: data.expectedReturnDatetime,
        status: data.status,
        notes: data.notes,
      };

      // actualReturnDatetime이 null이 아닌 경우에만 추가
      if (data.actualReturnDatetime !== null) {
        rentalPayload.actualReturnDatetime = data.actualReturnDatetime;
      }

      const rental = kioskRentalRepository.create(rentalPayload);
      await kioskRentalRepository.save(rental);

      // 장비 상태 업데이트 (대여중인 경우만)
      if (
        data.status === KioskRentalStatus.RENTED ||
        data.status === KioskRentalStatus.OVERDUE
      ) {
        data.device.status = KioskDeviceStatus.RENTED;
        await kioskDeviceRepository.save(data.device);
        console.log(
          `  ✅ 대여 #${i + 1}: ${data.renterName} - ${data.device.serialNumber} (${data.status})`,
        );
      } else {
        console.log(
          `  ✅ 대여 #${i + 1}: ${data.renterName} - ${data.device.serialNumber} (${data.status}) - 장비 상태: 사용가능`,
        );
      }
    }

    console.log('\n✨ 테스트 대여 데이터 생성 완료!');
    console.log(`\n📊 생성된 데이터:`);
    console.log(`  - 대여중: 2건`);
    console.log(`  - 연체: 1건`);
    console.log(`  - 반납완료: 1건`);
    console.log(`  - 총: 4건`);

    await AppDataSource.destroy();
    console.log('\n👋 데이터베이스 연결 종료');
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    process.exit(1);
  }
}

// 스크립트 실행
seedRentalData();
