import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, ValidationErrors } from '@/lib/types/auth';


export class BffApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public validationErrors?: ValidationErrors
  ) {
    super(message);
    this.name = 'BffApiError';
  }
}

class BffAuthClient {
  private baseUrl: string;

  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
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
      throw new BffApiError(
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

      throw new BffApiError(
        errorResult.error || 'Registration failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as RegisterResponse;
  }

  async login(data: LoginRequest): Promise<Omit<LoginResponse, 'token'>> {
    const response = await fetch(`${this.baseUrl}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    let result: Omit<LoginResponse, 'token'> | ApiError;
    try {
      result = await response.json();
    } catch {
      throw new BffApiError(
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

      throw new BffApiError(
        errorResult.error || 'Login failed',
        response.status,
        errorResult.code,
        Object.keys(validationErrors).length > 0 ? validationErrors : undefined
      );
    }

    return result as Omit<LoginResponse, 'token'>;
  }
}

export const bffAuthClient = new BffAuthClient();

export { BffAuthClient };

