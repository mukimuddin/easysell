import { NextResponse } from 'next/server';
import { verifySession } from './lib/session';
import { isAdminUserBlocked } from './lib/adminBlocked';
import { getAdminAuthVersion } from './lib/adminAuthVersion';

function clearAdminTokenCookie(response) {
  response.cookies.set('adminToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
  });
}

export async function middleware(request) {
  const path = request.nextUrl.pathname;

  if (path === '/api/admin/session-check') {
    return NextResponse.next();
  }

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

    try {
      // Directly check DB instead of internal fetch (fixes loopback/ECONNREFUSED on shared hosting)
      const blocked = await isAdminUserBlocked(payload.userId);
      const dbAuthVer = await getAdminAuthVersion(payload.userId);
      const tokenAuthVer = Number(payload.authVersion ?? 0);

      if (blocked || tokenAuthVer !== dbAuthVer) {
        if (path.startsWith('/api/')) {
          const res = NextResponse.json({ error: 'Session invalid or account blocked' }, { status: 403 });
          clearAdminTokenCookie(res);
          return res;
        }
        const res = NextResponse.redirect(new URL('/admin/login', request.url));
        clearAdminTokenCookie(res);
        return res;
      }
    } catch (e) {
      console.error('middleware session-check error', e);
    }
  }

  if (path.startsWith('/buyer') || path.startsWith('/api/buyer')) {
    if (
      path === '/buyer/login' ||
      path === '/buyer/register' ||
      path === '/api/buyer/login' ||
      path === '/api/buyer/register'
    ) {
      return NextResponse.next();
    }

    const authCookie = request.cookies.get('buyerToken')?.value;
    let payload = null;

    if (authCookie) {
      payload = await verifySession(authCookie);
    }

    if (!payload || payload.role !== 'buyer') {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/buyer/login', request.url));
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/buyer/:path*', '/api/buyer/:path*'],
};
