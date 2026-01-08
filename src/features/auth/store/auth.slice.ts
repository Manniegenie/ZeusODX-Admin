import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import  type { AuthState, LoginCredentials, RegisterCredentials, ResetPasswordCredentials } from '@/core/types/auth.types';
import { authService } from '../services/auth.service';

const getPersistedUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

const initialState: AuthState = {
  user: getPersistedUser(),
  token: localStorage.getItem('token'),
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.register(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (credentials: ResetPasswordCredentials, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(credentials);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Password reset failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
      logout: (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        // Check if 2FA is required (don't set user/token yet)
        if (action.payload.requires2FA) {
          // Don't set user or token, just return the response
          return;
        }
        state.user = action.payload.admin;
        state.token = action.payload.accessToken;
        if (action.payload.accessToken) {
          localStorage.setItem('token', action.payload.accessToken);
        }
        if (action.payload.admin) {
          // Ensure name is present and saved
          const userToSave = {
            ...action.payload.admin,
            name: action.payload.admin.name || action.payload.admin.username || '',
          };
          localStorage.setItem('user', JSON.stringify(userToSave));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        if (action.payload && typeof action.payload === 'object' && 'message' in action.payload) {
          state.error = (action.payload as any).message;
        } else {
          state.error = action.payload as string;
        }
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        if (action.payload.user) {
          // Ensure name is present and saved
          const userToSave = {
            ...action.payload.user,
            name: action.payload.user.name || action.payload.user.username || '',
          };
          localStorage.setItem('user', JSON.stringify(userToSave));
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export const authReducer = authSlice.reducer;