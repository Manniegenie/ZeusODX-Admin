import axios from '@/core/services/axios';
import type {
  GiftCardRatesResponse,
  FilterParams,
  CreateRateRequest,
  UpdateRateRequest,
  BulkCreateRatesRequest,
  CreateRateResponse,
  BulkCreateRatesResponse,
  DeleteRateResponse
} from '../types/giftcard';

export class GiftCardService {
  private static readonly API_BASE = '/admin/giftcard';

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
}
