import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { ensureAdminBlockedColumn, isAdminUserBlocked } from '@/lib/adminBlocked';
import { ensureAdminAuthVersionColumn, getAdminAuthVersion } from '@/lib/adminAuthVersion';

/**
 * Lightweight auth + block check for middleware and clients.
 * Must stay exempt from middleware’s own block re-fetch loop.
 */
export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);

  if (!session || (session.role !== 'admin' && session.role !== 'employee')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const blocked = await isAdminUserBlocked(session.userId);
    if (blocked) {
      const res = NextResponse.json({ error: 'Account blocked', blocked: true }, { status: 403 });
      res.cookies.set('adminToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
      });
      return res;
    }

    const dbAuthVer = await getAdminAuthVersion(session.userId);
    const tokenAuthVer = Number(session.authVersion ?? 0);
    if (tokenAuthVer !== dbAuthVer) {
      const res = NextResponse.json(
        { error: 'Session expired. Please sign in again.', sessionStale: true },
        { status: 403 }
      );
      res.cookies.set('adminToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        path: '/',
        sameSite: 'lax',
      });
      return res;
    }

    return NextResponse.json({ ok: true, userId: session.userId, role: session.role });
  } catch (e) {
    console.error('session-check', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
