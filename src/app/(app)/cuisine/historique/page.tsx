import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { startOfDayTunisia } from '@/lib/sales';
import { KitchenHistory } from '@/components/kitchen/kitchen-history';

export default async function CuisineHistoriquePage() {
  const user = await requireRole(Role.KITCHEN, Role.ADMIN);

  const orders = await prisma.order.findMany({
    where: {
      table: { establishmentId: user.establishmentId },
      status: 'PAYEE',
      createdAt: { gte: startOfDayTunisia(new Date()) },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      table: { select: { number: true, zone: true } },
      orderItems: {
        include: { dish: { select: { name: true } } },
      },
    },
  });

  const rows = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    tableNumber: order.table.number,
    tableZone: order.table.zone,
    totalAmount: order.totalAmount.toNumber(),
    items: order.orderItems.map((item) => ({
      dishName: item.dish.name,
      quantity: item.quantity,
    })),
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <KitchenHistory orders={rows} establishmentName={user.establishmentName} />
    </main>
  );
}
