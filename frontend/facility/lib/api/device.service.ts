import { apiClient } from './client';

// Types
export interface DeviceItem {
  id: number;
  facilityId: number;
  deviceType: 'AR글라스' | '골전도 이어폰' | '스마트폰' | '기타';
  deviceCode: string;
  notes: string;
  serialNumber: string;
  status: 'available' | 'rented' | 'broken' | 'maintenance';
  registrationDate: string;
  createdAt: string;
  updatedAt: string;
}

// Aggregated facility device type (for rental form)
export interface FacilityDevice {
  deviceType: 'AR글라스' | '골전도 이어폰' | '스마트폰' | '기타';
  qtyTotal: number;
  qtyAvailable: number;
  qtyRented: number;
  qtyBroken: number;
  qtyMaintenance: number;
}

export interface DeviceStats {
  totalDevices: number;
  availableDevices: number;
  rentedDevices: number;
  brokenDevices: number;
  maintenanceDevices: number;
  byType: Record<string, {
    total: number;
    available: number;
    rented: number;
    broken: number;
    maintenance: number;
  }>;
}

export interface CreateDeviceItemDto {
  deviceType: 'AR글라스' | '골전도 이어폰' | '스마트폰' | '기타';
  deviceCode: string;
  notes?: string;
  serialNumber?: string;
  registrationDate?: string;
}

export interface UpdateDeviceItemDto {
  deviceType?: 'AR글라스' | '골전도 이어폰' | '스마트폰' | '기타';
  deviceCode?: string;
  notes?: string;
  serialNumber?: string;
  status?: 'available' | 'rented' | 'broken' | 'maintenance';
  registrationDate?: string;
}

// API Response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to aggregate device items by type
export function aggregateDevicesByType(deviceItems: DeviceItem[]): FacilityDevice[] {
  const aggregated: Record<string, FacilityDevice> = {};

  deviceItems.forEach((item) => {
    if (!aggregated[item.deviceType]) {
      aggregated[item.deviceType] = {
        deviceType: item.deviceType,
        qtyTotal: 0,
        qtyAvailable: 0,
        qtyRented: 0,
        qtyBroken: 0,
        qtyMaintenance: 0,
      };
    }

    aggregated[item.deviceType].qtyTotal++;
    if (item.status === 'available') {
      aggregated[item.deviceType].qtyAvailable++;
    } else if (item.status === 'rented') {
      aggregated[item.deviceType].qtyRented++;
    } else if (item.status === 'broken') {
      aggregated[item.deviceType].qtyBroken++;
    } else if (item.status === 'maintenance') {
      aggregated[item.deviceType].qtyMaintenance++;
    }
  });

  return Object.values(aggregated);
}

export const deviceService = {
  /**
   * 장비 아이템 목록 조회
   */
  async getDevices(): Promise<DeviceItem[]> {
    const response = await apiClient.get<ApiResponse<DeviceItem[]>>('/facility/devices');
    return response.data.data;
  },

  /**
   * 장비 아이템을 타입별로 집계하여 조회
   */
  async getAggregatedDevices(): Promise<FacilityDevice[]> {
    const deviceItems = await this.getDevices();
    return aggregateDevicesByType(deviceItems);
  },

  /**
   * 장비 통계 조회
   */
  async getStats(): Promise<DeviceStats> {
    const response = await apiClient.get<ApiResponse<DeviceStats>>('/facility/devices/stats');
    return response.data.data;
  },

  /**
   * 특정 장비 아이템 상세 조회
   */
  async getDevice(id: number): Promise<DeviceItem> {
    const response = await apiClient.get<ApiResponse<DeviceItem>>(`/facility/devices/${id}`);
    return response.data.data;
  },

  /**
   * 새 장비 아이템 등록
   */
  async createDevice(data: CreateDeviceItemDto): Promise<DeviceItem> {
    const response = await apiClient.post<ApiResponse<DeviceItem>>('/facility/devices', data);
    return response.data.data;
  },

  /**
   * 장비 아이템 수정
   */
  async updateDevice(id: number, data: UpdateDeviceItemDto): Promise<DeviceItem> {
    const response = await apiClient.put<ApiResponse<DeviceItem>>(`/facility/devices/${id}`, data);
    return response.data.data;
  },

  /**
   * 장비 아이템 삭제
   */
  async deleteDevice(id: number): Promise<void> {
    await apiClient.delete(`/facility/devices/${id}`);
  },
};
