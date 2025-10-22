-- 시설 ID 2 (서울시각장애인복지시설)의 샘플 장비 데이터

-- 1. facility_devices 생성 (장비 타입별 집계)
INSERT INTO facility_devices (facility_id, device_type, qty_total, qty_available, qty_rented, qty_broken, memo, created_at, updated_at)
VALUES
  (2, 'AR글라스', 10, 8, 1, 1, 'AR 글라스 장비 관리', NOW(), NOW()),
  (2, '골전도 이어폰', 15, 12, 2, 1, '골전도 이어폰 장비 관리', NOW(), NOW()),
  (2, '스마트폰', 8, 5, 2, 1, '스마트폰 장비 관리', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  qty_total = VALUES(qty_total),
  qty_available = VALUES(qty_available),
  qty_rented = VALUES(qty_rented),
  qty_broken = VALUES(qty_broken),
  updated_at = NOW();

-- 2. facility_device_items 생성 (개별 장비 아이템)

-- AR글라스 (10개)
INSERT INTO facility_device_items (facility_device_id, device_code, serial_number, status, registration_date, notes, created_at, updated_at)
VALUES
  (1, 'AR-001', 'SN-AR-2024-001', 'available', '2024-01-15', 'AR 글라스 1호기', NOW(), NOW()),
  (1, 'AR-002', 'SN-AR-2024-002', 'available', '2024-01-15', 'AR 글라스 2호기', NOW(), NOW()),
  (1, 'AR-003', 'SN-AR-2024-003', 'available', '2024-01-15', 'AR 글라스 3호기', NOW(), NOW()),
  (1, 'AR-004', 'SN-AR-2024-004', 'available', '2024-02-01', 'AR 글라스 4호기', NOW(), NOW()),
  (1, 'AR-005', 'SN-AR-2024-005', 'available', '2024-02-01', 'AR 글라스 5호기', NOW(), NOW()),
  (1, 'AR-006', 'SN-AR-2024-006', 'available', '2024-03-10', 'AR 글라스 6호기', NOW(), NOW()),
  (1, 'AR-007', 'SN-AR-2024-007', 'available', '2024-03-10', 'AR 글라스 7호기', NOW(), NOW()),
  (1, 'AR-008', 'SN-AR-2024-008', 'available', '2024-04-05', 'AR 글라스 8호기', NOW(), NOW()),
  (1, 'AR-009', 'SN-AR-2024-009', 'rented', '2024-05-12', 'AR 글라스 9호기 - 현재 대여중', NOW(), NOW()),
  (1, 'AR-010', 'SN-AR-2024-010', 'broken', '2024-06-20', 'AR 글라스 10호기 - 수리 필요', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  updated_at = NOW();

-- 골전도 이어폰 (15개)
INSERT INTO facility_device_items (facility_device_id, device_code, serial_number, status, registration_date, notes, created_at, updated_at)
VALUES
  (2, 'BC-001', 'SN-BC-2024-001', 'available', '2024-01-10', '골전도 이어폰 1호', NOW(), NOW()),
  (2, 'BC-002', 'SN-BC-2024-002', 'available', '2024-01-10', '골전도 이어폰 2호', NOW(), NOW()),
  (2, 'BC-003', 'SN-BC-2024-003', 'available', '2024-01-10', '골전도 이어폰 3호', NOW(), NOW()),
  (2, 'BC-004', 'SN-BC-2024-004', 'available', '2024-01-10', '골전도 이어폰 4호', NOW(), NOW()),
  (2, 'BC-005', 'SN-BC-2024-005', 'available', '2024-02-05', '골전도 이어폰 5호', NOW(), NOW()),
  (2, 'BC-006', 'SN-BC-2024-006', 'available', '2024-02-05', '골전도 이어폰 6호', NOW(), NOW()),
  (2, 'BC-007', 'SN-BC-2024-007', 'available', '2024-02-05', '골전도 이어폰 7호', NOW(), NOW()),
  (2, 'BC-008', 'SN-BC-2024-008', 'available', '2024-03-15', '골전도 이어폰 8호', NOW(), NOW()),
  (2, 'BC-009', 'SN-BC-2024-009', 'available', '2024-03-15', '골전도 이어폰 9호', NOW(), NOW()),
  (2, 'BC-010', 'SN-BC-2024-010', 'available', '2024-04-20', '골전도 이어폰 10호', NOW(), NOW()),
  (2, 'BC-011', 'SN-BC-2024-011', 'available', '2024-04-20', '골전도 이어폰 11호', NOW(), NOW()),
  (2, 'BC-012', 'SN-BC-2024-012', 'available', '2024-05-25', '골전도 이어폰 12호', NOW(), NOW()),
  (2, 'BC-013', 'SN-BC-2024-013', 'rented', '2024-06-01', '골전도 이어폰 13호 - 현재 대여중', NOW(), NOW()),
  (2, 'BC-014', 'SN-BC-2024-014', 'rented', '2024-06-01', '골전도 이어폰 14호 - 현재 대여중', NOW(), NOW()),
  (2, 'BC-015', 'SN-BC-2024-015', 'broken', '2024-06-10', '골전도 이어폰 15호 - 수리 필요', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  updated_at = NOW();

-- 스마트폰 (8개)
INSERT INTO facility_device_items (facility_device_id, device_code, serial_number, status, registration_date, notes, created_at, updated_at)
VALUES
  (3, 'SP-001', 'SN-SP-2024-001', 'available', '2024-01-20', '스마트폰 1호 (Galaxy)', NOW(), NOW()),
  (3, 'SP-002', 'SN-SP-2024-002', 'available', '2024-01-20', '스마트폰 2호 (Galaxy)', NOW(), NOW()),
  (3, 'SP-003', 'SN-SP-2024-003', 'available', '2024-02-10', '스마트폰 3호 (iPhone)', NOW(), NOW()),
  (3, 'SP-004', 'SN-SP-2024-004', 'available', '2024-02-10', '스마트폰 4호 (iPhone)', NOW(), NOW()),
  (3, 'SP-005', 'SN-SP-2024-005', 'available', '2024-03-05', '스마트폰 5호 (Galaxy)', NOW(), NOW()),
  (3, 'SP-006', 'SN-SP-2024-006', 'rented', '2024-04-15', '스마트폰 6호 - 현재 대여중', NOW(), NOW()),
  (3, 'SP-007', 'SN-SP-2024-007', 'rented', '2024-05-20', '스마트폰 7호 - 현재 대여중', NOW(), NOW()),
  (3, 'SP-008', 'SN-SP-2024-008', 'broken', '2024-06-01', '스마트폰 8호 - 수리 필요', NOW(), NOW())
ON DUPLICATE KEY UPDATE
  status = VALUES(status),
  updated_at = NOW();
