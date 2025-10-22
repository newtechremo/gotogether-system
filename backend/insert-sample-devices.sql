-- Insert sample device items for testing
-- AR글라스 10개, 스마트폰 15개, 골전도 이어폰 15개
-- 5개는 대여중 상태로 설정

USE gotogether;

-- Get the first facility ID (assuming facility_id = 1)
SET @facility_id = 1;

-- Insert AR글라스 (10개)
INSERT INTO facility_device_items (facility_id, device_type, device_code, serial_number, status, registration_date, notes) VALUES
(@facility_id, 'AR글라스', 'AR-2025-001', 'SN-AR-2025-001', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-002', 'SN-AR-2025-002', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-003', 'SN-AR-2025-003', 'rented', '2025-01-01', 'AR 글라스 대여중'),
(@facility_id, 'AR글라스', 'AR-2025-004', 'SN-AR-2025-004', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-005', 'SN-AR-2025-005', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-006', 'SN-AR-2025-006', 'rented', '2025-01-01', 'AR 글라스 대여중'),
(@facility_id, 'AR글라스', 'AR-2025-007', 'SN-AR-2025-007', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-008', 'SN-AR-2025-008', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-009', 'SN-AR-2025-009', 'available', '2025-01-01', 'AR 글라스 신규 입고'),
(@facility_id, 'AR글라스', 'AR-2025-010', 'SN-AR-2025-010', 'available', '2025-01-01', 'AR 글라스 신규 입고');

-- Insert 스마트폰 (15개)
INSERT INTO facility_device_items (facility_id, device_type, device_code, serial_number, status, registration_date, notes) VALUES
(@facility_id, '스마트폰', 'SP-2025-001', 'SN-SP-2025-001', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-002', 'SN-SP-2025-002', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-003', 'SN-SP-2025-003', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-004', 'SN-SP-2025-004', 'rented', '2025-01-02', '스마트폰 대여중'),
(@facility_id, '스마트폰', 'SP-2025-005', 'SN-SP-2025-005', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-006', 'SN-SP-2025-006', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-007', 'SN-SP-2025-007', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-008', 'SN-SP-2025-008', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-009', 'SN-SP-2025-009', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-010', 'SN-SP-2025-010', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-011', 'SN-SP-2025-011', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-012', 'SN-SP-2025-012', 'rented', '2025-01-02', '스마트폰 대여중'),
(@facility_id, '스마트폰', 'SP-2025-013', 'SN-SP-2025-013', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-014', 'SN-SP-2025-014', 'available', '2025-01-02', '스마트폰 신규 입고'),
(@facility_id, '스마트폰', 'SP-2025-015', 'SN-SP-2025-015', 'available', '2025-01-02', '스마트폰 신규 입고');

-- Insert 골전도 이어폰 (15개)
INSERT INTO facility_device_items (facility_id, device_type, device_code, serial_number, status, registration_date, notes) VALUES
(@facility_id, '골전도 이어폰', 'BC-2025-001', 'SN-BC-2025-001', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-002', 'SN-BC-2025-002', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-003', 'SN-BC-2025-003', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-004', 'SN-BC-2025-004', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-005', 'SN-BC-2025-005', 'rented', '2025-01-03', '골전도 이어폰 대여중'),
(@facility_id, '골전도 이어폰', 'BC-2025-006', 'SN-BC-2025-006', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-007', 'SN-BC-2025-007', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-008', 'SN-BC-2025-008', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-009', 'SN-BC-2025-009', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-010', 'SN-BC-2025-010', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-011', 'SN-BC-2025-011', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-012', 'SN-BC-2025-012', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-013', 'SN-BC-2025-013', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-014', 'SN-BC-2025-014', 'available', '2025-01-03', '골전도 이어폰 신규 입고'),
(@facility_id, '골전도 이어폰', 'BC-2025-015', 'SN-BC-2025-015', 'available', '2025-01-03', '골전도 이어폰 신규 입고');

-- Summary
SELECT '========================================' as '';
SELECT 'Sample devices inserted successfully!' as '';
SELECT '========================================' as '';

-- Check results
SELECT
    device_type,
    COUNT(*) as total_count,
    SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_count,
    SUM(CASE WHEN status = 'rented' THEN 1 ELSE 0 END) as rented_count,
    SUM(CASE WHEN status = 'broken' THEN 1 ELSE 0 END) as broken_count,
    SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_count
FROM facility_device_items
WHERE facility_id = @facility_id
  AND device_code LIKE '%-2025-%'
GROUP BY device_type
ORDER BY device_type;

SELECT '========================================' as '';
SELECT 'Devices by status:' as '';
SELECT
    status,
    COUNT(*) as count
FROM facility_device_items
WHERE facility_id = @facility_id
  AND device_code LIKE '%-2025-%'
GROUP BY status;

SELECT '========================================' as '';
SELECT 'Rented devices:' as '';
SELECT
    device_type,
    device_code,
    serial_number,
    status,
    notes
FROM facility_device_items
WHERE facility_id = @facility_id
  AND status = 'rented'
  AND device_code LIKE '%-2025-%'
ORDER BY device_type, device_code;
