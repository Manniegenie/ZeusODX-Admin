export interface KYCEntry {
  _id: string;
  userId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'PROVISIONAL' | 'CANCELLED';
  idType: string;
  frontendIdType: string;
  idNumber: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  documentExpiryDate?: string;
  country: string;
  resultCode?: string;
  resultText?: string;
  confidenceValue?: string;
  verificationDate?: string;
  createdAt: string;
  lastUpdated: string;
  imageLinks?: {
    selfie_image?: string;
    liveness_images?: string[];
    document_image?: string;
    cropped_image?: string;
  };
  hasImages?: boolean;
  user: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
    kycLevel: string;
    kycStatus: string;
  };
}

export interface KYCResponse {
  success: boolean;
  data: {
    kycEntries: KYCEntry[];
    pagination: {
      currentPage: number;
      totalPages: number;
      total: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
      limit: number;
    };
    filters: {
      status?: string;
      idType?: string;
      searchTerm?: string;
      dateFrom?: string;
      dateTo?: string;
    };
  };
}

export interface FilterParams {
  searchTerm?: string;
  status?: string;
  idType?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface KYCDetailsResponse {
  success: boolean;
  data: {
    kyc: KYCEntry;
    user: {
      _id: string;
      firstname: string;
      lastname: string;
      email: string;
      phonenumber: string;
      kycLevel: string;
      kycStatus: string;
      createdAt: string;
      bvn?: string;
      bvnVerified?: boolean;
    };
  };
}

export interface KYCUpgradeRequest {
  phoneNumber: string;
  kycLevel: 'level1' | 'level2' | 'level3';
  reason?: string;
}

export interface KYCUpgradeResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    phoneNumber: string;
    kycLevel: string;
    reason: string;
  };
}
