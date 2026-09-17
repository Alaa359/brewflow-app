'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { createIngredientSchema } from '@/lib/validations/ingredient';
import type { MessageTranslator } from '@/lib/i18n/translator';
import { removeImage, saveImage } from '@/lib/uploads';

export type IngredientErrors = {
  name?: string[];
  unit?: string[];
  currentStock?: string[];
  minThreshold?: string[];
  costPerUnit?: string[];
  form?: string[];
};

export type IngredientState =
  | { errors?: IngredientErrors; message?: string; success?: boolean }
  | undefined;

function fieldErrors(error: z.ZodError): IngredientErrors {
  return error.flatten().fieldErrors as IngredientErrors;
}

function isDuplicate(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function parseIngredient(formData: FormData, t: MessageTranslator) {
  return createIngredientSchema(t).safeParse({
    name: formData.get('name'),
    unit: formData.get('unit'),
    currentStock: formData.get('currentStock'),
    minThreshold: formData.get('minThreshold'),
    costPerUnit: formData.get('costPerUnit'),
  });
}

export async function createIngredient(
  _prev: IngredientState,
  formData: FormData
): Promise<IngredientState> {
  const user = await requireRole(Role.ADMIN);
  const t = await getTranslations('Feedback.ingredients');
  const tValidation = await getTranslations('Validation');
  const tUploads = await getTranslations('Feedback.uploads');

  const validated = parseIngredient(formData, tValidation);
  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: t('invalidFields'),
    } satisfies IngredientState;
  }

  let imageUrl: string | null = null;
  try {
    imageUrl = await saveImage(
      'ingredients',
      formData.get('image') as File | null,
      tUploads
    );
  } catch (error) {
    return {
      errors: { form: [(error as Error).message] },
    } satisfies IngredientState;
  }

  try {
    await prisma.ingredient.create({
      data: {
        name: validated.data.name,
        unit: validated.data.unit,
        currentStock: validated.data.currentStock,
        minThreshold: validated.data.minThreshold,
        costPerUnit: validated.data.costPerUnit,
        imageUrl,
        establishmentId: user.establishmentId,
      },
    });
  } catch (error) {
    if (isDuplicate(error)) {
      await removeImage(imageUrl);
      return {
        errors: { name: [t('duplicate')] },
        message: t('createFailed'),
      } satisfies IngredientState;
    }
    await removeImage(imageUrl);
    throw error;
  }

  revalidatePath('/ingredients');
  return {
    success: true,
    message: t('created'),
  } satisfies IngredientState;
}

export async function updateIngredient(
  id: string,
  _prev: IngredientState,
  formData: FormData
): Promise<IngredientState> {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.ingredient.findFirst({
    where: { id, establishmentId: user.establishmentId },
  });
  if (!existing) redirect('/ingredients');

  const t = await getTranslations('Feedback.ingredients');
  const tValidation = await getTranslations('Validation');
  const tUploads = await getTranslations('Feedback.uploads');

  const validated = parseIngredient(formData, tValidation);
  if (!validated.success) {
    return {
      errors: fieldErrors(validated.error),
      message: t('invalidFields'),
    } satisfies IngredientState;
  }

  let newImage: string | null = null;
  try {
    newImage = await saveImage(
      'ingredients',
      formData.get('image') as File | null,
      tUploads
    );
  } catch (error) {
    return {
      errors: { form: [(error as Error).message] },
    } satisfies IngredientState;
  }

  const nextImageUrl = newImage ?? existing.imageUrl;

  try {
    await prisma.ingredient.update({
      where: { id },
      data: {
        name: validated.data.name,
        unit: validated.data.unit,
        currentStock: validated.data.currentStock,
        minThreshold: validated.data.minThreshold,
        costPerUnit: validated.data.costPerUnit,
        imageUrl: nextImageUrl,
      },
    });
  } catch (error) {
    if (isDuplicate(error)) {
      await removeImage(newImage);
      return {
        errors: { name: [t('duplicate')] },
        message: t('updateFailed'),
      } satisfies IngredientState;
    }
    await removeImage(newImage);
    throw error;
  }

  if (newImage) await removeImage(existing.imageUrl);
  revalidatePath('/ingredients');
  return {
    success: true,
    message: t('updated'),
  } satisfies IngredientState;
}

export async function deleteIngredient(id: string) {
  const user = await requireRole(Role.ADMIN);

  const existing = await prisma.ingredient.findFirst({
    where: { id, establishmentId: user.establishmentId },
  });
  if (!existing) redirect('/ingredients');

  const recipeCount = await prisma.$transaction(async (tx) =>
    tx.recipeIngredient.count({ where: { ingredientId: id } })
  );
  if (recipeCount > 0) redirect('/ingredients?erreur=recette');

  await prisma.ingredient.delete({ where: { id } }).catch((error) => {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      redirect('/ingredients?erreur=recette');
    }
    throw error;
  });
  await removeImage(existing.imageUrl);
  revalidatePath('/ingredients');
}
