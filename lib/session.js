import { SignJWT } from 'jose/jwt/sign';
import { jwtVerify } from 'jose/jwt/verify';

function getEncodedKey() {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey || secretKey.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set and at least 32 characters long.');
    }
    return null;
  }
  return new TextEncoder().encode(secretKey);
}

export async function createSession(userId, role, authVersion = 0) {
  const encodedKey = getEncodedKey();
  if (!encodedKey) {
    throw new Error('JWT_SECRET is missing or too short. Set at least 32 characters.');
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const av = Number(authVersion) || 0;
  const session = await new SignJWT({ userId, role, authVersion: av })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);

  return { session, expiresAt };
}


export async function verifySession(session) {
  if (!session) return null;
  const encodedKey = getEncodedKey();
  if (!encodedKey) return null;
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}


