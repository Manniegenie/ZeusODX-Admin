import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

function authHeaders() {
  const token = localStorage.getItem('token');
  return { Authorization: token ? `Bearer ${token}` : undefined };
}

export interface WalletBalance {
  balance: number;
  currency: string;
}

export async function getWalletBalance(currency?: string): Promise<WalletBalance> {
  const res = await axios.get(`${BASE_URL}/admin/deposits/wallet-balance`, {
    params: currency ? { currency } : undefined,
    headers: authHeaders(),
  });
  return res.data.data as WalletBalance;
}

export interface ReconciledDeposit {
  glydeReference: string;
  merchantReference: string | null;
  amount: number | null;
  status: string | null;
  createdAt: string | null;
  fee: number | null;
  credited: boolean;
  creditedAt: string | null;
  creditedAmount: number | null;
  user: { id: string; name: string; email: string; phonenumber: string } | null;
  virtualAccountUid: string | null;
}

export interface ReconciliationResponse {
  transactions: ReconciledDeposit[];
  uncreditedCount: number;
  page: number;
  perPage: number;
  pagination: unknown;
}

export async function getReconciliation(params?: { page?: number; perPage?: number }): Promise<ReconciliationResponse> {
  const res = await axios.get(`${BASE_URL}/admin/deposits/reconciliation`, {
    params,
    headers: authHeaders(),
  });
  return res.data.data as ReconciliationResponse;
}

export interface VirtualAccountRow {
  uid: string;
  type: string;
  status: string;
  accountNumber: string;
  accountName: string;
  bankName: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; phonenumber: string } | null;
}

export interface VirtualAccountsResponse {
  accounts: VirtualAccountRow[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export async function getVirtualAccounts(params?: { page?: number; limit?: number; status?: 'active' | 'inactive' }): Promise<VirtualAccountsResponse> {
  const res = await axios.get(`${BASE_URL}/admin/deposits/virtual-accounts`, {
    params,
    headers: authHeaders(),
  });
  return res.data.data as VirtualAccountsResponse;
}

export async function deactivateVirtualAccount(uid: string) {
  const res = await axios.post(`${BASE_URL}/admin/deposits/virtual-accounts/${uid}/deactivate`, {}, {
    headers: authHeaders(),
  });
  return res.data;
}

export interface DepositFeeConfig {
  feeAmount: number;
  isActive: boolean;
  description: string;
  updatedBy: string;
  updatedAt: string;
}

export async function getDepositFee(): Promise<DepositFeeConfig> {
  const res = await axios.get(`${BASE_URL}/admin/deposits/fee`, { headers: authHeaders() });
  return res.data.data as DepositFeeConfig;
}

export async function updateDepositFee(feeAmount: number, isActive?: boolean, description?: string): Promise<DepositFeeConfig> {
  const res = await axios.put(`${BASE_URL}/admin/deposits/fee`, { feeAmount, isActive, description }, {
    headers: authHeaders(),
  });
  return res.data.data as DepositFeeConfig;
}
