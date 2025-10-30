import type { RegisterRequest, RegisterResponse, ApiError, ValidationErrors } from '@/lib/types/auth';

/**
 * Custom error class for API errors with validation details
 */
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

/**
 * User Service API Client
 * Handles communication with the user service API
 */
class UserServiceApiClient {
  private baseUrl: string;

  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    const response = await fetch(`${this.baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    // Parse response
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

    // Handle error responses
    if (!response.ok) {
      const errorResult = result as ApiError;
      
      // Extract validation errors if present
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
}

// Export singleton instance
export const userServiceApiClient = new UserServiceApiClient();

// Export class for testing or custom instances
export { UserServiceApiClient };

