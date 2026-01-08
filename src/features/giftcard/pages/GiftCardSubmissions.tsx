import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Filter, X, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { GiftCardService } from '../services/giftcardService';
import { DataTable } from '@/features/dashboard/components/data-table';
import { submissionColumns } from '../components/submission-columns';
import type { GiftCardSubmission, SubmissionFilterParams, SubmissionStatus } from '../types/giftcard';

const CARD_TYPES = [
  'APPLE', 'STEAM', 'NORDSTROM', 'MACY', 'NIKE', 'GOOGLE_PLAY',
  'AMAZON', 'VISA', 'VANILLA', 'RAZOR_GOLD', 'AMERICAN_EXPRESS',
  'SEPHORA', 'FOOTLOCKER', 'XBOX', 'EBAY'
];

const COUNTRIES = ['US', 'CANADA', 'AUSTRALIA', 'SWITZERLAND'];

const STATUSES: SubmissionStatus[] = ['PENDING', 'REVIEWING', 'APPROVED', 'REJECTED', 'PAID'];

export function GiftCardSubmissions() {
  const titleCtx = useContext(DashboardTitleContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState<GiftCardSubmission[]>([]);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SubmissionFilterParams>({
    page: 1,
    limit: 20,
    status: undefined,
    cardType: '',
    country: '',
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Set page title
  useEffect(() => {
    titleCtx?.setTitle('Gift Card Submissions');
  }, [titleCtx]);

  // Load submissions
  const loadSubmissions = async (params: SubmissionFilterParams = filters) => {
    try {
      setLoading(true);
      const response = await GiftCardService.getSubmissions(params);

      if (response.success) {
        setSubmissions(response.data.submissions);
        setTotalSubmissions(response.data.pagination.totalSubmissions);
        setCurrentPage(response.data.pagination.currentPage);
        setTotalPages(response.data.pagination.totalPages);
      } else {
        toast.error('Failed to load submissions');
      }
    } catch (error: any) {
      console.error('Error loading submissions:', error);
      toast.error(error.response?.data?.message || 'Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadSubmissions();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key: keyof SubmissionFilterParams, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters
  const applyFilters = () => {
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    loadSubmissions(newFilters);
  };

  // Clear filters
  const clearFilters = () => {
    const clearedFilters: SubmissionFilterParams = {
      page: 1,
      limit: 20,
      status: undefined,
      cardType: '',
      country: '',
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    setFilters(clearedFilters);
    loadSubmissions(clearedFilters);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    loadSubmissions(newFilters);
  };

  // View submission detail
  const handleViewSubmission = (submission: GiftCardSubmission) => {
    navigate(`/giftcards/submissions/${submission._id}`, { state: { submission } });
  };

  const hasActiveFilters = filters.status || filters.cardType || filters.country || filters.searchTerm || filters.dateFrom || filters.dateTo;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gift Card Submissions</h1>
          <p className="text-muted-foreground">
            Review and manage user gift card submissions
          </p>
        </div>
        <Button onClick={() => loadSubmissions()} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="text-sm text-gray-500">Total</div>
          <div className="text-2xl font-bold">{totalSubmissions}</div>
        </Card>
        <Card className="p-4 bg-yellow-50">
          <div className="text-sm text-yellow-700">Pending</div>
          <div className="text-2xl font-bold text-yellow-900">
            {submissions.filter(s => s.status === 'PENDING').length}
          </div>
        </Card>
        <Card className="p-4 bg-blue-50">
          <div className="text-sm text-blue-700">Reviewing</div>
          <div className="text-2xl font-bold text-blue-900">
            {submissions.filter(s => s.status === 'REVIEWING').length}
          </div>
        </Card>
        <Card className="p-4 bg-green-50">
          <div className="text-sm text-green-700">Approved</div>
          <div className="text-2xl font-bold text-green-900">
            {submissions.filter(s => s.status === 'APPROVED').length}
          </div>
        </Card>
        <Card className="p-4 bg-red-50">
          <div className="text-sm text-red-700">Rejected</div>
          <div className="text-2xl font-bold text-red-900">
            {submissions.filter(s => s.status === 'REJECTED').length}
          </div>
        </Card>
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
            {hasActiveFilters && (
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
                <Label>Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    {STATUSES.map(status => (
                      <SelectItem key={status} value={status}>{status}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Card Type</Label>
                <Select
                  value={filters.cardType || ''}
                  onValueChange={(value) => handleFilterChange('cardType', value)}
                >
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
                <Select
                  value={filters.country || ''}
                  onValueChange={(value) => handleFilterChange('country', value)}
                >
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
                <Label>Search (Email/Name)</Label>
                <Input
                  value={filters.searchTerm}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  placeholder="Search users..."
                />
              </div>

              <div>
                <Label>Date From</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>

              <div>
                <Label>Date To</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>

              <div>
                <Label>Sort By</Label>
                <Select
                  value={filters.sortBy || 'createdAt'}
                  onValueChange={(value) => handleFilterChange('sortBy', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Submitted</SelectItem>
                    <SelectItem value="cardValue">Card Value</SelectItem>
                    <SelectItem value="expectedAmountToReceive">Expected Amount</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Sort Order</Label>
                <Select
                  value={filters.sortOrder || 'desc'}
                  onValueChange={(value) => handleFilterChange('sortOrder', value as 'asc' | 'desc')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="desc">Newest First</SelectItem>
                    <SelectItem value="asc">Oldest First</SelectItem>
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
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <DataTable
              columns={submissionColumns(handleViewSubmission)}
              data={submissions}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({totalSubmissions} total submissions)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
