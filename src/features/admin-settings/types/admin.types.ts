export type AdminRole = 'admin' | 'super_admin' | 'moderator';

export interface Admin {
  _id: string;
  adminName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  is2FAEnabled: boolean;
  is2FAVerified: boolean;
  is2FASetupCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  lastSuccessfulLogin?: string;
}

export interface CreateAdminPayload {
  adminName: string;
  email: string;
  passwordPin: string;
  role: AdminRole;
}

export interface CreateAdminResponse {
  success: boolean;
  message: string;
  admin?: Admin;
}

export interface GetAdminsResponse {
  success: boolean;
  data: Admin[];
}

export interface ResetAdmin2FAPayload {
  email: string;
  passwordPin: string;
  adminId: string;
}

export interface ResetAdmin2FAResponse {
  success: boolean;
  message: string;
}
