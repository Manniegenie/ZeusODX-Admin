import { useContext, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Filter, X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { GiftCardService } from '../services/giftcardService';
import { GiftCardDataTable } from '../components/giftcard-data-table';
import type { GiftCardRate, FilterParams, CreateRateRequest, UpdateRateRequest } from '../types/giftcard';

const CARD_TYPES = [
  'APPLE', 'STEAM', 'NORDSTROM', 'MACY', 'NIKE', 'GOOGLE_PLAY',
  'AMAZON', 'VISA', 'VANILLA', 'RAZOR_GOLD', 'AMERICAN_EXPRESS',
  'SEPHORA', 'FOOTLOCKER', 'XBOX', 'EBAY'
];

const COUNTRIES = ['US', 'CANADA', 'AUSTRALIA', 'SWITZERLAND'];
const VANILLA_TYPES = ['4097', '4118'];
const CURRENCIES = ['USD', 'NGN', 'GBP', 'EUR', 'CAD'];

export function GiftCardRates() {
  const titleCtx = useContext(DashboardTitleContext);
  const [loading, setLoading] = useState(false);
  const [rates, setRates] = useState<GiftCardRate[]>([]);
  const [totalRates, setTotalRates] = useState(0);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    country: '',
    cardType: '',
    vanillaType: '',
    isActive: undefined,
    page: 1,
    limit: 20
  });

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedRate, setSelectedRate] = useState<GiftCardRate | null>(null);

  // Form states
  const [formData, setFormData] = useState<CreateRateRequest>({
    cardType: '',
    country: '',
    rate: 0,
    physicalRate: undefined,
    ecodeRate: undefined,
    sourceCurrency: 'USD',
    targetCurrency: 'NGN',
    minAmount: 5,
    maxAmount: 2000,
    vanillaType: undefined,
    notes: ''
  });

  // Set page title
  useEffect(() => {
    titleCtx?.setTitle('Gift Card Rates');
  }, [titleCtx]);

  // Load gift card rates
  const loadRates = async (params: FilterParams = filters) => {
    try {
      setLoading(true);
      const response = await GiftCardService.getRates(params);

      if (response.success) {
        setRates(response.data.rates);
        setTotalRates(response.data.pagination.totalRates);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Failed to load gift card rates');
      }
    } catch (error) {
      console.error('Error loading gift card rates:', error);
      toast.error('Failed to load gift card rates');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadRates();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterParams, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadRates(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters = {
      country: '',
      cardType: '',
      vanillaType: '',
      isActive: undefined,
      page: 1,
      limit: 20
    };
    setFilters(clearedFilters);
    loadRates(clearedFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadRates(newFilters);
  };

  // Handle create rate
  const handleCreate = async () => {
    try {
      setLoading(true);
      const response = await GiftCardService.createRate(formData);

      if (response.success) {
        toast.success('Gift card rate created successfully');
        setShowCreateDialog(false);
        resetForm();
        loadRates();
      }
    } catch (error: any) {
      console.error('Error creating rate:', error);
      toast.error(error.response?.data?.message || 'Failed to create rate');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit rate
  const handleEdit = (rate: GiftCardRate) => {
    setSelectedRate(rate);
    setFormData({
      cardType: rate.cardType,
      country: rate.country,
      rate: rate.rate,
      physicalRate: rate.physicalRate,
      ecodeRate: rate.ecodeRate,
      sourceCurrency: rate.sourceCurrency,
      targetCurrency: rate.targetCurrency,
      minAmount: rate.minAmount,
      maxAmount: rate.maxAmount,
      vanillaType: rate.vanillaType,
      notes: rate.notes || ''
    });
    setShowEditDialog(true);
  };

  // Handle update rate
  const handleUpdate = async () => {
    if (!selectedRate) return;

    try {
      setLoading(true);
      const updateData: UpdateRateRequest = {
        rate: formData.rate,
        physicalRate: formData.physicalRate,
        ecodeRate: formData.ecodeRate,
        minAmount: formData.minAmount,
        maxAmount: formData.maxAmount,
        notes: formData.notes
      };

      const response = await GiftCardService.updateRate(selectedRate.id, updateData);

      if (response.success) {
        toast.success('Gift card rate updated successfully');
        setShowEditDialog(false);
        resetForm();
        setSelectedRate(null);
        loadRates();
      }
    } catch (error: any) {
      console.error('Error updating rate:', error);
      toast.error(error.response?.data?.message || 'Failed to update rate');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete rate
  const handleDelete = async (rate: GiftCardRate) => {
    if (!confirm(`Are you sure you want to delete the rate for ${rate.cardType} (${rate.country})?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await GiftCardService.deleteRate(rate.id);

      if (response.success) {
        toast.success('Gift card rate deleted successfully');
        loadRates();
      }
    } catch (error: any) {
      console.error('Error deleting rate:', error);
      toast.error(error.response?.data?.message || 'Failed to delete rate');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (rate: GiftCardRate) => {
    try {
      setLoading(true);
      const response = await GiftCardService.toggleRateStatus(rate.id, !rate.isActive);

      if (response.success) {
        toast.success(`Rate ${!rate.isActive ? 'activated' : 'deactivated'} successfully`);
        loadRates();
      }
    } catch (error: any) {
      console.error('Error toggling rate status:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle rate status');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      cardType: '',
      country: '',
      rate: 0,
      physicalRate: undefined,
      ecodeRate: undefined,
      sourceCurrency: 'USD',
      targetCurrency: 'NGN',
      minAmount: 5,
      maxAmount: 2000,
      vanillaType: undefined,
      notes: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Card Rates</h1>
          <p className="text-muted-foreground">
            Manage gift card exchange rates and pricing
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Rate
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </Button>
            {(filters.country || filters.cardType || filters.vanillaType || filters.isActive !== undefined) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-2 text-red-600"
              >
                <X className="w-4 h-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>Card Type</Label>
                <Select value={filters.cardType} onValueChange={(value) => handleFilterChange('cardType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {CARD_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Country</Label>
                <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All countries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All countries</SelectItem>
                    {COUNTRIES.map(country => (
                      <SelectItem key={country} value={country}>{country}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Vanilla Type</Label>
                <Select value={filters.vanillaType} onValueChange={(value) => handleFilterChange('vanillaType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {VANILLA_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-4">
                <Button onClick={applyFilters} className="w-full">
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading rates...</p>
            </div>
          </div>
        ) : (
          <GiftCardDataTable
            data={rates}
            pagination={{
              currentPage,
              totalPages,
              totalRates,
              limit: 20
            }}
            onPageChange={handlePageChange}
            onRefresh={() => loadRates()}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        )}
      </Card>

      {/* Create Rate Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Gift Card Rate</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Card Type *</Label>
              <Select value={formData.cardType} onValueChange={(value) => setFormData({...formData, cardType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select card type" />
                </SelectTrigger>
                <SelectContent>
                  {CARD_TYPES.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Country *</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({...formData, country: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.cardType === 'VANILLA' && (
              <div className="col-span-2">
                <Label>Vanilla Type *</Label>
                <Select value={formData.vanillaType} onValueChange={(value) => setFormData({...formData, vanillaType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vanilla type" />
                  </SelectTrigger>
                  <SelectContent>
                    {VANILLA_TYPES.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div>
              <Label>Base Rate (₦) *</Label>
              <Input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value)})}
                placeholder="e.g., 1500"
              />
            </div>

            <div>
              <Label>Physical Rate (₦)</Label>
              <Input
                type="number"
                value={formData.physicalRate || ''}
                onChange={(e) => setFormData({...formData, physicalRate: e.target.value ? parseFloat(e.target.value) : undefined})}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label>E-Code Rate (₦)</Label>
              <Input
                type="number"
                value={formData.ecodeRate || ''}
                onChange={(e) => setFormData({...formData, ecodeRate: e.target.value ? parseFloat(e.target.value) : undefined})}
                placeholder="Optional"
              />
            </div>

            <div>
              <Label>Source Currency</Label>
              <Select value={formData.sourceCurrency} onValueChange={(value) => setFormData({...formData, sourceCurrency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Target Currency</Label>
              <Select value={formData.targetCurrency} onValueChange={(value) => setFormData({...formData, targetCurrency: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Min Amount</Label>
              <Input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({...formData, minAmount: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <Label>Max Amount</Label>
              <Input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({...formData, maxAmount: parseFloat(e.target.value)})}
              />
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Optional notes"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || !formData.cardType || !formData.country || !formData.rate}>
              Create Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rate Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Gift Card Rate</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Card:</strong> {formData.cardType} ({formData.country})
                {formData.vanillaType && ` - Type ${formData.vanillaType}`}
              </p>
              <p className="text-xs text-gray-500 mt-1">Card type and country cannot be changed</p>
            </div>

            <div>
              <Label>Base Rate (₦) *</Label>
              <Input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <Label>Physical Rate (₦)</Label>
              <Input
                type="number"
                value={formData.physicalRate || ''}
                onChange={(e) => setFormData({...formData, physicalRate: e.target.value ? parseFloat(e.target.value) : undefined})}
              />
            </div>

            <div>
              <Label>E-Code Rate (₦)</Label>
              <Input
                type="number"
                value={formData.ecodeRate || ''}
                onChange={(e) => setFormData({...formData, ecodeRate: e.target.value ? parseFloat(e.target.value) : undefined})}
              />
            </div>

            <div>
              <Label>Min Amount</Label>
              <Input
                type="number"
                value={formData.minAmount}
                onChange={(e) => setFormData({...formData, minAmount: parseFloat(e.target.value)})}
              />
            </div>

            <div>
              <Label>Max Amount</Label>
              <Input
                type="number"
                value={formData.maxAmount}
                onChange={(e) => setFormData({...formData, maxAmount: parseFloat(e.target.value)})}
              />
            </div>

            <div className="col-span-2">
              <Label>Notes</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={loading || !formData.rate}>
              Update Rate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
