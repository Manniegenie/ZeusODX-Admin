import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Public site that hosts the campaigner dashboard (/affiliate/<slug>).
export const AFFILIATE_SITE_URL = (import.meta.env.VITE_AFFILIATE_SITE_URL || 'https://www.zeusodx.com').replace(/\/+$/, '');

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: token ? `Bearer ${token}` : undefined };
}

export type AffiliateStatus = 'active' | 'disabled';

export interface Affiliate {
  id: string;
  campaignerName: string;
  slug: string;
  code: string;
  status: AffiliateStatus;
  signupCount: number;
  dashboardPath: string;
  createdByEmail?: string;
  lastLoginAt?: string | null;
  createdAt: string;
}

export interface CreateAffiliateInput {
  campaignerName: string;
  password: string;
  slug?: string;
  code?: string;
  notes?: string;
}

export interface CreatedAffiliate {
  id: string;
  campaignerName: string;
  slug: string;
  code: string;
  status: AffiliateStatus;
  dashboardPath: string;
  createdAt: string;
}

export function dashboardUrl(dashboardPath: string): string {
  return `${AFFILIATE_SITE_URL}${dashboardPath}`;
}

export const affiliatesService = {
  async list(): Promise<Affiliate[]> {
    const res = await axios.get(`${BASE_URL}/admin/affiliates`, { headers: authHeaders() });
    return res.data.data as Affiliate[];
  },

  async create(input: CreateAffiliateInput): Promise<CreatedAffiliate> {
    const res = await axios.post(`${BASE_URL}/admin/affiliates`, input, { headers: authHeaders() });
    return res.data.data as CreatedAffiliate;
  },

  async setStatus(id: string, status: AffiliateStatus): Promise<void> {
    await axios.patch(`${BASE_URL}/admin/affiliates/${id}`, { status }, { headers: authHeaders() });
  },

  async resetPassword(id: string, password: string): Promise<void> {
    await axios.patch(`${BASE_URL}/admin/affiliates/${id}`, { password }, { headers: authHeaders() });
  },
};
