export interface GiftCardRate {
  id: string;
  cardType: string;
  country: string;
  rate: number;
  rateDisplay: string;
  physicalRate?: number;
  ecodeRate?: number;
  sourceCurrency: string;
  targetCurrency: string;
  minAmount: number;
  maxAmount: number;
  vanillaType?: string;
  isActive: boolean;
  lastUpdated?: string;
  notes?: string;
  createdAt: string;
}

export interface GiftCardRatesResponse {
  success: boolean;
  data: {
    rates: GiftCardRate[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRates: number;
      limit: number;
    };
  };
  message: string;
}

export interface FilterParams {
  country?: string;
  cardType?: string;
  vanillaType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateRateRequest {
  cardType: string;
  country: string;
  rate: number;
  physicalRate?: number;
  ecodeRate?: number;
  sourceCurrency?: string;
  targetCurrency?: string;
  minAmount?: number;
  maxAmount?: number;
  vanillaType?: string;
  notes?: string;
}

export interface UpdateRateRequest {
  rate?: number;
  physicalRate?: number;
  ecodeRate?: number;
  minAmount?: number;
  maxAmount?: number;
  isActive?: boolean;
  notes?: string;
}

export interface BulkCreateRatesRequest {
  rates: CreateRateRequest[];
}

export interface CreateRateResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    cardType: string;
    country: string;
    rate: number;
    rateDisplay: string;
    physicalRate?: number;
    ecodeRate?: number;
    minAmount: number;
    maxAmount: number;
    vanillaType?: string;
    isActive: boolean;
    createdAt: string;
  };
}

export interface BulkCreateRatesResponse {
  success: boolean;
  message: string;
  data: {
    totalCreated: number;
    rates: Array<{
      id: string;
      cardType: string;
      country: string;
      rate: number;
      rateDisplay: string;
      vanillaType?: string;
    }>;
  };
}

export interface DeleteRateResponse {
  success: boolean;
  message: string;
  data: {
    deletedRate: {
      cardType: string;
      country: string;
      rate: number;
      vanillaType?: string;
    };
  };
}

// Gift Card Submission Types
export type SubmissionStatus = 'PENDING' | 'REVIEWING' | 'APPROVED' | 'REJECTED' | 'PAID';
export type CardFormat = 'PHYSICAL' | 'E_CODE';
export type RejectionReason =
  | 'INVALID_IMAGE'
  | 'ALREADY_USED'
  | 'INSUFFICIENT_BALANCE'
  | 'FAKE_CARD'
  | 'UNREADABLE'
  | 'WRONG_TYPE'
  | 'EXPIRED'
  | 'INVALID_ECODE'
  | 'DUPLICATE_ECODE'
  | 'OTHER';

export interface GiftCardSubmission {
  _id: string;
  // Backend returns userId as populated object in detail view or user object in list view
  userId: string | {
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
    phonenumber: string;
    username?: string;
  };
  user?: {
    _id: string;
    email: string;
    firstname: string;
    lastname: string;
    phonenumber: string;
    username?: string;
  };
  cardType: string;
  cardFormat: CardFormat;
  country: string;
  cardValue: number;
  currency: string;
  eCode?: string;
  cardRange?: string;
  description?: string;
  imageUrls: string[];
  imagePublicIds: string[];
  totalImages: number;
  status: SubmissionStatus;
  expectedRate: number;
  expectedRateDisplay: string;
  expectedAmountToReceive: number;
  expectedSourceCurrency: string;
  expectedTargetCurrency: string;
  giftCardRateId?: string;
  approvedValue?: number;
  paymentRate?: number;
  paymentAmount?: number;
  paidAt?: string;
  transactionId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: RejectionReason;
  vanillaType?: string;
  metadata?: {
    submittedAt: string;
    userAgent?: string;
    ipAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionFilterParams {
  page?: number;
  limit?: number;
  status?: SubmissionStatus;
  cardType?: string;
  country?: string;
  searchTerm?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SubmissionsResponse {
  success: boolean;
  data: {
    submissions: GiftCardSubmission[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalSubmissions: number;
      limit: number;
    };
  };
  message: string;
}

export interface SubmissionDetailResponse {
  success: boolean;
  data: GiftCardSubmission;
  message: string;
}

export interface ApproveSubmissionRequest {
  approvedValue: number;
  paymentRate: number;
  notes?: string;
}

export interface ApproveSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    submissionId: string;
    status: SubmissionStatus;
    paymentAmount: number;
    transactionId: string;
    userBalance: number;
  };
}

export interface RejectSubmissionRequest {
  rejectionReason: RejectionReason;
  notes?: string;
}

export interface RejectSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    submissionId: string;
    status: SubmissionStatus;
    rejectionReason: RejectionReason;
  };
}

export interface ReviewSubmissionResponse {
  success: boolean;
  message: string;
  data: {
    submissionId: string;
    status: SubmissionStatus;
  };
}
