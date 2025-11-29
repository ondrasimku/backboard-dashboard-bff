import { NextResponse } from 'next/server';
import { requireAuth } from './session';

export interface AuthCheckResult {
  authorized: boolean;
  response?: NextResponse;
  accessToken?: string;
  user?: {
    name?: string;
    email?: string;
    sub?: string;
  };
}

export async function checkPermissionsMiddleware(
  requiredPermissions: string[]
): Promise<AuthCheckResult> {
  try {
    const accessToken = await requireAuth();

    return {
      authorized: true,
      accessToken,
      user: {
        sub: undefined,
        email: undefined,
        name: undefined,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return {
        authorized: false,
        response: NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        ),
      };
    }

    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      ),
    };
  }
}

export async function getOrganizationId(): Promise<string | null> {
  try {
    await requireAuth();
    return null;
  } catch {
    return null;
  }
}


