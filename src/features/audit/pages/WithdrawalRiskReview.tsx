import { useContext, useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { usePermissions } from '@/core/hooks/usePermissions';
import { getQaLogs, reviewQaLog, type QaLog, type RiskBand } from '../services/qaLogsService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  ShieldAlert, ShieldCheck, ShieldQuestion, CheckCircle2, XCircle, Clock,
} from 'lucide-react';

// ── Risk band presentation ───────────────────────────────────────────────────
const BAND_META: Record<RiskBand, { label: string; color: string; icon: React.ReactNode }> = {
  ALLOW: { label: 'Allow', color: 'text-green-700 bg-green-50 border-green-200', icon: <ShieldCheck className="h-4 w-4" /> },
  FLAG:  { label: 'Flag',  color: 'text-amber-700 bg-amber-50 border-amber-200', icon: <ShieldQuestion className="h-4 w-4" /> },
  HOLD:  { label: 'Hold',  color: 'text-orange-700 bg-orange-50 border-orange-200', icon: <ShieldAlert className="h-4 w-4" /> },
  BLOCK: { label: 'Block', color: 'text-red-700 bg-red-50 border-red-200', icon: <ShieldAlert className="h-4 w-4" /> },
};

const REVIEW_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING:  { label: 'Pending review', color: 'text-gray-600 bg-gray-50', icon: <Clock className="h-3.5 w-3.5" /> },
  APPROVED: { label: 'Approved', color: 'text-green-700 bg-green-50', icon: <CheckCircle2 className="h-3.5 w-3.5" /> },
  REJECTED: { label: 'Rejected', color: 'text-red-700 bg-red-50', icon: <XCircle className="h-3.5 w-3.5" /> },
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

function fullDate(iso: string): string {
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function formatAmount(log: QaLog): string {
  if (log.amount == null) return '—';
  const n = log.amount.toLocaleString(undefined, { maximumFractionDigits: 8 });
  return log.currency ? `${n} ${log.currency}` : n;
}

// ── Row component ────────────────────────────────────────────────────────────
function LogRow({ log, onReviewed }: { log: QaLog; onReviewed: (updated: QaLog) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const band = log.riskBand ?? 'ALLOW';
  const bandMeta = BAND_META[band];
  const reviewMeta = REVIEW_META[log.reviewStatus] ?? REVIEW_META.PENDING;
  const firedSignals = (log.riskSignals ?? []).filter(s => s.fired);
  const missedSignals = (log.riskSignals ?? []).filter(s => !s.fired);

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const res = await reviewQaLog(log._id, 'APPROVED');
      onReviewed(res.log);
      toast.success('Marked as reviewed — approved');
    } catch {
      toast.error('Failed to record review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      toast.error('Add a note explaining why this is being flagged as fraud');
      return;
    }
    setSubmitting(true);
    try {
      const res = await reviewQaLog(log._id, 'REJECTED', notes.trim());
      onReviewed(res.log);
      toast.success('Marked as reviewed — rejected');
      setRejecting(false);
      setNotes('');
    } catch {
      toast.error('Failed to record review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50/60 transition-colors">
      <div
        className="grid grid-cols-[auto_1fr_auto_auto_auto_auto] gap-4 px-4 py-3 cursor-pointer items-start"
        onClick={() => setExpanded(e => !e)}
      >
        <div className={`mt-0.5 rounded-lg p-2 shrink-0 border ${bandMeta.color}`}>
          {bandMeta.icon}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{log.withdrawalType.replace('_', ' ')}</span>
            <Badge variant="outline" className={`text-[10px] px-1.5 py-0 border ${bandMeta.color}`}>{bandMeta.label} · {log.riskScore ?? 0}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-600 font-medium">{log.username || log.email || log.userId || 'unknown user'}</span>
            <span className="text-xs text-gray-400">{formatAmount(log)}</span>
            {log.destinationSummary && <span className="text-xs text-gray-400 font-mono truncate max-w-[220px]">→ {log.destinationSummary}</span>}
          </div>
        </div>

        <div className="shrink-0 mt-0.5">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${reviewMeta.color}`}>
            {reviewMeta.icon} {reviewMeta.label}
          </span>
        </div>

        <div className="shrink-0 text-right mt-0.5">
          <span className="text-xs text-gray-400 whitespace-nowrap" title={fullDate(log.createdAt)}>
            {relativeTime(log.createdAt)}
          </span>
        </div>

        {log.reviewStatus === 'PENDING' ? (
          <div className="shrink-0 flex gap-1.5" onClick={e => e.stopPropagation()}>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-green-300 text-green-700 hover:bg-green-50" disabled={submitting} onClick={handleApprove}>
              Approve
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2 text-xs border-red-300 text-red-700 hover:bg-red-50" disabled={submitting} onClick={() => setRejecting(true)}>
              Reject
            </Button>
          </div>
        ) : (
          <div className="shrink-0" />
        )}

        <div className="shrink-0 mt-0.5 text-gray-300">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Route</p>
              <p className="font-mono text-gray-600">{log.method} {log.route}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Outcome</p>
              <p className="text-gray-700 font-medium">{log.outcome}{log.outcomeReason ? ` — ${log.outcomeReason}` : ''}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">IP address</p>
              <p className="font-mono text-gray-600">{log.ipAddress || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Timestamp</p>
              <p className="text-gray-600">{fullDate(log.createdAt)}</p>
            </div>
          </div>

          <div>
            <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Risk signals — score {log.riskScore ?? 0} ({bandMeta.label})</p>
            <div className="flex flex-wrap gap-1.5">
              {firedSignals.map(s => (
                <span key={s.signal} title={s.detail} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-50 text-red-700 border border-red-200">
                  {s.signal.replace(/_/g, ' ')} +{s.weight}
                </span>
              ))}
              {missedSignals.map(s => (
                <span key={s.signal} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-400">
                  {s.signal.replace(/_/g, ' ')}
                </span>
              ))}
              {firedSignals.length === 0 && missedSignals.length === 0 && (
                <span className="text-gray-400 text-[10px]">No risk signals recorded for this entry.</span>
              )}
            </div>
          </div>

          {log.reviewStatus !== 'PENDING' && (
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Review</p>
              <p className="text-gray-700">
                {reviewMeta.label} by <span className="font-medium">{log.reviewedBy || 'unknown'}</span>
                {log.reviewedAt ? ` on ${fullDate(log.reviewedAt)}` : ''}
              </p>
              {log.reviewNotes && <p className="text-gray-500 mt-0.5 italic">"{log.reviewNotes}"</p>}
            </div>
          )}
        </div>
      )}

      <Dialog open={rejecting} onOpenChange={setRejecting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject — mark as fraud</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">
            This records your disposition for the audit trail. It does not reverse or hold the withdrawal —
            it already completed. Use this to flag the account for further action.
          </p>
          <Textarea
            placeholder="Why is this being flagged as fraud?"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(false)} disabled={submitting}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={submitting}>Confirm rejection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function WithdrawalRiskReview() {
  const titleCtx = useContext(DashboardTitleContext);
  const { isSuperAdmin } = usePermissions();

  const [logs, setLogs] = useState<QaLog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    riskBand: '', reviewStatus: 'PENDING', withdrawalType: '', username: '', from: '', to: '',
  });

  useEffect(() => {
    titleCtx?.setTitle('Withdrawal Risk Review');
    titleCtx?.setBreadcrumb(['Audit & Monitoring', 'Withdrawal Risk Review']);
  }, [titleCtx]);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: pagination.limit };
      if (filters.riskBand)       params.riskBand      = filters.riskBand;
      if (filters.reviewStatus)   params.reviewStatus  = filters.reviewStatus;
      if (filters.withdrawalType) params.withdrawalType = filters.withdrawalType;
      if (filters.username)       params.username      = filters.username;
      if (filters.from)           params.from          = filters.from;
      if (filters.to)             params.to            = filters.to;
      const data = await getQaLogs(params);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load withdrawal risk logs.');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    if (isSuperAdmin) fetchLogs(1);
  }, [isSuperAdmin, fetchLogs]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Access denied. Super admin only.</p>
      </div>
    );
  }

  const handleFilterChange = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleSearch = () => fetchLogs(1);
  const handleClear = () => setFilters({ riskBand: '', reviewStatus: 'PENDING', withdrawalType: '', username: '', from: '', to: '' });

  const handleReviewed = (updated: QaLog) => {
    setLogs(prev => prev.map(l => (l._id === updated._id ? updated : l)));
  };

  const bandCounts = logs.reduce<Record<string, number>>((acc, l) => {
    const b = l.riskBand ?? 'ALLOW';
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {});
  const pendingCount = logs.filter(l => l.reviewStatus === 'PENDING').length;

  return (
    <div className="space-y-4">
      <Card className="p-4 border-amber-200 bg-amber-50/50">
        <p className="text-xs text-amber-800">
          <b>Shadow mode.</b> Every withdrawal is scored and logged here, but no withdrawal is ever held or
          blocked by this system — HOLD/BLOCK bands are observational. Approve/Reject below only records
          your disposition for audit purposes.
        </p>
      </Card>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Showing</p>
          <p className="text-2xl font-bold">{logs.length} <span className="text-sm font-normal text-gray-400">of {pagination.total.toLocaleString()}</span></p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Pending review</p>
          <p className="text-2xl font-bold text-gray-700">{pendingCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-red-500" /> Block</p>
          <p className="text-2xl font-bold text-red-600">{bandCounts.BLOCK ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldAlert className="h-3 w-3 text-orange-500" /> Hold</p>
          <p className="text-2xl font-bold text-orange-600">{bandCounts.HOLD ?? 0}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1"><ShieldQuestion className="h-3 w-3 text-amber-500" /> Flag</p>
          <p className="text-2xl font-bold text-amber-600">{bandCounts.FLAG ?? 0}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Username / email"
              value={filters.username}
              onChange={e => handleFilterChange('username', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <select
            className="w-full h-8 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.riskBand}
            onChange={e => handleFilterChange('riskBand', e.target.value)}
          >
            <option value="">All risk bands</option>
            <option value="BLOCK">Block</option>
            <option value="HOLD">Hold</option>
            <option value="FLAG">Flag</option>
            <option value="ALLOW">Allow</option>
          </select>
          <select
            className="w-full h-8 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.reviewStatus}
            onChange={e => handleFilterChange('reviewStatus', e.target.value)}
          >
            <option value="">All review statuses</option>
            <option value="PENDING">Pending review</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <select
            className="w-full h-8 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.withdrawalType}
            onChange={e => handleFilterChange('withdrawalType', e.target.value)}
          >
            <option value="">All types</option>
            <option value="CRYPTO">Crypto</option>
            <option value="NGNZ">NGNZ</option>
            <option value="INTERNAL_USERNAME">Internal transfer</option>
          </select>
          <Input type="date" className="h-8 text-sm" value={filters.from} onChange={e => handleFilterChange('from', e.target.value)} />
          <Input type="date" className="h-8 text-sm" value={filters.to} onChange={e => handleFilterChange('to', e.target.value)} />
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={handleSearch} disabled={loading}>
            <Search className="w-3.5 h-3.5 mr-1.5" /> Search
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear}>Clear</Button>
          <Button size="sm" variant="outline" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {error && <div className="p-4 text-sm text-red-600 border-b">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm">Loading withdrawal risk logs…</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <ShieldCheck className="h-8 w-8 mb-2" />
              <p className="text-sm">No entries found for the selected filters.</p>
            </div>
          ) : (
            <div>
              {logs.map(log => <LogRow key={log._id} log={log} onReviewed={handleReviewed} />)}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <p className="text-xs text-gray-500">
                {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total.toLocaleString()}
              </p>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" disabled={pagination.page <= 1 || loading} onClick={() => fetchLogs(pagination.page - 1)}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="text-xs px-3 py-1.5 text-gray-500">{pagination.page} / {pagination.pages}</span>
                <Button size="sm" variant="outline" disabled={pagination.page >= pagination.pages || loading} onClick={() => fetchLogs(pagination.page + 1)}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
