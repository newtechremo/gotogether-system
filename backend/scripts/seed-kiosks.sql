-- 키오스크 샘플 데이터 (15개)
-- 시설 ID는 기존 facilities 테이블의 데이터를 사용

-- AR 글라스 5개
INSERT INTO kiosk_devices (device_serial, device_type, model_name, facility_id, status, registration_date, notes) VALUES
('AR-2025-001', 'AR_GLASS', 'Vision Pro AR', 2, 'available', '2025-01-01', 'Go Together 1호점'),
('AR-2025-002', 'AR_GLASS', 'Vision Pro AR', 2, 'rented', '2025-01-01', 'Go Together 1호점'),
('AR-2025-003', 'AR_GLASS', 'Vision Pro AR', 3, 'available', '2025-01-05', 'Go Together 2호점'),
('AR-2025-004', 'AR_GLASS', 'Meta Quest AR', 4, 'available', '2025-01-10', 'Go Together 3호점'),
('AR-2025-005', 'AR_GLASS', 'Meta Quest AR', 4, 'maintenance', '2025-01-10', 'Go Together 3호점 - 점검중');

-- 골전도 이어폰 5개
INSERT INTO kiosk_devices (device_serial, device_type, model_name, facility_id, status, registration_date, notes) VALUES
('BC-2025-001', 'BONE_CONDUCTION', 'Shokz OpenRun Pro', 2, 'available', '2025-01-01', 'Go Together 1호점'),
('BC-2025-002', 'BONE_CONDUCTION', 'Shokz OpenRun Pro', 2, 'rented', '2025-01-01', 'Go Together 1호점'),
('BC-2025-003', 'BONE_CONDUCTION', 'AfterShokz Aeropex', 3, 'available', '2025-01-05', 'Go Together 2호점'),
('BC-2025-004', 'BONE_CONDUCTION', 'AfterShokz Aeropex', 4, 'rented', '2025-01-10', 'Go Together 3호점'),
('BC-2025-005', 'BONE_CONDUCTION', 'Shokz OpenRun Pro', 1, 'available', '2025-01-15', 'Go Together 4호점');

-- 스마트폰 5개
INSERT INTO kiosk_devices (device_serial, device_type, model_name, facility_id, status, registration_date, notes) VALUES
('SP-2025-001', 'SMARTPHONE', 'Galaxy S24', 2, 'available', '2025-01-01', 'Go Together 1호점'),
('SP-2025-002', 'SMARTPHONE', 'Galaxy S24', 2, 'rented', '2025-01-01', 'Go Together 1호점'),
('SP-2025-003', 'SMARTPHONE', 'iPhone 15', 3, 'available', '2025-01-05', 'Go Together 2호점'),
('SP-2025-004', 'SMARTPHONE', 'iPhone 15', 4, 'available', '2025-01-10', 'Go Together 3호점'),
('SP-2025-005', 'SMARTPHONE', 'Galaxy S24', 1, 'broken', '2025-01-15', 'Go Together 4호점 - 고장');

-- 대여 기록 추가 (현재 대여중 5건)
INSERT INTO kiosk_rentals (rental_number, device_id, facility_id, renter_name, renter_phone, rental_datetime, expected_return_datetime, status, notes) VALUES
('KR-2025-001', (SELECT id FROM kiosk_devices WHERE device_serial = 'AR-2025-002'), 2, '김철수', '010-1234-5678', '2025-10-17 10:00:00', '2025-10-17 14:00:00', 'rented', '메가박스 강남점'),
('KR-2025-002', (SELECT id FROM kiosk_devices WHERE device_serial = 'BC-2025-002'), 2, '이영희', '010-2345-6789', '2025-10-17 11:30:00', '2025-10-17 15:30:00', 'rented', '메가박스 강남점'),
('KR-2025-003', (SELECT id FROM kiosk_devices WHERE device_serial = 'SP-2025-002'), 2, '박민수', '010-3456-7890', '2025-10-17 09:00:00', '2025-10-17 13:00:00', 'rented', '메가박스 강남점'),
('KR-2025-004', (SELECT id FROM kiosk_devices WHERE device_serial = 'BC-2025-004'), 4, '정수연', '010-4567-8901', '2025-10-16 10:00:00', '2025-10-16 14:00:00', 'overdue', 'CGV 용산 - 연체 중'),
('KR-2025-005', (SELECT id FROM kiosk_devices WHERE device_serial = 'AR-2025-002'), 2, '최동욱', '010-5678-9012', '2025-10-16 08:00:00', '2025-10-16 12:00:00', 'overdue', '메가박스 강남점 - 연체 중');

-- 반납 완료된 기록 3건 (통계용)
INSERT INTO kiosk_rentals (rental_number, device_id, facility_id, renter_name, renter_phone, rental_datetime, expected_return_datetime, actual_return_datetime, status, notes) VALUES
('KR-2025-006', (SELECT id FROM kiosk_devices WHERE device_serial = 'AR-2025-001'), 2, '강지훈', '010-6789-0123', '2025-10-16 10:00:00', '2025-10-16 14:00:00', '2025-10-16 13:45:00', 'returned', '정상 반납'),
('KR-2025-007', (SELECT id FROM kiosk_devices WHERE device_serial = 'BC-2025-001'), 2, '한서진', '010-7890-1234', '2025-10-16 11:00:00', '2025-10-16 15:00:00', '2025-10-16 14:30:00', 'returned', '정상 반납'),
('KR-2025-008', (SELECT id FROM kiosk_devices WHERE device_serial = 'SP-2025-001'), 2, '오민지', '010-8901-2345', '2025-10-15 09:00:00', '2025-10-15 13:00:00', '2025-10-15 12:50:00', 'returned', '정상 반납');
