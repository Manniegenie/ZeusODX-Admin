export interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  coverImage?: string | null;
  coverImagePublicId?: string | null;
  tags: string[];
  author: string;
  isPublished: boolean;
  publishedAt?: string | null;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogListResponse {
  success: boolean;
  message: string;
  data: {
    posts: BlogPost[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      limit: number;
    };
  };
}

export interface BlogPostResponse {
  success: boolean;
  message: string;
  data: BlogPost;
}

export interface BlogDeleteResponse {
  success: boolean;
  message: string;
  data: { id: string; title: string };
}

export interface BlogToggleResponse {
  success: boolean;
  message: string;
  data: { id: string; title: string; isPublished: boolean; publishedAt?: string | null };
}

export interface BlogFilterParams {
  page?: number;
  limit?: number;
  isPublished?: boolean;
  search?: string;
  tag?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BlogFormData {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string;
  isPublished: boolean;
  coverImage?: File | null;
}
