export interface UserSummary {
  _id: string;
  email: string;
  username?: string;
  firstname?: string;
  lastname?: string;
  kycLevel?: number;
  kycStatus?: string;
  emailVerified?: boolean;
  chatbotTransactionVerified?: boolean;
  createdAt?: string;
  lastBalanceUpdate?: string;
}

export interface UsersSummaryResponse {
  success: true;
  data: {
    users: UserSummary[];
    pagination: {
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    };
  };
}

export interface RemovePasswordResponse {
  message: string;
}

export interface Disable2FaResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    is2FAEnabled: boolean;
    is2FAVerified: boolean;
  };
}

export interface WalletEntry {
  address: string;
  network: string;
  walletReferenceId: string;
}

export interface FetchWalletsResponse {
  email: string;
  wallets: Record<string, WalletEntry>;
  balances: {
    [key: string]: number | undefined;
    btcBalance?: number;
    btcBalanceUSD?: number;
    ethBalance?: number;
    ethBalanceUSD?: number;
    totalPortfolioBalance?: number;
  };
}

export interface DeductBalanceResponse {
  success: boolean;
  message: string;
  previousBalance: number;
  deductedAmount: number;
  newBalance: number;
  currency: string;
}

export interface CompleteUserSummaryResponse {
  success: boolean;
  data: {
    user: {
      _id: string;
      email: string;
      username?: string;
      firstname?: string;
      lastname?: string;
      phonenumber?: string;
      avatarUrl?: string;
      kycLevel?: number;
      kycStatus?: string;
      emailVerified?: boolean;
      chatbotTransactionVerified?: boolean;
      is2FAEnabled?: boolean;
      is2FAVerified?: boolean;
      bvnVerified?: boolean;
      bankAccounts?: Array<{
        accountName: string;
        bankName: string;
        bankCode: string;
        accountNumber: string;
        addedAt: string;
        isVerified: boolean;
        isActive: boolean;
      }>;
      createdAt?: string;
      updatedAt?: string;
      lastBalanceUpdate?: string;
      portfolioLastUpdated?: string;
      kyc?: {
        level1?: {
          status: string;
          phoneVerified: boolean;
          verifiedAt?: string;
          rejectionReason?: string;
        };
        level2?: {
          status: string;
          emailVerified: boolean;
          documentSubmitted: boolean;
          documentType?: string;
          documentNumber?: string;
          submittedAt?: string;
          approvedAt?: string;
          rejectedAt?: string;
          rejectionReason?: string;
        };
      };
    };
    wallets: Record<string, WalletEntry>;
    balances: {
      [key: string]: number | undefined;
      btcBalance?: number;
      btcPendingBalance?: number;
      ethBalance?: number;
      ethPendingBalance?: number;
      solBalance?: number;
      solPendingBalance?: number;
      usdtBalance?: number;
      usdtPendingBalance?: number;
      usdcBalance?: number;
      usdcPendingBalance?: number;
      bnbBalance?: number;
      bnbPendingBalance?: number;
      maticBalance?: number;
      maticPendingBalance?: number;
      trxBalance?: number;
      trxPendingBalance?: number;
      ngnzBalance?: number;
      ngnzPendingBalance?: number;
      totalPortfolioBalance?: number;
    };
    lastUpdated?: string;
  };
}

export type UserApiTypes = UserSummary | UsersSummaryResponse | RemovePasswordResponse;