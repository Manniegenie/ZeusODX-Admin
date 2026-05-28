import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import {
  fetchMinWithdrawals,
  upsertMinWithdrawal,
  toggleMinWithdrawal,
  deleteMinWithdrawal,
} from '@/features/fees/store/minimumWithdrawalSlice';
import type { AppDispatch, RootState } from '@/core/store/store';
import type { MinimumWithdrawalLimit } from '../services/minimumWithdrawalService';

const TOKEN_NETWORKS: Record<string, { code: string; label: string }[]> = {
  BTC:  [{ code: 'BITCOIN',  label: 'Bitcoin (BTC)' }],
  ETH:  [{ code: 'ETHEREUM', label: 'Ethereum (ERC20)' }],
  SOL:  [{ code: 'SOLANA',   label: 'Solana' }],
  USDT: [
    { code: 'TRC20',   label: 'Tron (TRC20)' },
    { code: 'ERC20',   label: 'Ethereum (ERC20)' },
    { code: 'POLYGON', label: 'Polygon (MATIC)' },
    { code: 'BEP20',   label: 'BNB Chain (BEP20)' },
  ],
  USDC: [
    { code: 'ERC20',   label: 'Ethereum (ERC20)' },
    { code: 'POLYGON', label: 'Polygon (MATIC)' },
    { code: 'TRC20',   label: 'Tron (TRC20)' },
  ],
  BNB:  [{ code: 'BEP20',   label: 'BNB Chain (BEP20)' }],
  MATIC:[{ code: 'POLYGON', label: 'Polygon' }],
  TRX:  [{ code: 'TRC20',   label: 'Tron (TRC20)' }],
  TON:  [{ code: 'TON',     label: 'TON' }],
};

const CURRENCIES = Object.keys(TOKEN_NETWORKS);

interface EditingRow {
  currency: string;
  network: string;
  minAmount: string;
  maxAmount: string;
}

export function MinimumWithdrawal() {
  const dispatch = useDispatch<AppDispatch>();
  const titleCtx = useContext(DashboardTitleContext);
  const { limits, loading, saving } = useSelector((state: RootState) => state.minimumWithdrawal);

  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [network, setNetwork] = useState(TOKEN_NETWORKS[CURRENCIES[0]][0].code);
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [networkName, setNetworkName] = useState('');

  const [editingRow, setEditingRow] = useState<EditingRow | null>(null);

  useEffect(() => {
    titleCtx?.setTitle('Minimum Withdrawal Limits');
    titleCtx?.setBreadcrumb(['Fees & Rates', 'Minimum Withdrawal Limits']);
    dispatch(fetchMinWithdrawals());
  }, [dispatch, titleCtx]);

  useEffect(() => {
    const nets = TOKEN_NETWORKS[currency];
    setNetwork(nets[0].code);
    setNetworkName(nets[0].label);
  }, [currency]);

  useEffect(() => {
    const nets = TOKEN_NETWORKS[currency] ?? [];
    const found = nets.find(n => n.code === network);
    if (found) setNetworkName(found.label);
  }, [currency, network]);

  const handleSave = async () => {
    const min = parseFloat(minAmount);
    const max = parseFloat(maxAmount);
    if (!minAmount || isNaN(min) || min < 0) { toast.error('Enter a valid minimum amount'); return; }
    if (!maxAmount || isNaN(max) || max <= 0) { toast.error('Enter a valid maximum amount'); return; }
    if (min >= max) { toast.error('Minimum must be less than maximum'); return; }

    try {
      await dispatch(upsertMinWithdrawal({ currency, network, networkName, minAmount: min, maxAmount: max })).unwrap();
      toast.success(`Limit set for ${currency}/${network}`);
      setMinAmount('');
      setMaxAmount('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save limit');
    }
  };

  const handleRowSave = async (row: EditingRow) => {
    const min = parseFloat(row.minAmount);
    const max = parseFloat(row.maxAmount);
    if (isNaN(min) || min < 0) { toast.error('Invalid minimum amount'); return; }
    if (isNaN(max) || max <= 0) { toast.error('Invalid maximum amount'); return; }
    if (min >= max) { toast.error('Minimum must be less than maximum'); return; }
    try {
      await dispatch(upsertMinWithdrawal({ currency: row.currency, network: row.network, minAmount: min, maxAmount: max })).unwrap();
      toast.success(`Updated ${row.currency}/${row.network}`);
      setEditingRow(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update limit');
    }
  };

  const handleToggle = async (limit: MinimumWithdrawalLimit) => {
    try {
      await dispatch(toggleMinWithdrawal({ currency: limit.currency, network: limit.network, isActive: !limit.isActive })).unwrap();
      toast.success(`${limit.currency}/${limit.network} ${!limit.isActive ? 'enabled' : 'disabled'}`);
    } catch (err) {
      toast.error('Failed to toggle limit');
    }
  };

  const handleDelete = async (limit: MinimumWithdrawalLimit) => {
    if (!confirm(`Delete minimum withdrawal limit for ${limit.currency}/${limit.network}?`)) return;
    try {
      await dispatch(deleteMinWithdrawal({ currency: limit.currency, network: limit.network })).unwrap();
      toast.success(`Deleted ${limit.currency}/${limit.network}`);
    } catch (err) {
      toast.error('Failed to delete limit');
    }
  };

  const isEditing = (limit: MinimumWithdrawalLimit) =>
    editingRow?.currency === limit.currency && editingRow?.network === limit.network;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">

      {/* Add / Update form */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Set withdrawal limit</h3>
          <p className="text-sm text-gray-500">
            Upserts the per-token minimum and maximum withdrawal amounts enforced on the backend.
            If an entry already exists for the selected token/network it will be overwritten.
          </p>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="space-y-1">
              <Label>Token</Label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Network</Label>
              <select
                value={network}
                onChange={e => setNetwork(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                {(TOKEN_NETWORKS[currency] ?? []).map(n => (
                  <option key={n.code} value={n.code}>{n.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label>Min amount ({currency})</Label>
              <input
                type="number"
                value={minAmount}
                onChange={e => setMinAmount(e.target.value)}
                placeholder="e.g. 0.001"
                step="any"
                min="0"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label>Max amount ({currency})</Label>
              <input
                type="number"
                value={maxAmount}
                onChange={e => setMaxAmount(e.target.value)}
                placeholder="e.g. 10"
                step="any"
                min="0"
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-1 text-sm"
              />
            </div>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save limit'}
          </Button>
        </CardContent>
      </Card>

      {/* Table of existing limits */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Configured limits</h3>
            <Button variant="outline" size="sm" onClick={() => dispatch(fetchMinWithdrawals())} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading limits...</p>
          ) : limits.length === 0 ? (
            <p className="text-sm text-gray-500">No limits configured. Add one above.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500 text-xs uppercase tracking-wide">
                    <th className="py-3 pr-4">Token</th>
                    <th className="py-3 pr-4">Network</th>
                    <th className="py-3 pr-4">Min</th>
                    <th className="py-3 pr-4">Max</th>
                    <th className="py-3 pr-4">Active</th>
                    <th className="py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {limits.map(limit => (
                    <tr key={`${limit.currency}-${limit.network}`} className="align-middle">
                      <td className="py-3 pr-4 font-medium">{limit.currency}</td>
                      <td className="py-3 pr-4 text-gray-600">{limit.networkName || limit.network}</td>

                      {isEditing(limit) ? (
                        <>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              value={editingRow!.minAmount}
                              onChange={e => setEditingRow(r => r && ({ ...r, minAmount: e.target.value }))}
                              step="any"
                              className="w-28 h-8 rounded border border-input px-2 text-sm"
                            />
                          </td>
                          <td className="py-2 pr-4">
                            <input
                              type="number"
                              value={editingRow!.maxAmount}
                              onChange={e => setEditingRow(r => r && ({ ...r, maxAmount: e.target.value }))}
                              step="any"
                              className="w-28 h-8 rounded border border-input px-2 text-sm"
                            />
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="py-3 pr-4">{limit.minAmount}</td>
                          <td className="py-3 pr-4">{limit.maxAmount}</td>
                        </>
                      )}

                      <td className="py-3 pr-4">
                        <Switch
                          checked={limit.isActive}
                          onCheckedChange={() => handleToggle(limit)}
                        />
                      </td>

                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {isEditing(limit) ? (
                            <>
                              <Button size="sm" onClick={() => handleRowSave(editingRow!)} disabled={saving}>
                                Save
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => setEditingRow(null)}>
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingRow({
                                  currency: limit.currency,
                                  network: limit.network,
                                  minAmount: String(limit.minAmount),
                                  maxAmount: String(limit.maxAmount),
                                })}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => handleDelete(limit)}
                              >
                                Delete
                              </Button>
                            </>
                          )}
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

      <Card>
        <CardContent className="p-6 space-y-2 text-sm text-gray-600">
          <h3 className="text-base font-semibold text-gray-900">How this works</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Limits are stored in the database and enforced by the backend on every withdrawal request.</li>
            <li>Toggling a limit inactive disables enforcement for that token/network without deleting the record.</li>
            <li>If no limit is configured for a token/network combination, the backend will allow any positive amount.</li>
            <li>Min and max amounts are in native token units (e.g. BTC, ETH) — not USD.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default MinimumWithdrawal;
