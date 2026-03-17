import axios from '@/core/services/axios';
import type {
  AnalyticsDateFilter,
  MarketingStatsResponse,
  TopTradersResponse,
  TokenVolumeResponse,
} from '../types/analytics';
import type { PlatformStatsResponse } from '@/features/dashboard/services/analyticsService';

const BASE = '/analytics';

export class AnalyticsService {
  static async getPlatformStats(filters?: AnalyticsDateFilter): Promise<PlatformStatsResponse> {
    const query = new URLSearchParams();
    if (filters?.dateFrom) query.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) query.append('dateTo', filters.dateTo);
    const qs = query.toString();
    const response = await axios.get(`${BASE}/platform-stats${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  static async getMarketingStats(filters?: AnalyticsDateFilter): Promise<MarketingStatsResponse> {
    const query = new URLSearchParams();
    if (filters?.dateFrom) query.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) query.append('dateTo', filters.dateTo);
    const qs = query.toString();
    const response = await axios.get(`${BASE}/marketing-stats${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  static async getTopTraders(filters?: AnalyticsDateFilter & { limit?: number }): Promise<TopTradersResponse> {
    const query = new URLSearchParams();
    if (filters?.dateFrom) query.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) query.append('dateTo', filters.dateTo);
    if (filters?.limit) query.append('limit', filters.limit.toString());
    const qs = query.toString();
    const response = await axios.get(`${BASE}/top-traders${qs ? `?${qs}` : ''}`);
    return response.data;
  }

  static async getTokenVolume(filters?: AnalyticsDateFilter): Promise<TokenVolumeResponse> {
    const query = new URLSearchParams();
    if (filters?.dateFrom) query.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) query.append('dateTo', filters.dateTo);
    const qs = query.toString();
    const response = await axios.get(`${BASE}/token-volume${qs ? `?${qs}` : ''}`);
    return response.data;
  }
}
