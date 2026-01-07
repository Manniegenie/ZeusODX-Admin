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
