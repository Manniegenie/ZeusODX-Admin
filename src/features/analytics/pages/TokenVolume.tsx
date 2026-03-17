import { useContext, useEffect, useState } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { RefreshCw, Coins, CalendarDays } from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import type { TokenVolumeEntry } from '../types/analytics';

export function TokenVolume() {
  const titleCtx = useContext(DashboardTitleContext);
  const [tokens, setTokens] = useState<TokenVolumeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    titleCtx?.setTitle('Token Volume');
    titleCtx?.setBreadcrumb(['Analytics', 'Token Volume']);
  }, [titleCtx]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await AnalyticsService.getTokenVolume({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });
      if (response.success) {
        setTokens(response.data.tokens);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch {
      toast.error('Failed to load token volume data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatUsd = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(amount);

  const formatVolume = (amount: number) => {
    if (amount < 0.00001 && amount > 0) return amount.toExponential(4);
    return amount.toLocaleString(undefined, { maximumFractionDigits: 4 });
  };

  const maxUsd = tokens.length > 0 ? Math.max(...tokens.map((t) => t.usdValue)) : 1;

  if (loading && tokens.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Token Volume</h1>
          <p className="text-sm text-gray-500">{lastUpdated && `Last updated: ${lastUpdated}`}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="tvDateFrom" className="text-xs text-gray-500">From</Label>
            <Input
              id="tvDateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-8 text-sm w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="tvDateTo" className="text-xs text-gray-500">To</Label>
            <Input
              id="tvDateTo"
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
        </div>
      </div>

      {/* Summary cards */}
      {tokens.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border shadow-none">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500">Total Tokens</p>
              <p className="text-2xl font-bold">{tokens.length}</p>
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500">Total USD Volume</p>
              <p className="text-2xl font-bold text-green-700">
                {formatUsd(tokens.reduce((s, t) => s + t.usdValue, 0))}
              </p>
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500">Total Trades</p>
              <p className="text-2xl font-bold">{tokens.reduce((s, t) => s + t.tradeCount, 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="border shadow-none">
            <CardContent className="pt-5 pb-4">
              <p className="text-xs text-gray-500">Top Token</p>
              <p className="text-2xl font-bold">{tokens[0]?.token ?? '—'}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Token table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-blue-600" />
            Tokens by Trading Volume (USD)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data found for the selected period.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">Rank</th>
                    <th className="text-left py-2 px-4">Token</th>
                    <th className="text-right py-2 px-4">USD Volume</th>
                    <th className="text-right py-2 px-4">Total Volume</th>
                    <th className="text-right py-2 px-4">Trades</th>
                    <th className="text-right py-2 px-4">Unique Users</th>
                    <th className="text-left py-2 px-4 w-40">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token, index) => (
                    <tr key={token.token} className="border-b hover:bg-gray-50">
                      <td className="py-2.5 px-4 text-gray-500">#{index + 1}</td>
                      <td className="py-2.5 px-4">
                        <span className="font-semibold text-base">{token.token}</span>
                      </td>
                      <td className="text-right py-2.5 px-4 font-medium">{formatUsd(token.usdValue)}</td>
                      <td className="text-right py-2.5 px-4 text-gray-600">{formatVolume(token.totalVolume)}</td>
                      <td className="text-right py-2.5 px-4">{token.tradeCount.toLocaleString()}</td>
                      <td className="text-right py-2.5 px-4">{token.uniqueUserCount.toLocaleString()}</td>
                      <td className="py-2.5 px-4">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${maxUsd > 0 ? (token.usdValue / maxUsd) * 100 : 0}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
