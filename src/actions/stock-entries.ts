'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { stockEntrySchema } from '@/lib/validations/stock-entry';

export type StockEntryErrors = {
  quantityAdded?: string[];
  supplierName?: string[];
  date?: string[];
  form?: string[];
};

export type StockEntryState =
  | { errors?: StockEntryErrors; message?: string; success?: boolean }
  | undefined;

export async function createStockEntry(
  ingredientId: string,
  _prev: StockEntryState,
  formData: FormData
): Promise<StockEntryState> {
  const user = await requireRole(Role.ADMIN);

  const ingredient = await prisma.ingredient.findFirst({
    where: { id: ingredientId, establishmentId: user.establishmentId },
    select: { id: true, name: true, unit: true },
  });
  if (!ingredient) redirect('/ingredients');

  const validated = stockEntrySchema.safeParse({
    quantityAdded: formData.get('quantityAdded'),
    supplierName: formData.get('supplierName'),
    date: formData.get('date'),
  });
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as StockEntryErrors,
      message: 'Certains champs sont invalides.',
    } satisfies StockEntryState;
  }

  await prisma.$transaction(async (tx) => {
    await tx.stockEntry.create({
      data: {
        quantityAdded: validated.data.quantityAdded,
        supplierName: validated.data.supplierName,
        date: validated.data.date,
        ingredientId,
        userId: user.id,
      },
    });
    await tx.ingredient.update({
      where: { id: ingredientId },
      data: { currentStock: { increment: validated.data.quantityAdded } },
    });
  });

  revalidatePath('/ingredients');
  return {
    success: true,
    message: 'Stock ajouté.',
  } satisfies StockEntryState;
}
