-- Seed initial device data for testing
-- Insert sample devices for each type

INSERT OR IGNORE INTO devices (type, name, qty_total, qty_available) VALUES
('AR_GLASSES', 'AR 글라스 세트 A', 5, 5),
('AR_GLASSES', 'AR 글라스 세트 B', 3, 3),
('BONE_HEADSET', '골전도 이어폰 세트 A', 10, 10),
('BONE_HEADSET', '골전도 이어폰 세트 B', 8, 8),
('SMARTPHONE', '스마트폰 세트 A', 6, 6),
('SMARTPHONE', '스마트폰 세트 B', 4, 4);
