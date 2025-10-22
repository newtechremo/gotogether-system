-- 시설관리자 시스템 데이터베이스 테이블 생성 SQL

-- 1. facility_devices (시설별 장비 관리 - 집계 테이블)
CREATE TABLE IF NOT EXISTS `facility_devices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facility_id` INT NOT NULL,
  `device_type` ENUM('AR글라스', '골전도 이어폰', '스마트폰') NOT NULL,
  `qty_total` INT DEFAULT 0 COMMENT '총 수량',
  `qty_available` INT DEFAULT 0 COMMENT '대여 가능 수량',
  `qty_rented` INT DEFAULT 0 COMMENT '대여중 수량',
  `qty_broken` INT DEFAULT 0 COMMENT '고장 수량',
  `memo` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE CASCADE,
  INDEX `idx_facility_device` (`facility_id`, `device_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. facility_device_items (개별 장비 상세)
CREATE TABLE IF NOT EXISTS `facility_device_items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facility_device_id` INT NOT NULL,
  `device_code` VARCHAR(100) UNIQUE NOT NULL COMMENT '장비 코드',
  `serial_number` VARCHAR(100) COMMENT '시리얼 번호',
  `status` ENUM('available', 'rented', 'broken', 'maintenance') DEFAULT 'available',
  `registration_date` DATE COMMENT '등록일',
  `notes` TEXT COMMENT '비고',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`facility_device_id`) REFERENCES `facility_devices`(`id`) ON DELETE CASCADE,
  INDEX `idx_facility_device_item_status` (`facility_device_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. facility_rentals (시설 대여/반납 기록)
CREATE TABLE IF NOT EXISTS `facility_rentals` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facility_id` INT NOT NULL,
  `rental_date` DATE NOT NULL COMMENT '대여일',
  `rental_weekday` VARCHAR(10) COMMENT '대여요일',
  `rental_type` ENUM('개인', '단체') NOT NULL COMMENT '대여 유형',
  `borrower_name` VARCHAR(100) NOT NULL COMMENT '대여자 이름',
  `borrower_phone` VARCHAR(20) NOT NULL COMMENT '핸드폰번호',
  `organization_name` VARCHAR(200) COMMENT '단체명 (단체시)',
  `gender` ENUM('남성', '여성', '기타') NOT NULL COMMENT '성별',
  `region` VARCHAR(100) NOT NULL COMMENT '지역 (시/도)',
  `residence` VARCHAR(200) NOT NULL COMMENT '거주지 (상세)',
  `age_group` ENUM('10대', '20대', '30대', '40대', '50대', '60대', '70대이상') NOT NULL COMMENT '연령대',
  `rental_purpose` VARCHAR(500) COMMENT '대여목적',
  `disability_type` VARCHAR(200) COMMENT '장애유형',
  `return_date` DATE NOT NULL COMMENT '반납일',
  `rental_period` INT GENERATED ALWAYS AS (DATEDIFF(return_date, rental_date) + 1) STORED COMMENT '예정기간 (일)',
  `expected_users` INT COMMENT '예정연인원',
  `actual_return_date` DATETIME COMMENT '실제 반납일시',
  `status` ENUM('대여중', '반납완료', '연체') DEFAULT '대여중',
  `notes` TEXT COMMENT '비고',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_by` VARCHAR(100) COMMENT '등록한 관리자',
  FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE CASCADE,
  INDEX `idx_facility_rental_status` (`facility_id`, `status`),
  INDEX `idx_facility_rental_date` (`rental_date`),
  INDEX `idx_facility_rental_borrower` (`borrower_name`, `borrower_phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. facility_rental_devices (대여 장비 상세)
CREATE TABLE IF NOT EXISTS `facility_rental_devices` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rental_id` INT NOT NULL,
  `device_item_id` INT COMMENT '장비 개별 ID',
  `device_type` VARCHAR(50) NOT NULL COMMENT '장비 유형',
  `quantity` INT DEFAULT 1 COMMENT '수량',
  `is_returned` BOOLEAN DEFAULT FALSE COMMENT '반납 여부',
  `return_datetime` DATETIME COMMENT '반납 일시',
  `return_condition` VARCHAR(100) COMMENT '반납시 상태',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`rental_id`) REFERENCES `facility_rentals`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_item_id`) REFERENCES `facility_device_items`(`id`) ON DELETE SET NULL,
  INDEX `idx_rental_device` (`rental_id`, `device_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. facility_repairs (고장신고 관리)
CREATE TABLE IF NOT EXISTS `facility_repairs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `facility_id` INT NOT NULL,
  `device_item_id` INT,
  `device_type` VARCHAR(50) NOT NULL COMMENT '장비 유형',
  `reporter_name` VARCHAR(100) COMMENT '신고자명',
  `issue_description` TEXT NOT NULL COMMENT '고장 증상',
  `status` ENUM('수리접수', '수리중', '수리완료') DEFAULT '수리접수' COMMENT '처리 상태',
  `repair_start_date` DATETIME COMMENT '수리 시작일',
  `repair_end_date` DATETIME COMMENT '수리 완료일',
  `repair_cost` DECIMAL(10, 2) COMMENT '수리 비용',
  `repair_notes` TEXT COMMENT '수리 내역',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`device_item_id`) REFERENCES `facility_device_items`(`id`) ON DELETE SET NULL,
  INDEX `idx_facility_repair_status` (`facility_id`, `status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. 트리거: 대여 요일 자동 설정
DELIMITER $$
CREATE TRIGGER IF NOT EXISTS `set_rental_weekday`
BEFORE INSERT ON `facility_rentals`
FOR EACH ROW
BEGIN
    SET NEW.rental_weekday =
        CASE DAYOFWEEK(NEW.rental_date)
            WHEN 1 THEN '일'
            WHEN 2 THEN '월'
            WHEN 3 THEN '화'
            WHEN 4 THEN '수'
            WHEN 5 THEN '목'
            WHEN 6 THEN '금'
            WHEN 7 THEN '토'
        END;
END$$
DELIMITER ;

-- 7. 이벤트: 연체 상태 자동 업데이트
DELIMITER $$
CREATE EVENT IF NOT EXISTS `update_facility_overdue_status`
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
    UPDATE `facility_rentals`
    SET `status` = '연체'
    WHERE `status` = '대여중'
    AND `return_date` < CURDATE();
END$$
DELIMITER ;
