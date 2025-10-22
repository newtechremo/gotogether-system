import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  repairService,
  CreateFacilityRepairDto,
  UpdateFacilityRepairDto,
  CompleteRepairDto,
  RepairListQuery,
} from '../api/repair.service';

const QUERY_KEYS = {
  repairs: ['repairs'] as const,
  inProgressRepairs: ['repairs', 'in-progress'] as const,
  completedRepairs: ['repairs', 'completed'] as const,
  repair: (id: number) => ['repairs', id] as const,
  repairsList: (query?: RepairListQuery) => ['repairs', 'list', query] as const,
};

/**
 * Get all repairs with optional filters
 */
export function useRepairs(query?: RepairListQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.repairsList(query),
    queryFn: () => repairService.getRepairs(query),
  });
}

/**
 * Get repairs in progress (수리중)
 */
export function useRepairsInProgress() {
  return useQuery({
    queryKey: QUERY_KEYS.inProgressRepairs,
    queryFn: () => repairService.getRepairsInProgress(),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get completed repairs
 */
export function useCompletedRepairs() {
  return useQuery({
    queryKey: QUERY_KEYS.completedRepairs,
    queryFn: () => repairService.getCompletedRepairs(),
  });
}

/**
 * Get specific repair
 */
export function useRepair(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.repair(id),
    queryFn: () => repairService.getRepair(id),
    enabled: !!id,
  });
}

/**
 * Create new repair
 */
export function useCreateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacilityRepairDto) =>
      repairService.createRepair(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inProgressRepairs });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('수리가 등록되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '수리 등록에 실패했습니다.');
    },
  });
}

/**
 * Update repair
 */
export function useUpdateRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacilityRepairDto }) =>
      repairService.updateRepair(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repair(variables.id) });
      toast.success('수리 정보가 수정되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '수리 수정에 실패했습니다.');
    },
  });
}

/**
 * Complete repair
 */
export function useCompleteRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CompleteRepairDto }) =>
      repairService.completeRepair(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repair(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.inProgressRepairs });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.completedRepairs });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('수리 완료 처리되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '수리 완료 처리에 실패했습니다.');
    },
  });
}

/**
 * Delete repair
 */
export function useDeleteRepair() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => repairService.deleteRepair(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.repairs });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('수리가 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '수리 삭제에 실패했습니다.');
    },
  });
}
