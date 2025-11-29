import { NextResponse, NextRequest } from 'next/server';
import { checkPermissionsMiddleware } from '@/lib/auth';
import { userServiceApiClient } from '@/lib/services/user-service-api-client';
import type { AssignPermissionToRoleRequest } from '@/lib/types/role';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await checkPermissionsMiddleware(['roles:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body: AssignPermissionToRoleRequest = await request.json();
    await userServiceApiClient.addPermissionToRole(id, body, authCheck.accessToken);
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

