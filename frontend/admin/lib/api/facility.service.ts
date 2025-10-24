import { apiClient } from './client';

export interface Facility {
  id: number;
  facilityCode: string;
  facilityName: string;
  username: string;
  managerName?: string;
  managerPhone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFacilityRequest {
  facilityCode: string;
  facilityName: string;
  username: string;
  password: string;
  managerName?: string;
  managerPhone?: string;
  address?: string;
}

export interface UpdateFacilityRequest {
  facilityCode?: string;
  facilityName?: string;
  username?: string;
  password?: string;
  managerName?: string;
  managerPhone?: string;
  address?: string;
  isActive?: boolean;
}

export interface FacilityListResponse {
  success: boolean;
  data: {
    items: Facility[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FacilityResponse {
  success: boolean;
  data: Facility;
  message?: string;
}

export interface ResetPasswordRequest {
  newPassword?: string;
  autoGenerate?: boolean;
}

export interface ResetPasswordResponse {
  success: boolean;
  data: {
    newPassword: string;
    message: string;
  };
  message: string;
}

export const facilityService = {
  async getFacilities(page: number = 1, limit: number = 10, search?: string): Promise<FacilityListResponse> {
    const params: any = { page: page.toString(), limit: limit.toString() };
    if (search) params.search = search;
    const query = new URLSearchParams(params).toString();
    const response = await apiClient.get<FacilityListResponse>('/facilities?' + query);
    return response.data;
  },

  async getFacility(id: number): Promise<FacilityResponse> {
    const response = await apiClient.get<FacilityResponse>('/facilities/' + id);
    return response.data;
  },

  async createFacility(data: CreateFacilityRequest): Promise<FacilityResponse> {
    const response = await apiClient.post<FacilityResponse>('/facilities', data);
    return response.data;
  },

  async updateFacility(id: number, data: UpdateFacilityRequest): Promise<FacilityResponse> {
    const response = await apiClient.put<FacilityResponse>('/facilities/' + id, data);
    return response.data;
  },

  async deleteFacility(id: number): Promise<FacilityResponse> {
    const response = await apiClient.delete<FacilityResponse>('/facilities/' + id);
    return response.data;
  },

  async resetPassword(id: number, data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    console.log('[API] 비밀번호 재설정 요청:', {
      url: '/admin/facilities/' + id + '/reset-password',
      facilityId: id,
      requestData: data
    });

    try {
      const response = await apiClient.post<ResetPasswordResponse>('/admin/facilities/' + id + '/reset-password', data);

      console.log('[API] 비밀번호 재설정 응답 받음:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: response.data
      });

      return response.data;
    } catch (error: any) {
      console.error('[API] 비밀번호 재설정 에러:', {
        error,
        response: error.response,
        responseData: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      throw error;
    }
  },
};
