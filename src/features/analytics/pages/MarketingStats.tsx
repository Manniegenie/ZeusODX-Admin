import { useContext, useEffect, useState } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, Users, UserCheck, TrendingUp, CalendarDays, Gift, ArrowUpRight } from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import type { MarketingStatsResponse } from '../types/analytics';

export function MarketingStats() {
  const titleCtx = useContext(DashboardTitleContext);
  const [data, setData] = useState<MarketingStatsResponse['data'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    titleCtx?.setTitle('Marketing Stats');
    titleCtx?.setBreadcrumb(['Analytics', 'Marketing Stats']);
  }, [titleCtx]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await AnalyticsService.getMarketingStats({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (response.success) {
        setData(response.data);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch {
      toast.error('Failed to load marketing stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const transactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      SWAP: 'Swap',
      OBIEX_SWAP: 'Obiex Swap',
      GIFTCARD: 'Gift Card',
      DEPOSIT: 'Deposit',
      WITHDRAWAL: 'Withdrawal',
    };
    return labels[type] ?? type;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Stats</h1>
          <p className="text-sm text-gray-500">{lastUpdated && `Last updated: ${lastUpdated}`}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="mktDateFrom" className="text-xs text-gray-500">From</Label>
            <Input
              id="mktDateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-sm w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="mktDateTo" className="text-xs text-gray-500">To</Label>
            <Input
              id="mktDateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-8 text-sm w-36"
            />
          </div>
          <Button onClick={fetchData} disabled={loading} variant="outline" className="flex items-center gap-2 h-8">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
            Apply
          </Button>
          {(dateFrom || dateTo) && (
            <Button onClick={() => { setDateFrom(''); setDateTo(''); }} variant="ghost" className="h-8 text-xs text-gray-500">
              Clear
            </Button>
          )}
          <Button onClick={fetchData} disabled={loading} variant="outline" size="icon" className="h-8 w-8">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {data && (
        <>
          {/* User KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="border shadow-none">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Users</p>
                    <p className="text-2xl font-bold">{data.users.total.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">{dateFrom || dateTo ? 'New in Period' : 'Total Registered'}</p>
                    <p className="text-2xl font-bold">{data.users.newInPeriod.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">KYC Verified</p>
                    <p className="text-2xl font-bold">{data.users.kycVerified.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Active Traders</p>
                    <p className="text-2xl font-bold">{data.users.activeTraders.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-none">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Gift className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Gift Card Submissions</p>
                    <p className="text-2xl font-bold">{data.giftcardSubmissions.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                User Conversion Funnel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: 'Registered Users', value: data.users.total, color: 'bg-blue-500', pct: 100 },
                  {
                    label: 'KYC Verified',
                    value: data.users.kycVerified,
                    color: 'bg-purple-500',
                    pct: data.users.total > 0 ? (data.users.kycVerified / data.users.total) * 100 : 0,
                  },
                  {
                    label: 'KYC Pending',
                    value: data.users.kycPending,
                    color: 'bg-yellow-500',
                    pct: data.users.total > 0 ? (data.users.kycPending / data.users.total) * 100 : 0,
                  },
                  {
                    label: 'Active Traders',
                    value: data.users.activeTraders,
                    color: 'bg-green-500',
                    pct: data.users.total > 0 ? (data.users.activeTraders / data.users.total) * 100 : 0,
                  },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">
                        {item.value.toLocaleString()} ({item.pct.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`${item.color} h-2.5 rounded-full transition-all`}
                        style={{ width: `${Math.min(item.pct, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Registrations */}
          {data.dailyRegistrations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  Daily Registrations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4">Date</th>
                        <th className="text-right py-2 px-4">New Users</th>
                        <th className="text-left py-2 px-4 w-40">Volume</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.dailyRegistrations.map((row) => {
                        const max = Math.max(...data.dailyRegistrations.map((r) => r.count));
                        return (
                          <tr key={row._id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-4">{row._id}</td>
                            <td className="text-right py-2 px-4 font-medium">{row.count}</td>
                            <td className="py-2 px-4">
                              <div className="w-full bg-gray-100 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${max > 0 ? (row.count / max) * 100 : 0}%` }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transaction Type Breakdown */}
          {data.transactionTypeBreakdown.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Transaction Activity Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {data.transactionTypeBreakdown.map((item) => (
                    <div key={item._id} className="p-4 border rounded-lg">
                      <p className="text-sm font-medium text-gray-600">{transactionTypeLabel(item._id)}</p>
                      <p className="text-2xl font-bold">{item.count.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
