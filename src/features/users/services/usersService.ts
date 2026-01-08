import axios from '@/core/services/axios';
import type { UsersSummaryResponse, RemovePasswordResponse, FetchWalletsResponse, WipePendingResponse, CompleteUserSummaryResponse } from '@/features/users/types/userApi.types';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export async function getUsersSummary(params?: Record<string, string | number | boolean>) : Promise<UsersSummaryResponse> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${BASE_URL}/usermanagement/users/summary`, {
    params,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data as UsersSummaryResponse;
}

export async function getUsers(params?: Record<string, string | number | boolean>) : Promise<import('../types/user').GetUsersResponse> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${BASE_URL}/usermanagement/users`, {
    params,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data as import('../types/user').GetUsersResponse;
}

export async function deleteUser(email: string) : Promise<{ success: boolean; message: string; deletedUser: { email: string; _id: string } }> {
  const token = localStorage.getItem('token');
  const res = await axios.delete(`${BASE_URL}/deleteuser/user`, {
    data: { email },
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data;
}

export async function removePasswordPin(email: string) : Promise<RemovePasswordResponse> {
  const token = localStorage.getItem('token');
  const res = await axios.patch(`${BASE_URL}/delete-pin/remove-passwordpin`, { email }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data as RemovePasswordResponse;
}

export async function fetchUserWallets(email: string) : Promise<FetchWalletsResponse> {
  const token = localStorage.getItem('token');
  // For now, let's use a simpler approach that matches your backend pattern
  // You'll need to create this endpoint on your backend: GET /admin/users/wallets?email=user@example.com
  const res = await axios.get(`${BASE_URL}/admin/users/wallets`, {
    params: { email },
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data as FetchWalletsResponse;
}

export async function wipePendingBalance(email: string, currency: string) : Promise<WipePendingResponse> {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${BASE_URL}/pending/wipe`, { email, currency }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data as WipePendingResponse;
}

export async function regenerateWalletsByPhone(phonenumber: string, tokens: string[], force = false) {
  const token = localStorage.getItem('token');
  const res = await axios.patch(`${BASE_URL}/updateuseraddress/regenerate-by-phone`, { phonenumber, tokens, force }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data;
}

export async function generateWalletsByPhone(phonenumber: string, force = false) {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${BASE_URL}/updateuseraddress/generate-wallets-by-phone`, { phonenumber, force }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data;
}

export async function statusByPhone(phonenumber: string) {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${BASE_URL}/updateuseraddress/status-by-phone`, {
    params: { phonenumber },
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data;
}

export async function getCompleteUserSummary(email: string): Promise<CompleteUserSummaryResponse> {
  const token = localStorage.getItem('token');
  const res = await axios.get(`${BASE_URL}/usermanagement/summary`, {
    params: { email },
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
    },
  });
  return res.data as CompleteUserSummaryResponse;
}

export async function getUserTransactions(email: string) {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${BASE_URL}/fetchtransactions/transactions-by-email`,
    { email },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    }
  );
  return res.data;
}

export default { getUsersSummary, removePasswordPin, fetchUserWallets, wipePendingBalance, getCompleteUserSummary, getUserTransactions };