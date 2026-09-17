'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { Prisma, Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { createRecipeSchema } from '@/lib/validations/recipe';

export type RecipeErrors = {
  form?: string[];
};

export type RecipeState =
  { errors?: RecipeErrors; message?: string; success?: boolean } | undefined;

export async function saveRecipe(
  dishId: string,
  _prev: RecipeState,
  formData: FormData
): Promise<RecipeState> {
  const user = await requireRole(Role.ADMIN);

  const dish = await prisma.dish.findFirst({
    where: { id: dishId, establishmentId: user.establishmentId },
    select: { id: true },
  });
  if (!dish) redirect('/plats');

  const t = await getTranslations('Feedback.recipes');
  const tValidation = await getTranslations('Validation');

  let raw: unknown;
  try {
    raw = JSON.parse(String(formData.get('lines') ?? ''));
  } catch {
    return {
      errors: { form: [t('invalidData')] },
      message: t('saveFailed'),
    } satisfies RecipeState;
  }

  const validated = createRecipeSchema(tValidation).safeParse(raw);
  if (!validated.success) {
    return {
      errors: { form: validated.error.issues.map((issue) => issue.message) },
      message: t('saveFailed'),
    } satisfies RecipeState;
  }

  const lines = validated.data;

  const seen = new Set<string>();
  for (const line of lines) {
    if (seen.has(line.ingredientId)) {
      return {
        errors: { form: [t('duplicateIngredient')] },
        message: t('saveFailed'),
      } satisfies RecipeState;
    }
    seen.add(line.ingredientId);
  }

  const ingredients = await prisma.ingredient.findMany({
    where: {
      id: { in: lines.map((line) => line.ingredientId) },
      establishmentId: user.establishmentId,
    },
    select: { id: true },
  });
  if (ingredients.length !== lines.length) {
    return {
      errors: {
        form: [t('ingredientNotFound')],
      },
      message: t('saveFailed'),
    } satisfies RecipeState;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.recipeIngredient.deleteMany({ where: { dishId } });
      if (lines.length > 0) {
        await tx.recipeIngredient.createMany({
          data: lines.map((line) => ({
            dishId,
            ingredientId: line.ingredientId,
            quantityNeeded: line.quantityNeeded,
          })),
        });
      }
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      return {
        errors: {
          form: [t('ingredientDeleted')],
        },
        message: t('saveFailed'),
      } satisfies RecipeState;
    }
    throw error;
  }

  revalidatePath('/plats');
  return {
    success: true,
    message: t('saved'),
  } satisfies RecipeState;
}
