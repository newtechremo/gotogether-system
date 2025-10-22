-- 테스트용 키오스크 장기 미반납 데이터 삽입
-- 이 스크립트는 테스트 목적으로만 사용하며, 프로덕션 환경에는 실행하지 마십시오.

-- 1. 키오스크 데이터 삽입
INSERT INTO kiosks (id, name, location, managerName, managerPhone, installationDate, status, createdAt, updatedAt)
VALUES
  (1, 'CGV 강남점', '서울시 강남구', '김관리', '02-1234-5678', '2024-01-15', 'active', NOW(), NOW()),
  (2, 'CGV 홍대입구점', '서울시 마포구', '이관리', '02-2345-6789', '2024-02-01', 'active', NOW(), NOW()),
  (3, 'CGV 잠실점', '서울시 송파구', '박관리', '02-3456-7890', '2024-03-01', 'active', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  location = VALUES(location);

-- 2. 키오스크 장비 데이터 삽입
INSERT INTO kiosk_devices (id, serial_number, device_type, box_number, kiosk_id, status, purchase_date, created_at, updated_at)
VALUES
  (1, 'AR-001', 'AR_GLASS', 1, 1, 'rented', '2024-01-20', NOW(), NOW()),
  (2, 'BC-003', 'BONE_CONDUCTION', 3, 2, 'rented', '2024-01-20', NOW(), NOW()),
  (3, 'SP-002', 'SMARTPHONE', 2, 1, 'rented', '2024-01-20', NOW(), NOW()),
  (4, 'AR-002', 'AR_GLASS', 4, 2, 'available', '2024-01-20', NOW(), NOW()),
  (5, 'BC-001', 'BONE_CONDUCTION', 5, 1, 'available', '2024-01-20', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- 3. 연체된 대여 데이터 삽입
-- 심각 (critical): 76시간 경과 (3일 이상)
INSERT INTO kiosk_rentals (id, rental_number, device_id, kiosk_id, renter_name, renter_phone, rental_datetime, expected_return_datetime, status, created_at, updated_at)
VALUES
  (1, 'R-001-20251018-001', 1, 1, '김철수', '010-1234-5678',
   DATE_SUB(NOW(), INTERVAL 76 HOUR),
   DATE_SUB(NOW(), INTERVAL 76 HOUR),
   'rented', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- 주의 (warning): 41시간 경과
INSERT INTO kiosk_rentals (id, rental_number, device_id, kiosk_id, renter_name, renter_phone, rental_datetime, expected_return_datetime, status, created_at, updated_at)
VALUES
  (2, 'R-002-20251019-001', 2, 2, '이영희', '010-2345-6789',
   DATE_SUB(NOW(), INTERVAL 41 HOUR),
   DATE_SUB(NOW(), INTERVAL 41 HOUR),
   'rented', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- 주의 (warning): 25시간 경과
INSERT INTO kiosk_rentals (id, rental_number, device_id, kiosk_id, renter_name, renter_phone, rental_datetime, expected_return_datetime, status, created_at, updated_at)
VALUES
  (3, 'R-001-20251020-001', 3, 1, '박민수', '010-3456-7890',
   DATE_SUB(NOW(), INTERVAL 25 HOUR),
   DATE_SUB(NOW(), INTERVAL 25 HOUR),
   'rented', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- 정상 대여 (연체 아님) - 아직 반납 예정 시간 전
INSERT INTO kiosk_rentals (id, rental_number, device_id, kiosk_id, renter_name, renter_phone, rental_datetime, expected_return_datetime, status, created_at, updated_at)
VALUES
  (4, 'R-003-20251021-001', 4, 2, '최정상', '010-4567-8901',
   NOW(),
   DATE_ADD(NOW(), INTERVAL 2 HOUR),
   'rented', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- 데이터 확인
SELECT
  kr.id,
  kr.rental_number,
  k.name as kiosk_name,
  k.location,
  kd.serial_number as device_name,
  kd.device_type,
  kr.renter_name,
  kr.renter_phone,
  kr.rental_datetime,
  kr.expected_return_datetime,
  TIMESTAMPDIFF(HOUR, kr.expected_return_datetime, NOW()) as elapsed_hours,
  kr.status
FROM kiosk_rentals kr
JOIN kiosk_devices kd ON kr.device_id = kd.id
JOIN kiosks k ON kr.kiosk_id = k.id
WHERE kr.status = 'rented'
ORDER BY kr.rental_datetime ASC;
