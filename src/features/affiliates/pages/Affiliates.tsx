import { useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Copy, KeyRound, Megaphone, Plus, RefreshCw, Users } from 'lucide-react';
import type { RootState } from '@/core/store/store';
import {
  affiliatesService,
  dashboardUrl,
  type Affiliate,
  type CreatedAffiliate,
} from '../services/affiliatesService';

const MIN_PASSWORD = 6;

function apiError(err: unknown, fallback: string): string {
  const data = (err as { response?: { data?: { message?: string; error?: string } } })?.response?.data;
  return data?.message || data?.error || fallback;
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  } catch {
    toast.error(`Could not copy ${label.toLowerCase()}`);
  }
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-NG', { dateStyle: 'medium', timeStyle: 'short' });
}

export function Affiliates() {
  const titleCtx = useContext(DashboardTitleContext);
  const { user } = useSelector((state: RootState) => state.auth);
  const isSuperAdmin = user?.role === 'super_admin';

  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);

  // Create form
  const [campaignerName, setCampaignerName] = useState('');
  const [password, setPassword] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [creating, setCreating] = useState(false);
  // Shown once after creation - the password can't be retrieved later.
  const [created, setCreated] = useState<{ affiliate: CreatedAffiliate; password: string } | null>(null);

  // Row actions
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<Affiliate | null>(null);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    titleCtx?.setTitle('Affiliates');
    titleCtx?.setBreadcrumb(['Affiliates']);
  }, [titleCtx]);

  const load = async () => {
    setLoading(true);
    try {
      setAffiliates(await affiliatesService.list());
    } catch (err) {
      toast.error(apiError(err, 'Failed to load affiliates'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) load();
  }, [isSuperAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignerName.trim()) return toast.error('Campaigner name is required');
    if (password.length < MIN_PASSWORD) return toast.error(`Password must be at least ${MIN_PASSWORD} characters`);

    setCreating(true);
    try {
      const affiliate = await affiliatesService.create({
        campaignerName: campaignerName.trim(),
        password,
        slug: slug.trim() || undefined,
        code: code.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setCreated({ affiliate, password });
      setCampaignerName('');
      setPassword('');
      setSlug('');
      setCode('');
      setNotes('');
      toast.success('Affiliate campaign created');
      load();
    } catch (err) {
      toast.error(apiError(err, 'Failed to create affiliate'));
    } finally {
      setCreating(false);
    }
  };

  const toggleStatus = async (a: Affiliate) => {
    const next = a.status === 'active' ? 'disabled' : 'active';
    if (next === 'disabled' && !window.confirm(`Disable ${a.campaignerName}? They'll be signed out and can't log in to their dashboard.`)) return;
    setBusyId(a.id);
    try {
      await affiliatesService.setStatus(a.id, next);
      setAffiliates((list) => list.map((x) => (x.id === a.id ? { ...x, status: next } : x)));
      toast.success(next === 'active' ? 'Affiliate enabled' : 'Affiliate disabled');
    } catch (err) {
      toast.error(apiError(err, 'Failed to update status'));
    } finally {
      setBusyId(null);
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    if (newPassword.length < MIN_PASSWORD) return toast.error(`Password must be at least ${MIN_PASSWORD} characters`);
    setBusyId(resetTarget.id);
    try {
      await affiliatesService.resetPassword(resetTarget.id, newPassword);
      toast.success(`Password reset for ${resetTarget.campaignerName}`);
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      toast.error(apiError(err, 'Failed to reset password'));
    } finally {
      setBusyId(null);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center text-gray-500">Affiliates are managed by super admins only.</CardContent>
        </Card>
      </div>
    );
  }

  const totalSignups = affiliates.reduce((sum, a) => sum + a.signupCount, 0);
  const activeCount = affiliates.filter((a) => a.status === 'active').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Affiliates</h1>
          <p className="text-sm text-gray-500">Campaign codes, campaigner dashboards, and the sign-ups they bring in</p>
        </div>
        <Button onClick={load} disabled={loading} variant="outline" className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Megaphone className="h-3.5 w-3.5" /> Campaigns
            </p>
            <p className="text-2xl font-bold text-gray-900">{affiliates.length}</p>
            <p className="text-xs text-gray-500">{activeCount} active</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 space-y-1">
            <p className="text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> Referred sign-ups
            </p>
            <p className="text-2xl font-bold text-gray-900">{totalSignups.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Across all campaigns</p>
          </CardContent>
        </Card>
      </div>

      {/* Create */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Plus className="h-5 w-5 text-blue-600" />
            New campaign
          </CardTitle>
          <CardDescription>
            Leave slug and code blank to generate them. Share the code and the dashboard link + password with the campaigner.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="aff-name">Campaigner name *</Label>
              <Input id="aff-name" value={campaignerName} onChange={(e) => setCampaignerName(e.target.value)} placeholder="e.g. Ade Johnson" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aff-password">Dashboard password *</Label>
              <Input
                id="aff-password"
                type="text"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={`At least ${MIN_PASSWORD} characters`}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aff-slug">Slug (optional)</Label>
              <Input id="aff-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Derived from the name" />
              <p className="text-xs text-gray-500">Dashboard: {dashboardUrl(`/affiliate/${slug.trim() || '<slug>'}`)}</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="aff-code">Code (optional)</Label>
              <Input id="aff-code" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Auto-generated" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label htmlFor="aff-notes">Notes (optional)</Label>
              <Textarea id="aff-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={creating}>
                {creating ? 'Creating…' : 'Create campaign'}
              </Button>
            </div>
          </form>

          {created && (
            <div className="mt-6 p-4 rounded-lg border border-green-200 bg-green-50 space-y-2 text-sm">
              <p className="font-semibold text-green-800">
                {created.affiliate.campaignerName}'s campaign is live. Copy these now - the password can't be shown again.
              </p>
              {[
                { label: 'Code', value: created.affiliate.code },
                { label: 'Dashboard link', value: dashboardUrl(created.affiliate.dashboardPath) },
                { label: 'Password', value: created.password },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <span className="w-32 text-gray-600">{row.label}</span>
                  <span className="font-mono text-gray-900 break-all">{row.value}</span>
                  <Button type="button" size="icon" variant="ghost" onClick={() => copy(row.value, row.label)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setCreated(null)}>
                Done
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Campaigns</CardTitle>
          <CardDescription>Sign-up counts are live</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading && affiliates.length === 0 ? (
            <div className="flex items-center justify-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : affiliates.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No campaigns yet</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-gray-500 uppercase tracking-wide text-xs">
                    <th className="py-3 px-4 text-left">Campaigner</th>
                    <th className="py-3 px-4 text-left">Code</th>
                    <th className="py-3 px-4 text-left">Dashboard</th>
                    <th className="py-3 px-4 text-right">Sign-ups</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Last login</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {affiliates.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{a.campaignerName}</div>
                        <div className="text-xs text-gray-500">Created {formatDate(a.createdAt)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => copy(a.code, 'Code')}
                          className="font-mono text-gray-700 hover:text-blue-600 inline-flex items-center gap-1"
                          title="Copy code"
                        >
                          {a.code} <Copy className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          onClick={() => copy(dashboardUrl(a.dashboardPath), 'Dashboard link')}
                          className="text-gray-700 hover:text-blue-600 inline-flex items-center gap-1"
                          title="Copy dashboard link"
                        >
                          {a.dashboardPath} <Copy className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-gray-900">{a.signupCount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            a.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{formatDate(a.lastLoginAt)}</td>
                      <td className="py-3 px-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busyId === a.id}
                            onClick={() => {
                              setResetTarget(a);
                              setNewPassword('');
                            }}
                          >
                            <KeyRound className="h-3.5 w-3.5 mr-1" /> Reset password
                          </Button>
                          <Button
                            size="sm"
                            variant={a.status === 'active' ? 'destructive' : 'default'}
                            disabled={busyId === a.id}
                            onClick={() => toggleStatus(a)}
                          >
                            {a.status === 'active' ? 'Disable' : 'Enable'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Reset dashboard password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetTarget?.campaignerName}. Anyone currently logged in to their dashboard is signed out.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="aff-new-password">New password</Label>
            <Input
              id="aff-new-password"
              type="text"
              autoComplete="off"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={`At least ${MIN_PASSWORD} characters`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetTarget(null)}>Cancel</Button>
            <Button onClick={handleResetPassword} disabled={busyId === resetTarget?.id}>
              Reset password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
