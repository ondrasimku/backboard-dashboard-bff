import type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse, ApiError, ValidationErrors, PasswordResetRequestRequest, PasswordResetRequestResponse, PasswordResetVerifyResponse, PasswordResetResetRequest, PasswordResetResetResponse, GoogleOAuthRequest, GoogleOAuthResponse, EmailVerificationResponse } from '@/lib/types/auth';
import type { Role, CreateRoleRequest, UpdateRoleRequest, AssignPermissionToRoleRequest, AssignRoleToUserRequest } from '@/lib/types/role';
import type { Permission } from '@/lib/types/permission';

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
  private adminBaseUrl: string;

  constructor() {
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service-express:3000';
    this.baseUrl = `${userServiceUrl}/api/auth`;
    this.adminBaseUrl = `${userServiceUrl}/api/admin`;
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

  async verifyEmail(token: string): Promise<EmailVerificationResponse> {
    const response = await fetch(`${this.baseUrl}/verify/${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let result: EmailVerificationResponse | ApiError;
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
        errorResult.error || 'Email verification failed',
        response.status,
        errorResult.code
      );
    }

    return result as EmailVerificationResponse;
  }

  // Admin API Methods - Roles
  async getAllRoles(token: string): Promise<Role[]> {
    const response = await fetch(`${this.adminBaseUrl}/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch roles' }));
      throw new ApiValidationError(
        error.error || 'Failed to fetch roles',
        response.status,
        error.code
      );
    }

    return await response.json();
  }

  async getRoleById(id: string, token: string): Promise<Role> {
    const response = await fetch(`${this.adminBaseUrl}/roles/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch role' }));
      throw new ApiValidationError(
        error.error || 'Failed to fetch role',
        response.status,
        error.code
      );
    }

    return await response.json();
  }

  async createRole(data: CreateRoleRequest, token: string): Promise<Role> {
    const response = await fetch(`${this.adminBaseUrl}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create role' }));
      throw new ApiValidationError(
        error.error || 'Failed to create role',
        response.status,
        error.code
      );
    }

    return await response.json();
  }

  async updateRole(id: string, data: UpdateRoleRequest, token: string): Promise<Role> {
    const response = await fetch(`${this.adminBaseUrl}/roles/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update role' }));
      throw new ApiValidationError(
        error.error || 'Failed to update role',
        response.status,
        error.code
      );
    }

    return await response.json();
  }

  async deleteRole(id: string, token: string): Promise<void> {
    const response = await fetch(`${this.adminBaseUrl}/roles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete role' }));
      throw new ApiValidationError(
        error.error || 'Failed to delete role',
        response.status,
        error.code
      );
    }
  }

  async addPermissionToRole(roleId: string, data: AssignPermissionToRoleRequest, token: string): Promise<void> {
    const response = await fetch(`${this.adminBaseUrl}/roles/${roleId}/permissions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to add permission to role' }));
      throw new ApiValidationError(
        error.error || 'Failed to add permission to role',
        response.status,
        error.code
      );
    }
  }

  async removePermissionFromRole(roleId: string, permissionId: string, token: string): Promise<void> {
    const response = await fetch(`${this.adminBaseUrl}/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove permission from role' }));
      throw new ApiValidationError(
        error.error || 'Failed to remove permission from role',
        response.status,
        error.code
      );
    }
  }

  // Admin API Methods - Permissions
  async getAllPermissions(token: string): Promise<Permission[]> {
    const response = await fetch(`${this.adminBaseUrl}/permissions`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch permissions' }));
      throw new ApiValidationError(
        error.error || 'Failed to fetch permissions',
        response.status,
        error.code
      );
    }

    return await response.json();
  }

  async getPermissionById(id: string, token: string): Promise<Permission> {
    const response = await fetch(`${this.adminBaseUrl}/permissions/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch permission' }));
      throw new ApiValidationError(
        error.error || 'Failed to fetch permission',
        response.status,
        error.code
      );
    }

    return await response.json();
  }

  // Admin API Methods - User-Role Assignments
  async assignRoleToUser(userId: string, data: AssignRoleToUserRequest, token: string): Promise<void> {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/roles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to assign role to user' }));
      throw new ApiValidationError(
        error.error || 'Failed to assign role to user',
        response.status,
        error.code
      );
    }
  }

  async removeRoleFromUser(userId: string, roleId: string, token: string): Promise<void> {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to remove role from user' }));
      throw new ApiValidationError(
        error.error || 'Failed to remove role from user',
        response.status,
        error.code
      );
    }
  }

  async getUserRoles(userId: string, token: string): Promise<Role[]> {
    const response = await fetch(`${this.adminBaseUrl}/users/${userId}/roles`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch user roles' }));
      throw new ApiValidationError(
        error.error || 'Failed to fetch user roles',
        response.status,
        error.code
      );
    }

    return await response.json();
  }
}

export const userServiceApiClient = new UserServiceApiClient();

export { UserServiceApiClient };

