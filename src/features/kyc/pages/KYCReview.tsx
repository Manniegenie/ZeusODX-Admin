import { useContext, useEffect, useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, X, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { KYCService } from '../services/kycService';
import { KYCDataTable } from '../components/kyc-data-table';
import type { KYCEntry, FilterParams } from '../types/kyc';

export function KYCReview() {
  const titleCtx = useContext(DashboardTitleContext);
  const [loading, setLoading] = useState(false);
  const [kycEntries, setKycEntries] = useState<KYCEntry[]>([]);
  const [total, setTotal] = useState(0);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterParams>({
    searchTerm: '',
    status: 'all',
    idType: 'all',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  // Active filters for display
  const [activeFilters, setActiveFilters] = useState(filters);
  
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Set page title
  useEffect(() => {
    titleCtx?.setTitle('KYC Review');
  }, [titleCtx]);

  // Load KYC entries
  const loadKycEntries = async (params: FilterParams, page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      // Convert "all" back to empty string for API
      const apiParams = { ...params };
      if (apiParams.status === 'all') apiParams.status = '';
      if (apiParams.idType === 'all') apiParams.idType = '';

      const response = await KYCService.getKycEntries({
        ...apiParams,
        page,
        limit: 20
      });

      if (response.success) {
        const newEntries = response.data.kycEntries;
        if (append) {
          setKycEntries(prev => [...prev, ...newEntries]);
        } else {
          setKycEntries(newEntries);
        }
        
        setTotal(response.data.pagination.total);
        setCurrentPage(response.data.pagination.currentPage);
        setHasNextPage(response.data.pagination.hasNextPage);
      } else {
        toast.error('Failed to load KYC entries');
      }
    } catch (error) {
      console.error('Error loading KYC entries:', error);
      toast.error('Failed to load KYC entries');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadKycEntries(activeFilters, 1);
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    setActiveFilters(filters);
    setCurrentPage(1);
    loadKycEntries(filters, 1);
  };

  // Clear all filters
  const clearFilters = () => {
    const clearedFilters: FilterParams = {
      searchTerm: '',
      status: 'all',
      idType: 'all',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    setActiveFilters(clearedFilters);
    setCurrentPage(1);
    loadKycEntries(clearedFilters, 1);
  };

  // Remove individual filter
  const removeFilter = (key: keyof FilterParams) => {
    const defaultValue = (key === 'status' || key === 'idType') ? 'all' : '';
    const newFilters = { ...activeFilters, [key]: defaultValue };
    setActiveFilters(newFilters);
    setFilters(newFilters);
    setCurrentPage(1);
    loadKycEntries(newFilters, 1);
  };

  // Load more entries
  const loadMore = () => {
    if (hasNextPage && !loadingMore) {
      loadKycEntries(activeFilters, currentPage + 1, true);
    }
  };

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(value => 
    value !== '' && value !== 'all' && value !== 'createdAt' && value !== 'desc'
  ).length;


  return (
    <div className="w-full bg-white space-y-6 p-4 rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">KYC Review</h1>
          <p className="text-gray-600 mt-1">
            Review and manage user KYC submissions ({total} total entries)
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or ID number..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-gray-900 bg-white"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters ? 'bg-green-50 border-green-500 text-green-700' : 'border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
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
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="provisional">Provisional</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ID Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                <Select value={filters.idType} onValueChange={(value) => handleFilterChange('idType', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All ID types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All ID types</SelectItem>
                    <SelectItem value="bvn">BVN</SelectItem>
                    <SelectItem value="national_id">National ID</SelectItem>
                    <SelectItem value="passport">Passport</SelectItem>
                    <SelectItem value="drivers_license">Driver's License</SelectItem>
                    <SelectItem value="nin">NIN</SelectItem>
                    <SelectItem value="voter_id">Voter ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button onClick={applyFilters} className="bg-green-500 text-white hover:bg-green-600">
                Apply Filters
              </Button>
              <Button onClick={clearFilters} >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFilterCount > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (value === '' || key === 'sortBy' || key === 'sortOrder') return null;
              
              return (
                <div key={key} className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}: {value}</span>
                  <button
                    onClick={() => removeFilter(key as keyof FilterParams)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Table */}
      <Card className="w-full bg-white rounded">
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <span className="ml-2 text-gray-600">Loading KYC entries...</span>
            </div>
          ) : kycEntries.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC entries found</h3>
              <p className="text-gray-600">Try adjusting your search criteria or filters.</p>
            </div>
          ) : (
            <div ref={tableContainerRef} className="overflow-x-auto">
              <KYCDataTable
                data={kycEntries}
                pagination={{
                  currentPage,
                  totalPages: Math.ceil(total / 20),
                  total,
                  hasNextPage,
                  hasPrevPage: currentPage > 1,
                  limit: 20
                }}
                onPageChange={loadMore}
                onRefresh={() => loadKycEntries(activeFilters, 1)}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
