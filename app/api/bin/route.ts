import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

export async function GET(request: NextRequest) {
  try {
    const token = await requireAuth();
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/bin`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch bin items' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch bin items', code: error.code },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/bin:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await requireAuth();
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/bin`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to empty bin' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to empty bin', code: error.code },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in DELETE /api/bin:', error);
    
    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
