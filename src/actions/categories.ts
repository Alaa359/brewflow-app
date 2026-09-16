'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { categorySchema } from '@/lib/validations/category';

export type CategoryErrors = {
  name?: string[];
  sortOrder?: string[];
  form?: string[];
};

export type CategoryState =
  { errors?: CategoryErrors; message?: string; success?: boolean } | undefined;

function fieldErrors(error: z.ZodError): CategoryErrors {
  return error.flatten().fieldErrors as CategoryErrors;
}

function isDuplicate(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function parseCategory(formData: FormData) {
  return categorySchema.safeParse({
    name: formData.get('name'),
    sortOrder: formData.get('sortOrder'),
  });
}

export async function createCategory(
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const user = await requireRole(Role.ADMIN);

  const validated = parseCategory(formData);
  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies CategoryState;
  }

  try {
    await prisma.category.create({
      data: {
        name: validated.data.name,
        sortOrder: validated.data.sortOrder,
        establishmentId: user.establishmentId,
      },
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: { name: ['Une catégorie de ce nom existe déjà.'] },
        message: 'Création impossible.',
      } satisfies CategoryState;
    }
    throw error;
  }

  revalidatePath('/plats');
  return {
    success: true,
    message: 'Catégorie créée.',
  } satisfies CategoryState;
}

export async function updateCategory(
  id: string,
  _prev: CategoryState,
  formData: FormData
): Promise<CategoryState> {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.category.findFirst({
    where: { id, establishmentId: user.establishmentId },
  });
  if (!existing) redirect('/plats');

  const validated = parseCategory(formData);
  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: 'Certains champs sont invalides.',
    } satisfies CategoryState;
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        sortOrder: validated.data.sortOrder,
      },
    });
  } catch (error) {
    if (isDuplicate(error)) {
      return {
        errors: { name: ['Une catégorie de ce nom existe déjà.'] },
        message: 'Mise à jour impossible.',
      } satisfies CategoryState;
    }
    throw error;
  }

  revalidatePath('/plats');
  return {
    success: true,
    message: 'Catégorie mise à jour.',
  } satisfies CategoryState;
}

export async function deleteCategory(id: string) {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.category.findFirst({
    where: { id, establishmentId: user.establishmentId },
    select: { id: true },
  });
  if (!existing) redirect('/plats');

  const dishCount = await prisma.$transaction(async (tx) =>
    tx.category.count({
      where: {
        id,
        establishmentId: user.establishmentId,
        dishes: { some: {} },
      },
    })
  );
  if (dishCount > 0) redirect('/plats?erreur=categorie');

  await prisma.category.delete({ where: { id } });
  revalidatePath('/plats');
}
