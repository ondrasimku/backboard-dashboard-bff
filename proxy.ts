import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

export function proxy(request: Request) {
  return handleI18nRouting(request as any);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(cs|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};

