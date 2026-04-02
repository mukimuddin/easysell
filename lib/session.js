import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'easysell-super-secure-jwt-secret-key-2026';
const encodedKey = new TextEncoder().encode(secretKey);

export async function createSession() {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
    
  return { session, expiresAt };
}

export async function verifySession(session) {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}
