import axios from '@/core/services/axios';
import type {
  BlogListResponse,
  BlogPostResponse,
  BlogDeleteResponse,
  BlogToggleResponse,
  BlogFilterParams,
  BlogFormData,
} from '../types/blog';

export class BlogService {
  private static readonly API_BASE = '/admin/blog';

  static async getPosts(params: BlogFilterParams): Promise<BlogListResponse> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.isPublished !== undefined) query.append('isPublished', params.isPublished.toString());
    if (params.search) query.append('search', params.search);
    if (params.tag) query.append('tag', params.tag);
    if (params.sortBy) query.append('sortBy', params.sortBy);
    if (params.sortOrder) query.append('sortOrder', params.sortOrder);
    const response = await axios.get(`${this.API_BASE}?${query.toString()}`);
    return response.data;
  }

  static async getPost(id: string): Promise<BlogPostResponse> {
    const response = await axios.get(`${this.API_BASE}/${id}`);
    return response.data;
  }

  static async createPost(data: BlogFormData): Promise<BlogPostResponse> {
    const form = new FormData();
    form.append('title', data.title);
    form.append('excerpt', data.excerpt);
    form.append('content', data.content);
    form.append('author', data.author);
    form.append('tags', data.tags);
    form.append('isPublished', data.isPublished.toString());
    if (data.coverImage) form.append('coverImage', data.coverImage);
    const response = await axios.post(this.API_BASE, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async updatePost(id: string, data: BlogFormData): Promise<BlogPostResponse> {
    const form = new FormData();
    form.append('title', data.title);
    form.append('excerpt', data.excerpt);
    form.append('content', data.content);
    form.append('author', data.author);
    form.append('tags', data.tags);
    form.append('isPublished', data.isPublished.toString());
    if (data.coverImage) form.append('coverImage', data.coverImage);
    const response = await axios.put(`${this.API_BASE}/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  static async deletePost(id: string): Promise<BlogDeleteResponse> {
    const response = await axios.delete(`${this.API_BASE}/${id}`);
    return response.data;
  }

  static async togglePublish(id: string): Promise<BlogToggleResponse> {
    const response = await axios.patch(`${this.API_BASE}/${id}/publish`);
    return response.data;
  }
}
