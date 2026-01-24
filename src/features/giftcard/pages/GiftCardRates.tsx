import { useContext, useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Filter, Plus, RefreshCw, ChevronLeft, ChevronRight, Edit, Trash2, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { GiftCardService } from '../services/giftcardService';
import type { GiftCardRate, FilterParams, CreateRateRequest, UpdateRateRequest, RateRangeKey } from '../types/giftcard';

// Rate ranges configuration (matches backend)
const RATE_RANGE_KEYS: RateRangeKey[] = ['range25_100', 'range100_200', 'range200_500', 'range500_1000'];
const RATE_RANGE_LABELS: Record<RateRangeKey, string> = {
  range25_100: '$25 - $100',
  range100_200: '$100 - $200',
  range200_500: '$200 - $500',
  range500_1000: '$500 - $1,000'
};

const CARD_TYPES = [
  'APPLE', 'STEAM', 'NORDSTROM', 'MACY', 'NIKE', 'GOOGLE_PLAY',
  'AMAZON', 'VISA', 'VANILLA', 'RAZOR_GOLD', 'AMERICAN_EXPRESS',
  'SEPHORA', 'FOOTLOCKER', 'XBOX', 'EBAY'
];

const COUNTRIES = ['US', 'CANADA', 'AUSTRALIA', 'SWITZERLAND'];
const VANILLA_TYPES = ['4097', '4118'];
const CURRENCIES = ['USD', 'NGN', 'GBP', 'EUR', 'CAD'];

// Helper functions
const getCountryFlag = (country: string) => {
  const flags: { [key: string]: string } = {
    'US': '🇺🇸',
    'CANADA': '🇨🇦',
    'AUSTRALIA': '🇦🇺',
    'SWITZERLAND': '🇨🇭'
  };
  return flags[country] || '🌍';
};

const getCardTypeDisplayName = (cardType: string) => {
  const typeMap: { [key: string]: string } = {
    'APPLE': 'Apple',
    'APPLE/ITUNES': 'Apple/iTunes',
    'STEAM': 'Steam',
    'NORDSTROM': 'Nordstrom',
    'MACY': "Macy's",
    'NIKE': 'Nike',
    'GOOGLE_PLAY': 'Google Play',
    'AMAZON': 'Amazon',
    'VISA': 'Visa',
    'VANILLA': 'Vanilla',
    'RAZOR_GOLD': 'Razor Gold',
    'AMERICAN_EXPRESS': 'American Express',
    'SEPHORA': 'Sephora',
    'FOOTLOCKER': 'Foot Locker',
    'XBOX': 'Xbox',
    'EBAY': 'eBay'
  };
  return typeMap[cardType] || cardType;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

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
    rateRanges: {
      range25_100: { rate: null, physicalRate: null, ecodeRate: null },
      range100_200: { rate: null, physicalRate: null, ecodeRate: null },
      range200_500: { rate: null, physicalRate: null, ecodeRate: null },
      range500_1000: { rate: null, physicalRate: null, ecodeRate: null }
    },
    physicalRate: undefined,
    ecodeRate: undefined,
    sourceCurrency: 'USD',
    targetCurrency: 'NGN',
    minAmount: 25,
    maxAmount: 1000,
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
      rateRanges: rate.rateRanges || {
        range25_100: { rate: null, physicalRate: null, ecodeRate: null },
        range100_200: { rate: null, physicalRate: null, ecodeRate: null },
        range200_500: { rate: null, physicalRate: null, ecodeRate: null },
        range500_1000: { rate: null, physicalRate: null, ecodeRate: null }
      },
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
        rateRanges: formData.rateRanges,
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
      rateRanges: {
        range25_100: { rate: null, physicalRate: null, ecodeRate: null },
        range100_200: { rate: null, physicalRate: null, ecodeRate: null },
        range200_500: { rate: null, physicalRate: null, ecodeRate: null },
        range500_1000: { rate: null, physicalRate: null, ecodeRate: null }
      },
      physicalRate: undefined,
      ecodeRate: undefined,
      sourceCurrency: 'USD',
      targetCurrency: 'NGN',
      minAmount: 25,
      maxAmount: 1000,
      vanillaType: undefined,
      notes: ''
    });
  };

  // Helper to update rate range values
  const updateRateRange = (rangeKey: RateRangeKey, field: 'rate' | 'physicalRate' | 'ecodeRate', value: string) => {
    const numValue = value === '' ? null : parseFloat(value);
    setFormData(prev => ({
      ...prev,
      rateRanges: {
        ...prev.rateRanges,
        [rangeKey]: {
          ...prev.rateRanges?.[rangeKey],
          [field]: numValue
        }
      }
    }));
  };

  // Count active filters
  const activeFilterCount = [filters.country, filters.cardType, filters.vanillaType, filters.isActive !== undefined ? 'active' : ''].filter(Boolean).length;

  return (
    <div className="w-full bg-white space-y-6 p-4 rounded" style={{ color: '#1A1A1A' }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#111827' }}>Gift Card Rates</h1>
          <p style={{ color: '#4B5563' }} className="mt-1">
            Manage gift card exchange rates and pricing ({totalRates} total rates)
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add New Rate
        </Button>
      </div>

      {/* Filters */}
      <div className="w-full">
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
            style={{ color: showFilters ? '#7C3AED' : '#374151' }}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Card Type</label>
                <Select value={filters.cardType} onValueChange={(value) => handleFilterChange('cardType', value)}>
                  <SelectTrigger className="w-full">
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Country</label>
                <Select value={filters.country} onValueChange={(value) => handleFilterChange('country', value)}>
                  <SelectTrigger className="w-full">
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Vanilla Type</label>
                <Select value={filters.vanillaType} onValueChange={(value) => handleFilterChange('vanillaType', value)}>
                  <SelectTrigger className="w-full">
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
                <label className="block text-sm font-medium mb-1" style={{ color: '#374151' }}>Status</label>
                <Select
                  value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                  onValueChange={(value) => handleFilterChange('isActive', value === '' ? undefined : value === 'true')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={applyFilters} className="bg-purple-600 text-white hover:bg-purple-700">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <Card className="w-full bg-white rounded">
        <div className="p-4">
          {/* Table Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm" style={{ color: '#4B5563' }}>
              Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalRates)} of {totalRates} rates
            </div>
            <Button
              onClick={() => loadRates()}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              <span className="ml-2" style={{ color: '#4B5563' }}>Loading rates...</span>
            </div>
          ) : rates.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2" style={{ color: '#111827' }}>No gift card rates found</h3>
              <p style={{ color: '#4B5563' }}>Try adjusting your filters or add a new rate.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" style={{ color: '#1A1A1A' }}>
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Card Type</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Country</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Default Rate</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Rate Ranges</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Status</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Last Updated</th>
                    <th className="text-left p-3 font-semibold" style={{ color: '#111827' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rates.map((rate) => (
                    <tr key={rate.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div>
                          <div className="font-medium" style={{ color: '#111827' }}>{getCardTypeDisplayName(rate.cardType)}</div>
                          {rate.vanillaType && (
                            <div className="text-xs" style={{ color: '#6B7280' }}>Type: {rate.vanillaType}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{getCountryFlag(rate.country)}</span>
                          <span className="font-medium" style={{ color: '#111827' }}>{rate.country}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div>
                          <div className="font-medium" style={{ color: '#111827' }}>{rate.rateDisplay}</div>
                          <div className="text-xs" style={{ color: '#6B7280' }}>
                            {rate.sourceCurrency} → {rate.targetCurrency}
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          {RATE_RANGE_KEYS.map(rangeKey => {
                            const rangeRate = rate.rateRanges?.[rangeKey];
                            const hasRate = rangeRate?.rate || rangeRate?.physicalRate || rangeRate?.ecodeRate;
                            return (
                              <div key={rangeKey} className="flex items-center gap-2 text-xs">
                                <span className="w-20 font-medium" style={{ color: '#6B7280' }}>
                                  {RATE_RANGE_LABELS[rangeKey]}:
                                </span>
                                {hasRate ? (
                                  <span style={{ color: '#111827' }}>
                                    ₦{rangeRate?.rate || rangeRate?.physicalRate || rangeRate?.ecodeRate}
                                  </span>
                                ) : (
                                  <span style={{ color: '#D1D5DB' }}>—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {rate.isActive ? (
                            <ToggleRight className="w-5 h-5 text-green-500" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-400" />
                          )}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rate.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {rate.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="text-sm" style={{ color: '#6B7280' }}>
                          {rate.lastUpdated ? formatDate(rate.lastUpdated) : formatDate(rate.createdAt)}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEdit(rate)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleStatus(rate)}
                            className="flex items-center gap-1"
                          >
                            {rate.isActive ? (
                              <>
                                <ToggleLeft className="h-4 w-4" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleRight className="h-4 w-4" />
                                Activate
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(rate)}
                            className="flex items-center gap-1"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {rates.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm" style={{ color: '#4B5563' }}>
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Create Rate Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle style={{ color: '#111827' }}>Create New Gift Card Rate</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label style={{ color: '#374151' }}>Card Type *</Label>
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
              <Label style={{ color: '#374151' }}>Country *</Label>
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
                <Label style={{ color: '#374151' }}>Vanilla Type *</Label>
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
              <Label style={{ color: '#374151' }}>Default Rate (₦) *</Label>
              <Input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
                placeholder="Fallback rate"
              />
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Used when no range-specific rate is set</p>
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Currency</Label>
              <div className="flex gap-2">
                <Select value={formData.sourceCurrency} onValueChange={(value) => setFormData({...formData, sourceCurrency: value})}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="flex items-center">→</span>
                <Select value={formData.targetCurrency} onValueChange={(value) => setFormData({...formData, targetCurrency: value})}>
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map(currency => (
                      <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Rate Ranges Section */}
            <div className="col-span-2">
              <Label style={{ color: '#374151' }} className="text-base font-semibold">Rate Ranges</Label>
              <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Set different rates for each card value range</p>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>Range</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>Base Rate (₦)</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>Physical (₦)</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>E-Code (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RATE_RANGE_KEYS.map(rangeKey => (
                      <tr key={rangeKey} className="border-t">
                        <td className="p-2 font-medium" style={{ color: '#111827' }}>
                          {RATE_RANGE_LABELS[rangeKey]}
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={formData.rateRanges?.[rangeKey]?.rate ?? ''}
                            onChange={(e) => updateRateRange(rangeKey, 'rate', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={formData.rateRanges?.[rangeKey]?.physicalRate ?? ''}
                            onChange={(e) => updateRateRange(rangeKey, 'physicalRate', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={formData.rateRanges?.[rangeKey]?.ecodeRate ?? ''}
                            onChange={(e) => updateRateRange(rangeKey, 'ecodeRate', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-2">
              <Label style={{ color: '#374151' }}>Notes</Label>
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
            <DialogTitle style={{ color: '#111827' }}>Edit Gift Card Rate</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm" style={{ color: '#4B5563' }}>
                <strong style={{ color: '#111827' }}>Card:</strong> {formData.cardType} ({formData.country})
                {formData.vanillaType && ` - Type ${formData.vanillaType}`}
              </p>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Card type and country cannot be changed</p>
            </div>

            <div>
              <Label style={{ color: '#374151' }}>Default Rate (₦) *</Label>
              <Input
                type="number"
                value={formData.rate}
                onChange={(e) => setFormData({...formData, rate: parseFloat(e.target.value) || 0})}
              />
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Fallback rate when no range-specific rate is set</p>
            </div>

            <div className="col-span-2">
              <Label style={{ color: '#374151' }} className="text-base font-semibold">Rate Ranges</Label>
              <p className="text-xs mb-3" style={{ color: '#6B7280' }}>Set different rates for each card value range</p>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>Range</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>Base Rate (₦)</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>Physical (₦)</th>
                      <th className="text-left p-2 font-medium" style={{ color: '#374151' }}>E-Code (₦)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {RATE_RANGE_KEYS.map(rangeKey => (
                      <tr key={rangeKey} className="border-t">
                        <td className="p-2 font-medium" style={{ color: '#111827' }}>
                          {RATE_RANGE_LABELS[rangeKey]}
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={formData.rateRanges?.[rangeKey]?.rate ?? ''}
                            onChange={(e) => updateRateRange(rangeKey, 'rate', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={formData.rateRanges?.[rangeKey]?.physicalRate ?? ''}
                            onChange={(e) => updateRateRange(rangeKey, 'physicalRate', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            className="h-8"
                            value={formData.rateRanges?.[rangeKey]?.ecodeRate ?? ''}
                            onChange={(e) => updateRateRange(rangeKey, 'ecodeRate', e.target.value)}
                            placeholder="—"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="col-span-2">
              <Label style={{ color: '#374151' }}>Notes</Label>
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
