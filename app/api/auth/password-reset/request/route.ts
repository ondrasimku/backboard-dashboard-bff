import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';

const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    const validationResult = passwordResetRequestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await userServiceApiClient.passwordResetRequest(validationResult.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Password reset request error:', error);
    
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
        error: 'An unexpected error occurred during password reset request',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};

