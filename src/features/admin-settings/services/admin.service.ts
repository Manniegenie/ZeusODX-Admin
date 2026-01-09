import axios from '@/core/services/axios';
import type {
  CreateAdminPayload,
  CreateAdminResponse,
  GetAdminsResponse,
  ResetAdmin2FAPayload,
  ResetAdmin2FAResponse,
  DeleteAdminPayload,
  DeleteAdminResponse
} from '../types/admin.types';

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

  async getAllAdmins(): Promise<GetAdminsResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${BASE_URL}/admin/register`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  },

  async resetAdmin2FA(payload: ResetAdmin2FAPayload): Promise<ResetAdmin2FAResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${BASE_URL}/admin/disable-2fa`, payload, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
  },

  async deleteAdmin(adminId: string, payload: Omit<DeleteAdminPayload, 'adminId'>): Promise<DeleteAdminResponse> {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${BASE_URL}/admin/register/${adminId}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      data: payload,
    });
    return response.data;
  },
};
