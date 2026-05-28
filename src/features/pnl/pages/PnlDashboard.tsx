import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/ui/DateRangeFilter';
import { toast } from 'sonner';
import { RefreshCw, TrendingUp, TrendingDown, Minus, Wallet, DollarSign } from 'lucide-react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { fetchPnlSnapshot, fetchPnlRevenue } from '../store/pnlSlice';
import { formatCurrency, formatNumber, formatDate, pnlColor } from '@/core/utils/dateUtils';
import type { AppDispatch, RootState } from '@/core/store/store';
import type { TokenPnl } from '../services/pnlService';

const TOKEN_ORDER = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'BNB', 'MATIC', 'TRX', 'TON', 'NGNZ'];

function PnlIndicator({ value }: { value: number | null }) {
  if (value === null) return <Minus className="h-3.5 w-3.5 text-gray-400" />;
  if (value > 0) return <TrendingUp className="h-3.5 w-3.5 text-green-600" />;
  if (value < 0) return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
  return <Minus className="h-3.5 w-3.5 text-gray-400" />;
}

function SummaryCard({ label, usd, ngn, highlight = false }: { label: string; usd: number; ngn: number; highlight?: boolean }) {
  const isPositive = usd >= 0;
  return (
    <Card className={highlight ? 'border-primary/30 bg-primary/5' : ''}>
      <CardContent className="p-5 space-y-1">
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold ${highlight ? (isPositive ? 'text-green-700' : 'text-red-700') : 'text-gray-900'}`}>
          {formatCurrency(usd, 'USD')}
        </p>
        <p className="text-sm text-gray-500">{formatCurrency(ngn, 'NGN')}</p>
      </CardContent>
    </Card>
  );
}

export function PnlDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const titleCtx = useContext(DashboardTitleContext);
  const { snapshot, revenue, snapshotLoading, revenueLoading, lastSnapshotAt } = useSelector(
    (state: RootState) => state.pnl
  );

  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    titleCtx?.setTitle('PNL Dashboard');
    titleCtx?.setBreadcrumb(['Analytics', 'PNL Dashboard']);
    dispatch(fetchPnlSnapshot());
    dispatch(fetchPnlRevenue({}));
  }, [dispatch, titleCtx]);

  const handleSnapshotRefresh = async () => {
    try {
      await dispatch(fetchPnlSnapshot()).unwrap();
    } catch {
      toast.error('Failed to refresh PNL snapshot');
    }
  };

  const handleRevenueApply = async () => {
    try {
      await dispatch(fetchPnlRevenue({ dateFrom: dateFrom || undefined, dateTo: dateTo || undefined })).unwrap();
    } catch {
      toast.error('Failed to load revenue data');
    }
  };

  const handleRevenueClear = () => {
    dispatch(fetchPnlRevenue({}));
  };

  const summary = snapshot?.summary;
  const breakdown = snapshot?.breakdown ?? {};

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 p-1">

      {/* ── Summary Cards ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Operator PNL Snapshot</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {lastSnapshotAt ? `Last refreshed: ${lastSnapshotAt}` : 'Fetching…'}
            {snapshot?.offrampRate && ` · Rate: ₦${formatNumber(snapshot.offrampRate, 2)}/$`}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleSnapshotRefresh} disabled={snapshotLoading} className="gap-1.5">
          <RefreshCw className={`h-4 w-4 ${snapshotLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {snapshotLoading && !snapshot ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SummaryCard
              label="Provider Balance (Obiex)"
              usd={summary.providerTotalUsd}
              ngn={summary.providerTotalNgn}
            />
            <SummaryCard
              label="Platform Liability (User Balances)"
              usd={summary.platformTotalUsd}
              ngn={summary.platformTotalNgn}
            />
            <SummaryCard
              label="Net PNL (Provider − Platform)"
              usd={summary.pnlTotalUsd}
              ngn={summary.pnlTotalNgn}
              highlight
            />
          </div>
          <p className="text-xs text-gray-400">
            Covering {snapshot?.userCount?.toLocaleString()} users · Snapshot taken {formatDate(snapshot?.fetchedAt)}
          </p>

          {/* ── Token Breakdown Table ──────────────────────────────── */}
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
                    {TOKEN_ORDER.filter(t => breakdown[t]).map(currency => {
                      const row: TokenPnl = breakdown[currency];
                      return (
                        <tr key={currency} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-semibold text-gray-800">{currency}</td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {row.providerAvailable !== null
                              ? formatNumber(row.providerAvailable, 8)
                              : <span className="text-gray-300 italic">N/A</span>}
                          </td>
                          <td className="py-3 px-4 text-right text-gray-600">
                            {formatNumber(row.platformAvailable, 8)}
                            {row.platformPending > 0 && (
                              <span className="text-gray-400 ml-1">(+{formatNumber(row.platformPending, 4)} pending)</span>
                            )}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${pnlColor(row.pnlAmount ?? 0)}`}>
                            {row.pnlAmount !== null ? formatNumber(row.pnlAmount, 8) : '—'}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${pnlColor(row.pnlUsd ?? 0)}`}>
                            {row.pnlUsd !== null ? formatCurrency(row.pnlUsd) : '—'}
                          </td>
                          <td className={`py-3 px-4 text-right font-medium ${pnlColor(row.pnlNgn ?? 0)}`}>
                            {row.pnlNgn !== null ? formatCurrency(row.pnlNgn, 'NGN') : '—'}
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

      {/* ── Revenue & Fees Section ─────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Fee Revenue</h2>
            <p className="text-xs text-gray-400 mt-0.5">Withdrawal fees collected in the selected period</p>
          </div>
          <DateRangeFilter
            dateFrom={dateFrom}
            dateTo={dateTo}
            onFromChange={setDateFrom}
            onToChange={setDateTo}
            onApply={handleRevenueApply}
            onClear={handleRevenueClear}
            loading={revenueLoading}
          />
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
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(revenue.withdrawalFees.totalUsd)}</p>
                  <p className="text-sm text-gray-500">{formatCurrency(revenue.withdrawalFees.totalNgn, 'NGN')}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" /> Withdrawals Processed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenue.activitySummary.withdrawalCount.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                    <Wallet className="h-3.5 w-3.5" /> Deposits Received
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {revenue.activitySummary.depositCount.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Fee breakdown table */}
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
                              <td className="py-3 px-4 text-right text-gray-600">{formatNumber(data.totalFee, 8)}</td>
                              <td className="py-3 px-4 text-right text-gray-700 font-medium">{formatCurrency(data.feeUsd)}</td>
                              <td className="py-3 px-4 text-right text-gray-700 font-medium">{formatCurrency(data.feeNgn, 'NGN')}</td>
                              <td className="py-3 px-4 text-right text-gray-500">{data.count.toLocaleString()}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {(dateFrom || dateTo) && (
              <p className="text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-md inline-block">
                Revenue filtered: {dateFrom || '—'} → {dateTo || 'now'}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default PnlDashboard;
