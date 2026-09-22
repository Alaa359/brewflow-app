import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import {
  IngredientsDashboard,
  type IngredientRow,
} from '@/components/ingredients/ingredients-dashboard';

export default async function IngredientsPage() {
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

  return (
    <main className="flex flex-1 flex-col p-6">
      <IngredientsDashboard ingredients={rows} />
    </main>
  );
}
