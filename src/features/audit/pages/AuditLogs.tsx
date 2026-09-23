import { useContext, useEffect, useState, useCallback, useRef } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { usePermissions } from '@/core/hooks/usePermissions';
import { getAuditLogs, getAuditBreakdown, type AuditLog, type AuditBreakdownCategory } from '../services/auditService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search, RefreshCw, ChevronLeft, ChevronRight,
  UserCog, DollarSign, Shield, Settings,
  Eye, Trash2, PlusCircle, ShieldAlert,
  CheckCircle2, XCircle, ChevronDown, ChevronUp,
  Wallet, Bell, FileText, Users, Gift, Percent,
  TrendingUp, HeartHandshake, ClipboardList,
} from 'lucide-react';

// ── Category presentation — matches the backend's deriveCategory() exactly ──
type CategoryMeta = { icon: React.ReactNode; color: string };

const CATEGORY_META: Record<string, CategoryMeta> = {
  'User Management':        { icon: <Users className="h-4 w-4" />,          color: 'text-blue-600 bg-blue-50' },
  'Funding':                { icon: <DollarSign className="h-4 w-4" />,     color: 'text-emerald-600 bg-emerald-50' },
  'Fees & Rates':           { icon: <Percent className="h-4 w-4" />,        color: 'text-violet-600 bg-violet-50' },
  'KYC':                    { icon: <UserCog className="h-4 w-4" />,        color: 'text-cyan-600 bg-cyan-50' },
  'Security':               { icon: <ShieldAlert className="h-4 w-4" />,    color: 'text-rose-600 bg-rose-50' },
  'Admin Accounts':         { icon: <Shield className="h-4 w-4" />,         color: 'text-red-600 bg-red-50' },
  'Content':                { icon: <FileText className="h-4 w-4" />,      color: 'text-sky-600 bg-sky-50' },
  'Notifications':          { icon: <Bell className="h-4 w-4" />,          color: 'text-amber-600 bg-amber-50' },
  'Gift Cards':             { icon: <Gift className="h-4 w-4" />,          color: 'text-pink-600 bg-pink-50' },
  'Wallets':                { icon: <Wallet className="h-4 w-4" />,        color: 'text-indigo-600 bg-indigo-50' },
  'Transactions':           { icon: <ClipboardList className="h-4 w-4" />, color: 'text-slate-600 bg-slate-100' },
  'Analytics':              { icon: <TrendingUp className="h-4 w-4" />,    color: 'text-teal-600 bg-teal-50' },
  'Referrals':              { icon: <HeartHandshake className="h-4 w-4" />,color: 'text-orange-600 bg-orange-50' },
  'Withdrawal Risk Review': { icon: <ShieldAlert className="h-4 w-4" />,    color: 'text-red-700 bg-red-50' },
  'Audit':                  { icon: <ClipboardList className="h-4 w-4" />, color: 'text-gray-600 bg-gray-100' },
  'Other':                  { icon: <Settings className="h-4 w-4" />,      color: 'text-gray-500 bg-gray-50' },
};

function getCategoryMeta(category?: string): CategoryMeta {
  return CATEGORY_META[category || 'Other'] ?? CATEGORY_META.Other;
}

function methodIcon(method: string) {
  const m = method.toUpperCase();
  if (m === 'GET') return <Eye className="h-3 w-3" />;
  if (m === 'DELETE') return <Trash2 className="h-3 w-3" />;
  if (m === 'POST') return <PlusCircle className="h-3 w-3" />;
  return <Settings className="h-3 w-3" />;
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
  const hidden = new Set(['password', 'passwordpin', 'pin', 'twofactorcode', 'token', 'secret', 'otp']);
  return Object.fromEntries(
    Object.entries(body).map(([k, v]) => [k, hidden.has(k.toLowerCase()) ? '••••••' : v])
  );
}

// ── Breakdown panel ──────────────────────────────────────────────────────────
function BreakdownPanel({
  categories,
  activeCategory,
  onSelectCategory,
}: {
  categories: AuditBreakdownCategory[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

  if (categories.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">Activity by category</h3>
          <span className="text-xs text-gray-400">{grandTotal.toLocaleString()} total actions · click a card to filter the list below</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {categories.map(cat => {
            const name = cat._id || 'Other';
            const meta = getCategoryMeta(name);
            const pct = grandTotal ? Math.round((cat.total / grandTotal) * 100) : 0;
            const isOpen = expanded === name;
            const isActive = activeCategory === name;
            return (
              <div
                key={name}
                className={`text-left rounded-lg border p-3 transition-colors cursor-pointer hover:bg-gray-50/80 ${isActive ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                onClick={() => onSelectCategory(isActive ? '' : name)}
              >
                <div className="flex items-center justify-between">
                  <span className={`rounded-md p-1.5 ${meta.color}`}>{meta.icon}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{pct}%</span>
                    <button
                      type="button"
                      className="text-gray-300 hover:text-gray-600"
                      title="Preview top actions"
                      onClick={e => { e.stopPropagation(); setExpanded(isOpen ? null : name); }}
                    >
                      {isOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <p className="text-sm font-semibold text-gray-900 mt-2">{name}</p>
                <p className="text-xs text-gray-500">{cat.total.toLocaleString()} actions · last {relativeTime(cat.lastAt)}</p>
                {isOpen && (
                  <div className="mt-2 pt-2 border-t space-y-1" onClick={e => e.stopPropagation()}>
                    {cat.actions.slice(0, 6).map(a => (
                      <div key={a.action} className="flex items-center justify-between text-[11px] text-gray-600">
                        <span className="truncate mr-2">{a.action}</span>
                        <span className="text-gray-400 shrink-0">{a.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Row component ────────────────────────────────────────────────────────────
function LogRow({ log }: { log: AuditLog }) {
  const [expanded, setExpanded] = useState(false);
  const meta = getCategoryMeta(log.category);
  const success = log.statusCode < 400;
  const cleanBody = sanitizeBody(log.requestBody);

  return (
    <div className="border-b last:border-b-0 hover:bg-gray-50/60 transition-colors">
      <div
        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 cursor-pointer items-start"
        onClick={() => setExpanded(e => !e)}
      >
        {/* Category icon */}
        <div className={`mt-0.5 rounded-lg p-2 shrink-0 ${meta.color}`}>
          {meta.icon}
        </div>

        {/* Main content */}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900">{log.action}</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{log.category || 'Other'}</Badge>
            <span className="text-gray-300">{methodIcon(log.method)}</span>
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
  const [breakdown, setBreakdown] = useState<AuditBreakdownCategory[]>([]);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const [filters, setFilters] = useState({
    adminEmail: '', action: '', method: '', adminRole: '', category: '', from: '', to: '',
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
      if (filters.category)   params.category   = filters.category;
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

  const fetchBreakdown = useCallback(async () => {
    setBreakdownLoading(true);
    try {
      const data = await getAuditBreakdown(filters.from || filters.to ? { from: filters.from, to: filters.to } : undefined);
      setBreakdown(data.byCategory || []);
    } catch {
      // Non-critical — the log list still works without the breakdown panel.
    } finally {
      setBreakdownLoading(false);
    }
  }, [filters.from, filters.to]);

  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs(1);
      fetchBreakdown();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin]);

  // Category clicks from the breakdown panel filter immediately, unlike the
  // other filters which wait for the explicit Search button. Skips the
  // initial mount — that fetch is already handled by the effect above.
  const isFirstCategoryRender = useRef(true);
  useEffect(() => {
    if (isFirstCategoryRender.current) {
      isFirstCategoryRender.current = false;
      return;
    }
    if (isSuperAdmin) fetchLogs(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.category]);

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 text-sm">Access denied. Super admin only.</p>
      </div>
    );
  }

  const handleFilterChange = (key: string, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }));

  const handleSearch = () => { fetchLogs(1); fetchBreakdown(); };
  const handleClear = () => {
    setFilters({ adminEmail: '', action: '', method: '', adminRole: '', category: '', from: '', to: '' });
  };
  const handleCategoryClick = (category: string) => {
    setFilters(prev => ({ ...prev, category }));
  };

  const successCount = logs.filter(l => l.statusCode < 400).length;
  const failCount = logs.length - successCount;

  return (
    <div className="space-y-4">

      {/* Breakdown by category */}
      {breakdownLoading && breakdown.length === 0 ? (
        <Card><CardContent className="p-4 text-xs text-gray-400">Loading breakdown…</CardContent></Card>
      ) : (
        <BreakdownPanel categories={breakdown} activeCategory={filters.category} onSelectCategory={handleCategoryClick} />
      )}

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
            <XCircle className="h-3 w-3 text-red-500" /> Failed
          </p>
          <p className="text-2xl font-bold text-red-600">{failCount}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
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
            value={filters.category}
            onChange={e => handleFilterChange('category', e.target.value)}
          >
            <option value="">All categories</option>
            {Object.keys(CATEGORY_META).filter(c => c !== 'Other').map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="Other">Other</option>
          </select>
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
        {filters.category && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xs text-gray-400">Filtering by:</span>
            <Badge variant="outline" className="text-xs cursor-pointer" onClick={() => handleCategoryClick(filters.category)}>
              {filters.category} ✕
            </Badge>
          </div>
        )}
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={handleSearch} disabled={loading}>
            <Search className="w-3.5 h-3.5 mr-1.5" /> Search
          </Button>
          <Button size="sm" variant="outline" onClick={handleClear}>Clear</Button>
          <Button size="sm" variant="outline" onClick={() => { fetchLogs(pagination.page); fetchBreakdown(); }} disabled={loading}>
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
