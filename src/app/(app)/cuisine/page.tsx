import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { ACTIVE_ORDER_STATUSES, nextStatusFor } from '@/lib/order-flow';
import {
  KitchenBoard,
  type KitchenOrder,
} from '@/components/kitchen/kitchen-board';

export default async function CuisinePage() {
  const user = await requireRole(Role.KITCHEN, Role.ADMIN);

  const orders = await prisma.order.findMany({
    where: {
      table: { establishmentId: user.establishmentId },
      status: { in: ACTIVE_ORDER_STATUSES },
    },
    orderBy: { createdAt: 'asc' },
    include: {
      table: { select: { number: true, zone: true } },
      orderItems: {
        include: { dish: { select: { name: true } } },
      },
    },
  });

  const rows: KitchenOrder[] = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    tableNumber: order.table.number,
    tableZone: order.table.zone,
    status: order.status,
    fromClient: order.userId === null,
    nextStatus: nextStatusFor(order.status, user.role),
    items: order.orderItems.map((item) => ({
      dishName: item.dish.name,
      quantity: item.quantity,
    })),
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <KitchenBoard orders={rows} />
    </main>
  );
}
