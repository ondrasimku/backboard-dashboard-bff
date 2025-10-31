import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    // Validate input
    const validationResult = registerSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Call user service via API client
    const result = await userServiceApiClient.register(validationResult.data);

    // Success - return user data and token
    return NextResponse.json(
      {
        user: result.user,
        token: result.token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle API validation errors from user service
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          details: error.validationErrors,
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during registration',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};


