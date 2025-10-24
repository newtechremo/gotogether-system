-- facilities 테이블에 deleted_at 컬럼 추가

USE gotogether;

-- deleted_at 컬럼이 없는 경우에만 추가
ALTER TABLE facilities
ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL
AFTER is_active;

-- 확인
DESC facilities;
