import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import {
  TablesTable,
  type TableListRow,
  type TableMenuCategory,
  type TableMenuDish,
} from '@/components/tables/tables-table';

export default async function TablesPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireRole(Role.ADMIN, Role.SERVER);

  const [tables, categories, dishes] = await Promise.all([
    prisma.table.findMany({
      where: { establishmentId: user.establishmentId },
      orderBy: [{ number: 'asc' }],
      select: {
        id: true,
        number: true,
        zone: true,
        qrCode: true,
        _count: { select: { orders: true } },
      },
    }),
    prisma.category.findMany({
      where: { establishmentId: user.establishmentId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
    prisma.dish.findMany({
      where: { establishmentId: user.establishmentId, isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        imageUrl: true,
        categoryId: true,
      },
    }),
  ]);

  const rows: TableListRow[] = tables.map((table) => ({
    id: table.id,
    number: table.number,
    zone: table.zone,
    qrCode: table.qrCode,
    orderCount: table._count.orders,
  }));

  const menuCategories: TableMenuCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const menuDishes: TableMenuDish[] = dishes.map((dish) => ({
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: dish.price.toNumber(),
    imageUrl: dish.imageUrl,
    categoryId: dish.categoryId,
  }));

  return (
    <main className="flex flex-1 flex-col p-6">
      <TablesTable
        tables={rows}
        categories={menuCategories}
        dishes={menuDishes}
        establishmentName={user.establishmentName}
        error={(await searchParams).erreur}
        readOnly={user.role !== Role.ADMIN}
      />
    </main>
  );
}
