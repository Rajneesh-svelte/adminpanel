// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define route categories
const protectedRoutes = ['/dashboard', '/profile', '/settings', '/doctor'];
// ✅ ADD '/' TO THIS ARRAY
const authRoutes = ['/login', '/register', '/']; 

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('authToken')?.value;

  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  // If a user is not logged in and tries to access a protected route,
  // redirect them to the login page.
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If a user is already logged in and tries to access an auth route
  // (like login, register, or home), redirect them to their main dashboard.
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL('/doctor', request.url));
  }

  // If none of the above, let the request proceed
  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};