import { apiClient, ApiResponse } from './client';

// Enums
export enum RepairStatus {
  REPORTED = '신고접수',
  IN_REPAIR = '수리중',
  COMPLETED = '수리완료',
}

// Interfaces
export interface DeviceItemInfo {
  id: number;
  deviceCode: string;
  deviceType: string;
  status: string;
}

export interface FacilityRepair {
  id: number;
  facilityId: number;
  deviceItemId: number;
  deviceType: string;
  repairStartDate: string;
  repairEndDate?: string;
  status: string;
  issueDescription: string;
  repairCost?: number;
  repairVendor?: string;
  repairNotes?: string;
  deviceItem?: DeviceItemInfo;
  createdAt: string;
  updatedAt: string;
}

// DTOs
export interface CreateFacilityRepairDto {
  deviceType: string;
  facilityDeviceItemId: number;
  symptomDescription: string;
}

export interface UpdateFacilityRepairDto {
  repairStatus?: string;
  repairMemo?: string;
}

export interface RepairListQuery {
  status?: RepairStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const repairService = {
  /**
   * Get all repairs with optional filters
   */
  async getRepairs(query?: RepairListQuery): Promise<FacilityRepair[]> {
    const response = await apiClient.get<ApiResponse<FacilityRepair[]>>(
      '/facility/repairs',
      { params: query }
    );
    return response.data.data;
  },

  /**
   * Get repairs in progress (status = 수리중)
   */
  async getRepairsInProgress(): Promise<FacilityRepair[]> {
    const response = await apiClient.get<ApiResponse<FacilityRepair[]>>(
      '/facility/repairs/in-progress'
    );
    return response.data.data;
  },

  /**
   * Get completed repairs
   */
  async getCompletedRepairs(): Promise<FacilityRepair[]> {
    const response = await apiClient.get<ApiResponse<FacilityRepair[]>>(
      '/facility/repairs/completed'
    );
    return response.data.data;
  },

  /**
   * Get repair by ID
   */
  async getRepair(id: number): Promise<FacilityRepair> {
    const response = await apiClient.get<ApiResponse<FacilityRepair>>(
      `/facility/repairs/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new repair
   */
  async createRepair(data: CreateFacilityRepairDto): Promise<FacilityRepair> {
    const response = await apiClient.post<ApiResponse<FacilityRepair>>(
      '/facility/repairs',
      data
    );
    return response.data.data;
  },

  /**
   * Update repair
   */
  async updateRepair(
    id: number,
    data: UpdateFacilityRepairDto
  ): Promise<FacilityRepair> {
    const response = await apiClient.put<ApiResponse<FacilityRepair>>(
      `/facility/repairs/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete repair
   */
  async deleteRepair(id: number): Promise<void> {
    await apiClient.delete(`/facility/repairs/${id}`);
  },
};
