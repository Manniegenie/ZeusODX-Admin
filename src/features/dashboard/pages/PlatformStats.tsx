import { useContext, useEffect, useState } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPlatformStats, type PlatformStatsResponse } from '../services/analyticsService';
import { toast } from 'sonner';
import { RefreshCw, Wallet, Zap, TrendingUp, DollarSign, Settings } from 'lucide-react';

export function PlatformStats() {
  const titleCtx = useContext(DashboardTitleContext);
  const [stats, setStats] = useState<PlatformStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    titleCtx?.setTitle('Platform Statistics');
    titleCtx?.setBreadcrumb(['Dashboard', 'Platform Stats']);
  }, [titleCtx]);

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
    </div>
  );
}
