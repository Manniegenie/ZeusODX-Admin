import axios from '@/core/services/axios';
import type { CreateAdminPayload, CreateAdminResponse } from '../types/admin.types';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const adminService = {
  async createAdmin(payload: CreateAdminPayload): Promise<CreateAdminResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_URL}/admin/register`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  },
};
