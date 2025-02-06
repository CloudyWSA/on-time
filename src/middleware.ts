import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getTokenFromRequest, verifyToken } from './app/lib/auth-utils';

// List of public paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
];

export async function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from cookies
  const token = await getTokenFromRequest(request);

  // If no token is present, redirect to login
  if (!token) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
