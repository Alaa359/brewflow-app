'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { tableSchema } from '@/lib/validations/table';

export type TableErrors = {
  number?: string[];
  zone?: string[];
  form?: string[];
};

export type TableState =
  | {
      errors?: TableErrors;
      message?: string;
      success?: boolean;
    }
  | undefined;

function fieldErrors(error: z.ZodError): TableErrors {
  return error.flatten().fieldErrors as TableErrors;
}

function isDuplicate(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function generateQrToken(): string {
  return crypto.randomUUID();
}

async function findOwnTable(id: string, establishmentId: string) {
  return prisma.table.findFirst({
    where: { id, establishmentId },
    select: { id: true },
  });
}

export async function createTable(
  _prev: TableState,
  formData: FormData
): Promise<TableState> {
  const user = await requireRole(Role.ADMIN);

  const validated = tableSchema.safeParse({
    number: formData.get('number'),
    zone: formData.get('zone') || undefined,
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies TableState;
  }

  try {
    await prisma.table.create({
      data: {
        ...validated.data,
        qrCode: generateQrToken(),
        establishmentId: user.establishmentId,
      },
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: {
          number: ['Une table porte déjà ce numéro dans cet établissement.'],
        },
        message: 'Création impossible.',
      } satisfies TableState;
    }
    throw error;
  }

  revalidatePath('/tables');
  return { success: true, message: 'Table créée.' } satisfies TableState;
}

export async function updateTable(
  id: string,
  _prev: TableState,
  formData: FormData
): Promise<TableState> {
  const user = await requireRole(Role.ADMIN);

  if (!(await findOwnTable(id, user.establishmentId))) redirect('/tables');

  const validated = tableSchema.safeParse({
    number: formData.get('number'),
    zone: formData.get('zone') || undefined,
  });

  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies TableState;
  }

  try {
    await prisma.table.update({
      where: { id },
      data: validated.data,
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: {
          number: ['Une table porte déjà ce numéro dans cet établissement.'],
        },
        message: 'Mise à jour impossible.',
      } satisfies TableState;
    }
    throw error;
  }

  revalidatePath('/tables');
  return { success: true, message: 'Table mise à jour.' } satisfies TableState;
}

export async function deleteTable(id: string) {
  const user = await requireRole(Role.ADMIN);

  if (!(await findOwnTable(id, user.establishmentId)))
    redirect('/tables?erreur=introuvable');

  await prisma.table.deleteMany({ where: { id } }).catch((error) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      redirect('/tables?erreur=commandes');
    }
    throw error;
  });

  revalidatePath('/tables');
}

export async function regenerateQr(id: string) {
  const user = await requireRole(Role.ADMIN);

  if (!(await findOwnTable(id, user.establishmentId))) redirect('/tables');

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await prisma.table.update({
        where: { id },
        data: { qrCode: generateQrToken() },
      });
      break;
    } catch (error) {
      if (isDuplicate(error) && attempt < 2) continue;
      throw error;
    }
  }

  revalidatePath('/tables');
}
