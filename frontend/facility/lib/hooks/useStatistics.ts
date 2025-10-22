import { useQuery } from '@tanstack/react-query';
import {
  statisticsService,
  MonthlyStatsParams,
  DailyStatsParams,
} from '../api/statistics.service';

const QUERY_KEYS = {
  dashboard: ['statistics', 'dashboard'] as const,
  deviceTypes: ['statistics', 'device-types'] as const,
  monthly: (params?: MonthlyStatsParams) => ['statistics', 'monthly', params] as const,
  daily: (params?: DailyStatsParams) => ['statistics', 'daily', params] as const,
  deviceUsage: ['statistics', 'device-usage'] as const,
};

/**
 * Dashboard statistics hook
 * Returns overall facility statistics for the dashboard
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboard,
    queryFn: () => statisticsService.getDashboardStats(),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });
}

/**
 * Device type statistics hook
 * Returns statistics broken down by device type (AR글라스, 골전도 이어폰, 스마트폰)
 */
export function useDeviceTypeStats() {
  return useQuery({
    queryKey: QUERY_KEYS.deviceTypes,
    queryFn: () => statisticsService.getDeviceTypeStats(),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Monthly statistics hook
 * Returns aggregated statistics for a specific month
 * @param params - Optional year and month parameters
 */
export function useMonthlyStats(params?: MonthlyStatsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.monthly(params),
    queryFn: () => statisticsService.getMonthlyStats(params),
  });
}

/**
 * Daily statistics hook
 * Returns daily statistics for a date range
 * @param params - Optional startDate and endDate parameters
 */
export function useDailyStats(params?: DailyStatsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.daily(params),
    queryFn: () => statisticsService.getDailyStats(params),
  });
}

/**
 * Device usage statistics hook
 * Returns usage statistics for individual devices
 */
export function useDeviceUsage() {
  return useQuery({
    queryKey: QUERY_KEYS.deviceUsage,
    queryFn: () => statisticsService.getDeviceUsage(),
  });
}
