import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/session';
import { cookies } from 'next/headers';
import { isAdminUserBlocked } from '@/lib/adminBlocked';
import { getAdminAuthVersion } from '@/lib/adminAuthVersion';

export async function GET() {
  const token = (await cookies()).get('adminToken')?.value;
  const session = await verifySession(token);
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {

    if (await isAdminUserBlocked(session.userId)) {
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
  } catch (e) {
    console.error('admin/me blocked check', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }

  return NextResponse.json({
    userId: session.userId,
    role: session.role
  });
}
