import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

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

    const { email, password, firstName, lastName } = validationResult.data;

    // Call user service
    const userServiceUrl = process.env.USER_SERVICE_URL || 'http://user-service-express:3000';
    const response = await fetch(`${userServiceUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.message || data.error || 'Registration failed',
          code: data.code,
        },
        { status: response.status }
      );
    }

    // Success - return user data and token
    return NextResponse.json(
      {
        user: data.user,
        token: data.token,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during registration',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};


