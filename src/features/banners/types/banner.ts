export interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  data: {
    banners: Banner[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  };
  message: string;
}

export interface FilterParams {
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateBannerRequest {
  title: string;
  imageUrl: string;
  link?: string;
  priority?: number;
  isActive?: boolean;
}

export interface UpdateBannerRequest {
  title?: string;
  imageUrl?: string;
  link?: string;
  priority?: number;
  isActive?: boolean;
}

export interface CreateBannerResponse {
  success: boolean;
  message: string;
  data: Banner;
}

export interface DeleteBannerResponse {
  success: boolean;
  message: string;
  data: {
    deletedBanner: {
      id: string;
      title: string;
    };
  };
}

export interface ToggleBannerResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    title: string;
    isActive: boolean;
  };
}

export interface ReorderBannersRequest {
  bannerPriorities: Array<{
    id: string;
    priority: number;
  }>;
}

export interface ReorderBannersResponse {
  success: boolean;
  message: string;
  data: {
    banners: Array<{
      id: string;
      title: string;
      priority: number;
      isActive: boolean;
    }>;
  };
}
