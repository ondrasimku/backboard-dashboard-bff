import { NextResponse, NextRequest } from 'next/server';
import { checkPermissionsMiddleware } from '@/lib/auth';
import { userServiceApiClient } from '@/lib/services/user-service-api-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string; roleId: string }> }
) {
  try {
    const authCheck = await checkPermissionsMiddleware(['users:manage']);
    
    if (!authCheck.authorized || !authCheck.accessToken) {
      return authCheck.response || NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId, roleId } = await params;
    await userServiceApiClient.removeRoleFromUser(userId, roleId, authCheck.accessToken);
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

