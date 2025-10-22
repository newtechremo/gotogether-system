import { apiClient } from './client';

// Types
export interface DeviceItem {
  id: number;
  deviceCode: string;
  serialNumber: string;
  status: 'available' | 'rented' | 'broken' | 'maintenance';
  registrationDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface FacilityDevice {
  id: number;
  facilityId: number;
  deviceType: string;
  qtyTotal: number;
  qtyAvailable: number;
  qtyRented: number;
  qtyBroken: number;
  memo: string;
  deviceItems: DeviceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DeviceStats {
  totalDevices: number;
  availableDevices: number;
  rentedDevices: number;
  brokenDevices: number;
  byType: Record<string, {
    total: number;
    available: number;
    rented: number;
    broken: number;
  }>;
}

export interface CreateDeviceItemDto {
  deviceCode: string;
  serialNumber?: string;
  registrationDate?: string;
  notes?: string;
}

export interface CreateFacilityDeviceDto {
  deviceType: 'AR글라스' | '골전도 이어폰' | '스마트폰';
  deviceItems: CreateDeviceItemDto[];
  memo?: string;
}

export interface UpdateDeviceItemDto {
  deviceCode?: string;
  serialNumber?: string;
  status?: 'available' | 'rented' | 'broken' | 'maintenance';
  registrationDate?: string;
  notes?: string;
}

export interface UpdateFacilityDeviceDto {
  memo?: string;
}

// API Response
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const deviceService = {
  /**
   * 장비 목록 조회
   */
  async getDevices(): Promise<FacilityDevice[]> {
    const response = await apiClient.get<ApiResponse<FacilityDevice[]>>('/facility/devices');
    return response.data.data;
  },

  /**
   * 장비 통계 조회
   */
  async getStats(): Promise<DeviceStats> {
    const response = await apiClient.get<ApiResponse<DeviceStats>>('/facility/devices/stats');
    return response.data.data;
  },

  /**
   * 특정 장비 상세 조회
   */
  async getDevice(id: number): Promise<FacilityDevice> {
    const response = await apiClient.get<ApiResponse<FacilityDevice>>(`/facility/devices/${id}`);
    return response.data.data;
  },

  /**
   * 새 장비 등록
   */
  async createDevice(data: CreateFacilityDeviceDto): Promise<FacilityDevice> {
    const response = await apiClient.post<ApiResponse<FacilityDevice>>('/facility/devices', data);
    return response.data.data;
  },

  /**
   * 장비 정보 수정 (메모)
   */
  async updateDevice(id: number, data: UpdateFacilityDeviceDto): Promise<FacilityDevice> {
    const response = await apiClient.put<ApiResponse<FacilityDevice>>(`/facility/devices/${id}`, data);
    return response.data.data;
  },

  /**
   * 장비 아이템 수정
   */
  async updateDeviceItem(itemId: number, data: UpdateDeviceItemDto): Promise<DeviceItem> {
    const response = await apiClient.put<ApiResponse<DeviceItem>>(`/facility/devices/items/${itemId}`, data);
    return response.data.data;
  },

  /**
   * 장비 아이템 삭제
   */
  async deleteDeviceItem(itemId: number): Promise<void> {
    await apiClient.delete(`/facility/devices/items/${itemId}`);
  },

  /**
   * 장비 삭제 (모든 아이템 포함)
   */
  async deleteDevice(id: number): Promise<void> {
    await apiClient.delete(`/facility/devices/${id}`);
  },
};
