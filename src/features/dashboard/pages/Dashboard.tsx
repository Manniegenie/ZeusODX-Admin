import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Card } from '@/components/ui/card';
import CardBg from '../../../assets/img/card-bg.png';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import type { RootState } from '@/core/store/store';
import { getDashboardAnalytics, getRecentTransactions, getFilteredData, getVolumes } from '../services/analyticsService'
import { toast } from 'sonner'
import type { DashboardAnalyticsResponse, Transaction } from '../type/analytic';
import { DataTable } from '../components/data-table';
import { columns } from '../components/columns';
import { Search, X, Filter } from 'lucide-react';

export function Dashboard() {
  const titleCtx = useContext(DashboardTitleContext);
  const { users } = useSelector((state: RootState) => state.users);
  const total = users.length;

  const [loading, setLoading] = useState(false)
  const [analytics, setAnalytics] = useState<DashboardAnalyticsResponse | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [transactionsLoading, setTransactionsLoading] = useState(false)
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    searchTerm: '',
    dateFrom: '',
    dateTo: '',
    transactionType: '',
    transactionStatus: '',
    userVerificationStatus: '',
    currency: '',
    minAmount: '',
    maxAmount: ''
  })
  
  // Active filters for display
  const [activeFilters, setActiveFilters] = useState(filters)
  
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const [volumes, setVolumes] = useState<{
    deposits?: any[];
    withdrawals?: any[];
    totalDepositNGN?: number;
    totalWithdrawalNGN?: number;
    totalDepositUSD?: number;
    totalWithdrawalUSD?: number;
  }>({})

  // Helper function to format currency
  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Count active filters
  const activeFilterCount = Object.values(activeFilters).filter(v => v !== '').length

  useEffect(() => {
    titleCtx?.setTitle('Dashboard');
  }, [titleCtx]);

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const resp = await getDashboardAnalytics()
        setAnalytics(resp)
      } catch (err) {
        console.error('Failed to load analytics', err)
        toast.error('Failed to load dashboard analytics')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    getVolumes().then(res => {
      if (res.success) setVolumes(res.data)
    }).catch(() => {})
  }, [])

  // Fetch transactions with filters
  const loadTransactions = useCallback(async (page: number = 1, reset: boolean = false) => {
    if (page === 1) {
      setTransactionsLoading(true)
    } else {
      setLoadingMore(true)
    }
    
    try {
      // Check if any filters are active
      const hasFilters = activeFilterCount > 0
      
      if (hasFilters) {
        // Use filter endpoint with all active filters
        const result = await getFilteredData({
          searchTerm: activeFilters.searchTerm || undefined,
          dateFrom: activeFilters.dateFrom || undefined,
          dateTo: activeFilters.dateTo || undefined,
          transactionType: activeFilters.transactionType || undefined,
          transactionStatus: activeFilters.transactionStatus || undefined,
          userVerificationStatus: activeFilters.userVerificationStatus || undefined,
          currency: activeFilters.currency || undefined,
          minAmount: activeFilters.minAmount || undefined,
          maxAmount: activeFilters.maxAmount || undefined,
          page,
          limit: 50
        })
        
        if (result.success) {
          if (reset || page === 1) {
            setTransactions(result.data.transactions)
          } else {
            setTransactions(prev => [...prev, ...result.data.transactions])
          }
          
          setHasNextPage(result.pagination.hasNextPage)
          setCurrentPage(page)
        }
      } else {
        // Use regular transactions endpoint
        const result = await getRecentTransactions(page, 50)
        
        if (result.success) {
          if (reset || page === 1) {
            setTransactions(result.data)
          } else {
            setTransactions(prev => [...prev, ...result.data])
          }
          
          setHasNextPage(result.pagination.hasNextPage)
          setCurrentPage(page)
        }
      }
    } catch (err) {
      console.error('Failed to load transactions', err)
      toast.error('Failed to load transactions')
    } finally {
      setTransactionsLoading(false)
      setLoadingMore(false)
    }
  }, [activeFilters, activeFilterCount])

  // Initial load
  useEffect(() => {
    loadTransactions(1, true)
  }, [activeFilters])

  // Load more transactions
  const loadMoreTransactions = useCallback(async () => {
    if (loadingMore || !hasNextPage) return
    await loadTransactions(currentPage + 1, false)
  }, [currentPage, hasNextPage, loadingMore, loadTransactions])

  // Infinite scroll handler
  useEffect(() => {
    const container = tableContainerRef.current
    if (!container) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container
      
      // Load more when scrolled to bottom (with 100px threshold)
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMoreTransactions()
      }
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [loadMoreTransactions])

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Apply filters
  const applyFilters = () => {
    setActiveFilters(filters)
    setCurrentPage(1)
    setShowFilters(false)
  }

  // Clear all filters
  const clearFilters = () => {
    const emptyFilters = {
      searchTerm: '',
      dateFrom: '',
      dateTo: '',
      transactionType: '',
      transactionStatus: '',
      userVerificationStatus: '',
      currency: '',
      minAmount: '',
      maxAmount: ''
    }
    setFilters(emptyFilters)
    setActiveFilters(emptyFilters)
    setCurrentPage(1)
  }

  // Remove individual filter
  const removeFilter = (key: string) => {
    setFilters(prev => ({ ...prev, [key]: '' }))
    setActiveFilters(prev => ({ ...prev, [key]: '' }))
  }

  return (
    <div className="w-full bg-white space-y-4 p-3 rounded">
      {/* Universal Search Bar */}
      <div className="w-full">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users, transactions, references..."
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
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
          <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                />
              </div>

              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction Type</label>
                <select
                  value={filters.transactionType}
                  onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                >
                  <option value="">All Types</option>
                  <option value="SWAP">Swap</option>
                  <option value="OBIEX_SWAP">Provider Swap</option>
                  <option value="DEPOSIT">Deposit</option>
                  <option value="WITHDRAWAL">Withdrawal</option>
                  <option value="GIFTCARD">Gift Card</option>
                  <option value="INTERNAL_TRANSFER_SENT">Transfer Sent</option>
                  <option value="INTERNAL_TRANSFER_RECEIVED">Transfer Received</option>
                </select>
              </div>

              {/* Transaction Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.transactionStatus}
                  onChange={(e) => handleFilterChange('transactionStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                >
                  <option value="">All Status</option>
                  <option value="SUCCESSFUL">Successful</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>

              {/* User Verification Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User Verification</label>
                <select
                  value={filters.userVerificationStatus}
                  onChange={(e) => handleFilterChange('userVerificationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                >
                  <option value="">All Users</option>
                  <option value="emailVerified">Email Verified</option>
                  <option value="bvnVerified">BVN Verified</option>
                  <option value="chatbotVerified">Chatbot Verified</option>
                  <option value="unverified">Unverified</option>
                </select>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  placeholder="e.g. USDT, BTC"
                  value={filters.currency}
                  onChange={(e) => handleFilterChange('currency', e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                />
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="∞"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white bg-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Active Filter Tags */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {activeFilters.searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                Search: {activeFilters.searchTerm}
                <button onClick={() => removeFilter('searchTerm')} className="hover:bg-green-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.dateFrom && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                From: {activeFilters.dateFrom}
                <button onClick={() => removeFilter('dateFrom')} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.dateTo && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                To: {activeFilters.dateTo}
                <button onClick={() => removeFilter('dateTo')} className="hover:bg-blue-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.transactionType && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-sm">
                Type: {activeFilters.transactionType}
                <button onClick={() => removeFilter('transactionType')} className="hover:bg-purple-700 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.transactionStatus && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Status: {activeFilters.transactionStatus}
                <button onClick={() => removeFilter('transactionStatus')} className="hover:bg-yellow-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {activeFilters.currency && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                Currency: {activeFilters.currency}
                <button onClick={() => removeFilter('currency')} className="hover:bg-indigo-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(activeFilters.minAmount || activeFilters.maxAmount) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                Amount: {activeFilters.minAmount || '0'} - {activeFilters.maxAmount || '∞'}
                <button onClick={() => {
                  removeFilter('minAmount')
                  removeFilter('maxAmount')
                }} className="hover:bg-orange-200 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 auto-cols-fr">
        <Card className="p-4 bg-primary rounded-lg text-white relative overflow-hidden min-w-0 flex-1">
          <img src={CardBg} className='object-fit absolute left-0 top-0' alt='Logo' />
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-white font-semibold whitespace-nowrap">Total Users</p>
            <h3 className="text-xl font-bold break-words min-w-0">{loading ? '...' : analytics?.data?.users?.total ?? total}</h3>
          </div>
        </Card>
        <Card className="p-4 rounded-lg border-gray-200 shadow-none min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">Trades</p>
            <h3 className="text-xl font-bold break-words min-w-0">{loading ? '...' : analytics?.data?.chatbotTrades?.overview?.total ?? '—'}</h3>
          </div>
        </Card>
        <Card className="p-4 rounded-lg border-gray-200 shadow-none min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">Completed Trades</p>
            <h3 className="text-xl font-bold break-words min-w-0">{loading ? '...' : analytics?.data?.chatbotTrades?.overview?.completed ?? '—'}</h3>
          </div>
        </Card>
        <Card className="p-4 rounded-lg border-gray-200 shadow-none min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">Pending Trades</p>
            <h3 className="text-xl font-bold break-words min-w-0">{loading ? '...' : analytics?.data?.chatbotTrades?.overview?.pending ?? '—'}</h3>
          </div>
        </Card>
        <Card className="p-4 rounded-lg border-gray-200 shadow-none min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">Transaction Volume</p>
            <h3 className="text-xl font-bold break-words min-w-0">
              {loading ? '...' : formatCurrency(analytics?.data?.transactionVolume)}
            </h3>
          </div>
        </Card>
        <Card className="p-4 rounded-lg border-gray-200 shadow-none min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">Deposit Volume (USD)</p>
            <h3 className="text-xl font-bold break-words min-w-0">
              {volumes.totalDepositUSD !== undefined ? `$${Number(volumes.totalDepositUSD).toLocaleString()}` : '—'}
            </h3>
          </div>
        </Card>
        <Card className="p-4 rounded-lg border-gray-200 shadow-none min-w-0 flex-1">
          <div className="flex flex-col items-start gap-1 min-w-0">
            <p className="text-xs text-gray-500 font-semibold whitespace-nowrap">Withdrawal Volume (USD)</p>
            <h3 className="text-xl font-bold break-words min-w-0">
              {volumes.totalWithdrawalUSD !== undefined ? `$${Number(volumes.totalWithdrawalUSD).toLocaleString()}` : '—'}
            </h3>
          </div>
        </Card>
      </div>

      {/* Recent Transactions Section */}
      <div className="w-full">
        {activeFilterCount > 0 && (
          <div className="flex items-center justify-end mb-4">
            <span className="text-sm text-gray-500">
              {transactions.length} result{transactions.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}

        {transactionsLoading ? (
          <div className="flex items-center justify-center w-full h-32">
            <svg className="animate-spin h-8 w-8 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
        ) : (
          <div ref={tableContainerRef} className="max-h-[600px] overflow-y-auto">
            <DataTable columns={columns} data={transactions} />
            
            {loadingMore && (
              <div className="flex items-center justify-center w-full py-4">
                <svg className="animate-spin h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="ml-2 text-sm text-gray-500">Loading more...</span>
              </div>
            )}
            
            {!hasNextPage && transactions.length > 0 && (
              <div className="text-center py-4 text-sm text-gray-500">
                No more transactions to load
              </div>
            )}

            {transactions.length === 0 && !transactionsLoading && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No transactions found</p>
                {activeFilterCount > 0 && (
                  <p className="text-sm mt-2">Try adjusting your filters</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}