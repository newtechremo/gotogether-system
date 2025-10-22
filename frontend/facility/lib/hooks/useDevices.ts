import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  deviceService,
  CreateFacilityDeviceDto,
  UpdateDeviceItemDto,
  UpdateFacilityDeviceDto,
} from '../api/device.service';

const QUERY_KEYS = {
  devices: ['devices'] as const,
  stats: ['devices', 'stats'] as const,
  device: (id: number) => ['devices', id] as const,
};

/**
 * 장비 목록 조회
 */
export function useDevices() {
  return useQuery({
    queryKey: QUERY_KEYS.devices,
    queryFn: () => deviceService.getDevices(),
  });
}

/**
 * 장비 통계 조회
 */
export function useDeviceStats() {
  return useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: () => deviceService.getStats(),
  });
}

/**
 * 특정 장비 상세 조회
 */
export function useDevice(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.device(id),
    queryFn: () => deviceService.getDevice(id),
    enabled: !!id,
  });
}

/**
 * 새 장비 등록
 */
export function useCreateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacilityDeviceDto) => deviceService.createDevice(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('장비가 등록되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '장비 등록에 실패했습니다.');
    },
  });
}

/**
 * 장비 정보 수정
 */
export function useUpdateDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacilityDeviceDto }) =>
      deviceService.updateDevice(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.device(variables.id) });
      toast.success('장비 정보가 수정되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '장비 수정에 실패했습니다.');
    },
  });
}

/**
 * 장비 아이템 수정
 */
export function useUpdateDeviceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: number; data: UpdateDeviceItemDto }) =>
      deviceService.updateDeviceItem(itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('장비 아이템이 수정되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '장비 아이템 수정에 실패했습니다.');
    },
  });
}

/**
 * 장비 아이템 삭제
 */
export function useDeleteDeviceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: number) => deviceService.deleteDeviceItem(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('장비 아이템이 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '장비 아이템 삭제에 실패했습니다.');
    },
  });
}

/**
 * 장비 삭제
 */
export function useDeleteDevice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deviceService.deleteDevice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.devices });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats });
      toast.success('장비가 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '장비 삭제에 실패했습니다.');
    },
  });
}
