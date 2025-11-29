import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';

const handleI18nRouting = createMiddleware(routing);

const PUBLIC_ROUTES = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'];
const AUTH_ROUTES = ['/login', '/register'];

const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some(route => pathname.includes(route));
};

const isAuthRoute = (pathname: string): boolean => {
  return AUTH_ROUTES.some(route => pathname.includes(route));
};

export function proxy(request: Request) {
  const nextRequest = request as NextRequest;
  const { pathname } = nextRequest.nextUrl;
  
  const authToken = nextRequest.cookies.get('auth_token')?.value;
  const isAuthenticated = !!authToken;

  if (!isAuthenticated && !isPublicRoute(pathname)) {
    const locale = pathname.split('/')[1];
    const validLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;
    const loginUrl = new URL(`/${validLocale}/login`, nextRequest.url);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isAuthRoute(pathname)) {
    const locale = pathname.split('/')[1];
    const validLocale = routing.locales.includes(locale as any) ? locale : routing.defaultLocale;
    const dashboardUrl = new URL(`/${validLocale}`, nextRequest.url);
    return NextResponse.redirect(dashboardUrl);
  }
  
  return handleI18nRouting(nextRequest as any);
}

export const config = {
  matcher: ['/', '/(cs|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};

