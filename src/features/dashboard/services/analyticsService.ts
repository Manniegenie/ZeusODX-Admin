import axios from '@/core/services/axios'
import type { DashboardAnalyticsResponse, RecentTransactionsResponse } from '../type/analytic'

const BASE_URL = import.meta.env.VITE_BASE_URL

export const getDashboardAnalytics = async (): Promise<DashboardAnalyticsResponse> => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${BASE_URL}/analytics/dashboard`, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined }
  })
  return res.data
}

export const getRecentTransactions = async (
  page: number = 1,
  limit: number = 50
): Promise<RecentTransactionsResponse> => {
  const token = localStorage.getItem('token')
  const res = await axios.get(
    `${BASE_URL}/analytics/recent-transactions?page=${page}&limit=${limit}`,
    {
      headers: { Authorization: token ? `Bearer ${token}` : undefined }
    }
  )
  return res.data
}

export interface FilterParams {
  searchTerm?: string
  dateFrom?: string
  dateTo?: string
  transactionType?: string
  transactionStatus?: string
  userVerificationStatus?: string
  currency?: string
  minAmount?: string
  maxAmount?: string
  page?: number
  limit?: number
}

export interface FilterResponse {
  success: boolean
  timestamp: string
  filters: {
    searchTerm: string | null
    dateFrom: string | null
    dateTo: string | null
    transactionType: string | null
    transactionStatus: string | null
    userVerificationStatus: string | null
    currency: string | null
    minAmount: string | null
    maxAmount: string | null
  }
  pagination: {
    currentPage: number
    totalPages: number
    limit: number
    totalCount: number
    transactionCount: number
    userCount: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
  aggregateStats: {
    totalAmount: number
    totalFees: number
    avgAmount: number
    successfulCount: number
    pendingCount: number
    failedCount: number
  }
  data: {
    transactions: any[]
    users: any[]
  }
}

export const getFilteredData = async (filters: FilterParams): Promise<FilterResponse> => {
  const token = localStorage.getItem('token')
  
  // Build query parameters
  const params = new URLSearchParams()
  
  if (filters.searchTerm) params.append('searchTerm', filters.searchTerm)
  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
  if (filters.dateTo) params.append('dateTo', filters.dateTo)
  if (filters.transactionType) params.append('transactionType', filters.transactionType)
  if (filters.transactionStatus) params.append('transactionStatus', filters.transactionStatus)
  if (filters.userVerificationStatus) params.append('userVerificationStatus', filters.userVerificationStatus)
  if (filters.currency) params.append('currency', filters.currency)
  if (filters.minAmount) params.append('minAmount', filters.minAmount)
  if (filters.maxAmount) params.append('maxAmount', filters.maxAmount)
  
  params.append('page', String(filters.page || 1))
  params.append('limit', String(filters.limit || 50))
  
  const res = await axios.get(
    `${BASE_URL}/analytics/filter?${params.toString()}`,
    {
      headers: { Authorization: token ? `Bearer ${token}` : undefined }
    }
  )
  
  return res.data
}

export const getSwapPairAnalytics = async (timeframe: '24h' | '7d' | '30d' = '24h') => {
  const token = localStorage.getItem('token')
  const res = await axios.get(
    `${BASE_URL}/analytics/swap-pairs?timeframe=${timeframe}`,
    {
      headers: { Authorization: token ? `Bearer ${token}` : undefined }
    }
  )
  return res.data
}

// Platform Stats Types
export interface TokenBalance {
  amount: number
  pendingAmount: number
  price: number
  usdValue: number
  pendingUsdValue: number
  nairaValue?: number
  pendingNairaValue?: number
}

export interface UtilityBreakdown {
  totalNaira: number
  totalNGNZ: number
  count: number
  usdValue: number
}

export interface PlatformStatsResponse {
  success: boolean
  timestamp: string
  data: {
    walletBalances: {
      totalUsd: number
      totalNaira: number
      totalPendingUsd: number
      totalPendingNaira: number
      grandTotalUsd: number
      grandTotalNaira: number
      userCount: number
      breakdown: Record<string, TokenBalance>
      conversionRate: {
        usdToNaira: number
        nairaToUsd: number
      }
    }
    utilitySpending: {
      totalNaira: number
      totalUsd: number
      totalTransactions: number
      breakdown: Record<string, UtilityBreakdown>
    }
    profits: {
      withdrawals: {
        totalFeesCollected: number
        totalFeesUsd: number
        totalTransactions: number
        totalAmountProcessed: number
        totalSentToBank: number
      }
      swaps: {
        totalSwaps: number
        markdownPercentage: number
        estimatedMarkdownProfit: number
        estimatedMarkdownProfitUsd: number
        totalFeesCollected: number
        totalObiexFees: number
      }
      priceMarkdown: {
        percentage: number
        isActive: boolean
        description: string
      }
      summary: {
        totalDirectFeesNaira: number
        totalDirectFeesUsd: number
        totalEstimatedMarkdownProfit: number
        totalEstimatedMarkdownProfitUsd: number
      }
    }
    currentSettings: {
      offrampRate: number
      globalMarkdownPercentage: number
      swapMarkdownPercentage: number
    }
  }
}

export const getPlatformStats = async (): Promise<PlatformStatsResponse> => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${BASE_URL}/analytics/platform-stats`, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined }
  })
  return res.data
}

export const getVolumes = async () => {
  const token = localStorage.getItem('token')
  const res = await axios.get(`${BASE_URL}/analytics/volumes`, {
    headers: { Authorization: token ? `Bearer ${token}` : undefined }
  })
  return res.data
}

export default getDashboardAnalytics