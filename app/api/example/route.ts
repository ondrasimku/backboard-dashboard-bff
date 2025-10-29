/**
 * Example API Route demonstrating Auth0 authentication
 * 
 * This route shows how to:
 * 1. Check user authentication
 * 2. Verify required permissions
 * 3. Access user information
 * 4. Forward access token to backend services
 */

import { NextResponse } from 'next/server';
import { checkPermissionsMiddleware, getOrganizationId } from '@/lib/auth';

export async function GET() {
  // Check if user has required permissions
  // This will return a 403 response if permissions are missing
  const authCheck = await checkPermissionsMiddleware(['projects:read']);
  
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  // Extract authenticated user and access token
  const { accessToken, user } = authCheck;

  // Get organization ID from user claims (if available)
  const orgId = await getOrganizationId();

  // Example: Forward request to backend service
  // In a real implementation, you would call your backend service here
  // const backendResponse = await fetch('https://backend-service/api/projects', {
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  // });

  // Return response with user information
  return NextResponse.json({
    message: 'Authenticated successfully',
    user: {
      name: user.name,
      email: user.email,
      sub: user.sub,
    },
    organizationId: orgId,
    // Note: Never expose the full access token to the client
    hasAccessToken: !!accessToken,
  });
}

export async function POST(request: Request) {
  // Example with different permissions for POST requests
  const authCheck = await checkPermissionsMiddleware(['projects:write']);
  
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  const body = await request.json();

  // Example: Forward POST request to backend service
  // const { accessToken } = authCheck;
  // const backendResponse = await fetch('https://backend-service/api/projects', {
  //   method: 'POST',
  //   headers: {
  //     'Authorization': `Bearer ${accessToken}`,
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify(body),
  // });

  return NextResponse.json({
    message: 'Project created successfully',
    data: body,
  });
}

