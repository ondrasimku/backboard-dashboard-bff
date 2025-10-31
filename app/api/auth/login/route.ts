import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { userServiceApiClient, ApiValidationError } from '@/lib/services/user-service-api-client';
import { cookies } from 'next/headers';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    
    const validationResult = loginSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const result = await userServiceApiClient.login(validationResult.data);

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
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    
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
        error: 'An unexpected error occurred during login',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};


