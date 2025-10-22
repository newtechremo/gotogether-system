import { apiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UserData {
  id: number;
  username: string;
  name: string;
  role?: string;
  permissions?: string[];
  facilityId?: number;
  facilityName?: string;
}

export interface LoginResponse {
  success: boolean;
  data: {
    access_token: string;
    refresh_token: string;
    user: UserData;
    expires_in: number;
  };
}

export interface CurrentUserResponse {
  success: boolean;
  data: UserData;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export const authService = {
  /**
   * 전체관리자 로그인
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/admin/login', data);
    return response.data;
  },

  /**
   * 로그아웃
   */
  async logout(): Promise<void> {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      // 쿠키에서도 토큰 제거
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    }
  },

  /**
   * 현재 사용자 정보 조회
   */
  async getCurrentUser(): Promise<CurrentUserResponse> {
    const response = await apiClient.get<CurrentUserResponse>('/auth/me');
    return response.data;
  },

  /**
   * 토큰 저장 (localStorage와 쿠키에 동시 저장)
   */
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_token', token);
      // 쿠키에도 저장 (미들웨어에서 접근 가능)
      // 7일 만료
      const expires = new Date();
      expires.setDate(expires.getDate() + 7);
      document.cookie = `admin_token=${token}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    }
  },

  /**
   * 사용자 정보 저장
   */
  saveUser(user: UserData): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin_user', JSON.stringify(user));
    }
  },

  /**
   * 저장된 사용자 정보 가져오기
   */
  getSavedUser(): UserData | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('admin_user');
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

  /**
   * 로그인 상태 확인
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('admin_token');
    }
    return false;
  },
};
