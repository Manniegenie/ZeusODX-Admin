export interface AdminPermissions {
  canDeleteUsers: boolean;
  canManageWallets: boolean;
  canManageFees: boolean;
  canViewTransactions: boolean;
  canFundUsers: boolean;
  canManageKYC: boolean;
  canAccessReports: boolean;
  canManageAdmins: boolean;
}

export interface FeatureAccess {
  dashboard: boolean;
  platformStats: boolean;
  userManagement: boolean;
  kycReview: boolean;
  feesAndRates: boolean;
  giftCards: boolean;
  banners: boolean;
  fundingAndBalances: boolean;
  pushNotifications: boolean;
  security: boolean;
  auditAndMonitoring: boolean;
  adminSettings: boolean;
  settings: boolean;
  canDeleteUsers: boolean;
  canManageWallets: boolean;
  canManageFees: boolean;
  canViewTransactions: boolean;
  canFundUsers: boolean;
  canManageKYC: boolean;
  canAccessReports: boolean;
  canManageAdmins: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  adminName?: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions?: AdminPermissions;
  featureAccess?: FeatureAccess;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  featureAccess: FeatureAccess | null;
}

export interface LoginCredentials {
  email: string;
  passwordPin: string;
  twoFAToken?: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  confirmPassword: string;
}

export interface ResetPasswordCredentials {
  email: string;
}

export interface NewPasswordCredentials {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface LoginErrorField {
  type: string;
  value: string;
  msg: string;
  path: string;
  location: string;
}

export interface LoginError {
  success: boolean;
  message: string;
  errors?: LoginErrorField[];
}