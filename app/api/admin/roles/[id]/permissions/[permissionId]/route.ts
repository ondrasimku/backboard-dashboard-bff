import { NextResponse, NextRequest } from 'next/server';
import { checkPermissionsMiddleware } from '@/lib/auth';
import { userServiceApiClient } from '@/lib/services/user-service-api-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; permissionId: string }> }
) {
  try {
    const authCheck = await checkPermissionsMiddleware(['roles:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id, permissionId } = await params;
    await userServiceApiClient.removePermissionFromRole(id, permissionId, authCheck.accessToken);
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

