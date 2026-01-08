import axios from '@/core/services/axios';
import type { LoginCredentials, RegisterCredentials, ResetPasswordCredentials } from '@/core/types/auth.types';

const BASE_URL = import.meta.env.VITE_BASE_URL;

class AuthService {

  async login(credentials: LoginCredentials) {
    try {
      // Only include twoFAToken if it has a value
      const payload: any = {
        email: credentials.email,
        passwordPin: credentials.passwordPin,
      };

      if (credentials.twoFAToken && credentials.twoFAToken.trim() !== '') {
        payload.twoFAToken = credentials.twoFAToken;
      }

      const response = await axios.post(`${BASE_URL}/adminsignin/signin`, payload, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      // Handle validation errors (400 status)
      if (error.response?.status === 400 && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const firstError = Array.isArray(validationErrors) ? validationErrors[0] : validationErrors;
        const errorMessage = firstError?.msg || firstError?.message || error.response?.data?.message || 'Validation failed';
        
        console.error('Login validation error:', {
          status: error.response.status,
          errors: validationErrors,
          message: errorMessage
        });
        
        throw new Error(errorMessage);
      }
      
      // Handle different error response formats
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Login failed';
      
      console.error('Login error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  }

  //  async login(credentials: LoginCredentials) {
  //   // FAKE LOGIN FOR DEVELOPMENT
  //   await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
  //   if (credentials.email === 'test@bramp.com' && credentials.passwordPin === "123456") {
  //     return {
  //       success: true,
  //       message: "Admin sign-in successful",
  //       accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDAyZDQ2OWM2MmI2ZjgyNTFkYzMyNCIsImVtYWlsIjoidGVzdEBicmFtcC5jb20iLCJhZG1pbk5hbWUiOiJUZXN0IEFkbWluIiwicm9sZSI6ImFkbWluIiwiYWRtaW5Sb2xlIjoic3VwZXJfYWRtaW4iLCJwZXJtaXNzaW9ucyI6eyJjYW5EZWxldGVVc2VycyI6dHJ1ZSwiY2FuTWFuYWdlV2FsbGV0cyI6dHJ1ZSwiY2FuTWFuYWdlRmVlcyI6dHJ1ZSwiY2FuVmlld1RyYW5zYWN0aW9ucyI6dHJ1ZSwiY2FuRnVuZFVzZXJzIjp0cnVlLCJjYW5NYW5hZ2VLWUMiOnRydWUsImNhbkFjY2Vzc1JlcG9ydHMiOnRydWUsImNhbk1hbmFnZUFkbWlucyI6dHJ1ZX0sImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTg1NDE3NDAsImV4cCI6MTc1ODU0NTM0MH0.XouNQG1nuZyu9_qTKzs3pVjkofNOOr_EyyqkikmfAvY",
  //       refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDAyZDQ2OWM2MmI2ZjgyNTFkYzMyNCIsInR5cGUiOiJhZG1pbiIsImlhdCI6MTc1ODU0MTc0MCwiZXhwIjoxNzU5MTQ2NTQwfQ.RSp9ziOoECkL6qAvSKqsklZFMwqa7BhVWxaVXXbcZKA",
  //       admin: {
  //         id: "68d02d469c62b6f8251dc324",
  //         adminName: "Test Admin",
  //         name: "Test Admin",
  //         email: "test@bramp.com",
  //         role: "super_admin",
  //         permissions: {
  //           canDeleteUsers: true,
  //           canManageWallets: true,
  //           canManageFees: true,
  //           canViewTransactions: true,
  //           canFundUsers: true,
  //           canManageKYC: true,
  //           canAccessReports: true,
  //           canManageAdmins: true
  //         },
  //         createdAt: "2025-09-21T16:52:22.214Z"
  //       }
  //     };
  //   } else {
  //     throw { success: false, message: 'Invalid PIN. 4 attempt(s) remaining.' };
  //   }
  // }

    async fakeLogin() {
      // Store the provided token in localStorage
      const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4ZDAyZDQ2OWM2MmI2ZjgyNTFkYzMyNCIsImVtYWlsIjoidGVzdEBicmFtcC5jb20iLCJhZG1pbk5hbWUiOiJUZXN0IEFkbWluIiwicm9sZSI6ImFkbWluIiwiYWRtaW5Sb2xlIjoic3VwZXJfYWRtaW4iLCJwZXJtaXNzaW9ucyI6eyJjYW5EZWxldGVVc2VycyI6dHJ1ZSwiY2FuTWFuYWdlV2FsbGV0cyI6dHJ1ZSwiY2FuTWFuYWdlRmVlcyI6dHJ1ZSwiY2FuVmlld1RyYW5zYWN0aW9ucyI6dHJ1ZSwiY2FuRnVuZFVzZXJzIjp0cnVlLCJjYW5NYW5hZ2VLWUMiOnRydWUsImNhbkFjY2Vzc1JlcG9ydHMiOnRydWUsImNhbk1hbmFnZUFkbWlucyI6dHJ1ZX0sImlzQWN0aXZlIjp0cnVlLCJpYXQiOjE3NTg1NDE3NDAsImV4cCI6MTc1ODU0NTM0MH0.XouNQG1nuZyu9_qTKzs3pVjkofNOOr_EyyqkikmfAvY';
      localStorage.setItem('token', token);
      return { token };
    }

  async register(credentials: RegisterCredentials) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    return response.json();
  }

  async resetPassword(credentials: ResetPasswordCredentials) {
    const response = await fetch(`${BASE_URL}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      throw new Error('Password reset failed');
    }

    return response.json();
  }

  async logout() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await fetch(`${BASE_URL}/adminsignin/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        // Optionally handle error (e.g., log or show message)
      }
    }
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();