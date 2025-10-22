import { apiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface FacilityUser {
  id: number;
  username: string;
  name: string;
  facilityId: number;
  facilityName: string;
  facilityCode: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: FacilityUser;
    expires_in: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<{success: boolean; data: LoginResponse['data']}>('/auth/facility/login', credentials);
    return {
      success: response.data.success,
      data: response.data.data,
    };
  },

  async getCurrentUser(): Promise<ApiResponse<FacilityUser>> {
    const response = await apiClient.get<ApiResponse<FacilityUser>>('/auth/me');
    return response.data;
  },

  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('facility_token', token);
      // Also save to cookie for middleware
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `facility_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  },

  saveUser(user: FacilityUser): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('facility_user', JSON.stringify(user));
    }
  },

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('facility_token');
    }
    return null;
  },

  getUser(): FacilityUser | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('facility_user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('facility_token');
      localStorage.removeItem('facility_user');
      // Remove cookie too
      document.cookie = 'facility_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  },

  isAuthenticated(): boolean {
    return this.getToken() !== null;
  },
};
