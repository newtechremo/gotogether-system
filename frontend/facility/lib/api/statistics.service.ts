import { apiClient, ApiResponse } from './client';

// Dashboard Statistics
export interface DashboardStats {
  totalDevices: number;
  availableDevices: number;
  rentedDevices: number;
  brokenDevices: number;
  currentRentals: number;
  todayRentals: number;
  todayReturns: number;
  overdueRentals: number;
}

// Device Type Statistics
export interface DeviceTypeStats {
  deviceType: string;
  total: number;
  available: number;
  rented: number;
  broken: number;
  utilizationRate: number;
}

// Monthly Statistics
export interface MonthlyStats {
  year: number;
  month: number;
  totalRentals: number;
  totalReturns: number;
  individualRentals: number;
  groupRentals: number;
  totalUsers: number;
  byDeviceType: Record<string, number>;
}

// Daily Statistics
export interface DailyStats {
  date: string;
  rentals: number;
  returns: number;
}

// Device Usage
export interface DeviceUsage {
  deviceId: number;
  deviceCode: string;
  deviceType: string;
  totalRentals: number;
  currentStatus: string;
  lastRentalDate: string | null;
}

// Query Parameters
export interface MonthlyStatsParams {
  year?: number;
  month?: number;
}

export interface DailyStatsParams {
  startDate?: string;
  endDate?: string;
}

export const statisticsService = {
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get<ApiResponse<DashboardStats>>(
      '/facility/statistics/dashboard'
    );
    return response.data.data;
  },

  /**
   * Get device type statistics
   */
  async getDeviceTypeStats(): Promise<DeviceTypeStats[]> {
    const response = await apiClient.get<ApiResponse<DeviceTypeStats[]>>(
      '/facility/statistics/device-types'
    );
    return response.data.data;
  },

  /**
   * Get monthly statistics
   */
  async getMonthlyStats(params?: MonthlyStatsParams): Promise<MonthlyStats> {
    const response = await apiClient.get<ApiResponse<MonthlyStats>>(
      '/facility/statistics/monthly',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get daily statistics
   */
  async getDailyStats(params?: DailyStatsParams): Promise<DailyStats[]> {
    const response = await apiClient.get<ApiResponse<DailyStats[]>>(
      '/facility/statistics/daily',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get device usage statistics
   */
  async getDeviceUsage(): Promise<DeviceUsage[]> {
    const response = await apiClient.get<ApiResponse<DeviceUsage[]>>(
      '/facility/statistics/device-usage'
    );
    return response.data.data;
  },
};
