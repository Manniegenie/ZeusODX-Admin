import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Each campaign's dashboard is served at https://<slug>.<AFFILIATE_DOMAIN>
// by ZeusODX-web.
export const AFFILIATE_DOMAIN = import.meta.env.VITE_AFFILIATE_DOMAIN || 'zeusodx.com';

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
  fundedCount: number;
  tradeVolumeUsd: number;
  // The code the campaigner hands out: the linked user's referral code
  // (their username) if the campaign is linked to a user, else `code`.
  shareCode: string;
  linkedUsername: string | null;
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
  // Activate an existing app user as this affiliate: their username
  // referrals count for the campaign too.
  linkUsername?: string;
}

export interface CreatedAffiliate {
  id: string;
  campaignerName: string;
  slug: string;
  code: string;
  status: AffiliateStatus;
  shareCode?: string;
  linkedUsername?: string | null;
  dashboardPath: string;
  createdAt: string;
}

export function dashboardUrl(slug: string): string {
  return `https://${slug}.${AFFILIATE_DOMAIN}`;
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

  async linkUser(id: string, username: string): Promise<void> {
    await axios.patch(`${BASE_URL}/admin/affiliates/${id}`, { linkUsername: username }, { headers: authHeaders() });
  },

  async unlinkUser(id: string): Promise<void> {
    await axios.patch(`${BASE_URL}/admin/affiliates/${id}`, { unlink: true }, { headers: authHeaders() });
  },

  async resetPassword(id: string, password: string): Promise<void> {
    await axios.patch(`${BASE_URL}/admin/affiliates/${id}`, { password }, { headers: authHeaders() });
  },
};
