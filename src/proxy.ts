import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  decrypt,
  encrypt,
} from '@/lib/auth/session';
import { roleHome } from '@/lib/auth/roles';

const PUBLIC_PATHS = ['/', '/login', '/register'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function isPublicOrderPath(pathname: string): boolean {
  return pathname === '/m' || pathname.startsWith('/m/');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Menu client (QR code de table) : accessible à tous, connecté ou non
  if (isPublicOrderPath(pathname)) return NextResponse.next();

  const session = await decrypt(request.cookies.get(SESSION_COOKIE)?.value);

  // Non authentifié
  if (!session?.userId) {
    if (isPublicPath(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  // Authentifié : on ne laisse plus accéder aux pages publiques
  if (isPublicPath(pathname)) {
    return NextResponse.redirect(
      new URL(roleHome(session.role), request.nextUrl)
    );
  }

  // Session glissante : on prolonge le cookie si moins de 6 jours restants
  const remaining = (session.exp ?? 0) * 1000 - Date.now();
  if (remaining < SESSION_MAX_AGE - 24 * 60 * 60 * 1000) {
    const fresh = await encrypt({
      userId: session.userId,
      role: session.role,
      establishmentId: session.establishmentId,
      name: session.name,
      email: session.email,
    });
    const response = NextResponse.next();
    response.cookies.set(SESSION_COOKIE, fresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE / 1000,
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:txt|png|jpg|jpeg|svg|webp|ico)$).*)',
  ],
};
