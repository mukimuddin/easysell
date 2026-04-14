import { NextResponse } from 'next/server';
import { verifySession } from './lib/session';

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
    // allow access to login routes
    if (path === '/admin/login' || path === '/api/admin/login') {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get('adminToken')?.value;
    let payload = null;
    
    if (authCookie) {
      payload = await verifySession(authCookie);
    }
    
    // If no valid session payload exists, deny access
    if (!payload || (payload.role !== 'admin' && payload.role !== 'employee')) {

      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
