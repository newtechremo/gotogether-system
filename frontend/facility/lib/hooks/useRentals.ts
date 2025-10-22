import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  rentalService,
  CreateFacilityRentalDto,
  UpdateFacilityRentalDto,
  ReturnRentalDto,
  RentalListQuery,
} from '../api/rental.service';

const QUERY_KEYS = {
  rentals: ['rentals'] as const,
  currentRentals: ['rentals', 'current'] as const,
  overdueRentals: ['rentals', 'overdue'] as const,
  rental: (id: number) => ['rentals', id] as const,
  rentalsList: (query?: RentalListQuery) => ['rentals', 'list', query] as const,
};

/**
 * Get all rentals with optional filters
 */
export function useRentals(query?: RentalListQuery) {
  return useQuery({
    queryKey: QUERY_KEYS.rentalsList(query),
    queryFn: () => rentalService.getRentals(query),
  });
}

/**
 * Get current rentals (대여중)
 */
export function useCurrentRentals() {
  return useQuery({
    queryKey: QUERY_KEYS.currentRentals,
    queryFn: () => rentalService.getCurrentRentals(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

/**
 * Get overdue rentals
 */
export function useOverdueRentals() {
  return useQuery({
    queryKey: QUERY_KEYS.overdueRentals,
    queryFn: () => rentalService.getOverdueRentals(),
    refetchInterval: 60000, // Refetch every minute
  });
}

/**
 * Get specific rental
 */
export function useRental(id: number) {
  return useQuery({
    queryKey: QUERY_KEYS.rental(id),
    queryFn: () => rentalService.getRental(id),
    enabled: !!id,
  });
}

/**
 * Create new rental
 */
export function useCreateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacilityRentalDto) =>
      rentalService.createRental(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rentals });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentRentals });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('대여가 등록되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '대여 등록에 실패했습니다.');
    },
  });
}

/**
 * Update rental
 */
export function useUpdateRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacilityRentalDto }) =>
      rentalService.updateRental(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rentals });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rental(variables.id) });
      toast.success('대여 정보가 수정되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '대여 수정에 실패했습니다.');
    },
  });
}

/**
 * Return rental
 */
export function useReturnRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ReturnRentalDto }) =>
      rentalService.returnRental(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rentals });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rental(variables.id) });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentRentals });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('반납 처리가 완료되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '반납 처리에 실패했습니다.');
    },
  });
}

/**
 * Delete rental
 */
export function useDeleteRental() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => rentalService.deleteRental(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rentals });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      toast.success('대여가 삭제되었습니다.');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || '대여 삭제에 실패했습니다.');
    },
  });
}
