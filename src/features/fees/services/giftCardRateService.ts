import axios from '@/core/services/axios';
import type { GiftCardRatesResponse } from '../type/giftCardRate.types';

export async function fetchGiftCardRatesAPI(params?: {
  country?: string;
  cardType?: string;
  vanillaType?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}): Promise<GiftCardRatesResponse> {
    const BASE_URL = import.meta.env.VITE_BASE_URL;
    const token = localStorage.getItem('token');
  const response = await axios.get(`${BASE_URL}/admingiftcard/rates`, {
      params,
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });
    return response.data;
}

export async function createGiftCardRateAPI(data: {
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
  isActive?: boolean;
}): Promise<unknown> {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/admingiftcard/rates`,
    data,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  );
  return response.data;
}

/**
 * Bulk create gift card rates
 * POST /admingiftcard/rates/bulk
 * payload: { rates: [...] }
 */
export const bulkCreateGiftCardRatesAPI = async (payload: { rates: Record<string, unknown>[] }) => {
  // Prefer axios so callers can attach onUploadProgress if desired.
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/admingiftcard/rates/bulk`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  );

  return response.data;
}

/**
 * Bulk create with progress callback (browser upload progress).
 * onUploadProgress receives a ProgressEvent and should update percent accordingly.
 */
import type { AxiosProgressEvent } from 'axios';

export const bulkCreateGiftCardRatesWithProgress = async (
  payload: { rates: Record<string, unknown>[] },
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void
) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');
  const response = await axios.post(
    `${BASE_URL}/admingiftcard/rates/bulk`,
    payload,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      onUploadProgress,
    }
  );

  return response.data;
}

/**
 * Delete a gift card rate by id
 * DELETE /admingiftcard/rates/:id
 */
export const deleteGiftCardRateAPI = async (id: string) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');

  const res = await axios.delete(`${BASE_URL}/admingiftcard/rates/${encodeURIComponent(id)}`, {
    headers: { "Content-Type": "application/json", Authorization: token ? `Bearer ${token}` : undefined }
  });

  return res.data;
}

/**
 * Update a gift card rate by id
 * PUT /admingiftcard/rates/:id
 * body: { rate?: number; physicalRate?: number; ecodeRate?: number; minAmount?: number; maxAmount?: number; isActive?: boolean; notes?: string }
 */
export const updateGiftCardRateAPI = async (
  id: string,
  body: { rate?: number; physicalRate?: number; ecodeRate?: number; minAmount?: number; maxAmount?: number; isActive?: boolean; notes?: string }
) => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const token = localStorage.getItem('token');

  const res = await axios.put(`${BASE_URL}/admingiftcard/rates/${encodeURIComponent(id)}`, body, {
    headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : undefined }
  });

  return res.data;
}