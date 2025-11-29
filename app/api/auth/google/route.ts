import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';
import { cookies } from 'next/headers';

const googleOAuthSchema = z.object({
  idToken: z.string().min(1, 'ID token is required'),
});

export type GoogleOAuthInput = z.infer<typeof googleOAuthSchema>;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    const validationResult = googleOAuthSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await userServiceApiClient.googleOAuth(validationResult.data);

    const cookieStore = await cookies();
    cookieStore.set('auth_token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json(
      {
        user: result.user,
        isNewUser: result.isNewUser,
        accountLinked: result.accountLinked,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Google OAuth error:', error);
    
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
        error: 'An unexpected error occurred during Google authentication',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};

