export interface User {
  id: string;
  email: string;
  name: string;
  adminName?: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
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