import { apiClient, ApiResponse } from './client';

// Enums
export enum RentalType {
  INDIVIDUAL = '개인',
  GROUP = '단체',
}

export enum RentalStatus {
  RENTED = '대여중',
  RETURNED = '반납완료',
  OVERDUE = '연체',
}

export enum DisabilityType {
  VISUAL = '시각장애',
  HEARING = '청각장애',
  PHYSICAL = '지체장애',
  INTELLECTUAL = '지적장애',
  OTHER = '기타',
}

export enum AgeGroup {
  TEENS = '10대',
  TWENTIES = '20대',
  THIRTIES = '30대',
  FORTIES = '40대',
  FIFTIES = '50대',
  SIXTIES = '60대',
  SEVENTIES_PLUS = '70대이상',
}

export enum Gender {
  MALE = '남성',
  FEMALE = '여성',
  OTHER = '기타',
}

// Interfaces
export interface RentalDevice {
  deviceType: string;
  quantity: number;
  deviceItemIds?: number[];
}

export interface RentalDeviceResponse {
  id: number;
  deviceType: string;
  quantity: number;
  facilityDeviceItemId?: number;
}

export interface FacilityRental {
  id: number;
  facilityId: number;
  borrowerName: string;  // Backend uses borrowerName, not renterName
  borrowerPhone: string; // Backend uses borrowerPhone, not renterPhone
  disabilityType: string; // Backend uses disabilityType
  organizationName?: string;
  rentalType: string;
  expectedUsers?: number;
  rentalDate: string;
  returnDate: string;
  rentalPurpose: string; // Backend uses rentalPurpose, not purpose
  region: string;
  residence: string;
  ageGroup: string;
  gender: string;
  status: string;
  actualReturnDate?: string;
  rentalPeriod?: number;
  rentalWeekday?: string;
  notes?: string; // Backend uses notes, not memo
  rentalDevices: RentalDeviceResponse[];
  createdAt: string;
  createdBy?: string;
}

// DTOs
export interface CreateFacilityRentalDto {
  renterName: string;
  renterPhone: string;
  renterDisabilityId: DisabilityType;
  renterDisabilityNumber?: string;
  rentalType: RentalType;
  expectedUsers?: number;
  rentalDate: string;
  returnDate: string;
  purpose: string;
  region: string;
  ageGroup: AgeGroup;
  gender: Gender;
  devices: RentalDevice[];
  memo?: string;
}

export interface UpdateFacilityRentalDto {
  renterName?: string;
  renterPhone?: string;
  returnDate?: string;
  status?: RentalStatus;
  memo?: string;
}

export interface ReturnRentalDto {
  actualReturnDate?: string;
  returnMemo?: string;
}

export interface RentalListQuery {
  status?: RentalStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export const rentalService = {
  /**
   * Get all rentals with optional filters
   */
  async getRentals(query?: RentalListQuery): Promise<FacilityRental[]> {
    const response = await apiClient.get<ApiResponse<FacilityRental[]>>(
      '/facility/rentals',
      { params: query }
    );
    return response.data.data;
  },

  /**
   * Get current rentals (status = 대여중)
   */
  async getCurrentRentals(): Promise<FacilityRental[]> {
    const response = await apiClient.get<ApiResponse<FacilityRental[]>>(
      '/facility/rentals/current'
    );
    return response.data.data;
  },

  /**
   * Get overdue rentals
   */
  async getOverdueRentals(): Promise<FacilityRental[]> {
    const response = await apiClient.get<ApiResponse<FacilityRental[]>>(
      '/facility/rentals/overdue'
    );
    return response.data.data;
  },

  /**
   * Get rental by ID
   */
  async getRental(id: number): Promise<FacilityRental> {
    const response = await apiClient.get<ApiResponse<FacilityRental>>(
      `/facility/rentals/${id}`
    );
    return response.data.data;
  },

  /**
   * Create new rental
   */
  async createRental(data: CreateFacilityRentalDto): Promise<FacilityRental> {
    const response = await apiClient.post<ApiResponse<FacilityRental>>(
      '/facility/rentals',
      data
    );
    return response.data.data;
  },

  /**
   * Update rental
   */
  async updateRental(
    id: number,
    data: UpdateFacilityRentalDto
  ): Promise<FacilityRental> {
    const response = await apiClient.put<ApiResponse<FacilityRental>>(
      `/facility/rentals/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Process return
   */
  async returnRental(
    id: number,
    data: ReturnRentalDto
  ): Promise<FacilityRental> {
    const response = await apiClient.post<ApiResponse<FacilityRental>>(
      `/facility/rentals/${id}/return`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete rental
   */
  async deleteRental(id: number): Promise<void> {
    await apiClient.delete(`/facility/rentals/${id}`);
  },
};
