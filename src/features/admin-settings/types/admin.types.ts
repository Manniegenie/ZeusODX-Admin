export type AdminRole = 'admin' | 'super_admin' | 'moderator';

export interface Admin {
  _id: string;
  adminName: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
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
