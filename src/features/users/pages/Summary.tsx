import { useContext, useEffect, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { RefreshCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { DashboardTitleContext } from "@/layouts/DashboardTitleContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FetchWalletsResponse } from "@/features/users/types/userApi.types";
import { WalletList } from "@/features/funding/components/WalletList";
import { getCompleteUserSummary, getUserTransactions } from "@/features/users/services/usersService";
import { toast } from "sonner";
import { DataTable } from "@/features/dashboard/components/data-table";
import { columns } from "@/features/dashboard/components/columns";
import type { Transaction } from "@/features/dashboard/type/analytic";

export function Summary() {
  const titleCtx = useContext(DashboardTitleContext);
  const location = useLocation();
  const navigate = useNavigate();
  const navState = (location.state ?? {}) as { user?: { email?: string } };

  const [userEmail] = useState<string>(
    () => navState.user?.email ?? ""
  );
  const [walletData, setWalletData] = useState<FetchWalletsResponse | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>("—");

  // Transaction states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    titleCtx?.setTitle("User Summary");
    titleCtx?.setBreadcrumb([
      "User management",
      "User Summary",
    ]);
  }, [titleCtx]);

  // Fetch user summary data
  useEffect(() => {
    const fetchSummary = async () => {
      if (!userEmail) {
        return;
      }

      setLoading(true);
      try {
        const response = await getCompleteUserSummary(userEmail);
        if (response.success && response.data) {
          // Store user data
          setUserData(response.data.user);

          // Transform the data to match FetchWalletsResponse format for WalletList
          const transformedData: FetchWalletsResponse = {
            email: response.data.user.email,
            wallets: response.data.wallets,
            balances: response.data.balances
          };
          setWalletData(transformedData);

          // Format last updated date
          if (response.data.lastUpdated) {
            const date = new Date(response.data.lastUpdated);
            setLastUpdated(date.toLocaleString('en-US', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            }));
          }
        }
      } catch (error: any) {
        console.error('Error fetching user summary:', error);
        toast.error(error?.response?.data?.error || 'Failed to fetch user summary');
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userEmail]);

  // Fetch user transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      if (!userEmail) {
        return;
      }

      setTransactionsLoading(true);
      try {
        const response = await getUserTransactions(userEmail);
        if (response.success && response.transactions) {
          // Transform transactions to match the Transaction interface
          const transformedTransactions: Transaction[] = response.transactions.map((txn: any) => ({
            id: txn._id || txn.id,
            userId: txn.userId,
            username: txn.username,
            userEmail: txn.userEmail || userEmail,
            type: txn.type,
            status: txn.status,
            currency: txn.currency,
            amount: txn.amount,
            fee: txn.fee,
            narration: txn.narration,
            reference: txn.reference,
            source: txn.source,
            createdAt: txn.createdAt,
            updatedAt: txn.updatedAt,
            completedAt: txn.completedAt,
            fromCurrency: txn.fromCurrency,
            toCurrency: txn.toCurrency,
            fromAmount: txn.fromAmount,
            toAmount: txn.toAmount,
            swapType: txn.swapType,
            exchangeRate: txn.exchangeRate,
            bankName: txn.bankName,
            accountName: txn.accountName,
            accountNumberMasked: txn.accountNumberMasked,
            withdrawalFee: txn.withdrawalFee,
            recipientUsername: txn.recipientUsername,
            senderUsername: txn.senderUsername,
            cardType: txn.cardType,
            country: txn.country,
            expectedRate: txn.expectedRate
          }));
          setTransactions(transformedTransactions);
        }
      } catch (error: any) {
        console.error('Error fetching transactions:', error);
        toast.error(error?.response?.data?.error || 'Failed to fetch transactions');
      } finally {
        setTransactionsLoading(false);
      }
    };

    fetchTransactions();
  }, [userEmail]);

  // Pagination
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  return (
    <div className="w-full px-10 pb-8">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => navigate('/users')}
          className="mb-4"
        >
          ← Back to Users
        </Button>
      </div>

      {/* Top Section: Portfolio Summary */}
      <div className="w-full mb-6">
        <div
          className="w-full h-60 rounded-md flex justify-between items-center text-white px-6 py-6 bg-primary"
          id="wallet-summary"
        >
          <div className="flex flex-col items-start gap-12 h-full text-xs space-y-2">
            <div className="h-fit flex flex-col items-start justify-start">
              <span className="font-semibold text-[20px]">
                User Portfolio Summary
              </span>
              <span className="text-xs text-sm font-light">
                {userEmail || "—"}
              </span>
            </div>
            <div className="h-full">
              <span className="flex items-center justify-start gap-2">
                <span className="text-[50px] font-semibold">
                  {loading ? (
                    'Loading...'
                  ) : (
                    (() => {
                      if (!walletData?.balances) return '—';
                      if (walletData.balances.totalPortfolioBalance !== undefined) {
                        return '$' + walletData.balances.totalPortfolioBalance.toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2
                        });
                      }
                      return '—';
                    })()
                  )}
                </span>
                <RefreshCcw
                  className={`h-4 w-4 text-white ${loading ? 'animate-spin' : ''}`}
                />
              </span>
              <span>Total Portfolio Value</span>
            </div>
          </div>
          <div className="flex flex-col items-end justify-start h-full text-xs">
            <span>Last Updated</span>
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: KYC Information */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">KYC Information</CardTitle>
              <CardDescription>User verification and identity details</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : userData ? (
                <div className="space-y-4">
                  {/* Personal Information */}
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Personal Details</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Name:</span>
                        <span className="font-medium">{userData.firstname} {userData.lastname}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email:</span>
                        <span className="font-medium text-xs">{userData.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone:</span>
                        <span className="font-medium">{userData.phonenumber || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Username:</span>
                        <span className="font-medium">{userData.username || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <h4 className="font-semibold text-sm">Verification Status</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-500">KYC Level:</span>
                        <span className={`font-medium ${userData.kycLevel === 2 ? 'text-green-600' : 'text-yellow-600'}`}>
                          Level {userData.kycLevel || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">KYC Status:</span>
                        <span className={`font-medium ${
                          userData.kycStatus === 'approved' ? 'text-green-600' :
                          userData.kycStatus === 'pending' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {userData.kycStatus || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email Verified:</span>
                        <span className={userData.emailVerified ? 'text-green-600' : 'text-red-600'}>
                          {userData.emailVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">BVN Verified:</span>
                        <span className={userData.bvnVerified ? 'text-green-600' : 'text-red-600'}>
                          {userData.bvnVerified ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">2FA Enabled:</span>
                        <span className={userData.is2FAEnabled ? 'text-green-600' : 'text-gray-500'}>
                          {userData.is2FAEnabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* KYC Details */}
                  {userData.kyc && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-semibold text-sm">KYC Details</h4>

                      {userData.kyc.level2 && (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Document Type:</span>
                            <span className="font-medium">{userData.kyc.level2.documentType || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Document Number:</span>
                            <span className="font-medium">{userData.kyc.level2.documentNumber || 'N/A'}</span>
                          </div>
                          {userData.kyc.level2.submittedAt && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Submitted:</span>
                              <span className="font-medium text-xs">
                                {new Date(userData.kyc.level2.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {userData.kyc.level2.rejectionReason && (
                            <div className="flex flex-col space-y-1">
                              <span className="text-gray-500">Rejection Reason:</span>
                              <span className="font-medium text-xs text-red-600">
                                {userData.kyc.level2.rejectionReason}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bank Accounts */}
                  {userData.bankAccounts && userData.bankAccounts.length > 0 && (
                    <div className="border-t pt-4 space-y-2">
                      <h4 className="font-semibold text-sm">Bank Accounts</h4>
                      <div className="space-y-2">
                        {userData.bankAccounts.map((account: any, idx: number) => (
                          <div key={idx} className="text-sm p-2 bg-gray-50 rounded">
                            <div className="font-medium">{account.bankName}</div>
                            <div className="text-gray-600">{account.accountNumber}</div>
                            <div className="text-gray-600 text-xs">{account.accountName}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4 space-y-1 text-xs text-gray-500">
                    <div>Account created: {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'N/A'}</div>
                    <div>Last updated: {userData.updatedAt ? new Date(userData.updatedAt).toLocaleDateString() : 'N/A'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">No user data available</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Column 2 & 3: Wallets and Balances */}
        <div className="lg:col-span-2">
          <WalletList data={walletData} />
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaction History</CardTitle>
            <CardDescription>
              User transaction history ({transactions.length} total transactions)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCcw className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-500">Loading transactions...</span>
              </div>
            ) : transactions.length > 0 ? (
              <>
                <DataTable columns={columns} data={paginatedTransactions} />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 border-t pt-4">
                    <div className="text-sm text-gray-500">
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToPreviousPage}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </Button>
                      <div className="text-sm">
                        Page {currentPage} of {totalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={goToNextPage}
                        disabled={currentPage === totalPages}
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No transactions found for this user
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
