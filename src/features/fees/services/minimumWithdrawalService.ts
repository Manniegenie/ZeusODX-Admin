import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface MinimumWithdrawalLimit {
  _id: string;
  currency: string;
  network: string;
  networkName: string;
  minAmount: number;
  maxAmount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: token ? `Bearer ${token}` : undefined };
}

export const minimumWithdrawalService = {
  getAll: async (): Promise<ApiResponse<MinimumWithdrawalLimit[]>> => {
    const response = await axios.get<ApiResponse<MinimumWithdrawalLimit[]>>(
      `${BASE_URL}/set-fee/min-withdrawals`,
      { headers: authHeaders() }
    );
    return response.data;
  },

  upsert: async (payload: {
    currency: string;
    network: string;
    networkName?: string;
    minAmount: number;
    maxAmount: number;
    isActive?: boolean;
  }): Promise<ApiResponse<MinimumWithdrawalLimit>> => {
    const response = await axios.put<ApiResponse<MinimumWithdrawalLimit>>(
      `${BASE_URL}/set-fee/min-withdrawal`,
      payload,
      { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
    );
    return response.data;
  },

  toggle: async (currency: string, network: string, isActive: boolean): Promise<ApiResponse<MinimumWithdrawalLimit>> => {
    const response = await axios.patch<ApiResponse<MinimumWithdrawalLimit>>(
      `${BASE_URL}/set-fee/min-withdrawal/toggle`,
      { currency, network, isActive },
      { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
    );
    return response.data;
  },

  delete: async (currency: string, network: string): Promise<ApiResponse<MinimumWithdrawalLimit>> => {
    const response = await axios.delete<ApiResponse<MinimumWithdrawalLimit>>(
      `${BASE_URL}/set-fee/min-withdrawal/${encodeURIComponent(currency)}/${encodeURIComponent(network)}`,
      { headers: authHeaders() }
    );
    return response.data;
  },
};
