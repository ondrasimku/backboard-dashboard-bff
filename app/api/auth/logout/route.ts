import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const POST = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    
    return NextResponse.json(
      {
        error: 'An unexpected error occurred during logout',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
};

