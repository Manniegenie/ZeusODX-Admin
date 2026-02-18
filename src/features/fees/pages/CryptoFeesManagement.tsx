import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { fetchCryptoFees, updateCryptoFee, updateCryptoNetworkName, deleteCryptoFee } from '../store/cryptoFeeSlice';
import type { AppDispatch, RootState } from '@/core/store/store';
import type { CryptoFee } from '../type/fee';
import { toast } from 'sonner';
import { DEPOSIT_NETWORK_OPTIONS } from '../constants/networks';

export function CryptoFeesManagement() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { fees, loading, error } = useSelector((state: RootState) => state.cryptoFee);
  const titleCtx = useContext(DashboardTitleContext);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [filterNetwork, setFilterNetwork] = useState('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<CryptoFee | null>(null);
  const [formData, setFormData] = useState({
    currency: '',
    network: '',
    networkName: '',
    networkFee: ''
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const uniqueCurrencies = [...new Set(fees.map(fee => fee.currency))].sort();
  const uniqueNetworks = [...new Set(fees.map(fee => fee.network))].sort();

  useEffect(() => {
    titleCtx?.setTitle('Crypto Fees Management');
    titleCtx?.setBreadcrumb([
      'Fees & Rates',
      'Crypto Fees',
      'Management',
    ]);

    dispatch(fetchCryptoFees());
  }, [dispatch, titleCtx]);

  const filteredFees = fees.filter(fee => {
    const matchesSearch = searchTerm === '' ||
      fee.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.network.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.networkName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCurrency = filterCurrency === 'all' || filterCurrency === '' || fee.currency === filterCurrency;
    const matchesNetwork = filterNetwork === 'all' || filterNetwork === '' || fee.network === filterNetwork;

    return matchesSearch && matchesCurrency && matchesNetwork;
  });

  const handleAddNew = () => {
    navigate('/fees-rates/add-crypto-fee');
  };

  const handleEdit = (fee: CryptoFee) => {
    setEditingFee(fee);
    setFormData({
      currency: fee.currency,
      network: fee.network,
      networkName: fee.networkName,
      networkFee: fee.networkFee.toString()
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (fee: CryptoFee) => {
    if (!confirm(`Delete ${fee.currency} - ${fee.network} fee?`)) {
      return;
    }
    try {
      setDeletingId(`${fee.currency}-${fee.network}`);
      await dispatch(deleteCryptoFee({
        currency: fee.currency,
        network: fee.network,
      })).unwrap();
      toast.success('Crypto fee deleted successfully');
    } catch (err) {
      console.error('Delete fee failed', err);
      toast.error('Failed to delete crypto fee');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async () => {
    if (!formData.currency || !formData.network) {
      toast.error('Currency and Network are required');
      return;
    }

    if (!formData.networkFee || parseFloat(formData.networkFee) < 0) {
      toast.error('Network fee must be a non-negative number');
      return;
    }

    try {
      setSaving(true);

      if (!editingFee) {
        toast.error('No fee selected for editing');
        return;
      }

      await dispatch(updateCryptoFee({
        currency: formData.currency,
        network: formData.network,
        networkName: formData.networkName,
        networkFee: parseFloat(formData.networkFee)
      })).unwrap();
      toast.success('Crypto fee updated successfully');

      dispatch(fetchCryptoFees());
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Save failed', err);
      toast.error('Failed to save crypto fee');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateNetworkName = async (fee: CryptoFee, newNetworkName: string) => {
    try {
      await dispatch(updateCryptoNetworkName({
        currency: fee.currency,
        network: fee.network,
        networkName: newNetworkName
      })).unwrap();
      toast.success('Network name updated successfully');
      dispatch(fetchCryptoFees());
    } catch (err) {
      console.error('Update network name failed', err);
      toast.error('Failed to update network name');
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Crypto Fees Management</h1>
          <p className="text-gray-600">Manage cryptocurrency network fees and settings</p>
        </div>
        <Button onClick={handleAddNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New Crypto Fee
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search fees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency-filter">Filter by Currency</Label>
              <Select value={filterCurrency} onValueChange={setFilterCurrency}>
                <SelectTrigger>
                  <SelectValue placeholder="All currencies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All currencies</SelectItem>
                  {uniqueCurrencies.map(currency => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="network-filter">Filter by Network</Label>
              <Select value={filterNetwork} onValueChange={setFilterNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="All networks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All networks</SelectItem>
                  {uniqueNetworks.map(network => (
                    <SelectItem key={network} value={network}>
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Actions</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setFilterCurrency('');
                    setFilterNetwork('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <div className="text-red-700">{error}</div>
          </CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="grid gap-4">
          {filteredFees.length === 0 ? (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  {fees.length === 0 ? 'No crypto fees found' : 'No fees match your search criteria'}
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredFees.map((fee, index) => (
              <Card key={`${fee.currency}-${fee.network}-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge  className="font-mono">
                          {fee.currency}
                        </Badge>
                        <Badge variant="secondary">
                          {fee.network}
                        </Badge>
                      </div>
                      <div>
                        <div className="font-medium">{fee.networkName || 'Unnamed Network'}</div>
                        <div className="text-sm text-gray-500">
                          Fee ({fee.currency}): {fee.networkFee}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          const newName = prompt('Enter new network name:', fee.networkName);
                          if (newName !== null && newName.trim() !== fee.networkName) {
                            handleUpdateNetworkName(fee, newName.trim());
                          }
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleEdit(fee)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDelete(fee)}
                        disabled={deletingId === `${fee.currency}-${fee.network}`}
                        className="gap-2 bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        {deletingId === `${fee.currency}-${fee.network}` ? 'Deleting…' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Edit Crypto Fee
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                placeholder="e.g., BTC, ETH, USDT"
                disabled={!!editingFee}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="network">Network</Label>
              <Select
                value={formData.network}
                onValueChange={(value) => setFormData(prev => ({ ...prev, network: value }))}
                disabled={!!editingFee}
              >
                <SelectTrigger
                  id="network"
                  className="w-full border border-gray-300 py-6 text-slate-900"
                  disabled={!!editingFee}
                >
                  <SelectValue placeholder="Select network" className="text-slate-900" />
                </SelectTrigger>
                <SelectContent className="w-full border border-gray-300 bg-white text-slate-900">
                  {DEPOSIT_NETWORK_OPTIONS.map((network) => (
                    <SelectItem key={network} value={network} className="text-slate-900">
                      {network}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="networkName">Network Name</Label>
              <Input
                id="networkName"
                value={formData.networkName}
                onChange={(e) => setFormData(prev => ({ ...prev, networkName: e.target.value }))}
                placeholder="e.g., Bitcoin Network, Ethereum Mainnet"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="networkFee">Network Fee ({formData.currency || 'Token'})</Label>
              <Input
                id="networkFee"
                type="number"
                step="0.000001"
                min="0"
                value={formData.networkFee}
                onChange={(e) => setFormData(prev => ({ ...prev, networkFee: e.target.value }))}
                placeholder="0.001"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Updating...' : 'Update Fee'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CryptoFeesManagement;
