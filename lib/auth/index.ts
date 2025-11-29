import { NextResponse } from 'next/server';
import { requireAuth, verifyToken, getAuthContext, AuthContext } from './session';

export interface AuthCheckResult {
  authorized: boolean;
  response?: NextResponse;
  accessToken?: string;
  authContext?: AuthContext;
}

export async function checkPermissionsMiddleware(
  requiredPermissions: string[]
): Promise<AuthCheckResult> {
  try {
    const accessToken = await requireAuth();
    const authContext = await verifyToken(accessToken);

    const userPermissions = authContext.permissions || [];
    const hasAllPermissions = requiredPermissions.every(perm =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return {
        authorized: false,
        response: NextResponse.json(
          {
            error: 'Insufficient permissions',
            required: requiredPermissions,
            has: userPermissions,
          },
          { status: 403 }
        ),
      };
    }

    return {
      authorized: true,
      accessToken,
      authContext,
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
        { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
        { status: 500 }
      ),
    };
  }
}

export async function getOrganizationId(): Promise<string | null> {
  try {
    const authContext = await getAuthContext();
    return authContext?.orgId || null;
  } catch {
    return null;
  }
}

export { AuthContext } from './session';


