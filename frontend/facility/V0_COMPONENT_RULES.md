# 같이봄 플러스 시설관리자 시스템 - V0 Component Rules

## 프로젝트 개요
영화관 보조기기 대여 관리시스템으로 AR 글라스, 골전도 이어폰, 스마트폰의 대여/반납/수리를 관리하는 시스템입니다.

## 필수 사용 컴포넌트

### 1. 네비게이션 시스템
\`\`\`tsx
// components/navigation.tsx - 메인 네비게이션 바
- 한국어 인터페이스 (대시보드, 기기관리, 대여/반납, 전체이력, 고장신고)
- 이모지 아이콘 사용 (📊, 🎧, 🔄, 📋, 🔧)
- 검은색 테두리와 활성 상태 스타일링
- 접근성 고려 (min-h-[44px], min-w-[44px])
\`\`\`

### 2. 대시보드 컴포넌트
\`\`\`tsx
// components/dashboard/kpi-cards.tsx - KPI 메트릭 카드
interface KPICardsProps {
  totalDevices: number
  currentRentals: number
  availableDevices: number
  todayRentals: number
  todayReturns: number
}
- 4개 카드 그리드 레이아웃 (총 보유 기기, 현재 대여중, 대여 가능, 오늘 처리)
- 검은색 테두리와 흰색 배경
- 큰 숫자 표시 (text-4xl font-bold)

// components/dashboard/current-rentals.tsx - 현재 대여 현황
// components/dashboard/inventory-status.tsx - 재고 현황
// components/dashboard/recent-history.tsx - 최근 이력
\`\`\`

### 3. 기기 관리 컴포넌트
\`\`\`tsx
// components/devices/device-table.tsx - 기기 목록 테이블
interface DeviceTableProps {
  devices: Device[]
}
- 기기 종류별 한국어 라벨 (AR 글라스, 골전도 이어폰, 스마트폰)
- 수량 상태 표시 (전체, 대여중, 고장, 가능)
- 품절/고장 상태 빨간색 표시
- 수정 버튼으로 편집 다이얼로그 연결

// components/devices/add-device-button.tsx - 기기 추가 버튼
// components/devices/add-device-dialog.tsx - 기기 추가 다이얼로그
// components/devices/edit-device-dialog.tsx - 기기 수정 다이얼로그
\`\`\`

### 4. 대여/반납 컴포넌트
\`\`\`tsx
// components/rentals/rental-tabs.tsx - 대여/반납 탭 인터페이스
interface RentalTabsProps {
  devices: Device[]
  currentRentals: Rental[]
}
- 대여하기/반납하기 탭 전환
- 검은색 활성 탭, 흰색 비활성 탭
- 큰 버튼 크기 (min-h-[60px], text-xl)

// components/rentals/rent-form.tsx - 대여 폼
// components/rentals/return-form.tsx - 반납 폼
\`\`\`

### 5. 수리 관리 컴포넌트
\`\`\`tsx
// components/repairs/repair-table.tsx - 수리 현황 테이블
// components/repairs/add-repair-dialog.tsx - 수리 신고 다이얼로그
// components/repairs/update-status-dialog.tsx - 수리 상태 업데이트
\`\`\`

### 6. 이력 관리 컴포넌트
\`\`\`tsx
// components/history/history-table.tsx - 전체 이력 테이블
\`\`\`

## 데이터 타입 정의

### 기기 타입
\`\`\`tsx
export const DEVICE_TYPES = {
  AR_GLASSES: "AR_GLASSES",
  BONE_HEADSET: "BONE_HEADSET", 
  SMARTPHONE: "SMARTPHONE",
} as const

export interface Device {
  id: number
  type: DeviceType
  name: string | null
  qty_total: number
  qty_available: number
  qty_broken: number
  created_at: string
  updated_at: string
}
\`\`\`

### 대여 타입
\`\`\`tsx
export interface Rental {
  id: number
  device_type: DeviceType
  device_name: string | null
  renter_name: string
  renter_phone: string
  rented_at: string
  returned_at: string | null
  note_rent: string | null
  note_return: string | null
}
\`\`\`

### 수리 타입
\`\`\`tsx
export const REPAIR_STATUS = {
  REPORTED: "REPORTED",
  IN_PROGRESS: "IN_PROGRESS", 
  COMPLETED: "COMPLETED",
} as const

export interface RepairReport {
  id: number
  device_type: DeviceType
  device_name: string | null
  symptom: string
  status: RepairStatus
  reported_at: string
  completed_at: string | null
  notes: string | null
}
\`\`\`

## 디자인 시스템 규칙

### 색상 시스템
- **주색상**: 검은색 (#000000) - 테두리, 활성 상태, 텍스트
- **배경색**: 흰색 (#FFFFFF) - 카드, 폼 배경
- **보조색**: 회색 계열 - 비활성 상태, 설명 텍스트
- **경고색**: 빨간색 - 품절, 고장 상태 표시

### 타이포그래피
- **제목**: text-3xl font-bold (시스템 제목)
- **섹션 제목**: text-lg font-semibold
- **본문**: text-lg leading-relaxed (접근성 고려)
- **폰트**: GeistSans, GeistMono

### 레이아웃 패턴
- **컨테이너**: max-w-7xl mx-auto px-4
- **카드**: border-2 border-black bg-white
- **버튼**: min-h-[44px] min-w-[44px] (접근성)
- **그리드**: grid-cols-1 md:grid-cols-2 lg:grid-cols-4
- **간격**: gap-6, gap-8 (일관된 여백)

### 접근성 규칙
- 최소 터치 영역: 44px × 44px
- 기본 폰트 크기: 150% (24px) - layout.tsx에서 설정
- 충분한 색상 대비
- 의미있는 한국어 라벨 사용

## 데이터베이스 쿼리 패턴

### 기기 관리
\`\`\`tsx
import { deviceQueries } from "@/lib/database"

// 모든 기기 조회
const devices = deviceQueries.getAll()

// 기기 수량 업데이트
deviceQueries.updateAvailableQty(deviceType, change)
deviceQueries.updateBrokenQty(deviceType, change)
\`\`\`

### 대여 관리
\`\`\`tsx
import { rentalQueries } from "@/lib/database"

// 현재 대여 목록
const currentRentals = rentalQueries.getCurrentRentals()

// 오늘 통계
const todayStats = rentalQueries.getTodayStats()
\`\`\`

### 수리 관리
\`\`\`tsx
import { repairQueries } from "@/lib/database"

// 수리 현황 조회
const repairs = repairQueries.getAll()

// 상태별 카운트
const statusCounts = repairQueries.getStatusCounts()
\`\`\`

## 사용 지침

1. **새 페이지 생성시**: Navigation 컴포넌트를 반드시 포함
2. **데이터 표시시**: 한국어 라벨과 적절한 상태 표시 사용
3. **폼 작성시**: 접근성을 고려한 큰 버튼과 명확한 라벨
4. **상태 관리시**: 품절, 고장 등 중요 상태는 빨간색으로 강조
5. **테이블 생성시**: 검은색 테두리와 호버 효과 적용

이 규칙들을 따라 일관된 사용자 경험과 접근성을 보장하는 시스템을 구축하세요.
