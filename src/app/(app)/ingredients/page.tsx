import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import {
  IngredientsTable,
  type IngredientRow,
} from '@/components/ingredients/ingredients-table';
import {
  StockEntriesHistory,
  type StockEntryRow,
} from '@/components/stock/stock-entries-history';

function toDateInput(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

function toDateLabel(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

export default async function IngredientsPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireRole(Role.ADMIN);

  const ingredients = await prisma.ingredient.findMany({
    where: { establishmentId: user.establishmentId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      unit: true,
      currentStock: true,
      minThreshold: true,
      costPerUnit: true,
      imageUrl: true,
      _count: { select: { recipeIngredients: true } },
    },
  });

  const rows: IngredientRow[] = ingredients.map((ingredient) => ({
    id: ingredient.id,
    name: ingredient.name,
    unit: ingredient.unit,
    currentStock: ingredient.currentStock.toNumber(),
    minThreshold: ingredient.minThreshold.toNumber(),
    costPerUnit: ingredient.costPerUnit.toNumber(),
    imageUrl: ingredient.imageUrl,
    recipeCount: ingredient._count.recipeIngredients,
  }));

  const lowCount = rows.filter(
    (ingredient) => ingredient.currentStock < ingredient.minThreshold
  ).length;

  const totalEntries = await prisma.stockEntry.count({
    where: { ingredient: { establishmentId: user.establishmentId } },
  });

  const stockEntries = await prisma.stockEntry.findMany({
    where: { ingredient: { establishmentId: user.establishmentId } },
    orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    take: 50,
    select: {
      id: true,
      date: true,
      quantityAdded: true,
      supplierName: true,
      ingredient: { select: { name: true, unit: true } },
      user: { select: { name: true } },
    },
  });

  const entryRows: StockEntryRow[] = stockEntries.map((entry) => ({
    id: entry.id,
    dateLabel: toDateLabel(entry.date),
    quantityAdded: entry.quantityAdded.toNumber(),
    supplierName: entry.supplierName,
    ingredientName: entry.ingredient.name,
    unit: entry.ingredient.unit,
    userName: entry.user.name,
  }));

  const today = toDateInput(new Date());

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <IngredientsTable
        ingredients={rows}
        lowCount={lowCount}
        error={(await searchParams).erreur}
        today={today}
      />
      <StockEntriesHistory entries={entryRows} total={totalEntries} />
    </main>
  );
}
