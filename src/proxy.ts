import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  decrypt,
  encrypt,
} from '@/lib/auth/session';
import { roleHome } from '@/lib/auth/roles';
import { prisma } from '@/lib/prisma';
import {
  LOCALE_COOKIE,
  defaultLocale,
  isLocale,
  localeDirection,
} from '@/i18n/config';

const PUBLIC_PATHS = ['/', '/login', '/register'];

// Doit rester synchronisé avec messages/{fr,en,ar}.json → Menu.notFound.
// Le proxy ne peut pas importer les fichiers de messages entiers sans
// alourdir son bundle : le texte du 404 de menu est donc dupliqué ici.
const MENU_NOT_FOUND_COPY = {
  fr: {
    title: 'QR code invalide',
    description:
      'Ce lien de commande n’est plus valide. Demandez le QR code à jour à votre serveur.',
    back: 'Retour à BrewFlow',
  },
  en: {
    title: 'Invalid QR code',
    description:
      'This ordering link is no longer valid. Ask your server for the up-to-date QR code.',
    back: 'Back to BrewFlow',
  },
  ar: {
    title: 'رمز QR غير صالح',
    description: 'رابط الطلب هذا لم يعد صالحًا. اطلب من النادل رمز QR المحدّث.',
    back: 'العودة إلى BrewFlow',
  },
} as const;

type MenuLocale = keyof typeof MENU_NOT_FOUND_COPY;

function menuLocale(cookieValue: string | undefined): MenuLocale {
  return isLocale(cookieValue) ? cookieValue : defaultLocale;
}

function decodeSegment(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function menuNotFoundResponse(locale: MenuLocale): NextResponse {
  const copy = MENU_NOT_FOUND_COPY[locale];
  const html = `<!DOCTYPE html>
<html lang="${locale}" dir="${localeDirection(locale)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${copy.title}</title>
</head>
<body style="margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#ffffff;color:#111827;font-family:system-ui,-apple-system,sans-serif">
<main style="text-align:center;padding:24px;max-width:32rem">
<h1 style="font-size:1.25rem;font-weight:600;margin:0 0 8px">${copy.title}</h1>
<p style="font-size:0.875rem;line-height:1.5;color:#6b7280;margin:0 0 16px">${copy.description}</p>
<a href="/" style="font-size:0.875rem;color:#2563eb;text-decoration:underline">${copy.back}</a>
</main>
</body>
</html>`;

  return new NextResponse(html, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.includes(pathname);
}

function isPublicOrderPath(pathname: string): boolean {
  return pathname === '/m' || pathname.startsWith('/m/');
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Menu client (QR code de table) : accessible à tous, connecté ou non
  if (isPublicOrderPath(pathname)) {
    // Vérification avant streaming : notFound() dans la page arrive trop tard
    // pour fixer le statut (le loading.tsx démarre le flux en 200).
    const token = pathname.startsWith('/m/') ? pathname.slice('/m/'.length) : '';
    if (token) {
      const table = await prisma.table.findUnique({
        where: { qrCode: decodeSegment(token) },
        select: { id: true },
      });
      if (!table) {
        return menuNotFoundResponse(
          menuLocale(request.cookies.get(LOCALE_COOKIE)?.value)
        );
      }
    }
    return NextResponse.next();
  }

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
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        name: true,
        email: true,
        role: true,
        memberships: {
          select: {
            establishmentId: true,
            establishment: { select: { name: true } },
          },
        },
      },
    });
    if (!user || user.memberships.length === 0) {
      const expired = NextResponse.redirect(new URL('/login', request.nextUrl));
      expired.cookies.delete(SESSION_COOKIE);
      return expired;
    }
    const current =
      user.memberships.find(
        (membership) => membership.establishmentId === session.establishmentId
      ) ?? user.memberships[0];
    const fresh = await encrypt({
      userId: session.userId,
      role: user.role,
      establishmentId: current.establishmentId,
      name: user.name,
      email: user.email,
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
