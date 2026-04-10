import { useContext, useEffect, useState, useCallback } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { usePermissions } from '@/core/hooks/usePermissions';
import { getAuditLogs, type AuditLog } from '../services/auditService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

const METHOD_COLORS: Record<string, string> = {
  GET:    'bg-blue-100 text-blue-700',
  POST:   'bg-green-100 text-green-700',
  PATCH:  'bg-yellow-100 text-yellow-700',
  PUT:    'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
};

const ROLE_COLORS: Record<string, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin:       'bg-blue-100 text-blue-700',
  moderator:   'bg-gray-100 text-gray-700',
};

function StatusBadge({ code }: { code: number }) {
  const color = code < 300 ? 'bg-green-100 text-green-700'
    : code < 400 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-700';
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{code}</span>;
}

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${color}`}>{label}</span>;
}

export function AuditLogs() {
  const titleCtx = useContext(DashboardTitleContext);
  const { isSuperAdmin } = usePermissions();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 50, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    adminEmail: '',
    action: '',
    method: '',
    adminRole: '',
    from: '',
    to: '',
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
      if (filters.method)     params.method      = filters.method;
      if (filters.adminRole)  params.adminRole   = filters.adminRole;
      if (filters.from)       params.from        = filters.from;
      if (filters.to)         params.to          = filters.to;

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => fetchLogs(1);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'medium' });

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs text-gray-500">Total Logs</p>
          <p className="text-2xl font-bold">{pagination.total.toLocaleString()}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Current Page</p>
          <p className="text-2xl font-bold">{pagination.page} / {pagination.pages}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Showing</p>
          <p className="text-2xl font-bold">{logs.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-gray-500">Per Page</p>
          <p className="text-2xl font-bold">{pagination.limit}</p>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              className="w-full pl-8 pr-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Admin email"
              value={filters.adminEmail}
              onChange={e => handleFilterChange('adminEmail', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <input
            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Action"
            value={filters.action}
            onChange={e => handleFilterChange('action', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <select
            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            value={filters.method}
            onChange={e => handleFilterChange('method', e.target.value)}
          >
            <option value="">All methods</option>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
          </select>
          <select
            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            value={filters.adminRole}
            onChange={e => handleFilterChange('adminRole', e.target.value)}
          >
            <option value="">All roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
          </select>
          <input
            type="date"
            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.from}
            onChange={e => handleFilterChange('from', e.target.value)}
          />
          <input
            type="date"
            className="w-full px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
            value={filters.to}
            onChange={e => handleFilterChange('to', e.target.value)}
          />
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="sm" onClick={handleSearch} disabled={loading}>
            <Search className="w-3.5 h-3.5 mr-1.5" />
            Search
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            setFilters({ adminEmail: '', action: '', method: '', adminRole: '', from: '', to: '' });
          }}>
            Clear
          </Button>
          <Button size="sm" variant="outline" onClick={() => fetchLogs(pagination.page)} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {error && (
          <div className="p-4 text-sm text-red-600 border-b">{error}</div>
        )}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Timestamp</TableHead>
                <TableHead className="text-xs">Admin</TableHead>
                <TableHead className="text-xs">Role</TableHead>
                <TableHead className="text-xs">Method</TableHead>
                <TableHead className="text-xs">Action</TableHead>
                <TableHead className="text-xs">Route</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">IP</TableHead>
                <TableHead className="text-xs">ms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-sm text-gray-400">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-sm text-gray-400">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map(log => (
                  <TableRow key={log._id} className="text-xs">
                    <TableCell className="whitespace-nowrap text-gray-500">
                      {formatDate(log.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{log.adminName || '—'}</div>
                      <div className="text-gray-400">{log.adminEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge label={log.adminRole || '—'} color={ROLE_COLORS[log.adminRole] || 'bg-gray-100 text-gray-600'} />
                    </TableCell>
                    <TableCell>
                      <Badge label={log.method} color={METHOD_COLORS[log.method] || 'bg-gray-100 text-gray-600'} />
                    </TableCell>
                    <TableCell className="font-medium max-w-[160px] truncate" title={log.action}>
                      {log.action}
                    </TableCell>
                    <TableCell className="text-gray-500 max-w-[180px] truncate font-mono" title={log.route}>
                      {log.route}
                    </TableCell>
                    <TableCell>
                      <StatusBadge code={log.statusCode} />
                    </TableCell>
                    <TableCell className="text-gray-500 font-mono">{log.ipAddress}</TableCell>
                    <TableCell className="text-gray-500">{log.durationMs}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <p className="text-xs text-gray-500">
              {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page <= 1 || loading}
                onClick={() => fetchLogs(pagination.page - 1)}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={pagination.page >= pagination.pages || loading}
                onClick={() => fetchLogs(pagination.page + 1)}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
