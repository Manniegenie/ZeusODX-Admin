import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '@/core/store/store';
import type { FeatureAccess } from '@/core/types/auth.types';
import { setFeatureAccess } from '@/features/auth/store/auth.slice';
import axios from '@/core/services/axios';

// Default feature access for when permissions haven't been loaded yet
const defaultFeatureAccess: FeatureAccess = {
  dashboard: true,
  platformStats: false,
  userManagement: false,
  kycReview: false,
  feesAndRates: false,
  giftCards: false,
  banners: false,
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
  canManagePushNotifications: false,
  canManageUsers: false,
  canManageGiftcards: false,
  canManageBanners: false,
  canRemoveFunding: false,
  canManageBalances: false,
};

export function usePermissions() {
  const dispatch = useDispatch();
  const { token, featureAccess, user } = useSelector((state: RootState) => state.auth);

  const fetchPermissions = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get('/admin/permissions');

      if (response.data.success) {
        console.log('[PERMISSIONS] Fetched from API:', {
          userManagement: response.data.data.featureAccess.userManagement,
          canManageUsers: response.data.data.featureAccess.canManageUsers,
          role: response.data.data.role,
          allFeatureAccess: response.data.data.featureAccess
        });
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
          banners: true,
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
          canManagePushNotifications: true,
          canManageUsers: true,
          canManageGiftcards: true,
          canManageBanners: true,
          canRemoveFunding: true,
          canManageBalances: true,
        };
        dispatch(setFeatureAccess(superAdminAccess));
      } else if (user?.role === 'admin') {
        // Fallback for admin role - only push notifications, user management, banners, giftcards
        const adminAccess: FeatureAccess = {
          dashboard: true,
          platformStats: false,
          userManagement: true,
          kycReview: false,
          feesAndRates: false,
          giftCards: true,
          banners: true,
          fundingAndBalances: false,
          pushNotifications: true,
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
          canManagePushNotifications: true,
          canManageUsers: true,
          canManageGiftcards: true,
          canManageBanners: true,
          canRemoveFunding: false,
          canManageBalances: false,
        };
        dispatch(setFeatureAccess(adminAccess));
      }
    }
  }, [token, dispatch, user?.role]);

  useEffect(() => {
    if (token) {
      // Always fetch permissions on mount or when token changes
      // This ensures permissions are fresh and up-to-date
      fetchPermissions();
    }
  }, [token, fetchPermissions]);

  const hasFeatureAccess = useCallback(
    (feature: keyof FeatureAccess): boolean => {
      // Super admins always have access
      if (user?.role === 'super_admin') {
        return true;
      }
      
      // If permissions haven't loaded yet, use defaults
      if (!featureAccess) {
        // For admin role, grant only specific features as fallback
        if (user?.role === 'admin') {
          const adminOnlyFeatures: (keyof FeatureAccess)[] = [
            'dashboard',
            'userManagement',
            'giftCards',
            'banners',
            'pushNotifications',
            'settings',
            'canManageUsers',
            'canManageGiftcards',
            'canManageBanners',
            'canManagePushNotifications'
          ];
          if (adminOnlyFeatures.includes(feature)) {
            return true;
          }
          return false;
        }
        return defaultFeatureAccess[feature];
      }
      
      // Check the feature access
      const hasAccess = featureAccess[feature] ?? false;
      
      // Debug logging for userManagement specifically
      if (feature === 'userManagement') {
        console.log('[PERMISSIONS] userManagement check:', {
          hasAccess,
          featureAccess: featureAccess.userManagement,
          role: user?.role,
          canManageUsers: featureAccess.canManageUsers
        });
      }
      
      return hasAccess;
    },
    [featureAccess, user?.role]
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
