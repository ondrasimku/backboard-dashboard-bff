import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || 'http://localhost:8080';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service-express:3000';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuth();
    
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { 
          error: 'Invalid file type',
          details: 'Allowed types: image/jpeg, image/png, image/webp'
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { 
          error: 'File too large',
          details: `Maximum file size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        },
        { status: 413 }
      );
    }

    // Step 1: Upload to Media Service
    const mediaFormData = new FormData();
    mediaFormData.append('file', file);

    const mediaResponse = await fetch(`${MEDIA_SERVICE_URL}/files`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: mediaFormData,
    });

    if (!mediaResponse.ok) {
      const error = await mediaResponse.json().catch(() => ({ error: 'Failed to upload file' }));
      return NextResponse.json(
        { 
          error: 'Failed to upload file',
          details: error.error || error.details || 'Unknown error'
        },
        { status: mediaResponse.status }
      );
    }

    const mediaData = await mediaResponse.json();

    // Step 2: Update user avatar in User Service
    const userResponse = await fetch(`${USER_SERVICE_URL}/api/users/me/avatar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        fileId: mediaData.fileId,
        avatarUrl: mediaData.url,
      }),
    });

    if (!userResponse.ok) {
      const error = await userResponse.json().catch(() => ({ error: 'Failed to update avatar' }));
      return NextResponse.json(
        { 
          error: 'Failed to update avatar',
          details: error.error || error.message || 'Unknown error'
        },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    return NextResponse.json(userData);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

