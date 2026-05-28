import { useContext, useEffect, useState, useCallback } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { usePermissions } from '@/core/hooks/usePermissions';
import { getAuditLogs, type AuditLog } from '../services/auditService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  UserX, UserCheck, DollarSign, Shield, Settings,
  Eye, Trash2, Edit, PlusCircle, Lock, Unlock,
  AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Wallet, Bell, FileText, Key,
} from 'lucide-react';

// ── Semantic action mapping ──────────────────────────────────────────────────
// Maps route patterns → { label, icon, category, color }
type ActionMeta = { label: string; icon: React.ReactNode; category: string; color: string };

function getActionMeta(route: string, method: string, action: string): ActionMeta {
  const r = route.toLowerCase();
  const m = method.toUpperCase();

  if (r.includes('blockuser') || r.includes('block-user'))
    return { label: 'Blocked user', icon: <UserX className="h-4 w-4" />, category: 'User', color: 'text-red-600 bg-red-50' };
  if (r.includes('unlockaccount') || r.includes('unlock-pin') || r.includes('unlock-2fa'))
    return { label: 'Unlocked account', icon: <Unlock className="h-4 w-4" />, category: 'User', color: 'text-green-600 bg-green-50' };
  if (r.includes('deleteuser') || r.includes('delete-user'))
    return { label: 'Deleted user', icon: <Trash2 className="h-4 w-4" />, category: 'User', color: 'text-red-700 bg-red-50' };
  if (r.includes('delete-pin') || r.includes('deletepin'))
    return { label: 'Removed PIN', icon: <Key className="h-4 w-4" />, category: 'User', color: 'text-orange-600 bg-orange-50' };
  if (r.includes('fund') || r.includes('funduser'))
    return { label: 'Funded user', icon: <DollarSign className="h-4 w-4" />, category: 'Funding', color: 'text-emerald-600 bg-emerald-50' };
  if (r.includes('deduct') || r.includes('pending'))
    return { label: 'Adjusted balance', icon: <Wallet className="h-4 w-4" />, category: 'Funding', color: 'text-amber-600 bg-amber-50' };
  if (r.includes('kyc'))
    return { label: 'KYC review', icon: <UserCheck className="h-4 w-4" />, category: 'KYC', color: 'text-blue-600 bg-blue-50' };
  if (r.includes('crypto-fee') || r.includes('set-fee'))
    return { label: m === 'DELETE' ? 'Deleted fee' : m === 'POST' ? 'Created fee' : 'Updated fee', icon: <Edit className="h-4 w-4" />, category: 'Fees', color: 'text-violet-600 bg-violet-50' };
  if (r.includes('min-withdrawal'))
    return { label: 'Updated withdrawal limit', icon: <Shield className="h-4 w-4" />, category: 'Fees', color: 'text-violet-600 bg-violet-50' };
  if (r.includes('marker') || r.includes('pricemarkdown') || r.includes('price-markdown'))
    return { label: 'Updated price markdown', icon: <Settings className="h-4 w-4" />, category: 'Fees', color: 'text-violet-600 bg-violet-50' };
  if (r.includes('swapmarkdown') || r.includes('nairamarkup'))
    return { label: 'Updated rate/markup', icon: <Settings className="h-4 w-4" />, category: 'Fees', color: 'text-violet-600 bg-violet-50' };
  if (r.includes('notification') || r.includes('push'))
    return { label: 'Sent notification', icon: <Bell className="h-4 w-4" />, category: 'Content', color: 'text-sky-600 bg-sky-50' };
  if (r.includes('banner'))
    return { label: 'Managed banner', icon: <FileText className="h-4 w-4" />, category: 'Content', color: 'text-sky-600 bg-sky-50' };
  if (r.includes('blog'))
    return { label: 'Managed blog', icon: <FileText className="h-4 w-4" />, category: 'Content', color: 'text-sky-600 bg-sky-50' };
  if (r.includes('2fa') || r.includes('2-fa'))
    return { label: '2FA action', icon: <Lock className="h-4 w-4" />, category: 'Security', color: 'text-rose-600 bg-rose-50' };
  if (r.includes('permission'))
    return { label: 'Updated permissions', icon: <Shield className="h-4 w-4" />, category: 'Security', color: 'text-rose-600 bg-rose-50' };
  if (r.includes('registeradmin') || r.includes('adminsign'))
    return { label: 'Admin auth', icon: <Key className="h-4 w-4" />, category: 'Security', color: 'text-rose-600 bg-rose-50' };
  if (m === 'GET')
    return { label: action || 'Viewed data', icon: <Eye className="h-4 w-4" />, category: 'Read', color: 'text-gray-500 bg-gray-50' };
  if (m === 'POST')
    return { label: action || 'Created record', icon: <PlusCircle className="h-4 w-4" />, category: 'Write', color: 'text-indigo-600 bg-indigo-50' };
  if (m === 'DELETE')
    return { label: action || 'Deleted record', icon: <Trash2 className="h-4 w-4" />, category: 'Write', color: 'text-red-600 bg-red-50' };
  return { label: action || 'Admin action', icon: <Settings className="h-4 w-4" />, category: 'Write', color: 'text-gray-600 bg-gray-50' };
}

const ROLE_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  super_admin: 'destructive',
  admin: 'default',
  moderator: 'secondary',
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

function sanitizeBody(body?: Record<string, unknown>): Record<string, unknown> | null {
  if (!body || Object.keys(body).length === 0) return null;
  const hidden = new Set(['password', 'passwordpin', 'pin', 'twoFactorCode', 'token', 'secret', 'otp']);
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, hidden.has(k.toLowerCase()) ? '••••••' : v])
  );
}

// ── Row component ────────────────────────────────────────────────────────────
function LogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getActionMeta(log.route, log.method, log.action);
  const success = log.statusCode < 400;
  const cleanBody = sanitizeBody(log.requestBody);

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50/60 transition-colors">
      <div
        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 cursor-pointer items-start"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Action icon */}
        <div className={`mt-0.5 rounded-lg p-2 shrink-0 ${meta.color}`}>
          {meta.icon}
        </div>

        {/* Main content */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{meta.label}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">{meta.category}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-600 font-medium">{log.adminName || log.adminEmail}</span>
            <Badge variant={ROLE_VARIANTS[log.adminRole] ?? 'secondary'} className="text-[10px] px-1.5 py-0">
              {log.adminRole?.replace('_', ' ')}
            </Badge>
            {log.targetUserEmail && (
              <span className="text-xs text-gray-400">→ {log.targetUserEmail}</span>
            )}
          </div>
          {log.details && (
            <p className="text-xs text-gray-500 mt-0.5 truncate max-w-lg">{log.details}</p>
          )}
        </div>

        {/* Status */}
        <div className="shrink-0 mt-0.5">
          {success
            ? <CheckCircle2 className="h-4 w-4 text-green-500" />
            : <XCircle className="h-4 w-4 text-red-500" />}
        </div>

        {/* Time */}
        <div className="shrink-0 text-right mt-0.5">
          <span className="text-xs text-gray-400 whitespace-nowrap" title={fullDate(log.createdAt)}>
            {relativeTime(log.createdAt)}
          </span>
          <p className="text-[10px] text-gray-300">{log.durationMs}ms</p>
        </div>

        {/* Expand toggle */}
        <div className="shrink-0 mt-0.5 text-gray-300">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-1 bg-gray-50 border-t space-y-3 text-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Admin email</p>
              <p className="text-gray-700 font-medium">{log.adminEmail}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Route</p>
              <p className="font-mono text-gray-600">{log.method} {log.route}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Status code</p>
              <p className={success ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>{log.statusCode}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Timestamp</p>
              <p className="text-gray-600">{fullDate(log.createdAt)}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">IP address</p>
              <p className="font-mono text-gray-600">{log.ipAddress || '—'}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Duration</p>
              <p className="text-gray-600">{log.durationMs}ms</p>
            </div>
            {log.targetUserId && (
              <div>
                <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-0.5">Target user ID</p>
                <p className="font-mono text-gray-600 truncate">{log.targetUserId}</p>
              </div>
            )}
          </div>
          {cleanBody && (
            <div>
              <p className="text-gray-400 uppercase tracking-wide text-[10px] mb-1">Request data</p>
              <pre className="bg-white border rounded p-2 text-gray-700 overflow-x-auto text-[11px] leading-relaxed">
                {JSON.stringify(cleanBody, null, 2)}
              </pre>
            </div>
          )}
          {log.userAgent && (
            <p className="text-gray-400 text-[10px] truncate" title={log.userAgent}>
              <span className="uppercase tracking-wide mr-1">User agent:</span>{log.userAgent}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function AuditLogs() {
  const titleCtx = useContext(DashboardTitleContext);
  const { isSuperAdmin } = usePermissions();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    adminEmail: '', action: '', method: '', adminRole: '', from: '', to: '',
  });

  useEffect(() => {
    titleCtx?.setTitle('Audit Logs');
    titleCtx?.setBreadcrumb(['Audit & Monitoring', 'Audit Logs']);
  }, [titleCtx]);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: pagination.limit };
      if (filters.adminEmail) params.adminEmail = filters.adminEmail;
      if (filters.action)     params.action     = filters.action;
      if (filters.method)     params.method     = filters.method;
      if (filters.adminRole)  params.adminRole  = filters.adminRole;
      if (filters.from)       params.from       = filters.from;
      if (filters.to)         params.to         = filters.to;
      const data = await getAuditLogs(params);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch {
      setError('Failed to load audit logs.');
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
  const handleClear = () => {
    setFilters({ adminEmail: '', action: '', method: '', adminRole: '', from: '', to: '' });
  };

  const successCount = logs.filter(l => l.statusCode < 400).length;
  const failCount = logs.length - successCount;

  return (
    <div className="space-y-4">

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Total logged actions</p>
          <p className="text-2xl font-bold">{pagination.total.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Showing</p>
          <p className="text-2xl font-bold">{logs.length} <span className="text-sm font-normal text-gray-400">of page {pagination.page}/{pagination.pages}</span></p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" /> Successful
          </p>
          <p className="text-2xl font-bold text-green-700">{successCount}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-red-500" /> Failed
          </p>
          <p className="text-2xl font-bold text-red-600">{failCount}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              className="pl-8 h-8 text-sm"
              placeholder="Admin email"
              value={filters.adminEmail}
              onChange={e => handleFilterChange('adminEmail', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Input
            className="h-8 text-sm"
            placeholder="Action keyword"
            value={filters.action}
            onChange={e => handleFilterChange('action', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <select
            className="w-full h-8 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.method}
            onChange={e => handleFilterChange('method', e.target.value)}
          >
            <option value="">All methods</option>
            <option value="GET">GET (view)</option>
            <option value="POST">POST (create)</option>
            <option value="PATCH">PATCH (update)</option>
            <option value="PUT">PUT (update)</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select
            className="w-full h-8 px-3 text-sm border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.adminRole}
            onChange={e => handleFilterChange('adminRole', e.target.value)}
          >
            <option value="">All roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <Input
            type="date"
            className="h-8 text-sm"
            value={filters.from}
            onChange={e => handleFilterChange('from', e.target.value)}
          />
          <Input
            type="date"
            className="h-8 text-sm"
            value={filters.to}
            onChange={e => handleFilterChange('to', e.target.value)}
          />
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

      {/* Activity feed */}
      <Card>
        <CardContent className="p-0">
          {error && <div className="p-4 text-sm text-red-600 border-b">{error}</div>}

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              <span className="text-sm">Loading activity…</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <FileText className="h-8 w-8 mb-2" />
              <p className="text-sm">No audit logs found for the selected filters.</p>
            </div>
          ) : (
            <div>
              {logs.map(log => <LogRow key={log._id} log={log} />)}
            </div>
          )}

          {/* Pagination */}
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
