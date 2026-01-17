export interface GiftCardRate {
  id: string;
  cardType: string;
  country: string;
  rate: number;
  rateDisplay: string;
  physicalRate?: number;
  ecodeRate?: number;
  minAmount?: number;
  maxAmount?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastUpdated?: string;
  updatedBy?: string;
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