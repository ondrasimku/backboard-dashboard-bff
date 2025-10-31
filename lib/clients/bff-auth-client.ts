import type { RegisterRequest, RegisterResponse, ApiError, ValidationErrors } from '@/lib/types/auth';

/**
 * Custom error class for BFF API errors with validation details
 */
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

/**
 * BFF Auth Client
 * Handles communication with the BFF (Next.js) auth endpoints
 * Client-side only
 */
class BffAuthClient {
  private baseUrl: string;

  constructor(baseUrl = '/api/auth') {
    this.baseUrl = baseUrl;
  }

  /**
   * Register a new user via BFF
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
      throw new BffApiError(
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

      throw new BffApiError(
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
export const bffAuthClient = new BffAuthClient();

// Export class for testing or custom instances
export { BffAuthClient };

