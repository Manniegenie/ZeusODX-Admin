import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: token ? `Bearer ${token}` : undefined };
}

export interface ReferralSummary {
  totalReferrers: number;
  totalReferredUsers: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  totalPendingEarnings: number;
  totalPaidOutEarnings: number;
  last30Days: {
    amountPaid: number;
    rewardCount: number;
    dailyAverage: number;
  };
  projected: {
    next7Days: number;
    next30Days: number;
    basis: string;
  };
}

export interface ReferralLeaderboardEntry {
  rank: number;
  userId: string;
  username: string | null;
  email: string | null;
  fullName: string | null;
  referralCode: string;
  totalReferrals: number;
  totalConversions: number;
  conversionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidOutEarnings: number;
}

export interface ReferredUserDetail {
  userId: string;
  username: string | null;
  email: string | null;
  fullName: string | null;
  joinedAt: string;
  hasConverted: boolean;
  firstTransactionAt: string | null;
  earningsFromUser: number;
}

export interface ReferrerDetail {
  userId: string;
  username: string | null;
  email: string | null;
  fullName: string | null;
  referralCode: string;
  isActive: boolean;
  totalReferrals: number;
  totalConversions: number;
  totalEarnings: number;
  pendingEarnings: number;
  paidOutEarnings: number;
  referredUsers: ReferredUserDetail[];
}

export type LeaderboardSortBy = 'totalReferrals' | 'totalConversions' | 'totalEarnings' | 'pendingEarnings';

export const referralsService = {
  getSummary: async (): Promise<{ success: boolean; data: ReferralSummary }> => {
    const res = await axios.get(`${BASE_URL}/admin-referrals/summary`, { headers: authHeaders() });
    return res.data;
  },

  getLeaderboard: async (sortBy: LeaderboardSortBy = 'totalEarnings', limit = 25): Promise<{ success: boolean; sortBy: string; data: ReferralLeaderboardEntry[] }> => {
    const res = await axios.get(`${BASE_URL}/admin-referrals/leaderboard`, {
      params: { sortBy, limit },
      headers: authHeaders(),
    });
    return res.data;
  },

  getReferrerDetail: async (userId: string): Promise<{ success: boolean; data: ReferrerDetail }> => {
    const res = await axios.get(`${BASE_URL}/admin-referrals/${userId}`, { headers: authHeaders() });
    return res.data;
  },
};
