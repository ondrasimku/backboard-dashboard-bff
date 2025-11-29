import { NextResponse } from 'next/server';
import { getAuthContext } from '@/lib/auth/session';

export async function GET() {
  try {
    const authContext = await getAuthContext();
    
    // Return empty permissions/roles if not authenticated (graceful degradation)
    // This allows the UI to work even if the user is not fully authenticated
    if (!authContext) {
      return NextResponse.json({
        permissions: [],
        roles: [],
      });
    }

    return NextResponse.json({
      permissions: authContext.permissions || [],
      roles: authContext.roles || [],
    });
  } catch (error) {
    // On error, return empty permissions to prevent UI breakage
    return NextResponse.json({
      permissions: [],
      roles: [],
    });
  }
}

