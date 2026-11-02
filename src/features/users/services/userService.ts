import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface UserSearchParams {
  email?: string;
  firstName?: string;
  lastName?: string;
  q?: string;
  field?: string;
  limit?: number;
  page?: number;
  sortBy?: 'createdAt' | 'email' | 'firstName' | 'lastName' | 'kycLevel';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  recentUsers: number;
  kycBreakdown: {
    [key: string]: number;
  };
  percentageActive: number;
}

class UserService {
  async lookupUser(email: string) {
    try {
      const response = await axios.get(`${BASE_URL}/admin/user-lookup`, {
        params: { email }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to lookup user');
    }
  }

  async getRecentUsers(limit: number = 10) {
    try {
      const response = await axios.get(`${BASE_URL}/admin/users/recent`, {
        params: { limit }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch recent users');
    }
  }

  async searchUsers(params: UserSearchParams) {
    try {
      const response = await axios.get(`${BASE_URL}/admin/users/search`, {
        params
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to search users');
    }
  }

  async getUserDetails(userId: string) {
    try {
      const response = await axios.get(`${BASE_URL}/admin/users/${userId}/details`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user details');
    }
  }

  async getUserStats() {
    try {
      const response = await axios.get(`${BASE_URL}/admin/users/stats`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch user stats');
    }
  }
}

export const userService = new UserService();

export async function unlockUserPin(userId: string, twoFAToken: string) {
  try {
    const response = await axios.post(`${BASE_URL}/usermanagement/users/${userId}/unlock-pin`, {}, {
      headers: { 'X-2FA-Token': twoFAToken },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to unlock PIN account');
  }
}

export async function unlock2FALock(userId: string, twoFAToken: string) {
  try {
    const response = await axios.post(`${BASE_URL}/usermanagement/users/${userId}/unlock-2fa`, {}, {
      headers: { 'X-2FA-Token': twoFAToken },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.response?.data?.error || 'Failed to unlock 2FA lock');
  }
}