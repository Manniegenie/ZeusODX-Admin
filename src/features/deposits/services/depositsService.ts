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
  glydeReference?: string | null;
  amount?: number | null;
  status?: string | null;
  createdAt?: string | null;
  fee?: number | null;
  credited?: boolean;
  blockedReason?: 'name_mismatch' | 'fee_shortfall' | null;
  creditedAt?: string | null;
  creditedAmount?: number | null;
  user: { id: string; name: string; email: string; phonenumber: string } | null;
  virtualAccountUid: string | null;
  accountNumber?: string | null;
  // Present instead of the transaction fields above when this account
  // couldn't be reached at all on Glyde's side (e.g. an orphaned account).
  error?: string;
}

export interface ReconciliationResponse {
  transactions: ReconciledDeposit[];
  uncreditedCount: number;
  page: number;
  limit: number;
  totalAccounts: number;
  totalPages: number;
}

// page/limit paginate over OUR virtual accounts (each account's own
// transaction history is pulled from Glyde per-account, not a global list -
// see adminRoutes/deposits.js for why).
export async function getReconciliation(params?: { page?: number; limit?: number }): Promise<ReconciliationResponse> {
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
