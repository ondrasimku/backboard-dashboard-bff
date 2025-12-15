import { NextResponse, NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/session';

export async function GET() {
  try {
    const token = await requireAuth();
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/folders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to fetch folders' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch folders', code: error.code },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in GET /api/folders:', error);
    
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

export async function POST(request: NextRequest) {
  try {
    const token = await requireAuth();
    const body = await request.json();
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/folders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to create folder' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to create folder', code: error.code },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/folders:', error);
    
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

