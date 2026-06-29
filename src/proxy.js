import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protect dashboard and post modification pages
  const isProtectedPath = pathname.startsWith('/dashboard') || pathname.startsWith('/posts/new') || pathname.endsWith('/edit');
  const isAuthPath = pathname === '/login' || pathname === '/register';

  if (isProtectedPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/posts/new',
    '/posts/:id/edit',
    '/login',
    '/register'
  ],
};
