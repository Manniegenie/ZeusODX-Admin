import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export type WithdrawalType = 'CRYPTO' | 'NGNZ' | 'INTERNAL_USERNAME';
export type QaOutcome = 'SUCCESS' | 'BLOCKED' | 'REJECTED' | 'ERROR';
export type RiskBand = 'ALLOW' | 'FLAG' | 'HOLD' | 'BLOCK';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface RiskSignal {
  signal: string;
  weight: number;
  fired: boolean;
  detail?: string;
}

export interface QaLog {
  _id: string;
  withdrawalType: WithdrawalType;
  route: string;
  method: string;
  userId?: string;
  username?: string;
  email?: string;
  requestBody?: Record<string, unknown>;
  responseBody?: Record<string, unknown>;
  statusCode: number;
  outcome: QaOutcome;
  outcomeReason?: string;
  amount?: number;
  currency?: string;
  network?: string;
  fee?: number;
  destinationSummary?: string;
  transactionId?: string;
  reference?: string;
  ipAddress?: string;
  userAgent?: string;
  country?: string;
  durationMs?: number;
  riskScore?: number;
  riskBand?: RiskBand;
  riskSignals?: RiskSignal[];
  reviewStatus: ReviewStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QaLogsResponse {
  success: boolean;
  logs: QaLog[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface QaLogStat {
  _id: { withdrawalType: WithdrawalType; outcome: QaOutcome };
  count: number;
  totalAmount: number;
}

export async function getQaLogs(params?: {
  page?: number;
  limit?: number;
  withdrawalType?: string;
  outcome?: string;
  riskBand?: string;
  reviewStatus?: string;
  userId?: string;
  username?: string;
  currency?: string;
  from?: string;
  to?: string;
}): Promise<QaLogsResponse> {
  const res = await axios.get(`${BASE_URL}/admin/qa-logs`, { params });
  return res.data as QaLogsResponse;
}

export async function getQaLogStats(params?: { from?: string; to?: string }): Promise<{ success: boolean; stats: QaLogStat[] }> {
  const res = await axios.get(`${BASE_URL}/admin/qa-logs/stats`, { params });
  return res.data;
}

export async function reviewQaLog(
  id: string,
  decision: 'APPROVED' | 'REJECTED',
  notes?: string
): Promise<{ success: boolean; log: QaLog }> {
  const res = await axios.patch(`${BASE_URL}/admin/qa-logs/${id}/review`, { decision, notes });
  return res.data;
}
