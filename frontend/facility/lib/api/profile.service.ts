import { apiClient } from './client';

export interface FacilityProfile {
  id: number;
  facilityCode: string;
  facilityName: string;
  username: string;
  managerName: string;
  managerPhone: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  managerName?: string;
  managerPhone?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const profileService = {
  // 프로필 조회
  getProfile: () => apiClient.get<{ success: boolean; data: FacilityProfile }>('/facility/profile'),

  // 프로필 수정
  updateProfile: (data: UpdateProfileRequest) =>
    apiClient.put<{ success: boolean; data: FacilityProfile; message: string }>('/facility/profile', data),

  // 비밀번호 변경
  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put<{ success: boolean; data: { message: string }; message: string }>('/facility/profile/password', data),
};
