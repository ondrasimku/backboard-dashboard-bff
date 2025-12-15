import { notFound } from 'next/navigation';
import { PublicPageContent } from '@/components/pages/public-page-content';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Home } from 'lucide-react';

interface PublicPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

async function getPublicPage(slug: string) {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/pages/public/${slug}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching public page:', error);
    return null;
  }
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const page = await getPublicPage(slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-12">
        <article className="max-w-4xl mx-auto">
          {/* Page Content */}
          <PublicPageContent content={page.content || {}} />

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t text-sm text-muted-foreground">
            <p>
              Published on{' '}
              {new Date(page.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </footer>
        </article>
      </main>
    </div>
  );
}
