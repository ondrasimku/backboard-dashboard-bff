import { NextRequest, NextResponse } from 'next/server';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) => {
  try {
    const { token } = await params;
    
    if (!token) {
      return NextResponse.json(
        {
          error: 'Token is required',
          code: 'INVALID_TOKEN',
        },
        { status: 400 }
      );
    }

    const result = await userServiceApiClient.passwordResetVerify(token);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Password reset token verification error:', error);
    
    if (error instanceof ApiValidationError) {
      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
        },
        { status: error.statusCode }
      );
    }
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during token verification',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};

