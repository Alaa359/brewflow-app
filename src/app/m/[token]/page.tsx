import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import {
  MenuClient,
  type MenuCategory,
  type MenuDish,
} from '@/components/menu/menu-client';

export const dynamic = 'force-dynamic';

export default async function TableMenuPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const table = await prisma.table.findUnique({
    where: { qrCode: token },
    select: {
      id: true,
      number: true,
      zone: true,
      establishment: { select: { id: true, name: true } },
    },
  });

  if (!table) notFound();

  const [categories, dishes] = await Promise.all([
    prisma.category.findMany({
      where: { establishmentId: table.establishment.id },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true },
    }),
    prisma.dish.findMany({
      where: { establishmentId: table.establishment.id, isActive: true },
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

  const categoryRows: MenuCategory[] = categories.map((category) => ({
    id: category.id,
    name: category.name,
  }));

  const dishRows: MenuDish[] = dishes.map((dish) => ({
    id: dish.id,
    name: dish.name,
    description: dish.description,
    price: dish.price.toNumber(),
    imageUrl: dish.imageUrl,
    categoryId: dish.categoryId,
  }));

  return (
    <MenuClient
      token={token}
      establishmentName={table.establishment.name}
      tableNumber={table.number}
      tableZone={table.zone}
      categories={categoryRows}
      dishes={dishRows}
    />
  );
}
