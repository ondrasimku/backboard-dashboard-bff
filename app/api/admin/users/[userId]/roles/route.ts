import { NextResponse, NextRequest } from 'next/server';
import { checkPermissionsMiddleware } from '@/lib/auth';
import { userServiceApiClient } from '@/lib/services/user-service-api-client';
import type { AssignRoleToUserRequest } from '@/lib/types/role';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authCheck = await checkPermissionsMiddleware(['users:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const roles = await userServiceApiClient.getUserRoles(userId, authCheck.accessToken);
    return NextResponse.json(roles);
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as { statusCode: number }).statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authCheck = await checkPermissionsMiddleware(['users:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const body: AssignRoleToUserRequest = await request.json();
    await userServiceApiClient.assignRoleToUser(userId, body, authCheck.accessToken);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && 'statusCode' in error) {
      return NextResponse.json(
        { error: error.message },
        { status: (error as { statusCode: number }).statusCode }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


