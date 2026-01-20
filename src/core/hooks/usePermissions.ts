import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/core/store/store';
import type { FeatureAccess } from '@/core/types/auth.types';
import { setFeatureAccess } from '@/features/auth/store/auth.slice';
import axios from '@/core/services/axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Default feature access for when permissions haven't been loaded yet
const defaultFeatureAccess: FeatureAccess = {
  dashboard: true,
  platformStats: false,
  userManagement: false,
  kycReview: false,
  feesAndRates: false,
  giftCards: false,
  fundingAndBalances: false,
  pushNotifications: false,
  security: false,
  auditAndMonitoring: false,
  adminSettings: false,
  settings: true,
  canDeleteUsers: false,
  canManageWallets: false,
  canManageFees: false,
  canViewTransactions: false,
  canFundUsers: false,
  canManageKYC: false,
  canAccessReports: false,
  canManageAdmins: false,
};

export function usePermissions() {
  const dispatch = useDispatch();
  const { token, featureAccess, user } = useSelector((state: RootState) => state.auth);

  const fetchPermissions = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${BASE_URL}/admin/permissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        dispatch(setFeatureAccess(response.data.data.featureAccess));
      }
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
      // Use role-based defaults if API fails
      if (user?.role === 'super_admin') {
        const superAdminAccess: FeatureAccess = {
          dashboard: true,
          platformStats: true,
          userManagement: true,
          kycReview: true,
          feesAndRates: true,
          giftCards: true,
          fundingAndBalances: true,
          pushNotifications: true,
          security: true,
          auditAndMonitoring: true,
          adminSettings: true,
          settings: true,
          canDeleteUsers: true,
          canManageWallets: true,
          canManageFees: true,
          canViewTransactions: true,
          canFundUsers: true,
          canManageKYC: true,
          canAccessReports: true,
          canManageAdmins: true,
        };
        dispatch(setFeatureAccess(superAdminAccess));
      }
    }
  }, [token, dispatch, user?.role]);

  useEffect(() => {
    if (token && !featureAccess) {
      fetchPermissions();
    }
  }, [token, featureAccess, fetchPermissions]);

  const hasFeatureAccess = useCallback(
    (feature: keyof FeatureAccess): boolean => {
      if (!featureAccess) return defaultFeatureAccess[feature];
      return featureAccess[feature] ?? false;
    },
    [featureAccess]
  );

  const hasPermission = useCallback(
    (permission: keyof FeatureAccess): boolean => {
      if (!featureAccess) return false;
      return featureAccess[permission] ?? false;
    },
    [featureAccess]
  );

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator';

  return {
    featureAccess: featureAccess ?? defaultFeatureAccess,
    hasFeatureAccess,
    hasPermission,
    fetchPermissions,
    isSuperAdmin,
    isAdmin,
    isModerator,
    role: user?.role,
  };
}
