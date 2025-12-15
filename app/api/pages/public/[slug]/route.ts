import { NextResponse, NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const pagesServiceUrl = process.env.PAGES_SERVICE_URL || 'http://pages-service-express:3002';

    const response = await fetch(`${pagesServiceUrl}/api/public/${slug}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Page not found' }));
      return NextResponse.json(
        { error: error.error || error.message || 'Page not found', code: error.code },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

