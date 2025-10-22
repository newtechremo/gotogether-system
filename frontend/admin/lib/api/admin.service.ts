import { apiClient } from './client';

/**
 * 장기 미반납 데이터 타입
 */
export interface OverdueRental {
  id: number;
  kioskId: number;
  kioskName: string;
  location: string;
  deviceName: string;
  deviceType: string;
  rentalTime: string;
  elapsedHours: number;
  renterName: string;
  renterPhone: string;
  severity: 'critical' | 'warning';
}

/**
 * 장기 미반납 목록 응답
 */
export interface OverdueRentalsResponse {
  success: boolean;
  data: OverdueRental[];
}

/**
 * 키오스크 정보
 */
export interface Kiosk {
  id: number;
  name: string;
  location: string;
  status: string;
}

/**
 * 키오스크 목록 응답
 */
export interface KiosksResponse {
  success: boolean;
  data: Kiosk[];
}

/**
 * 관리자 API 서비스
 */
export const adminService = {
  /**
   * 장기 미반납 목록 조회
   */
  async getOverdueRentals(): Promise<OverdueRentalsResponse> {
    const response = await apiClient.get<OverdueRentalsResponse>('/admin/overdue-rentals');
    return response.data;
  },

  /**
   * 키오스크 목록 조회
   */
  async getKiosks(): Promise<KiosksResponse> {
    const response = await apiClient.get<KiosksResponse>('/admin/kiosks');
    return response.data;
  },
};
