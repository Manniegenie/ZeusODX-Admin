import { useContext, useEffect, useRef, useState } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RefreshCw, Trophy, CalendarDays, Info } from 'lucide-react';
import { AnalyticsService } from '../services/analyticsService';
import type { TopTrader } from '../types/analytics';

// Volume breakdown legend shown above the table
const VOLUME_SOURCES = [
  { key: 'ngnzVolumeUsd', label: 'NGNZ Volume', desc: 'NGNZ-currency transactions (swaps, bills)', color: 'bg-green-500' },
  { key: 'cryptoWithdrawalUsd', label: 'Crypto Withdrawals', desc: 'Crypto WITHDRAWAL transactions', color: 'bg-orange-500' },
  { key: 'internalTransferUsd', label: 'Internal Transfers', desc: 'Swaps & internal crypto trades', color: 'bg-blue-500' },
];

export function TopTraders() {
  const titleCtx = useContext(DashboardTitleContext);
  const [traders, setTraders] = useState<TopTrader[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [limit, setLimit] = useState('20');

  const scrollRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [hasHScroll, setHasHScroll] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Top Traders');
    titleCtx?.setBreadcrumb(['Analytics', 'Top Traders']);
  }, [titleCtx]);

  // Sync custom scroll indicator with table scroll position
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const update = () => {
      const scrollable = el.scrollWidth - el.clientWidth;
      setHasHScroll(scrollable > 0);
      if (scrollable <= 0) { setScrollPct(0); setThumbWidth(0); return; }
      const ratio = el.clientWidth / el.scrollWidth;
      setThumbWidth(ratio * el.clientWidth);
      setScrollPct((el.scrollLeft / scrollable) * (el.clientWidth - ratio * el.clientWidth));
    };

    update();
    el.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    return () => { el.removeEventListener('scroll', update); window.removeEventListener('resize', update); };
  }, [traders]);

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

      {/* Volume source legend */}
      <div className="flex flex-wrap gap-3 items-center p-3 bg-gray-50 rounded-lg border text-xs">
        <Info className="h-3.5 w-3.5 text-gray-400 shrink-0" />
        <span className="text-gray-500 font-medium mr-1">Volume includes:</span>
        {VOLUME_SOURCES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${s.color}`} />
            <span className="font-medium">{s.label}</span>
            <span className="text-gray-400 hidden sm:inline">— {s.desc}</span>
          </span>
        ))}
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
            <div className="relative">
              {/* Scrollable table */}
              <div ref={scrollRef} className="overflow-x-auto">
                <table className="w-full text-sm min-w-[900px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left py-3 px-4 font-medium text-gray-600 sticky left-0 bg-gray-50 z-10 min-w-[60px]">Rank</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 sticky left-[60px] bg-gray-50 z-10 min-w-[200px]">User</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 min-w-[130px]">
                        <span className="flex items-center justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          NGNZ Volume
                        </span>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 min-w-[130px]">
                        <span className="flex items-center justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                          NGNZ (USD est.)
                        </span>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 min-w-[155px]">
                        <span className="flex items-center justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                          Crypto Withdrawals
                        </span>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 min-w-[155px]">
                        <span className="flex items-center justify-end gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                          Internal Transfers
                        </span>
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-900 min-w-[145px] bg-gray-100">
                        Total Volume (USD)
                      </th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 min-w-[90px]">Trades</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600 min-w-[120px]">Tokens</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600 min-w-[100px]">Last Trade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {traders.map((trader, index) => (
                      <tr
                        key={trader.userId}
                        className={`border-b hover:bg-gray-50 ${index < 3 ? 'bg-yellow-50/40' : ''}`}
                      >
                        <td className="py-3 px-4 text-lg font-medium sticky left-0 bg-inherit z-10">{rankBadge(index)}</td>
                        <td className="py-3 px-4 sticky left-[60px] bg-inherit z-10">
                          <p className="font-medium leading-tight">
                            {trader.firstname || trader.lastname
                              ? `${trader.firstname} ${trader.lastname}`.trim()
                              : 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[180px]">{trader.email}</p>
                        </td>
                        <td className="text-right py-3 px-4 text-green-700">{fmtNgn(trader.ngnzVolume)}</td>
                        <td className="text-right py-3 px-4 text-green-600">{fmtUsd(trader.ngnzVolumeUsd)}</td>
                        <td className="text-right py-3 px-4 text-orange-600">{fmtUsd(trader.cryptoWithdrawalUsd)}</td>
                        <td className="text-right py-3 px-4 text-blue-600">{fmtUsd(trader.internalTransferUsd)}</td>
                        <td className="text-right py-3 px-4 font-bold text-gray-900 bg-gray-50">{fmtUsd(trader.totalVolumeUsd)}</td>
                        <td className="text-right py-3 px-4">{trader.tradeCount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {trader.currencies.slice(0, 4).map((c) => (
                              <span key={c} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{c}</span>
                            ))}
                            {trader.currencies.length > 4 && (
                              <span className="text-xs text-gray-400">+{trader.currencies.length - 4}</span>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 text-xs text-gray-500">
                          {trader.lastTradeAt ? new Date(trader.lastTradeAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Custom horizontal scroll indicator */}
              {hasHScroll && (
                <div className="h-1.5 bg-gray-100 mx-4 mb-3 mt-1 rounded-full relative overflow-hidden">
                  <div
                    ref={thumbRef}
                    className="absolute top-0 h-full bg-gray-400 rounded-full transition-transform"
                    style={{ width: thumbWidth, transform: `translateX(${scrollPct}px)` }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
