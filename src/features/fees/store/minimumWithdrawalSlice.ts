import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { minimumWithdrawalService, type MinimumWithdrawalLimit } from '../services/minimumWithdrawalService';

interface MinimumWithdrawalState {
  limits: MinimumWithdrawalLimit[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: MinimumWithdrawalState = {
  limits: [],
  loading: false,
  saving: false,
  error: null,
};

export const fetchMinWithdrawals = createAsyncThunk(
  'minimumWithdrawal/fetchAll',
  async () => {
    const response = await minimumWithdrawalService.getAll();
    return response.data;
  }
);

export const upsertMinWithdrawal = createAsyncThunk(
  'minimumWithdrawal/upsert',
  async (payload: { currency: string; network: string; networkName?: string; minAmount: number; maxAmount: number; isActive?: boolean }) => {
    const response = await minimumWithdrawalService.upsert(payload);
    return response.data;
  }
);

export const toggleMinWithdrawal = createAsyncThunk(
  'minimumWithdrawal/toggle',
  async ({ currency, network, isActive }: { currency: string; network: string; isActive: boolean }) => {
    const response = await minimumWithdrawalService.toggle(currency, network, isActive);
    return response.data;
  }
);

export const deleteMinWithdrawal = createAsyncThunk(
  'minimumWithdrawal/delete',
  async ({ currency, network }: { currency: string; network: string }) => {
    await minimumWithdrawalService.delete(currency, network);
    return { currency, network };
  }
);

const minimumWithdrawalSlice = createSlice({
  name: 'minimumWithdrawal',
  initialState,
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMinWithdrawals.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchMinWithdrawals.fulfilled, (state, action) => { state.loading = false; state.limits = action.payload ?? []; })
      .addCase(fetchMinWithdrawals.rejected, (state, action) => { state.loading = false; state.error = action.error.message ?? 'Failed to fetch limits'; })

      .addCase(upsertMinWithdrawal.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(upsertMinWithdrawal.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.limits.findIndex(l => l.currency === action.payload.currency && l.network === action.payload.network);
        if (idx >= 0) state.limits[idx] = action.payload;
        else state.limits.push(action.payload);
      })
      .addCase(upsertMinWithdrawal.rejected, (state, action) => { state.saving = false; state.error = action.error.message ?? 'Failed to save limit'; })

      .addCase(toggleMinWithdrawal.fulfilled, (state, action) => {
        const idx = state.limits.findIndex(l => l.currency === action.payload.currency && l.network === action.payload.network);
        if (idx >= 0) state.limits[idx] = action.payload;
      })

      .addCase(deleteMinWithdrawal.fulfilled, (state, action) => {
        state.limits = state.limits.filter(l => !(l.currency === action.payload.currency && l.network === action.payload.network));
      });
  },
});

export const { clearError } = minimumWithdrawalSlice.actions;
export default minimumWithdrawalSlice.reducer;
