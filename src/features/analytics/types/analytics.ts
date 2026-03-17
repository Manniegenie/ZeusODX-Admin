export interface AnalyticsDateFilter {
  dateFrom?: string;
  dateTo?: string;
}

// ─── Marketing Stats ────────────────────────────────────────────────────────

export interface DailyRegistration {
  _id: string; // 'YYYY-MM-DD'
  count: number;
}

export interface TransactionTypeCount {
  _id: string;
  count: number;
}

export interface MarketingStatsResponse {
  success: boolean;
  timestamp: string;
  filters: { dateFrom: string | null; dateTo: string | null };
  data: {
    users: {
      total: number;
      newInPeriod: number;
      kycVerified: number;
      kycPending: number;
      activeTraders: number;
      conversionRate: number;
    };
    dailyRegistrations: DailyRegistration[];
    transactionTypeBreakdown: TransactionTypeCount[];
    giftcardSubmissions: number;
  };
}

// ─── Top Traders ─────────────────────────────────────────────────────────────

export interface TopTrader {
  userId: string;
  email: string;
  firstname: string;
  lastname: string;
  /** Raw NGNZ amount transacted */
  ngnzVolume: number;
  /** NGNZ volume converted to USD */
  ngnzVolumeUsd: number;
  /** Crypto withdrawal volume in USD */
  cryptoWithdrawalUsd: number;
  /** Internal transfer / swap volume in USD */
  internalTransferUsd: number;
  /** Combined total volume in USD */
  totalVolumeUsd: number;
  tradeCount: number;
  currencies: string[];
  lastTradeAt: string;
}

export interface TopTradersResponse {
  success: boolean;
  timestamp: string;
  filters: { dateFrom: string | null; dateTo: string | null; limit: number };
  data: { topTraders: TopTrader[] };
}

// ─── Token Volume ─────────────────────────────────────────────────────────────

export interface TokenVolumeEntry {
  token: string;
  totalVolume: number;
  tradeCount: number;
  uniqueUserCount: number;
  usdValue: number;
}

export interface TokenVolumeResponse {
  success: boolean;
  timestamp: string;
  filters: { dateFrom: string | null; dateTo: string | null };
  data: { tokens: TokenVolumeEntry[] };
}

// ─── Platform Stats (with date filter) ───────────────────────────────────────

export interface PlatformStatsFilters {
  dateFrom: string | null;
  dateTo: string | null;
}
