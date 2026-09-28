import { useContext, useEffect, useState, useCallback } from 'react';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  RefreshCw, ChevronLeft, ChevronRight, AlertTriangle,
  CheckCircle2, XCircle, Wallet, Landmark, Percent,
} from 'lucide-react';
import {
  getWalletBalance, getReconciliation, getVirtualAccounts, deactivateVirtualAccount,
  getDepositFee, updateDepositFee,
  type WalletBalance, type ReconciledDeposit, type VirtualAccountRow, type DepositFeeConfig,
} from '../services/depositsService';

function formatNaira(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '—';
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

// ── Wallet balance summary ──────────────────────────────────────────────────
function WalletBalanceCard() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWalletBalance();
      setBalance(data);
    } catch {
      setError('Failed to load Glyde wallet balance.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="rounded-md p-1.5 bg-emerald-50 text-emerald-600"><Wallet className="h-4 w-4" /></span>
          <p className="text-sm font-medium text-gray-500">Glyde Wallet Balance</p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchBalance} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      {error ? (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      ) : (
        <p className="text-3xl font-bold mt-2">
          {loading && !balance ? '…' : balance ? formatNaira(balance.balance) : '—'}
          {balance && <span className="text-sm font-normal text-gray-400 ml-2">{balance.currency}</span>}
        </p>
      )}
      <p className="text-xs text-gray-400 mt-1">Live from Glyde — the funds available to settle deposits.</p>
    </Card>
  );
}

// ── Reconciliation tab ──────────────────────────────────────────────────────
function ReconciliationTab() {
  const [data, setData] = useState<ReconciledDeposit[]>([]);
  const [uncreditedCount, setUncreditedCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getReconciliation({ page: p, limit: 20 });
      setData(res.transactions);
      setUncreditedCount(res.uncreditedCount);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      setError('Failed to load reconciliation data from Glyde.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  return (
    <div className="space-y-4">
      {uncreditedCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-800">
            <strong>{uncreditedCount}</strong> deposit{uncreditedCount === 1 ? '' : 's'} on this page {uncreditedCount === 1 ? 'is' : 'are'} confirmed by Glyde but not yet credited to a user — check the webhook is registered and working.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {error && <div className="p-4 text-sm text-red-600 border-b">{error}</div>}
          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400">
              <RefreshCw className="h-5 w-5 animate-spin mr-2" /><span className="text-sm">Loading from Glyde…</span>
            </div>
          ) : data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <Landmark className="h-8 w-8 mb-2" />
              <p className="text-sm">No deposit transactions found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-2 font-medium">Date</th>
                    <th className="px-4 py-2 font-medium">Amount</th>
                    <th className="px-4 py-2 font-medium">Fee</th>
                    <th className="px-4 py-2 font-medium">User</th>
                    <th className="px-4 py-2 font-medium">Glyde Status</th>
                    <th className="px-4 py-2 font-medium">Credited</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, i) => row.error ? (
                    <tr key={`err-${row.virtualAccountUid}-${i}`} className="border-b last:border-0 bg-red-50/60">
                      <td className="px-4 py-3 text-gray-500" colSpan={3}>—</td>
                      <td className="px-4 py-3">
                        {row.user ? (
                          <div>
                            <p className="font-medium">{row.user.name || '—'}</p>
                            <p className="text-xs text-gray-400">{row.user.email}</p>
                          </div>
                        ) : <span className="text-gray-400">Unmatched</span>}
                        <p className="text-xs text-gray-400">{row.accountNumber}</p>
                      </td>
                      <td className="px-4 py-3 text-red-600 text-xs" colSpan={2}>{row.error}</td>
                    </tr>
                  ) : (
                    <tr key={`${row.virtualAccountUid}-${row.glydeReference || i}`} className={`border-b last:border-0 ${!row.credited && row.status !== 'failed' ? 'bg-amber-50/60' : ''}`}>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{formatDate(row.createdAt ?? null)}</td>
                      <td className="px-4 py-3 font-medium">{formatNaira(row.amount ?? null)}</td>
                      <td className="px-4 py-3 text-gray-500">{row.fee ? formatNaira(row.fee) : '—'}</td>
                      <td className="px-4 py-3">
                        {row.user ? (
                          <div>
                            <p className="font-medium">{row.user.name || '—'}</p>
                            <p className="text-xs text-gray-400">{row.user.email}</p>
                          </div>
                        ) : <span className="text-gray-400">Unmatched</span>}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs capitalize">{row.status || 'unknown'}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {row.credited ? (
                          <span className="inline-flex items-center gap-1 text-green-700 text-xs font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Credited
                          </span>
                        ) : row.status === 'failed' ? (
                          <span className="text-xs text-gray-400">N/A (failed)</span>
                        ) : (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 text-red-600 text-xs font-medium">
                              <XCircle className="h-3.5 w-3.5" /> Not credited
                            </span>
                            {row.blockedReason === 'name_mismatch' && (
                              <span className="text-[10px] text-red-500 font-semibold uppercase tracking-wide">Sender name mismatch</span>
                            )}
                            {row.blockedReason === 'fee_shortfall' && (
                              <span className="text-[10px] text-gray-400">Amount below fee</span>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button size="sm" variant="outline" onClick={() => fetchData(page)} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => fetchData(page - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs px-3 py-1.5 text-gray-500">Page {page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={loading || page >= totalPages} onClick={() => fetchData(page + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Virtual Accounts tab ────────────────────────────────────────────────────
function VirtualAccountsTab() {
  const [data, setData] = useState<VirtualAccountRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deactivatingUid, setDeactivatingUid] = useState<string | null>(null);

  const fetchData = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await getVirtualAccounts({ page: p, limit: 25 });
      setData(res.accounts);
      setPage(res.page);
      setTotalPages(res.totalPages);
    } catch {
      setError('Failed to load virtual accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(1); }, [fetchData]);

  const handleDeactivate = async (uid: string) => {
    if (!confirm('Deactivate this virtual account? The user will need a new one to keep receiving bank-transfer deposits.')) return;
    setDeactivatingUid(uid);
    try {
      await deactivateVirtualAccount(uid);
      toast.success('Virtual account deactivated');
      fetchData(page);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate');
    } finally {
      setDeactivatingUid(null);
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        {error && <div className="p-4 text-sm text-red-600 border-b">{error}</div>}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <RefreshCw className="h-5 w-5 animate-spin mr-2" /><span className="text-sm">Loading…</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <Landmark className="h-8 w-8 mb-2" />
            <p className="text-sm">No virtual accounts created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500 uppercase tracking-wide">
                  <th className="px-4 py-2 font-medium">User</th>
                  <th className="px-4 py-2 font-medium">Account Number</th>
                  <th className="px-4 py-2 font-medium">Bank</th>
                  <th className="px-4 py-2 font-medium">Status</th>
                  <th className="px-4 py-2 font-medium">Created</th>
                  <th className="px-4 py-2 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((a) => (
                  <tr key={a.uid} className="border-b last:border-0">
                    <td className="px-4 py-3">
                      {a.user ? (
                        <div>
                          <p className="font-medium">{a.user.name || '—'}</p>
                          <p className="text-xs text-gray-400">{a.user.email}</p>
                        </div>
                      ) : <span className="text-gray-400">Unknown user</span>}
                    </td>
                    <td className="px-4 py-3 font-mono">{a.accountNumber}</td>
                    <td className="px-4 py-3">{a.bankName || '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.status === 'active' ? 'default' : 'secondary'} className="text-xs capitalize">{a.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(a.createdAt)}</td>
                    <td className="px-4 py-3">
                      {a.status === 'active' && (
                        <Button
                          size="sm" variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => handleDeactivate(a.uid)}
                          disabled={deactivatingUid === a.uid}
                        >
                          {deactivatingUid === a.uid ? 'Deactivating…' : 'Deactivate'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <Button size="sm" variant="outline" onClick={() => fetchData(page)} disabled={loading}>
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => fetchData(page - 1)}>
                <ChevronLeft className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs px-3 py-1.5 text-gray-500">{page} / {totalPages}</span>
              <Button size="sm" variant="outline" disabled={page >= totalPages || loading} onClick={() => fetchData(page + 1)}>
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Fee Settings tab ────────────────────────────────────────────────────────
function FeeSettingsTab() {
  const [fee, setFee] = useState<DepositFeeConfig | null>(null);
  const [feeInput, setFeeInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchFee = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDepositFee();
      setFee(data);
      setFeeInput(String(data.feeAmount));
    } catch {
      toast.error('Failed to load deposit fee configuration');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchFee(); }, [fetchFee]);

  const handleSave = async () => {
    const parsed = Number(feeInput);
    if (isNaN(parsed) || parsed < 0) {
      toast.error('Fee must be a non-negative number');
      return;
    }
    setSaving(true);
    try {
      const updated = await updateDepositFee(parsed);
      setFee(updated);
      toast.success('Deposit fee updated');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update fee');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-6 max-w-lg">
      <div className="flex items-center gap-2 mb-1">
        <span className="rounded-md p-1.5 bg-violet-50 text-violet-600"><Percent className="h-4 w-4" /></span>
        <h3 className="font-semibold">Flat Deposit Fee</h3>
      </div>
      <p className="text-sm text-gray-500 mb-4">
        Deducted from every confirmed Glyde deposit before it's credited to the user's NGNZ balance — accounts for Glyde's own fixed per-deposit charge.
      </p>

      {loading ? (
        <p className="text-sm text-gray-400">Loading…</p>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="feeAmount">Fee Amount (₦)</Label>
            <Input
              id="feeAmount"
              type="number"
              min="0"
              step="1"
              value={feeInput}
              onChange={(e) => setFeeInput(e.target.value)}
              className="w-40"
            />
          </div>
          {fee && (
            <p className="text-xs text-gray-400 mt-2">
              Last updated by {fee.updatedBy} on {formatDate(fee.updatedAt)}
            </p>
          )}
          <Button className="mt-4" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Fee'}
          </Button>
        </>
      )}
    </Card>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function Deposits() {
  const titleCtx = useContext(DashboardTitleContext);

  useEffect(() => {
    titleCtx?.setTitle('Deposits');
    titleCtx?.setBreadcrumb(['Deposits']);
  }, [titleCtx]);

  return (
    <div className="space-y-4">
      <WalletBalanceCard />

      <Tabs defaultValue="reconciliation">
        <TabsList>
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="virtual-accounts">Virtual Accounts</TabsTrigger>
          <TabsTrigger value="fee">Fee Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="reconciliation" className="mt-4">
          <ReconciliationTab />
        </TabsContent>
        <TabsContent value="virtual-accounts" className="mt-4">
          <VirtualAccountsTab />
        </TabsContent>
        <TabsContent value="fee" className="mt-4">
          <FeeSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
