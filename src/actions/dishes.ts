'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { createDishSchema } from '@/lib/validations/dish';
import type { MessageTranslator } from '@/lib/i18n/translator';
import { removeImage, saveImage } from '@/lib/uploads';

export type DishErrors = {
  name?: string[];
  description?: string[];
  price?: string[];
  categoryId?: string[];
  isActive?: string[];
  form?: string[];
};

export type DishState =
  { errors?: DishErrors; message?: string; success?: boolean } | undefined;

function fieldErrors(error: z.ZodError): DishErrors {
  return error.flatten().fieldErrors as DishErrors;
}

function isDuplicate(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function parseDish(formData: FormData, t: MessageTranslator) {
  return createDishSchema(t).safeParse({
    name: formData.get('name'),
    description: formData.get('description'),
    price: formData.get('price'),
    categoryId: formData.get('categoryId'),
    isActive: formData.get('isActive'),
  });
}

export async function createDish(
  _prev: DishState,
  formData: FormData
): Promise<DishState> {
  const user = await requireRole(Role.ADMIN);
  const t = await getTranslations('Feedback.dishes');
  const tValidation = await getTranslations('Validation');
  const tUploads = await getTranslations('Feedback.uploads');

  const validated = parseDish(formData, tValidation);
  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: t('invalidFields'),
    } satisfies DishState;
  }

  const category = await prisma.category.findFirst({
    where: {
      id: validated.data.categoryId,
      establishmentId: user.establishmentId,
    },
    select: { id: true },
  });
  if (!category) {
    return {
      errors: { categoryId: [t('categoryNotFound')] },
      message: t('createFailed'),
    } satisfies DishState;
  }

  const duplicate = await prisma.dish.findFirst({
    where: {
      establishmentId: user.establishmentId,
      name: validated.data.name,
    },
  });
  if (duplicate) {
    return {
      errors: { name: [t('duplicateName')] },
      message: t('createFailed'),
    } satisfies DishState;
  }

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveImage(
      'dishes',
      formData.get('image') as File | null,
      tUploads
    );
  } catch (error) {
    return {
      errors: { form: [(error as Error).message] },
    } satisfies DishState;
  }

  try {
    await prisma.dish.create({
      data: {
        name: validated.data.name,
        description: validated.data.description,
        price: validated.data.price,
        categoryId: validated.data.categoryId,
        isActive: validated.data.isActive,
        imageUrl,
        establishmentId: user.establishmentId,
      },
    });
  } catch (error) {
    await removeImage(imageUrl);
    if (isDuplicate(error)) {
      return {
        errors: { name: [t('duplicateName')] },
        message: t('createFailed'),
      } satisfies DishState;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return {
        errors: { categoryId: [t('categoryNotFound')] },
        message: t('createFailed'),
      } satisfies DishState;
    }
    throw error;
  }

  revalidatePath('/plats');
  return {
    success: true,
    message: t('created'),
  } satisfies DishState;
}

export async function updateDish(
  id: string,
  _prev: DishState,
  formData: FormData
): Promise<DishState> {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.dish.findFirst({
    where: { id, establishmentId: user.establishmentId },
  });
  if (!existing) redirect('/plats');

  const t = await getTranslations('Feedback.dishes');
  const tValidation = await getTranslations('Validation');
  const tUploads = await getTranslations('Feedback.uploads');

  const validated = parseDish(formData, tValidation);
  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: t('invalidFields'),
    } satisfies DishState;
  }

  const duplicate = await prisma.dish.findFirst({
    where: {
      establishmentId: user.establishmentId,
      name: validated.data.name,
      id: { not: id },
    },
  });
  if (duplicate) {
    return {
      errors: { name: [t('duplicateName')] },
      message: t('updateFailed'),
    } satisfies DishState;
  }

  const category = await prisma.category.findFirst({
    where: {
      id: validated.data.categoryId,
      establishmentId: user.establishmentId,
    },
    select: { id: true },
  });
  if (!category) {
    return {
      errors: { categoryId: [t('categoryNotFound')] },
      message: t('updateFailed'),
    } satisfies DishState;
  }

  let newImage: string | null = null;
  try {
    newImage = await saveImage(
      'dishes',
      formData.get('image') as File | null,
      tUploads
    );
  } catch (error) {
    return {
      errors: { form: [(error as Error).message] },
    } satisfies DishState;
  }

  const nextImageUrl = newImage ?? existing.imageUrl;

  try {
    await prisma.dish.update({
      where: { id },
      data: {
        name: validated.data.name,
        description: validated.data.description,
        price: validated.data.price,
        categoryId: validated.data.categoryId,
        isActive: validated.data.isActive,
        imageUrl: nextImageUrl,
      },
    });
  } catch (error) {
    await removeImage(newImage);
    if (isDuplicate(error)) {
      return {
        errors: { name: [t('duplicateName')] },
        message: t('updateFailed'),
      } satisfies DishState;
    }
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return {
        errors: { categoryId: [t('categoryNotFound')] },
        message: t('updateFailed'),
      } satisfies DishState;
    }
    throw error;
  }

  if (newImage) await removeImage(existing.imageUrl);
  revalidatePath('/plats');
  return {
    success: true,
    message: t('updated'),
  } satisfies DishState;
}

export async function deleteDish(id: string) {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.dish.findFirst({
    where: { id, establishmentId: user.establishmentId },
  });
  if (!existing) redirect('/plats');

  let blocked: 'recette' | 'commande' | null = null;
  await prisma.$transaction(async (tx) => {
    const recipeCount = await tx.recipeIngredient.count({
      where: { dishId: id },
    });
    const orderItemCount = await tx.orderItem.count({
      where: { dishId: id },
    });
    if (recipeCount > 0) blocked = 'recette';
    else if (orderItemCount > 0) blocked = 'commande';
  });

  if (blocked) redirect(`/plats?erreur=${blocked}`);

  await prisma.dish.delete({ where: { id } }).catch((error) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      redirect('/plats?erreur=commande');
    }
    throw error;
  });
  await removeImage(existing.imageUrl);
  revalidatePath('/plats');
}
