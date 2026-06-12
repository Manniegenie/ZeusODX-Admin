import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fundUser, deductUser } from '../services/funding.service';
import type { FundUserRequest, FundUserResponse } from '../types/funding.types';

export const fundUserThunk = createAsyncThunk<FundUserResponse, FundUserRequest & { twoFAToken?: string }, { rejectValue: string }>(
  'funding/fundUser',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');
      const { twoFAToken, ...fundData } = data;
      return await fundUser(fundData, token, twoFAToken);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Funding failed';
      return rejectWithValue(String(message));
    }
  }
);

export const deductUserThunk = createAsyncThunk<FundUserResponse, FundUserRequest & { twoFAToken?: string }, { rejectValue: string }>(
  'funding/deductUser',
  async (data, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No auth token');
      const { twoFAToken, ...deductData } = data;
      return await deductUser(deductData, token, twoFAToken);
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Deduction failed';
      return rejectWithValue(String(message));
    }
  }
);

interface FundingState {
  loading: boolean;
  error: string | null;
  response: FundUserResponse | null;
}

const initialState: FundingState = {
  loading: false,
  error: null,
  response: null,
};

const fundingSlice = createSlice({
  name: 'funding',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fundUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(fundUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(fundUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deductUserThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.response = null;
      })
      .addCase(deductUserThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.response = action.payload;
      })
      .addCase(deductUserThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const fundingReducer = fundingSlice.reducer;