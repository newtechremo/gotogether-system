# 가치봄플러스 GoTogether API 문서 v1.0

## 📌 API 개요

### Base URL
```
Production: https://api.gotogether.kr/v1
Development: https://dev-api.gotogether.kr/v1
```

### 인증 방식
```http
Authorization: Bearer {token}
Content-Type: application/json
```

---

## 1. 키오스크 API

### 1.1 사용자 인증 및 대여

#### 📱 전화번호 인증 요청
```http
POST /kiosk/auth/request-otp
```

**Request Body:**
```json
{
  "phone_number": "010-1234-5678",
  "kiosk_id": "KIOSK_001",
  "facility_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "request_id": "REQ_123456",
    "expires_at": "2024-11-15T10:05:00Z",
    "remaining_seconds": 180
  },
  "message": "인증번호가 발송되었습니다"
}
```

#### ✅ OTP 인증 확인
```http
POST /kiosk/auth/verify-otp
```

**Request Body:**
```json
{
  "request_id": "REQ_123456",
  "otp_code": "123456",
  "phone_number": "010-1234-5678"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "auth_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "phone": "010-****-5678",
      "rental_available": true,
      "existing_rentals": []
    }
  }
}
```

#### 🎯 대여 가능 장비 조회
```http
GET /kiosk/devices/available?kiosk_id={kiosk_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kiosk_id": "KIOSK_001",
    "location": "서울시 영화관",
    "devices": [
      {
        "type": "AR_GLASS",
        "type_name": "AR 글라스",
        "available_count": 5,
        "total_count": 5,
        "devices": [
          {
            "device_id": "AR_001",
            "box_number": 1,
            "status": "available"
          }
        ]
      },
      {
        "type": "BONE_CONDUCTION",
        "type_name": "골전도 이어폰",
        "available_count": 2,
        "total_count": 2
      },
      {
        "type": "SMARTPHONE",
        "type_name": "스마트폰",
        "available_count": 2,
        "total_count": 2
      }
    ],
    "total_available": 9,
    "updated_at": "2024-11-15T10:00:00Z"
  }
}
```

#### 📦 장비 대여 처리
```http
POST /kiosk/rentals/create
```

**Request Body:**
```json
{
  "auth_token": "eyJhbGciOiJIUzI1NiIs...",
  "kiosk_id": "KIOSK_001",
  "devices": [
    {
      "device_id": "AR_001",
      "device_type": "AR_GLASS"
    }
  ],
  "renter_info": {
    "name": "홍길동",
    "phone": "010-1234-5678",
    "agree_terms": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rental_id": "RENT_20241115_001",
    "rental_number": "2024111500001",
    "devices": [
      {
        "device_id": "AR_001",
        "device_type": "AR_GLASS",
        "box_number": 1,
        "nfc_tag_id": "NFC_AR_001"
      }
    ],
    "rental_date": "2024-11-15T10:00:00Z",
    "expected_return": "2024-11-17T22:00:00Z",
    "box_opened": [1]
  },
  "message": "대여가 완료되었습니다"
}
```

### 1.2 반납 처리

#### 🔍 반납 대상 조회
```http
GET /kiosk/rentals/active?phone={phone_number}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rentals": [
      {
        "rental_id": "RENT_20241115_001",
        "devices": [
          {
            "device_id": "AR_001",
            "device_type": "AR_GLASS",
            "device_name": "AR 글라스",
            "rental_date": "2024-11-15T10:00:00Z"
          }
        ]
      }
    ]
  }
}
```

#### 📥 장비 반납 처리
```http
POST /kiosk/rentals/return
```

**Request Body:**
```json
{
  "rental_id": "RENT_20241115_001",
  "device_id": "AR_001",
  "nfc_tag_id": "NFC_AR_001",
  "kiosk_id": "KIOSK_001",
  "return_box_number": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "return_id": "RET_20241115_001",
    "device_id": "AR_001",
    "returned_at": "2024-11-15T18:00:00Z",
    "rental_duration_hours": 8,
    "remaining_devices": 0
  },
  "message": "반납이 완료되었습니다"
}
```

### 1.3 키오스크 상태 관리

#### 🔄 키오스크 상태 동기화
```http
POST /kiosk/status/sync
```

**Request Body:**
```json
{
  "kiosk_id": "KIOSK_001",
  "status": {
    "operational": true,
    "network_status": "connected",
    "boxes": [
      {
        "box_number": 1,
        "device_id": "AR_001",
        "door_status": "closed",
        "nfc_status": "active"
      }
    ],
    "temperature": 22.5,
    "last_maintenance": "2024-11-01T10:00:00Z"
  }
}
```

---

## 2. 관리자 API

### 2.1 인증

#### 🔐 관리자 로그인
```http
POST /admin/auth/login
```

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 1,
      "username": "admin",
      "name": "관리자",
      "role": "super_admin",
      "permissions": ["all"]
    },
    "expires_in": 3600
  }
}
```

### 2.2 GoTogether 키오스크 관리

#### 📊 전체 키오스크 현황 조회
```http
GET /admin/kiosks
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_kiosks": 15,
    "kiosks": [
      {
        "id": 1,
        "kiosk_id": "KIOSK_001",
        "location": "서울시 메가박스",
        "facility_id": 1,
        "status": "operational",
        "devices": {
          "total": 9,
          "available": 4,
          "rented": 5,
          "maintenance": 0
        },
        "ar_glass": {
          "total": 5,
          "available": 1,
          "rented": 4
        },
        "bone_conduction": {
          "total": 2,
          "available": 2,
          "rented": 0
        },
        "smartphone": {
          "total": 2,
          "available": 1,
          "rented": 1
        },
        "last_sync": "2024-11-15T10:00:00Z"
      }
    ]
  }
}
```

#### 🔍 키오스크 상세 정보 조회
```http
GET /admin/kiosks/{kiosk_id}/detail
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kiosk_id": "KIOSK_001",
    "location": "서울시 메가박스",
    "installation_date": "2024-01-15",
    "devices": [
      {
        "device_id": "AR_001",
        "device_type": "AR_GLASS",
        "serial_number": "AR2024001",
        "box_number": 1,
        "status": "rented",
        "current_rental": {
          "rental_id": "RENT_20241115_001",
          "renter_phone": "010-****-5678",
          "rental_date": "2024-11-15T10:00:00Z"
        },
        "total_rentals": 45,
        "notes": "정상 작동"
      }
    ],
    "maintenance_history": [
      {
        "date": "2024-11-01",
        "type": "정기점검",
        "technician": "김기술",
        "notes": "정상"
      }
    ]
  }
}
```

### 2.3 실시간 대여 현황

#### 📈 실시간 대여 현황 조회
```http
GET /admin/rentals/realtime
```

**Query Parameters:**
- `date`: 조회 날짜 (YYYY-MM-DD)
- `kiosk_id`: 키오스크 ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-11-15",
    "summary": {
      "total_rentals_today": 25,
      "total_returns_today": 20,
      "currently_rented": 45,
      "overdue": 3
    },
    "rentals": [
      {
        "rental_id": "RENT_20241115_001",
        "kiosk_id": "KIOSK_001",
        "location": "서울시 메가박스",
        "device_type": "AR_GLASS",
        "device_id": "AR_001",
        "renter_phone": "010-****-5678",
        "rental_time": "2024-11-15T10:00:00Z",
        "expected_return": "2024-11-17T22:00:00Z",
        "status": "rented"
      }
    ]
  }
}
```

### 2.4 장기 미반납자 관리

#### ⚠️ 장기 미반납자 목록 조회
```http
GET /admin/rentals/overdue
```

**Query Parameters:**
- `hours`: 경과 시간 (기본값: 24)
- `kiosk_id`: 키오스크 ID (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "overdue_count": 3,
    "overdue_rentals": [
      {
        "rental_id": "RENT_20241110_005",
        "kiosk_id": "KIOSK_003",
        "location": "대구시 롯데시네마",
        "device_type": "AR_GLASS",
        "device_id": "AR_015",
        "box_name": "001_AR글라스",
        "renter_info": {
          "phone": "010-****-1234",
          "rental_date": "2024-11-10T14:30:00Z"
        },
        "elapsed_hours": 124,
        "elapsed_days": 5,
        "status": "severely_overdue",
        "alert_level": "high"
      }
    ]
  }
}
```

### 2.5 원격 제어

#### 🔓 키오스크 박스 원격 열기
```http
POST /admin/kiosks/{kiosk_id}/remote-control
```

**Request Body:**
```json
{
  "action": "open_box",
  "box_number": 1,
  "reason": "관리자 점검",
  "admin_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "kiosk_id": "KIOSK_001",
    "action": "open_box",
    "box_number": 1,
    "executed_at": "2024-11-15T10:30:00Z",
    "result": "success"
  },
  "message": "박스가 열렸습니다"
}
```

---

## 3. 시설관리자 API

### 3.1 시설관리자 인증

#### 🔐 시설관리자 로그인
```http
POST /facility/auth/login
```

**Request Body:**
```json
{
  "username": "facility_seoul_01",
  "password": "password123"
}
```

### 3.2 시설 장비 관리

#### 📦 시설 장비 목록 조회
```http
GET /facility/devices
```

**Response:**
```json
{
  "success": true,
  "data": {
    "facility_id": 1,
    "facility_name": "서울시각장애인복지관",
    "devices": [
      {
        "device_type": "AR글라스",
        "total_quantity": 10,
        "available_quantity": 2,
        "rented_quantity": 8,
        "broken_quantity": 0,
        "devices": [
          {
            "device_code": "FAC_AR_001",
            "serial_number": "SN2024001",
            "status": "rented",
            "registration_date": "2024-01-15"
          }
        ]
      }
    ]
  }
}
```

#### ➕ 신규 장비 등록
```http
POST /facility/devices/register
```

**Request Body:**
```json
{
  "device_type": "AR글라스",
  "devices": [
    {
      "device_code": "FAC_AR_011",
      "serial_number": "SN2024011",
      "registration_date": "2024-11-15"
    }
  ],
  "memo": "신규 구매 장비"
}
```

### 3.3 시설 대여/반납

#### 📝 시설 대여 등록
```http
POST /facility/rentals/create
```

**Request Body:**
```json
{
  "rental_date": "2024-11-15",
  "rental_type": "단체",
  "borrower_name": "홍길동",
  "borrower_phone": "010-1234-5678",
  "organization_name": "서울시각장애인복지관",
  "gender": "남성",
  "region": "서울특별시",
  "residence": "강남구 테헤란로 123",
  "age_group": "40대",
  "rental_purpose": "영화관람",
  "disability_type": "시각장애",
  "return_date": "2024-11-17",
  "expected_users": 15,
  "devices": [
    {
      "device_type": "AR글라스",
      "quantity": 8
    },
    {
      "device_type": "골전도 이어폰",
      "quantity": 5
    }
  ],
  "notes": "단체 영화 관람 프로그램"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "rental_id": "FAC_RENT_20241115_001",
    "rental_period": 3,
    "total_devices": 13,
    "created_at": "2024-11-15T10:00:00Z"
  },
  "message": "대여가 등록되었습니다"
}
```

### 3.4 고장 신고

#### 🔧 고장 신고 등록
```http
POST /facility/repairs/report
```

**Request Body:**
```json
{
  "device_item_id": 5,
  "device_type": "AR글라스",
  "issue_description": "화면이 깜빡거리며 간헐적으로 꺼짐",
  "reporter_name": "김관리"
}
```

---

## 4. 통계 API

### 4.1 대여 통계

#### 📊 일일 통계 조회
```http
GET /statistics/daily?date={date}&facility_id={facility_id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-11-15",
    "facility_id": 1,
    "kiosk_stats": {
      "total_rentals": 25,
      "total_returns": 20,
      "ar_glass_rentals": 15,
      "bone_conduction_rentals": 5,
      "smartphone_rentals": 5
    },
    "facility_stats": {
      "total_rentals": 10,
      "total_returns": 8,
      "individual_rentals": 3,
      "group_rentals": 7
    }
  }
}
```

---

## 5. 웹소켓 API (실시간 업데이트)

### WebSocket 연결
```javascript
ws://api.gotogether.kr/ws
```

### 이벤트 구독
```json
{
  "type": "subscribe",
  "channels": ["kiosk_status", "rentals", "returns"],
  "kiosk_id": "KIOSK_001"
}
```

### 실시간 이벤트 수신
```json
{
  "type": "rental_created",
  "data": {
    "rental_id": "RENT_20241115_001",
    "kiosk_id": "KIOSK_001",
    "device_type": "AR_GLASS",
    "timestamp": "2024-11-15T10:00:00Z"
  }
}
```

---

## 6. 에러 코드

| Code | Description | HTTP Status |
|------|------------|-------------|
| AUTH_001 | 인증 실패 | 401 |
| AUTH_002 | 토큰 만료 | 401 |
| AUTH_003 | 권한 없음 | 403 |
| RENTAL_001 | 이미 대여 중인 사용자 | 400 |
| RENTAL_002 | 대여 가능 장비 없음 | 400 |
| RENTAL_003 | 미반납 장비 존재 | 400 |
| DEVICE_001 | 장비를 찾을 수 없음 | 404 |
| DEVICE_002 | 장비 상태 오류 | 400 |
| KIOSK_001 | 키오스크 연결 오류 | 503 |
| KIOSK_002 | 박스 열기 실패 | 500 |

---

## 7. Rate Limiting

- 일반 API: 1000 requests/hour
- 인증 API: 10 requests/minute
- WebSocket: 100 messages/minute

---