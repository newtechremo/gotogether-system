// Device types enum
export const DEVICE_TYPES = {
  AR_GLASSES: "AR_GLASSES",
  BONE_HEADSET: "BONE_HEADSET",
  SMARTPHONE: "SMARTPHONE",
} as const

export type DeviceType = (typeof DEVICE_TYPES)[keyof typeof DEVICE_TYPES]

// Repair status enum
export const REPAIR_STATUS = {
  REPORTED: "REPORTED",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
} as const

export type RepairStatus = (typeof REPAIR_STATUS)[keyof typeof REPAIR_STATUS]

// Type definitions
export interface Device {
  id: number
  type: DeviceType
  name: string | null
  qty_total: number
  qty_available: number
  qty_broken: number // Added broken quantity field
  created_at: string
  updated_at: string
}

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

export interface Rental {
  id: number
  device_type: DeviceType
  device_name: string | null
  renter_name: string
  renter_phone: string
  rental_date: string // 대여일
  rental_day_of_week: string // 대여요일
  rental_type: "개인" | "단체" // 유형
  group_name: string | null // 단체명
  gender: "남" | "여" // 성별
  region: string // 지역
  residence: string // 거주지
  age_group: string // 연령대
  rental_purpose: string // 대여목적
  disability_type: string // 장애유형
  quantity: number // 수량
  period: number // 기간
  total_person_days: number // 연인원
  return_date: string // 반납일
  rented_at: string
  returned_at: string | null
  note_rent: string | null
  note_return: string | null
}

const devices: Device[] = [
  {
    id: 1,
    type: "AR_GLASSES",
    name: "AR 글라스",
    qty_total: 10,
    qty_available: 8,
    qty_broken: 1, // Added broken quantity
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    type: "BONE_HEADSET",
    name: "골전도 이어폰",
    qty_total: 15,
    qty_available: 12,
    qty_broken: 2, // Added broken quantity
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    type: "SMARTPHONE",
    name: "스마트폰",
    qty_total: 8,
    qty_available: 5,
    qty_broken: 1, // Added broken quantity
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const repairReports: RepairReport[] = [
  {
    id: 1,
    device_type: "AR_GLASSES",
    device_name: "AR 글라스",
    symptom: "화면이 깜빡거림",
    status: "IN_PROGRESS",
    reported_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    completed_at: null,
    notes: "부품 교체 필요",
  },
  {
    id: 2,
    device_type: "SMARTPHONE",
    device_name: "스마트폰",
    symptom: "배터리 방전",
    status: "COMPLETED",
    reported_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    completed_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    notes: "배터리 교체 완료",
  },
]

const rentals: Rental[] = [
  {
    id: 1,
    device_type: "AR_GLASSES",
    device_name: "AR 글라스",
    renter_name: "김철수",
    renter_phone: "010-1234-5678",
    rental_date: new Date().toISOString().split("T")[0],
    rental_day_of_week: "월",
    rental_type: "개인",
    group_name: null,
    gender: "남",
    region: "서울",
    residence: "강남구",
    age_group: "30대",
    rental_purpose: "영화 상영장 관람",
    disability_type: "시각장애",
    quantity: 1,
    period: 7,
    total_person_days: 7,
    return_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    rented_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    returned_at: null,
    note_rent: "영화 관람용",
    note_return: null,
  },
  {
    id: 2,
    device_type: "SMARTPHONE",
    device_name: "스마트폰",
    renter_name: "이영희",
    renter_phone: "010-9876-5432",
    rental_date: new Date().toISOString().split("T")[0],
    rental_day_of_week: "월",
    rental_type: "개인",
    group_name: null,
    gender: "여",
    region: "경기",
    residence: "수원시",
    age_group: "20대",
    rental_purpose: "영화 상영장 관람",
    disability_type: "청각장애",
    quantity: 1,
    period: 7,
    total_person_days: 7,
    return_date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    rented_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    returned_at: null,
    note_rent: "자막 서비스용",
    note_return: null,
  },
]

let nextDeviceId = 4
let nextRentalId = 3
let nextRepairId = 3 // Added repair ID counter

// Device operations
export const deviceQueries = {
  getAll: () => {
    return [...devices].sort((a, b) => a.type.localeCompare(b.type))
  },

  getById: (id: number) => {
    return devices.find((d) => d.id === id)
  },

  create: (device: Omit<Device, "id" | "created_at" | "updated_at">) => {
    const newDevice: Device = {
      ...device,
      id: nextDeviceId++,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    devices.push(newDevice)
    return { lastInsertRowid: newDevice.id }
  },

  update: (id: number, updates: Partial<Pick<Device, "name" | "qty_total" | "qty_available" | "qty_broken">>) => {
    // Added qty_broken to updatable fields
    const deviceIndex = devices.findIndex((d) => d.id === id)
    if (deviceIndex === -1) return { changes: 0 }

    devices[deviceIndex] = {
      ...devices[deviceIndex],
      ...updates,
      updated_at: new Date().toISOString(),
    }
    return { changes: 1 }
  },

  updateAvailableQty: (deviceType: DeviceType, change: number) => {
    const device = devices.find((d) => d.type === deviceType)
    if (!device || device.qty_available + change < 0) return { changes: 0 }

    device.qty_available += change
    device.updated_at = new Date().toISOString()
    return { changes: 1 }
  },

  updateBrokenQty: (deviceType: DeviceType, change: number) => {
    const device = devices.find((d) => d.type === deviceType)
    if (!device || device.qty_broken + change < 0) return { changes: 0 }

    device.qty_broken += change
    device.updated_at = new Date().toISOString()
    return { changes: 1 }
  },
}

export const repairQueries = {
  getAll: () => {
    return [...repairReports].sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime())
  },

  getById: (id: number) => {
    return repairReports.find((r) => r.id === id)
  },

  create: (report: Omit<RepairReport, "id" | "reported_at" | "completed_at">) => {
    const newReport: RepairReport = {
      ...report,
      id: nextRepairId++,
      reported_at: new Date().toISOString(),
      completed_at: null,
    }
    repairReports.push(newReport)
    return { lastInsertRowid: newReport.id }
  },

  updateStatus: (id: number, status: RepairStatus, notes?: string) => {
    const report = repairReports.find((r) => r.id === id)
    if (!report) return { changes: 0 }

    report.status = status
    if (notes) report.notes = notes
    if (status === "COMPLETED") {
      report.completed_at = new Date().toISOString()
    }
    return { changes: 1 }
  },

  getStatusCounts: () => {
    const counts = {
      REPORTED: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
    }
    repairReports.forEach((report) => {
      counts[report.status]++
    })
    return counts
  },
}

// Rental operations
export const rentalQueries = {
  getAll: () => {
    return [...rentals].sort((a, b) => new Date(b.rented_at).getTime() - new Date(a.rented_at).getTime())
  },

  getCurrentRentals: () => {
    return rentals
      .filter((r) => !r.returned_at)
      .sort((a, b) => new Date(b.rented_at).getTime() - new Date(a.rented_at).getTime())
  },

  create: (rental: Omit<Rental, "id" | "rented_at" | "returned_at">) => {
    const newRental: Rental = {
      ...rental,
      id: nextRentalId++,
      rented_at: new Date().toISOString(),
      returned_at: null,
    }
    rentals.push(newRental)
    return { lastInsertRowid: newRental.id }
  },

  returnRental: (id: number, noteReturn: string) => {
    const rental = rentals.find((r) => r.id === id && !r.returned_at)
    if (!rental) return { changes: 0 }

    rental.returned_at = new Date().toISOString()
    rental.note_return = noteReturn
    return { changes: 1 }
  },

  getTodayStats: () => {
    const today = new Date().toDateString()
    const todayRentals = rentals.filter((r) => new Date(r.rented_at).toDateString() === today)
    const todayReturns = rentals.filter((r) => r.returned_at && new Date(r.returned_at).toDateString() === today)

    return {
      today_rentals: todayRentals.length,
      today_returns: todayReturns.length,
    }
  },
}
