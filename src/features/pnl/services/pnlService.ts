import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: token ? `Bearer ${token}` : undefined };
}

function buildQuery(params: Record<string, string | undefined>): string {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v) q.append(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export interface ProviderWallet {
  availableBalance: number;
  pendingBalance: number;
  lockedBalance?: number;
  pendingSwapBalance?: number;
  currency: string;
  error?: string;
}

export interface TokenPnl {
  providerAvailable: number | null;
  providerPending: number | null;
  platformAvailable: number;
  platformPending: number;
  pnlAmount: number | null;
  priceUsd: number;
  providerAvailableUsd: number | null;
  providerPendingUsd: number | null;
  platformAvailableUsd: number;
  platformPendingUsd: number;
  pnlUsd: number | null;
  providerAvailableNgn: number | null;
  platformAvailableNgn: number;
  pnlNgn: number | null;
  fetchError?: string;
  note?: string;
}

export interface PnlSummary {
  providerTotalUsd: number;
  providerTotalNgn: number;
  platformTotalUsd: number;
  platformTotalNgn: number;
  pnlTotalUsd: number;
  pnlTotalNgn: number;
}

export interface PnlSnapshot {
  fetchedAt: string;
  offrampRate: number;
  userCount: number;
  summary: PnlSummary;
  previousDay: (PnlSummary & { recordedAt: string }) | null;
  breakdown: Record<string, TokenPnl>;
}

export interface RevenueData {
  dateFrom: string | null;
  dateTo: string | null;
  offrampRate: number;
  withdrawalFees: {
    totalUsd: number;
    totalNgn: number;
    breakdown: Record<string, { totalFee: number; count: number; feeUsd: number; feeNgn: number }>;
  };
  activitySummary: {
    withdrawalCount: number;
    depositCount: number;
  };
}

export const pnlService = {
  getProviderWallets: async (): Promise<{ success: boolean; data: { wallets: Record<string, ProviderWallet>; fetchedAt: string } }> => {
    const res = await axios.get(`${BASE_URL}/pnl/provider-wallets`, { headers: authHeaders() });
    return res.data;
  },

  getSnapshot: async (): Promise<{ success: boolean; data: PnlSnapshot }> => {
    const res = await axios.get(`${BASE_URL}/pnl/snapshot`, { headers: authHeaders() });
    return res.data;
  },

  getRevenue: async (dateFrom?: string, dateTo?: string): Promise<{ success: boolean; data: RevenueData }> => {
    const url = `${BASE_URL}/pnl/revenue${buildQuery({ dateFrom, dateTo })}`;
    const res = await axios.get(url, { headers: authHeaders() });
    return res.data;
  },
};
