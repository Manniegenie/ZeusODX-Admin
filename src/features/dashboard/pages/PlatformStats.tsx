import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/ui/DateRangeFilter';
import { getPlatformStats, type PlatformStatsResponse } from '../services/analyticsService';
import { fetchPnlSnapshot, fetchPnlRevenue } from '@/features/pnl/store/pnlSlice';
import { formatCurrency as pnlFormatCurrency, formatNumber as pnlFormatNumber, formatDate as pnlFormatDate, pnlColor } from '@/core/utils/dateUtils';
import { toast } from 'sonner';
import { RefreshCw, Wallet, Zap, TrendingUp, TrendingDown, Minus, DollarSign, Settings, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { AppDispatch, RootState } from '@/core/store/store';
import type { TokenPnl } from '@/features/pnl/services/pnlService';

const TOKEN_ORDER = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'MATIC', 'TRX', 'TON', 'NGNZ'];

function pctChange(current: number, previous: number | undefined): number | null {
  if (previous === undefined || previous === null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-gray-400">vs yesterday: —</span>;
  const up = pct >= 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${up ? 'text-green-600' : 'text-red-600'}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? '+' : ''}{pct.toFixed(2)}% vs yesterday
    </span>
  );
}

function PnlIndicator({ value }: { value: number | null }) {
  if (value === null) return <Minus className="h-3.5 w-3.5 text-gray-400" />;
  if (value > 0) return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
  if (value < 0) return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

export function PlatformStats() {
  const titleCtx = useContext(DashboardTitleContext);
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { snapshot, revenue, snapshotLoading, revenueLoading, lastSnapshotAt } = useSelector(
    (state: RootState) => state.pnl
  );
  const isSuperAdmin = user?.role === 'super_admin';

  const [stats, setStats] = useState<PlatformStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [pnlDateFrom, setPnlDateFrom] = useState('');
  const [pnlDateTo, setPnlDateTo] = useState('');

  useEffect(() => {
    titleCtx?.setTitle('Platform Statistics');
    titleCtx?.setBreadcrumb(['Dashboard', 'Platform Stats']);
  }, [titleCtx]);

  useEffect(() => {
    if (isSuperAdmin) {
      dispatch(fetchPnlSnapshot());
      dispatch(fetchPnlRevenue({}));
    }
  }, [dispatch, isSuperAdmin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await getPlatformStats();
      if (response.success) {
        setStats(response.data);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      toast.error('Failed to load platform statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount: number, currency: 'USD' | 'NGN' = 'USD') => {
    if (currency === 'NGN') {
      return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num < 0.00001 && num > 0) {
      return num.toExponential(4);
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: decimals });
  };

  if (loading && !stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platform Statistics</h1>
          <p className="text-sm text-gray-500">
            {lastUpdated && `Last updated: ${lastUpdated}`}
          </p>
        </div>
        <Button
          onClick={fetchStats}
          disabled={loading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {stats && (
        <>
          {/* Total Wallet Balances */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-blue-600" />
                Total User Wallet Balances
              </CardTitle>
              <CardDescription>
                Aggregated balances across all {stats.walletBalances.userCount} users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total (USD)</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(stats.walletBalances.totalUsd)}
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total (Naira)</p>
                  <p className="text-2xl font-bold text-green-700">
                    {formatCurrency(stats.walletBalances.totalNaira, 'NGN')}
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Pending (USD)</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {formatCurrency(stats.walletBalances.totalPendingUsd)}
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Grand Total (USD)</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {formatCurrency(stats.walletBalances.grandTotalUsd)}
                  </p>
                </div>
              </div>

              {/* Token Breakdown */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">Token</th>
                      <th className="text-right py-2 px-4">Balance</th>
                      <th className="text-right py-2 px-4">Pending</th>
                      <th className="text-right py-2 px-4">Price (USD)</th>
                      <th className="text-right py-2 px-4">Value (USD)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.walletBalances.breakdown).map(([token, data]) => (
                      <tr key={token} className="border-b hover:bg-gray-50">
                        <td className="py-2 px-4 font-medium">{token}</td>
                        <td className="text-right py-2 px-4">{formatNumber(data.amount, 8)}</td>
                        <td className="text-right py-2 px-4 text-gray-500">{formatNumber(data.pendingAmount, 8)}</td>
                        <td className="text-right py-2 px-4">{formatCurrency(data.price)}</td>
                        <td className="text-right py-2 px-4 font-medium">{formatCurrency(data.usdValue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Utility Spending */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Total Utility Spending
              </CardTitle>
              <CardDescription>
                Airtime, Data, Electricity, Cable TV, and more
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Spent (Naira)</p>
                  <p className="text-2xl font-bold text-yellow-700">
                    {formatCurrency(stats.utilitySpending.totalNaira, 'NGN')}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Spent (USD)</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {formatCurrency(stats.utilitySpending.totalUsd)}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-700">
                    {stats.utilitySpending.totalTransactions.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Utility Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.utilitySpending.breakdown).map(([type, data]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-gray-600 capitalize">{type.replace('_', ' ')}</p>
                    <p className="text-lg font-bold">{formatCurrency(data.totalNaira, 'NGN')}</p>
                    <p className="text-xs text-gray-500">{data.count} transactions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Profits & Revenue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Profits & Revenue
              </CardTitle>
              <CardDescription>
                Fees and markdown profits from withdrawals and swaps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Withdrawal Profits */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Withdrawal Fees
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fees Collected</span>
                      <span className="font-medium">{formatCurrency(stats.profits.withdrawals.totalFeesCollected, 'NGN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fees (USD)</span>
                      <span className="font-medium">{formatCurrency(stats.profits.withdrawals.totalFeesUsd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transactions</span>
                      <span className="font-medium">{stats.profits.withdrawals.totalTransactions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Processed</span>
                      <span className="font-medium">{formatCurrency(stats.profits.withdrawals.totalAmountProcessed, 'NGN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sent to Bank</span>
                      <span className="font-medium">{formatCurrency(stats.profits.withdrawals.totalSentToBank, 'NGN')}</span>
                    </div>
                  </div>
                </div>

                {/* Swap Profits */}
                <div className="p-4 border rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Swap Markdown Profits
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Swaps</span>
                      <span className="font-medium">{stats.profits.swaps.totalSwaps}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Markdown %</span>
                      <span className="font-medium">{stats.profits.swaps.markdownPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Markdown Profit</span>
                      <span className="font-medium">{formatCurrency(stats.profits.swaps.estimatedMarkdownProfit, 'NGN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Markdown (USD)</span>
                      <span className="font-medium">{formatCurrency(stats.profits.swaps.estimatedMarkdownProfitUsd)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Fees Collected</span>
                      <span className="font-medium">{formatNumber(stats.profits.swaps.totalFeesCollected)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-4 text-green-800">Profit Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Direct Fees (Naira)</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(stats.profits.summary.totalDirectFeesNaira, 'NGN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Direct Fees (USD)</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(stats.profits.summary.totalDirectFeesUsd)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Est. Markdown Profit</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(stats.profits.summary.totalEstimatedMarkdownProfit, 'NGN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Est. Markdown (USD)</p>
                    <p className="text-xl font-bold text-green-700">
                      {formatCurrency(stats.profits.summary.totalEstimatedMarkdownProfitUsd)}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Current Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">USD/NGN Rate</p>
                  <p className="text-xl font-bold">{formatNumber(stats.currentSettings.offrampRate)}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Global Price Markdown</p>
                  <p className="text-xl font-bold">{stats.currentSettings.globalMarkdownPercentage}%</p>
                  <p className="text-xs text-gray-500">{stats.profits.priceMarkdown.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600">Swap Markdown</p>
                  <p className="text-xl font-bold">{stats.currentSettings.swapMarkdownPercentage}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* PNL — Super Admin Only */}
      {isSuperAdmin && (
        <div className="space-y-8 pt-4 border-t">
          {/* Section header with top-level date filter */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Operator PNL</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Live balance snapshot · Fee revenue filtered by date range
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DateRangeFilter
                dateFrom={pnlDateFrom}
                dateTo={pnlDateTo}
                onFromChange={setPnlDateFrom}
                onToChange={setPnlDateTo}
                onApply={() => dispatch(fetchPnlRevenue({ dateFrom: pnlDateFrom || undefined, dateTo: pnlDateTo || undefined }))}
                onClear={() => { setPnlDateFrom(''); setPnlDateTo(''); dispatch(fetchPnlRevenue({})); }}
                loading={revenueLoading}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(fetchPnlSnapshot())}
                disabled={snapshotLoading}
                className="gap-1.5 shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${snapshotLoading ? 'animate-spin' : ''}`} />
                Refresh snapshot
              </Button>
            </div>
          </div>
          {lastSnapshotAt && (
            <p className="text-xs text-gray-400 -mt-4">
              Last refreshed: {lastSnapshotAt}{snapshot?.offrampRate ? ` · Rate: ₦${pnlFormatNumber(snapshot.offrampRate, 2)}/$` : ''}
            </p>
          )}

          {snapshotLoading && !snapshot ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
            </div>
          ) : snapshot?.summary ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  {
                    label: 'Provider Balance (Obiex)',
                    usd: snapshot.summary.providerTotalUsd,
                    ngn: snapshot.summary.providerTotalNgn,
                    prevUsd: snapshot.previousDay?.providerTotalUsd,
                  },
                  {
                    label: 'Platform Liability (User Balances)',
                    usd: snapshot.summary.platformTotalUsd,
                    ngn: snapshot.summary.platformTotalNgn,
                    prevUsd: snapshot.previousDay?.platformTotalUsd,
                  },
                  {
                    label: 'Net PNL (Provider − Platform)',
                    usd: snapshot.summary.pnlTotalUsd,
                    ngn: snapshot.summary.pnlTotalNgn,
                    prevUsd: snapshot.previousDay?.pnlTotalUsd,
                    highlight: true,
                  },
                ].map(({ label, usd, ngn, prevUsd, highlight }) => (
                  <Card key={label} className={highlight ? 'border-primary/30 bg-primary/5' : ''}>
                    <CardContent className="p-5 space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
                      <p className={`text-2xl font-bold ${highlight ? (usd >= 0 ? 'text-green-700' : 'text-red-700') : 'text-gray-900'}`}>
                        {pnlFormatCurrency(usd, 'USD')}
                      </p>
                      <p className="text-sm text-gray-500">{pnlFormatCurrency(ngn, 'NGN')}</p>
                      <PctBadge pct={pctChange(usd, prevUsd)} />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <p className="text-xs text-gray-400">
                Covering {snapshot.userCount?.toLocaleString()} users · Snapshot taken {pnlFormatDate(snapshot.fetchedAt)}
              </p>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700">Token-by-token breakdown</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-gray-50 text-gray-500 uppercase tracking-wide">
                          <th className="py-3 px-4 text-left">Token</th>
                          <th className="py-3 px-4 text-right">Provider (Obiex)</th>
                          <th className="py-3 px-4 text-right">Platform Users</th>
                          <th className="py-3 px-4 text-right">PNL (token)</th>
                          <th className="py-3 px-4 text-right">PNL (USD)</th>
                          <th className="py-3 px-4 text-right">PNL (NGN)</th>
                          <th className="py-3 px-4 text-center">Trend</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {TOKEN_ORDER.filter(t => (snapshot.breakdown ?? {})[t]).map(currency => {
                          const row: TokenPnl = (snapshot.breakdown ?? {})[currency];
                          return (
                            <tr key={currency} className="hover:bg-gray-50">
                              <td className="py-3 px-4 font-semibold text-gray-800">{currency}</td>
                              <td className="py-3 px-4 text-right text-gray-600">
                                {row.providerAvailable !== null ? pnlFormatNumber(row.providerAvailable, 8) : <span className="text-gray-300 italic">N/A</span>}
                              </td>
                              <td className="py-3 px-4 text-right text-gray-600">
                                {pnlFormatNumber(row.platformAvailable, 8)}
                                {row.platformPending > 0 && (
                                  <span className="text-gray-400 ml-1">(+{pnlFormatNumber(row.platformPending, 4)} pending)</span>
                                )}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${pnlColor(row.pnlAmount ?? 0)}`}>
                                {row.pnlAmount !== null ? pnlFormatNumber(row.pnlAmount, 8) : '—'}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${pnlColor(row.pnlUsd ?? 0)}`}>
                                {row.pnlUsd !== null ? pnlFormatCurrency(row.pnlUsd) : '—'}
                              </td>
                              <td className={`py-3 px-4 text-right font-medium ${pnlColor(row.pnlNgn ?? 0)}`}>
                                {row.pnlNgn !== null ? pnlFormatCurrency(row.pnlNgn, 'NGN') : '—'}
                              </td>
                              <td className="py-3 px-4 flex justify-center">
                                <PnlIndicator value={row.pnlUsd} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : null}

          {/* Fee Revenue */}
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-800">Fee Revenue</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Withdrawal fees collected{pnlDateFrom || pnlDateTo ? ` · ${pnlDateFrom || '—'} → ${pnlDateTo || 'now'}` : ' · All time'}
              </p>
            </div>

            {revenueLoading && !revenue ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-300" />
              </div>
            ) : revenue ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-5 space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" /> Total Fee Revenue
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{pnlFormatCurrency(revenue.withdrawalFees.totalUsd)}</p>
                      <p className="text-sm text-gray-500">{pnlFormatCurrency(revenue.withdrawalFees.totalNgn, 'NGN')}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" /> Withdrawals Processed
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{revenue.activitySummary.withdrawalCount.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-5 space-y-1">
                      <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                        <Wallet className="h-3.5 w-3.5" /> Deposits Received
                      </p>
                      <p className="text-2xl font-bold text-gray-900">{revenue.activitySummary.depositCount.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                </div>

                {Object.keys(revenue.withdrawalFees.breakdown).length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-gray-700">Fee breakdown by token</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b bg-gray-50 text-gray-500 uppercase tracking-wide">
                              <th className="py-3 px-4 text-left">Token</th>
                              <th className="py-3 px-4 text-right">Fee (token)</th>
                              <th className="py-3 px-4 text-right">Fee (USD)</th>
                              <th className="py-3 px-4 text-right">Fee (NGN)</th>
                              <th className="py-3 px-4 text-right">Withdrawals</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {Object.entries(revenue.withdrawalFees.breakdown)
                              .sort(([, a], [, b]) => b.feeUsd - a.feeUsd)
                              .map(([currency, data]) => (
                                <tr key={currency} className="hover:bg-gray-50">
                                  <td className="py-3 px-4 font-semibold text-gray-800">{currency}</td>
                                  <td className="py-3 px-4 text-right text-gray-600">{pnlFormatNumber(data.totalFee, 8)}</td>
                                  <td className="py-3 px-4 text-right text-gray-700 font-medium">{pnlFormatCurrency(data.feeUsd)}</td>
                                  <td className="py-3 px-4 text-right text-gray-700 font-medium">{pnlFormatCurrency(data.feeNgn, 'NGN')}</td>
                                  <td className="py-3 px-4 text-right text-gray-500">{data.count.toLocaleString()}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}

              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
