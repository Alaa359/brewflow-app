'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { getSession, requireRole } from '@/lib/auth/dal';
import { SESSION_COOKIE, SESSION_MAX_AGE, encrypt } from '@/lib/auth/session';
import { establishmentSchema } from '@/lib/validations/establishment';
import { ROLE_HOME } from '@/lib/auth/roles';

export type EstablishmentErrors = {
  name?: string[];
  address?: string[];
  phone?: string[];
  timezone?: string[];
  form?: string[];
};

export type EstablishmentState =
  | {
      errors?: EstablishmentErrors;
      message?: string;
      success?: boolean;
    }
  | undefined;

function fieldErrors(error: z.ZodError): EstablishmentErrors {
  return error.flatten().fieldErrors as EstablishmentErrors;
}

function isDuplicate(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

async function isMember(userId: string, establishmentId: string) {
  return (
    (await prisma.membership.findUnique({
      where: {
        userId_establishmentId: { userId, establishmentId },
      },
      select: { id: true },
    })) !== null
  );
}

export async function switchEstablishment(establishmentId: string) {
  const session = await getSession();
  if (!session?.userId) redirect('/login');

  const ok = await isMember(session.userId, establishmentId);
  if (!ok) redirect(ROLE_HOME[session.role] ?? '/');

  const nextSession = await encrypt({
    ...session,
    establishmentId,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, nextSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE / 1000,
  });

  revalidatePath('/', 'layout');
}

export async function createEstablishment(
  _prev: EstablishmentState,
  formData: FormData
): Promise<EstablishmentState> {
  const user = await requireRole(Role.ADMIN);

  const validated = establishmentSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    phone: formData.get('phone') || undefined,
    timezone: formData.get('timezone'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies EstablishmentState;
  }

  await prisma.establishment.create({
    data: {
      ...validated.data,
      memberships: {
        create: { userId: user.id },
      },
    },
  });

  revalidatePath('/', 'layout');
  return {
    success: true,
    message: 'Établissement créé.',
  } satisfies EstablishmentState;
}

export async function updateEstablishment(
  id: string,
  _prev: EstablishmentState,
  formData: FormData
): Promise<EstablishmentState> {
  const user = await requireRole(Role.ADMIN);

  if (!(await isMember(user.id, id))) redirect('/etablissements');

  const validated = establishmentSchema.safeParse({
    name: formData.get('name'),
    address: formData.get('address') || undefined,
    phone: formData.get('phone') || undefined,
    timezone: formData.get('timezone'),
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies EstablishmentState;
  }

  try {
    await prisma.establishment.update({
      where: { id },
      data: validated.data,
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: { form: ['Un établissement porte déjà ce nom.'] },
        message: 'Mise à jour impossible.',
      } satisfies EstablishmentState;
    }
    throw error;
  }

  revalidatePath('/', 'layout');
  return {
    success: true,
    message: 'Établissement mis à jour.',
  } satisfies EstablishmentState;
}

export async function deleteEstablishment(id: string) {
  const user = await requireRole(Role.ADMIN);

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    select: { establishmentId: true },
  });
  const ids = memberships.map((membership) => membership.establishmentId);
  if (!ids.includes(id)) redirect('/etablissements');
  if (user.establishmentId === id) redirect('/etablissements?erreur=courant');
  if (ids.length <= 1) redirect('/etablissements?erreur=dernier');

  await prisma.establishment.deleteMany({ where: { id } }).catch((error) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      redirect('/etablissements?erreur=commandes');
    }
    throw error;
  });

  revalidatePath('/', 'layout');
}
