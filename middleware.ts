import { NextRequest, NextResponse } from 'next/server';
import { updateSession, verifyToken } from '@/lib/auth';

// Simple in-memory rate limiting (Note: resets on server restart/re-deploy)
const rateLimitMap = new Map<string, { count: number, lastReset: number }>();

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
             request.headers.get('x-real-ip') || 
             'anonymous';
  const pathname = request.nextUrl.pathname;

  // 1. Rate Limiting for API routes
  if (pathname.startsWith('/api')) {
    const now = Date.now();
    const rateLimit = rateLimitMap.get(ip) || { count: 0, lastReset: now };

    // Reset every 1 minute
    if (now - rateLimit.lastReset > 60000) {
      rateLimit.count = 0;
      rateLimit.lastReset = now;
    }

    rateLimit.count++;
    rateLimitMap.set(ip, rateLimit);

    // Limit to 60 requests per minute
    if (rateLimit.count > 60) {
      return new NextResponse('Too many requests', { status: 429 });
    }
  }

  // 2. Update session (Standard Auth Flow)
  const res = await updateSession(request) || NextResponse.next();
  
  // 3. Custom Admin Protection
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('session')?.value;
    const session = token ? await verifyToken(token) : null;
    
    if (!session || session.user?.role !== 'admin') {
      // Redirect to home if not admin
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
