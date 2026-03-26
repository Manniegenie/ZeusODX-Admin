import { useContext, useEffect, useState } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RefreshCw, Trophy, CalendarDays } from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import type { TopTrader } from '../types/analytics';

export function TopTraders() {
  const titleCtx = useContext(DashboardTitleContext);
  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState('20');

  useEffect(() => {
    titleCtx?.setTitle('Top Traders');
    titleCtx?.setBreadcrumb(['Analytics', 'Top Traders']);
  }, [titleCtx]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await AnalyticsService.getTopTraders({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: parseInt(limit),
      });
      if (response.success) {
        setTraders(response.data.topTraders);
        setLastUpdated(new Date().toLocaleString());
      }
    } catch {
      toast.error('Failed to load top traders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const fmtUsd = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(v);

  const fmtNgn = (v: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);

  const rankBadge = (i: number) => {
    if (i === 0) return '🥇';
    if (i === 1) return '🥈';
    if (i === 2) return '🥉';
    return `#${i + 1}`;
  };

  if (loading && traders.length === 0) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-full mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Top Traders</h1>
          <p className="text-sm text-gray-500">{lastUpdated && `Last updated: ${lastUpdated}`}</p>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="ttDateFrom" className="text-xs text-gray-500">From</Label>
            <Input id="ttDateFrom" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="ttDateTo" className="text-xs text-gray-500">To</Label>
            <Input id="ttDateTo" type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-8 text-sm w-36" />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-gray-500">Show</Label>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="h-8 w-24 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">Top 10</SelectItem>
                <SelectItem value="20">Top 20</SelectItem>
                <SelectItem value="50">Top 50</SelectItem>
                <SelectItem value="100">Top 100</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={fetchData} disabled={loading} variant="outline" className="flex items-center gap-2 h-8">
            {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
            Apply
          </Button>
          {(dateFrom || dateTo) && (
            <Button onClick={() => { setDateFrom(''); setDateTo(''); }} variant="ghost" className="h-8 text-xs text-gray-500">Clear</Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Leaderboard — Ranked by Total Volume (USD)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {traders.length === 0 ? (
            <p className="text-center text-gray-500 py-8 px-6">No data found for the selected period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left py-3 px-4 font-medium text-gray-600 w-16">Rank</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">NGN Volume</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-900 bg-gray-100">Total Volume (USD)</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Top Tokens</th>
                </tr>
              </thead>
              <tbody>
                {traders.map((trader, index) => (
                  <tr
                    key={trader.userId}
                    className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50/40' : ''}`}
                  >
                    <td className="py-3 px-4 text-lg font-medium">{rankBadge(index)}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium leading-tight">
                        {trader.firstname || trader.lastname
                          ? `${trader.firstname} ${trader.lastname}`.trim()
                          : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500 truncate max-w-[220px]">{trader.email}</p>
                    </td>
                    <td className="text-right py-3 px-4 text-green-700 font-medium">{fmtNgn(trader.ngnzVolume)}</td>
                    <td className="text-right py-3 px-4 font-bold text-gray-900 bg-gray-50">{fmtUsd(trader.totalVolumeUsd)}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {trader.topTokens.map((c) => (
                          <span key={c} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{c}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
