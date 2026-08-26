import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, CheckCircle, Circle } from 'lucide-react';
import { referralsService, type ReferrerDetail } from '../services/referralsService';

function formatNaira(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(date: string | null): string {
  if (!date) return '—';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-NG', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function ReferralDetail() {
  const titleCtx = useContext(DashboardTitleContext);
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();

  const [detail, setDetail] = useState<ReferrerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    titleCtx?.setTitle('Referrer Detail');
    titleCtx?.setBreadcrumb(['Analytics', 'Referrals', 'Detail']);
  }, [titleCtx]);

  const fetchDetail = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await referralsService.getReferrerDetail(userId);
      if (res.success) setDetail(res.data);
    } catch (err) {
      console.error('Failed to load referrer detail', err);
      toast.error('Failed to load referrer detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (loading && !detail) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Button variant="outline" onClick={() => navigate('/analytics/referrals')} className="mb-4">
          ← Back to Referrals
        </Button>
        <Card>
          <CardContent className="p-8 text-center text-gray-500">No referral record found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <Button variant="outline" onClick={() => navigate('/analytics/referrals')} className="mb-2">
        ← Back to Referrals
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{detail.fullName || detail.username}</CardTitle>
          <CardDescription className="normal-case">{detail.email} · code: <span className="font-mono">{detail.referralCode}</span></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Referrals</p>
              <p className="text-xl font-bold text-gray-900">{detail.totalReferrals}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Conversions</p>
              <p className="text-xl font-bold text-gray-900">{detail.totalConversions}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Earned</p>
              <p className="text-xl font-bold text-green-700">{formatNaira(detail.totalEarnings)}</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Payout</p>
              <p className="text-xl font-bold text-yellow-700">{formatNaira(detail.pendingEarnings)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-4">
            Status: <span className={detail.isActive ? 'text-green-600' : 'text-red-600'}>{detail.isActive ? 'Active' : 'Inactive'}</span>
            {' · '}Already paid out: {formatNaira(detail.paidOutEarnings)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Referred Users ({detail.referredUsers.length})</CardTitle>
          <CardDescription>Everyone who signed up with this referral code</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {detail.referredUsers.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No referred users yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500 uppercase tracking-wide text-xs">
                    <th className="py-3 px-4 text-left">User</th>
                    <th className="py-3 px-4 text-left">Joined</th>
                    <th className="py-3 px-4 text-center">Converted</th>
                    <th className="py-3 px-4 text-left">First Transaction</th>
                    <th className="py-3 px-4 text-right">Earnings Generated</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {detail.referredUsers.map((u) => (
                    <tr key={u.userId} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{u.fullName || u.username || '—'}</div>
                        <div className="text-xs text-gray-500 normal-case">{u.email}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(u.joinedAt)}</td>
                      <td className="py-3 px-4 flex justify-center">
                        {u.hasConverted
                          ? <CheckCircle className="h-4 w-4 text-green-600" />
                          : <Circle className="h-4 w-4 text-gray-300" />}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(u.firstTransactionAt)}</td>
                      <td className="py-3 px-4 text-right font-medium text-green-700">{formatNaira(u.earningsFromUser)}</td>
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
