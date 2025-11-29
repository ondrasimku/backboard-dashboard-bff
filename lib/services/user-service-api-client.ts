import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, ValidationErrors, PasswordResetRequestRequest, PasswordResetRequestResponse, PasswordResetVerifyResponse, PasswordResetResetRequest, PasswordResetResetResponse, GoogleOAuthRequest, GoogleOAuthResponse } from '@/lib/types/auth';

export class ApiValidationError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public validationErrors?: ValidationErrors
  ) {
    super(message);
    this.name = 'ApiValidationError';
  }
}

class UserServiceApiClient {
  private baseUrl: string;

  constructor() {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service-express:3000';
    this.baseUrl = `${userServiceUrl}/api/auth`;
  }

  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result: RegisterResponse | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new ApiValidationError(
        'Invalid server response',
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok) {
      const errorResult = result as ApiError;
      
      const validationErrors: ValidationErrors = {};
      if (errorResult.details) {
        Object.entries(errorResult.details).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            validationErrors[key] = messages[0];
          }
        });
      }

      throw new ApiValidationError(
        errorResult.error || 'Registration failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as RegisterResponse;
  }

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result: LoginResponse | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new ApiValidationError(
        'Invalid server response',
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok) {
      const errorResult = result as ApiError;
      
      const validationErrors: ValidationErrors = {};
      if (errorResult.details) {
        Object.entries(errorResult.details).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            validationErrors[key] = messages[0];
          }
        });
      }

      throw new ApiValidationError(
        errorResult.error || 'Login failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as LoginResponse;
  }

  async passwordResetRequest(data: PasswordResetRequestRequest): Promise<PasswordResetRequestResponse> {
    const response = await fetch(`${this.baseUrl}/password-reset/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result: PasswordResetRequestResponse | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new ApiValidationError(
        'Invalid server response',
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok) {
      const errorResult = result as ApiError;
      
      const validationErrors: ValidationErrors = {};
      if (errorResult.details) {
        Object.entries(errorResult.details).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            validationErrors[key] = messages[0];
          }
        });
      }

      throw new ApiValidationError(
        errorResult.error || 'Password reset request failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as PasswordResetRequestResponse;
  }

  async passwordResetVerify(token: string): Promise<PasswordResetVerifyResponse> {
    const response = await fetch(`${this.baseUrl}/password-reset/verify/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let result: PasswordResetVerifyResponse | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new ApiValidationError(
        'Invalid server response',
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok) {
      const errorResult = result as ApiError;

      throw new ApiValidationError(
        errorResult.error || 'Password reset token verification failed',
        response.status,
        errorResult.code
      );
    }

    return result as PasswordResetVerifyResponse;
  }

  async passwordResetReset(data: PasswordResetResetRequest): Promise<PasswordResetResetResponse> {
    const response = await fetch(`${this.baseUrl}/password-reset/reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result: PasswordResetResetResponse | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new ApiValidationError(
        'Invalid server response',
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok) {
      const errorResult = result as ApiError;
      
      const validationErrors: ValidationErrors = {};
      if (errorResult.details) {
        Object.entries(errorResult.details).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            validationErrors[key] = messages[0];
          }
        });
      }

      throw new ApiValidationError(
        errorResult.error || 'Password reset failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as PasswordResetResetResponse;
  }

  async googleOAuth(data: GoogleOAuthRequest): Promise<GoogleOAuthResponse> {
    const response = await fetch(`${this.baseUrl}/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    let result: GoogleOAuthResponse | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new ApiValidationError(
        'Invalid server response',
        response.status,
        'INVALID_RESPONSE'
      );
    }

    if (!response.ok) {
      const errorResult = result as ApiError;
      
      const validationErrors: ValidationErrors = {};
      if (errorResult.details) {
        Object.entries(errorResult.details).forEach(([key, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            validationErrors[key] = messages[0];
          }
        });
      }

      throw new ApiValidationError(
        errorResult.error || 'Google OAuth failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as GoogleOAuthResponse;
  }
}

export const userServiceApiClient = new UserServiceApiClient();

export { UserServiceApiClient };

