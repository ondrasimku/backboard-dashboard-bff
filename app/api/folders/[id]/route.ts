import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await requireAuth();
    const { id } = await params;
    const body = await request.json();
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/folders/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update folder' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to update folder', code: error.code },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = await requireAuth();
    const { id } = await params;
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/folders/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete folder' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to delete folder', code: error.code },
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

