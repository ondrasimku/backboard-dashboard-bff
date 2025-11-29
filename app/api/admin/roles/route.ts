import { NextResponse, NextRequest } from 'next/server';
import { checkPermissionsMiddleware } from '@/lib/auth';
import { userServiceApiClient } from '@/lib/services/user-service-api-client';
import type { CreateRoleRequest } from '@/lib/types/role';

export async function GET(request: NextRequest) {
  try {
    const authCheck = await checkPermissionsMiddleware(['roles:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const roles = await userServiceApiClient.getAllRoles(authCheck.accessToken);
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

export async function POST(request: NextRequest) {
  try {
    const authCheck = await checkPermissionsMiddleware(['roles:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body: CreateRoleRequest = await request.json();
    const role = await userServiceApiClient.createRole(body, authCheck.accessToken);
    return NextResponse.json(role, { status: 201 });
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

