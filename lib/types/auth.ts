export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: Record<string, string[]>;
}

export interface ValidationErrors {
  [key: string]: string;
}

export interface PasswordResetRequestRequest {
  email: string;
}

export interface PasswordResetRequestResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetVerifyResponse {
  success: boolean;
  message: string;
}

export interface PasswordResetResetRequest {
  token: string;
  newPassword: string;
}

export interface PasswordResetResetResponse {
  success: boolean;
  message: string;
}

export interface GoogleOAuthRequest {
  idToken: string;
}

export interface GoogleOAuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    emailVerified: boolean;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
  isNewUser: boolean;
  accountLinked: boolean;
}

