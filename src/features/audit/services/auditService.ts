import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export interface AuditLog {
  _id: string;
  adminId: string;
  adminName: string;
  adminEmail: string;
  adminRole: string;
  method: string;
  route: string;
  category: string;
  action: string;
  requestBody?: Record<string, unknown>;
  targetUserId?: string;
  targetUserEmail?: string;
  details?: string;
  statusCode: number;
  ipAddress: string;
  userAgent: string;
  durationMs: number;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLogsResponse {
  success: boolean;
  logs: AuditLog[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  adminEmail?: string;
  adminRole?: string;
  action?: string;
  category?: string;
  method?: string;
  from?: string;
  to?: string;
}): Promise<AuditLogsResponse> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${BASE_URL}/audit-logs`, {
    params,
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
  return res.data as AuditLogsResponse;
}

export interface AuditBreakdownCategory {
  _id: string; // category name
  total: number;
  lastAt: string;
  actions: { action: string; count: number }[];
}

export interface AuditBreakdownAdmin {
  _id: { adminId: string; adminName: string; adminEmail: string; adminRole: string };
  count: number;
  lastAt: string;
}

export async function getAuditBreakdown(params?: {
  from?: string;
  to?: string;
}): Promise<{ success: boolean; byCategory: AuditBreakdownCategory[]; topAdmins: AuditBreakdownAdmin[] }> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${BASE_URL}/audit-logs/breakdown`, {
    params,
    headers: { Authorization: token ? `Bearer ${token}` : undefined },
  });
  return res.data;
}
