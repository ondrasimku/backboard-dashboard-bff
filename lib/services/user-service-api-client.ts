import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, ValidationErrors } from '@/lib/types/auth';

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
}

export const userServiceApiClient = new UserServiceApiClient();

export { UserServiceApiClient };

