import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { RefreshCw, Users, TrendingUp, Award, Wallet, Clock } from 'lucide-react';
import {
  referralsService,
  type ReferralSummary,
  type ReferralLeaderboardEntry,
  type LeaderboardSortBy,
} from '../services/referralsService';

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const SORT_OPTIONS: { value: LeaderboardSortBy; label: string }[] = [
  { value: 'totalEarnings', label: 'Highest earnings' },
  { value: 'totalReferrals', label: 'Most referrals' },
  { value: 'totalConversions', label: 'Most conversions' },
  { value: 'pendingEarnings', label: 'Highest pending payout' },
];

export function Referrals() {
  const titleCtx = useContext(DashboardTitleContext);
  const navigate = useNavigate();

  const [summary, setSummary] = useState<ReferralSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<ReferralLeaderboardEntry[]>([]);
  const [sortBy, setSortBy] = useState<LeaderboardSortBy>('totalEarnings');
  const [loading, setLoading] = useState(true);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  useEffect(() => {
    titleCtx?.setTitle('Referral Program');
    titleCtx?.setBreadcrumb(['Analytics', 'Referrals']);
  }, [titleCtx]);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await referralsService.getSummary();
      if (res.success) setSummary(res.data);
    } catch (err) {
      console.error('Failed to load referral summary', err);
      toast.error('Failed to load referral summary');
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async (sort: LeaderboardSortBy) => {
    setLeaderboardLoading(true);
    try {
      const res = await referralsService.getLeaderboard(sort, 25);
      if (res.success) setLeaderboard(res.data);
    } catch (err) {
      console.error('Failed to load referral leaderboard', err);
      toast.error('Failed to load referral leaderboard');
    } finally {
      setLeaderboardLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchLeaderboard(sortBy);
  }, [sortBy]);

  const refreshAll = () => {
    fetchSummary();
    fetchLeaderboard(sortBy);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-sm text-gray-500">Leaderboard, earnings, and projected payouts</p>
        </div>
        <Button onClick={refreshAll} disabled={loading} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {loading && !summary ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : summary ? (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> Total Referrers
                </p>
                <p className="text-2xl font-bold text-gray-900">{summary.totalReferrers.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{summary.totalReferredUsers.toLocaleString()} users referred</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5" /> Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900">{summary.conversionRate}%</p>
                <p className="text-xs text-gray-500">{summary.totalConversions.toLocaleString()} conversions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Award className="h-3.5 w-3.5" /> Total Earnings Paid
                </p>
                <p className="text-2xl font-bold text-gray-900">{formatNaira(summary.totalEarnings)}</p>
                <p className="text-xs text-gray-500">Lifetime, all referrers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 space-y-1">
                <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                  <Wallet className="h-3.5 w-3.5" /> Pending Payout
                </p>
                <p className="text-2xl font-bold text-yellow-700">{formatNaira(summary.totalPendingEarnings)}</p>
                <p className="text-xs text-gray-500">{formatNaira(summary.totalPaidOutEarnings)} already paid out</p>
              </CardContent>
            </Card>
          </div>

          {/* Projected earnings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                Projected Earnings
              </CardTitle>
              <CardDescription>{summary.projected.basis}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Last 30 Days Paid</p>
                  <p className="text-xl font-bold text-blue-700">{formatNaira(summary.last30Days.amountPaid)}</p>
                  <p className="text-xs text-gray-500">{summary.last30Days.rewardCount.toLocaleString()} reward payouts</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Projected Next 7 Days</p>
                  <p className="text-xl font-bold text-gray-900">{formatNaira(summary.projected.next7Days)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Projected Next 30 Days</p>
                  <p className="text-xl font-bold text-gray-900">{formatNaira(summary.projected.next30Days)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Top Referrers</CardTitle>
                <CardDescription>Ranked leaderboard, top 25</CardDescription>
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as LeaderboardSortBy)}>
                <SelectTrigger className="w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="p-0">
              {leaderboardLoading ? (
                <div className="flex items-center justify-center py-10">
                  <RefreshCw className="h-6 w-6 animate-spin text-gray-300" />
                </div>
              ) : leaderboard.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No referrers yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-gray-500 uppercase tracking-wide text-xs">
                        <th className="py-3 px-4 text-left">Rank</th>
                        <th className="py-3 px-4 text-left">Referrer</th>
                        <th className="py-3 px-4 text-left">Code</th>
                        <th className="py-3 px-4 text-right">Referrals</th>
                        <th className="py-3 px-4 text-right">Conversions</th>
                        <th className="py-3 px-4 text-right">Conv. Rate</th>
                        <th className="py-3 px-4 text-right">Total Earned</th>
                        <th className="py-3 px-4 text-right">Pending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {leaderboard.map((entry) => (
                        <tr
                          key={entry.userId}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => navigate(`/analytics/referrals/${entry.userId}`)}
                        >
                          <td className="py-3 px-4 font-semibold text-gray-800">#{entry.rank}</td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{entry.fullName || entry.username || '—'}</div>
                            <div className="text-xs text-gray-500 normal-case">{entry.email}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-gray-600">{entry.referralCode}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{entry.totalReferrals}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{entry.totalConversions}</td>
                          <td className="py-3 px-4 text-right text-gray-700">{entry.conversionRate}%</td>
                          <td className="py-3 px-4 text-right font-medium text-green-700">{formatNaira(entry.totalEarnings)}</td>
                          <td className="py-3 px-4 text-right text-yellow-700">{formatNaira(entry.pendingEarnings)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
