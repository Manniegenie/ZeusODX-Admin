import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { createCryptoFee } from '../store/cryptoFeeSlice';
import type { AppDispatch } from '@/core/store/store';
import { toast } from 'sonner';
import { DEPOSIT_NETWORK_OPTIONS } from '../constants/networks';

export function AddCryptoFee() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const titleCtx = useContext(DashboardTitleContext);
  
  const [formData, setFormData] = useState({
    currency: '',
    network: '',
    networkName: '',
    networkFee: ''
  });
  const [saving, setSaving] = useState(false);

  // Set page title and breadcrumb
  titleCtx?.setTitle('Add New Crypto Fee');
  titleCtx?.setBreadcrumb([
    'Fees & Rates',
    'Crypto Fees',
    'Add New',
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.currency || !formData.network || !formData.networkFee || parseFloat(formData.networkFee) < 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      setSaving(true);
      
      await dispatch(createCryptoFee({
        currency: formData.currency,
        network: formData.network,
        networkName: formData.networkName,
        networkFee: parseFloat(formData.networkFee)
      })).unwrap();
      
      toast.success('Crypto fee created successfully');
      navigate('/fees-rates/crypto-fees-management');
    } catch (err: unknown) {
      console.error('Create failed', err);
      const errorMessage =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof (err as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message ?? 'Failed to create crypto fee'
          : 'Failed to create crypto fee';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/fees-rates/crypto-fees-management');
  };

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Add New Crypto Fee</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Currency *</Label>
                <Input
                  id="currency"
                  value={formData.currency}
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                  placeholder="e.g., BTC, ETH, USDT"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="network">Network *</Label>
                <Select
                  value={formData.network}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, network: value }))}
                >
                  <SelectTrigger id="network" className="w-full border border-gray-300 py-6 text-slate-900">
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
              <Label htmlFor="networkFee">Network Fee ({formData.currency || 'Token'}) *</Label>
              <Input
                id="networkFee"
                type="number"
                step="0.000001"
                min="0"
                value={formData.networkFee}
                onChange={(e) => setFormData(prev => ({ ...prev, networkFee: e.target.value }))}
                placeholder="0.001"
                required
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Creating...' : 'Create Crypto Fee'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AddCryptoFee;
