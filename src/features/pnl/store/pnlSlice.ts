import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { pnlService, type PnlSnapshot, type RevenueData } from '../services/pnlService';

interface PnlState {
  snapshot: PnlSnapshot | null;
  revenue: RevenueData | null;
  snapshotLoading: boolean;
  revenueLoading: boolean;
  snapshotError: string | null;
  revenueError: string | null;
  lastSnapshotAt: string | null;
}

const initialState: PnlState = {
  snapshot: null,
  revenue: null,
  snapshotLoading: false,
  revenueLoading: false,
  snapshotError: null,
  revenueError: null,
  lastSnapshotAt: null,
};

export const fetchPnlSnapshot = createAsyncThunk('pnl/snapshot', async () => {
  const res = await pnlService.getSnapshot();
  return res.data;
});

export const fetchPnlRevenue = createAsyncThunk(
  'pnl/revenue',
  async ({ dateFrom, dateTo }: { dateFrom?: string; dateTo?: string }) => {
    const res = await pnlService.getRevenue(dateFrom, dateTo);
    return res.data;
  }
);

const pnlSlice = createSlice({
  name: 'pnl',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPnlSnapshot.pending, (state) => { state.snapshotLoading = true; state.snapshotError = null; })
      .addCase(fetchPnlSnapshot.fulfilled, (state, action) => {
        state.snapshotLoading = false;
        state.snapshot = action.payload;
        state.lastSnapshotAt = new Date().toLocaleString();
      })
      .addCase(fetchPnlSnapshot.rejected, (state, action) => {
        state.snapshotLoading = false;
        state.snapshotError = action.error.message ?? 'Failed to fetch PNL snapshot';
      })
      .addCase(fetchPnlRevenue.pending, (state) => { state.revenueLoading = true; state.revenueError = null; })
      .addCase(fetchPnlRevenue.fulfilled, (state, action) => { state.revenueLoading = false; state.revenue = action.payload; })
      .addCase(fetchPnlRevenue.rejected, (state, action) => {
        state.revenueLoading = false;
        state.revenueError = action.error.message ?? 'Failed to fetch revenue';
      });
  },
});

export default pnlSlice.reducer;
