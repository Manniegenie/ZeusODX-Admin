import axios from '@/core/services/axios';

export interface TransactionDetails {
  id: string;
  userId?: string;
  username?: string;
  userEmail?: string;
  type: string;
  status: string;
  currency: string;
  amount: number;
  fee?: number;
  narration?: string;
  reference?: string;
  source?: string;
  network?: string;
  hash?: string;
  transactionId?: string;
  obiexTransactionId?: string;
  memo?: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  failedAt?: string;
  failureReason?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    username: string;
    phone: string;
    kycLevel?: number;
    kycStatus?: string;
  };
  recipient?: {
    id?: string;
    name?: string;
    email?: string;
    username: string;
    fullName?: string;
  };
  sender?: {
    id?: string;
    name?: string;
    email?: string;
    username: string;
    fullName?: string;
  };
  swapDetails?: {
    fromCurrency: string;
    toCurrency: string;
    fromAmount: number;
    toAmount: number;
    swapType?: string;
    swapCategory?: string;
    swapPair?: string;
    exchangeRate?: number;
    swapDirection?: string;
  };
  withdrawalDetails?: {
    bankName?: string;
    accountName?: string;
    accountNumberMasked?: string;
    accountNumberLast4?: string;
    requestedAmount?: number;
    withdrawalFee?: number;
    amountSentToBank?: number;
    provider?: string;
    obiexStatus?: string;
    obiexReference?: string;
  };
  giftCardDetails?: {
    cardType?: string;
    cardFormat?: string;
    cardRange?: string;
    country?: string;
    eCode?: string;
    expectedRate?: number;
    expectedAmountToReceive?: number;
  };
  metadata?: any;
}

export interface TransactionDetailsResponse {
  success: boolean;
  data: {
    transaction: TransactionDetails;
  };
}

export class TransactionService {
  private static readonly API_BASE = '/admin/transaction';

  /**
   * Get transaction details by ID
   */
  static async getTransactionDetails(transactionId: string): Promise<TransactionDetailsResponse> {
    try {
      const response = await axios.get(`${this.API_BASE}/${transactionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction details:', error);
      throw error;
    }
  }
}
