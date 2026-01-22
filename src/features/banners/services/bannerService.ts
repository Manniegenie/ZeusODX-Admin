import axios from '@/core/services/axios';
import type {
  BannersResponse,
  FilterParams,
  CreateBannerRequest,
  UpdateBannerRequest,
  CreateBannerResponse,
  DeleteBannerResponse,
  ToggleBannerResponse,
  ReorderBannersRequest,
  ReorderBannersResponse,
} from '../types/banner';

export class BannerService {
  private static readonly API_BASE = '/admin/banners';

  /**
   * Get all banners with filtering and pagination
   */
  static async getBanners(params: FilterParams): Promise<BannersResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const response = await axios.get(`${this.API_BASE}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching banners:', error);
      throw error;
    }
  }

  /**
   * Get a single banner by ID
   */
  static async getBannerById(id: string): Promise<CreateBannerResponse> {
    try {
      const response = await axios.get(`${this.API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching banner:', error);
      throw error;
    }
  }

  /**
   * Create a new banner
   */
  static async createBanner(data: CreateBannerRequest): Promise<CreateBannerResponse> {
    try {
      const response = await axios.post(this.API_BASE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating banner:', error);
      throw error;
    }
  }

  /**
   * Update an existing banner
   */
  static async updateBanner(id: string, data: UpdateBannerRequest): Promise<CreateBannerResponse> {
    try {
      const response = await axios.put(`${this.API_BASE}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  }

  /**
   * Delete a banner
   */
  static async deleteBanner(id: string): Promise<DeleteBannerResponse> {
    try {
      const response = await axios.delete(`${this.API_BASE}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  }

  /**
   * Toggle banner active status
   */
  static async toggleBannerStatus(id: string): Promise<ToggleBannerResponse> {
    try {
      const response = await axios.patch(`${this.API_BASE}/${id}/toggle`);
      return response.data;
    } catch (error) {
      console.error('Error toggling banner status:', error);
      throw error;
    }
  }

  /**
   * Reorder banners by priority
   */
  static async reorderBanners(data: ReorderBannersRequest): Promise<ReorderBannersResponse> {
    try {
      const response = await axios.put(`${this.API_BASE}/reorder/priorities`, data);
      return response.data;
    } catch (error) {
      console.error('Error reordering banners:', error);
      throw error;
    }
  }
}
