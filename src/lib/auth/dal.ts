import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import {
  decrypt,
  SESSION_COOKIE,
  type SessionPayload,
} from '@/lib/auth/session';
import { roleHome } from '@/lib/auth/roles';

export type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  establishmentId: string;
  establishmentName: string;
};

export const getSession = cache(async (): Promise<SessionPayload | null> => {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  if (!value) return null;
  return decrypt(value);
});

export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession();
  if (!session?.userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      establishmentId: true,
      establishment: { select: { name: true } },
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    establishmentId: user.establishmentId,
    establishmentName: user.establishment.name,
  };
});

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect('/login');
  return user;
}

export async function requireRole(...roles: Role[]): Promise<CurrentUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) redirect(roleHome(user.role));
  return user;
}
