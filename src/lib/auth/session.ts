import 'server-only';
import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'bf_session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 jours

const secretKey = process.env.SESSION_SECRET;
if (!secretKey || secretKey.length < 32) {
  throw new Error(
    'SESSION_SECRET manquante ou trop courte (32 caractères minimum).'
  );
}
const encodedKey = new TextEncoder().encode(secretKey);

export type SessionPayload = {
  userId: string;
  role: string;
  establishmentId: string;
  name: string;
  email: string;
};

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey);
}

type DecodedSession = (SessionPayload & { exp: number }) | null;

export async function decrypt(
  session: string | undefined = ''
): Promise<DecodedSession> {
  try {
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload as DecodedSession;
  } catch {
    return null;
  }
}
