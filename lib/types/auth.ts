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

