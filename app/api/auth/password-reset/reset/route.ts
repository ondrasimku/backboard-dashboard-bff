import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';

const passwordResetResetSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export type PasswordResetResetInput = z.infer<typeof passwordResetResetSchema>;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    const validationResult = passwordResetResetSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await userServiceApiClient.passwordResetReset(validationResult.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Password reset error:', error);
    
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
        error: 'An unexpected error occurred during password reset',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};

