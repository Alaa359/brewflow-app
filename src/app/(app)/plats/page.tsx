import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { computeMargins } from '@/lib/margins';
import { DishesTable, type DishRow } from '@/components/dishes/dishes-table';
import type { CategoryRow } from '@/components/categories/categories-manager';
import type { RecipeIngredientOption } from '@/components/dishes/recipe-editor';

export default async function PlatsPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireRole(Role.ADMIN);

  const categories = await prisma.category.findMany({
    where: { establishmentId: user.establishmentId },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      sortOrder: true,
      _count: { select: { dishes: true } },
    },
  });

  const dishes = await prisma.dish.findMany({
    where: { establishmentId: user.establishmentId },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      categoryId: true,
      imageUrl: true,
      isActive: true,
      _count: { select: { recipeIngredients: true, orderItems: true } },
      recipeIngredients: {
        include: {
          ingredient: {
            select: { name: true, unit: true, costPerUnit: true },
          },
        },
      },
    },
  });

  const ingredients = await prisma.ingredient.findMany({
    where: { establishmentId: user.establishmentId },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, unit: true, costPerUnit: true },
  });

  const ingredientOptions: RecipeIngredientOption[] = ingredients.map(
    (ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit.toNumber(),
    })
  );

  const categoryRows: CategoryRow[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    sortOrder: cat.sortOrder,
    dishCount: cat._count.dishes,
  }));

  const dishRows: DishRow[] = dishes.map((dish) => {
    const recipe = dish.recipeIngredients.map((ri) => ({
      ingredientId: ri.ingredientId,
      ingredientName: ri.ingredient.name,
      unit: ri.ingredient.unit,
      quantityNeeded: ri.quantityNeeded.toNumber(),
      costPerUnit: ri.ingredient.costPerUnit.toNumber(),
    }));
    const margins = computeMargins(dish.price.toNumber(), recipe);
    return {
      id: dish.id,
      name: dish.name,
      description: dish.description,
      price: dish.price.toNumber(),
      categoryId: dish.categoryId,
      imageUrl: dish.imageUrl,
      isActive: dish.isActive,
      recipeCount: dish._count.recipeIngredients,
      orderItemCount: dish._count.orderItems,
      cost: margins.cost,
      margin: margins.margin,
      marginPercent: margins.marginPercent,
      recipe,
    };
  });

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <DishesTable
        categories={categoryRows}
        dishes={dishRows}
        ingredients={ingredientOptions}
        error={(await searchParams).erreur}
      />
    </main>
  );
}
