import { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { DashboardTitleContext } from '@/layouts/DashboardTitleContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Copy, ExternalLink, User, CreditCard, ArrowRightLeft, Wallet, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { TransactionService, type TransactionDetails } from '../services/transactionService';
import { usePermissions } from '@/core/hooks/usePermissions';

export function TransactionDetail() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const titleCtx = useContext(DashboardTitleContext);
  const { hasFeatureAccess } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<TransactionDetails | null>(null);

  useEffect(() => {
    titleCtx?.setTitle('Transaction Details');
  }, [titleCtx]);

  useEffect(() => {
    const loadTransaction = async () => {
      if (!transactionId) {
        toast.error('Transaction ID is required');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        const response = await TransactionService.getTransactionDetails(transactionId);
        if (response.success) {
          setTransaction(response.data.transaction);
        } else {
          toast.error('Failed to load transaction details');
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error loading transaction:', error);
        toast.error(error?.response?.data?.error || 'Failed to load transaction details');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    loadTransaction();
  }, [transactionId, navigate]);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      'SUCCESSFUL': 'bg-green-100 text-green-800',
      'COMPLETED': 'bg-green-100 text-green-800',
      'CONFIRMED': 'bg-green-100 text-green-800',
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'FAILED': 'bg-red-100 text-red-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeDisplayName = (type: string) => {
    const displayNames: Record<string, string> = {
      'OBIEX_SWAP': 'Provider Swap',
      'SWAP': 'Swap',
      'DEPOSIT': 'Deposit',
      'WITHDRAWAL': 'Withdrawal',
      'GIFTCARD': 'Gift Card',
      'INTERNAL_TRANSFER_SENT': 'Transfer Sent',
      'INTERNAL_TRANSFER_RECEIVED': 'Transfer Received'
    };
    return displayNames[type] || type;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SWAP':
      case 'OBIEX_SWAP':
        return <ArrowRightLeft className="w-5 h-5" />;
      case 'DEPOSIT':
        return <Wallet className="w-5 h-5" />;
      case 'WITHDRAWAL':
        return <Building2 className="w-5 h-5" />;
      case 'GIFTCARD':
        return <CreditCard className="w-5 h-5" />;
      case 'INTERNAL_TRANSFER_SENT':
      case 'INTERNAL_TRANSFER_RECEIVED':
        return <ArrowRightLeft className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(amount) + ' ' + currency;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="w-full bg-white space-y-4 p-6 rounded">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="w-full bg-white space-y-4 p-6 rounded">
        <div className="text-center py-8">
          <p className="text-gray-500">Transaction not found</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white space-y-6 p-6 rounded">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction Details</h1>
            <p className="text-gray-600 mt-1">View complete transaction information</p>
          </div>
        </div>
      </div>

      {/* Transaction Overview Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-lg ${getStatusBadge(transaction.status)}`}>
              {getTypeIcon(transaction.type)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{getTypeDisplayName(transaction.type)}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(transaction.status)}`}>
                {transaction.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Amount</p>
            <p className={`text-2xl font-bold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
            </p>
          </div>
        </div>

        {/* Transaction ID and Reference */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-500">Transaction ID</p>
              <p className="font-mono text-sm font-semibold">{transaction.id}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(transaction.id, 'Transaction ID')}
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          {transaction.reference && (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-500">Reference</p>
                <p className="font-mono text-sm font-semibold">{transaction.reference}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(transaction.reference!, 'Reference')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* User Information */}
        {transaction.user && (
          <Card className="p-4 mb-6 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-semibold text-gray-900">{transaction.user.name}</p>
                  <p className="text-sm text-gray-600">{transaction.user.email}</p>
                  <p className="text-xs text-gray-500">@{transaction.user.username} • {transaction.user.phone}</p>
                </div>
              </div>
              {hasFeatureAccess('userManagement') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/users?search=${transaction.user?.email}`)}
                  className="flex items-center gap-2"
                >
                  View User
                  <ExternalLink className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Transaction Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Type:</span>
                <span className="font-semibold">{getTypeDisplayName(transaction.type)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-semibold ${getStatusBadge(transaction.status)} px-2 py-1 rounded`}>
                  {transaction.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Currency:</span>
                <span className="font-semibold">{transaction.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className={`font-semibold ${transaction.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {transaction.amount < 0 ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
                </span>
              </div>
              {transaction.fee !== undefined && transaction.fee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="font-semibold">{formatCurrency(transaction.fee, transaction.currency)}</span>
                </div>
              )}
              {transaction.network && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-semibold">{transaction.network}</span>
                </div>
              )}
              {transaction.source && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Source:</span>
                  <span className="font-semibold">{transaction.source}</span>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Timestamps</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Created:</span>
                <span className="font-semibold text-sm">{formatDate(transaction.createdAt)}</span>
              </div>
              {transaction.updatedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Updated:</span>
                  <span className="font-semibold text-sm">{formatDate(transaction.updatedAt)}</span>
                </div>
              )}
              {transaction.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-semibold text-sm">{formatDate(transaction.completedAt)}</span>
                </div>
              )}
              {transaction.failedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Failed:</span>
                  <span className="font-semibold text-sm text-red-600">{formatDate(transaction.failedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Swap Details */}
        {transaction.swapDetails && (
          <Card className="p-4 bg-blue-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Swap Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">From</p>
                <p className="font-semibold text-lg">{formatCurrency(transaction.swapDetails.fromAmount, transaction.swapDetails.fromCurrency)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">To</p>
                <p className="font-semibold text-lg">{formatCurrency(transaction.swapDetails.toAmount, transaction.swapDetails.toCurrency)}</p>
              </div>
              {transaction.swapDetails.swapType && (
                <div>
                  <p className="text-sm text-gray-600">Swap Type</p>
                  <p className="font-semibold">{transaction.swapDetails.swapType}</p>
                </div>
              )}
              {transaction.swapDetails.exchangeRate && (
                <div>
                  <p className="text-sm text-gray-600">Exchange Rate</p>
                  <p className="font-semibold">{transaction.swapDetails.exchangeRate.toFixed(6)}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Withdrawal Details */}
        {transaction.withdrawalDetails && (
          <Card className="p-4 bg-orange-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Withdrawal Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transaction.withdrawalDetails.bankName && (
                <div>
                  <p className="text-sm text-gray-600">Bank Name</p>
                  <p className="font-semibold">{transaction.withdrawalDetails.bankName}</p>
                </div>
              )}
              {transaction.withdrawalDetails.accountName && (
                <div>
                  <p className="text-sm text-gray-600">Account Name</p>
                  <p className="font-semibold">{transaction.withdrawalDetails.accountName}</p>
                </div>
              )}
              {transaction.withdrawalDetails.accountNumberMasked && (
                <div>
                  <p className="text-sm text-gray-600">Account Number</p>
                  <p className="font-semibold font-mono">{transaction.withdrawalDetails.accountNumberMasked}</p>
                </div>
              )}
              {transaction.withdrawalDetails.amountSentToBank !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Amount Sent</p>
                  <p className="font-semibold">{formatCurrency(transaction.withdrawalDetails.amountSentToBank, 'NGN')}</p>
                </div>
              )}
              {transaction.withdrawalDetails.withdrawalFee !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Withdrawal Fee</p>
                  <p className="font-semibold">{formatCurrency(transaction.withdrawalDetails.withdrawalFee, 'NGN')}</p>
                </div>
              )}
              {transaction.withdrawalDetails.obiexStatus && (
                <div>
                  <p className="text-sm text-gray-600">Provider Status</p>
                  <p className="font-semibold">{transaction.withdrawalDetails.obiexStatus}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Transfer Details */}
        {(transaction.recipient || transaction.sender) && (
          <Card className="p-4 bg-purple-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transfer Details</h3>
            {transaction.recipient && (
              <div className="mb-3">
                <p className="text-sm text-gray-600">Recipient</p>
                <p className="font-semibold">{transaction.recipient.name || transaction.recipient.username}</p>
                {transaction.recipient.email && (
                  <p className="text-sm text-gray-500">{transaction.recipient.email}</p>
                )}
              </div>
            )}
            {transaction.sender && (
              <div>
                <p className="text-sm text-gray-600">Sender</p>
                <p className="font-semibold">{transaction.sender.name || transaction.sender.username}</p>
                {transaction.sender.email && (
                  <p className="text-sm text-gray-500">{transaction.sender.email}</p>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Gift Card Details */}
        {transaction.giftCardDetails && (
          <Card className="p-4 bg-green-50">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gift Card Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transaction.giftCardDetails.cardType && (
                <div>
                  <p className="text-sm text-gray-600">Card Type</p>
                  <p className="font-semibold">{transaction.giftCardDetails.cardType}</p>
                </div>
              )}
              {transaction.giftCardDetails.country && (
                <div>
                  <p className="text-sm text-gray-600">Country</p>
                  <p className="font-semibold">{transaction.giftCardDetails.country}</p>
                </div>
              )}
              {transaction.giftCardDetails.expectedRate && (
                <div>
                  <p className="text-sm text-gray-600">Expected Rate</p>
                  <p className="font-semibold">{transaction.giftCardDetails.expectedRate}</p>
                </div>
              )}
              {transaction.giftCardDetails.expectedAmountToReceive !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">Expected Amount</p>
                  <p className="font-semibold">{formatCurrency(transaction.giftCardDetails.expectedAmountToReceive, transaction.currency)}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Additional Information */}
        {(transaction.narration || transaction.hash || transaction.memo || transaction.failureReason) && (
          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-3">
              {transaction.narration && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Narration</p>
                  <p className="font-semibold">{transaction.narration}</p>
                </div>
              )}
              {transaction.hash && (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Transaction Hash</p>
                    <p className="font-mono text-sm font-semibold break-all">{transaction.hash}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transaction.hash!, 'Transaction Hash')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
              {transaction.memo && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Memo</p>
                  <p className="font-semibold">{transaction.memo}</p>
                </div>
              )}
              {transaction.failureReason && (
                <div>
                  <p className="text-sm text-red-600 mb-1">Failure Reason</p>
                  <p className="font-semibold text-red-600">{transaction.failureReason}</p>
                </div>
              )}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
}
