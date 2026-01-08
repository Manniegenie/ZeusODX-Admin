import axios from '@/core/services/axios';
import type {
  GiftCardRatesResponse,
  FilterParams,
  CreateRateRequest,
  UpdateRateRequest,
  BulkCreateRatesRequest,
  CreateRateResponse,
  BulkCreateRatesResponse,
  DeleteRateResponse,
  SubmissionFilterParams,
  SubmissionsResponse,
  SubmissionDetailResponse,
  ApproveSubmissionRequest,
  ApproveSubmissionResponse,
  RejectSubmissionRequest,
  RejectSubmissionResponse,
  ReviewSubmissionResponse
} from '../types/giftcard';

export class GiftCardService {
  private static readonly API_BASE = '/admingiftcard';

  /**
   * Get all gift card rates with filtering and pagination
   */
  static async getRates(params: FilterParams): Promise<GiftCardRatesResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.country) queryParams.append('country', params.country);
      if (params.cardType) queryParams.append('cardType', params.cardType);
      if (params.vanillaType) queryParams.append('vanillaType', params.vanillaType);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

      const response = await axios.get(`${this.API_BASE}/rates?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gift card rates:', error);
      throw error;
    }
  }

  /**
   * Create a new gift card rate
   */
  static async createRate(data: CreateRateRequest): Promise<CreateRateResponse> {
    try {
      const response = await axios.post(`${this.API_BASE}/rates`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating gift card rate:', error);
      throw error;
    }
  }

  /**
   * Bulk create gift card rates
   */
  static async bulkCreateRates(data: BulkCreateRatesRequest): Promise<BulkCreateRatesResponse> {
    try {
      const response = await axios.post(`${this.API_BASE}/rates/bulk`, data);
      return response.data;
    } catch (error) {
      console.error('Error bulk creating gift card rates:', error);
      throw error;
    }
  }

  /**
   * Update an existing gift card rate
   */
  static async updateRate(id: string, data: UpdateRateRequest): Promise<CreateRateResponse> {
    try {
      const response = await axios.put(`${this.API_BASE}/rates/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating gift card rate:', error);
      throw error;
    }
  }

  /**
   * Delete a gift card rate
   */
  static async deleteRate(id: string): Promise<DeleteRateResponse> {
    try {
      const response = await axios.delete(`${this.API_BASE}/rates/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting gift card rate:', error);
      throw error;
    }
  }

  /**
   * Toggle gift card rate active status
   */
  static async toggleRateStatus(id: string, isActive: boolean): Promise<CreateRateResponse> {
    try {
      const response = await axios.put(`${this.API_BASE}/rates/${id}`, { isActive });
      return response.data;
    } catch (error) {
      console.error('Error toggling gift card rate status:', error);
      throw error;
    }
  }

  // ============================================
  // GIFT CARD SUBMISSION MANAGEMENT
  // ============================================

  /**
   * Get all gift card submissions with filtering and pagination
   */
  static async getSubmissions(params: SubmissionFilterParams): Promise<SubmissionsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.cardType) queryParams.append('cardType', params.cardType);
      if (params.country) queryParams.append('country', params.country);
      if (params.searchTerm) queryParams.append('searchTerm', params.searchTerm);
      if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
      if (params.dateTo) queryParams.append('dateTo', params.dateTo);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axios.get(`${this.API_BASE}/submissions?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gift card submissions:', error);
      throw error;
    }
  }

  /**
   * Get a specific gift card submission by ID
   */
  static async getSubmissionById(id: string): Promise<SubmissionDetailResponse> {
    try {
      const response = await axios.get(`${this.API_BASE}/submissions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching gift card submission detail:', error);
      throw error;
    }
  }

  /**
   * Approve a gift card submission
   */
  static async approveSubmission(
    id: string,
    data: ApproveSubmissionRequest
  ): Promise<ApproveSubmissionResponse> {
    try {
      const response = await axios.post(`${this.API_BASE}/submissions/${id}/approve`, data);
      return response.data;
    } catch (error) {
      console.error('Error approving gift card submission:', error);
      throw error;
    }
  }

  /**
   * Reject a gift card submission
   */
  static async rejectSubmission(
    id: string,
    data: RejectSubmissionRequest
  ): Promise<RejectSubmissionResponse> {
    try {
      const response = await axios.post(`${this.API_BASE}/submissions/${id}/reject`, data);
      return response.data;
    } catch (error) {
      console.error('Error rejecting gift card submission:', error);
      throw error;
    }
  }

  /**
   * Mark a gift card submission as under review
   */
  static async markAsReviewing(id: string): Promise<ReviewSubmissionResponse> {
    try {
      const response = await axios.post(`${this.API_BASE}/submissions/${id}/review`);
      return response.data;
    } catch (error) {
      console.error('Error marking submission as reviewing:', error);
      throw error;
    }
  }
}
