import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { ACTIVE_ORDER_STATUSES, nextStatusFor } from '@/lib/order-flow';
import { startOfDayTunisia } from '@/lib/sales';
import {
  KitchenBoard,
  type KitchenOrder,
  type KitchenStats,
} from '@/components/kitchen/kitchen-board';

export default async function CuisineKdsPage() {
  const user = await requireRole(Role.KITCHEN, Role.ADMIN);

  const [orders, served] = await Promise.all([
    prisma.order.findMany({
      where: {
        table: { establishmentId: user.establishmentId },
        status: { in: ACTIVE_ORDER_STATUSES },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        table: { select: { number: true, zone: true } },
        user: { select: { name: true } },
        orderItems: {
          include: { dish: { select: { name: true } } },
        },
      },
    }),
    prisma.order.findMany({
      where: {
        table: { establishmentId: user.establishmentId },
        status: 'PAYEE',
        createdAt: { gte: startOfDayTunisia(new Date(), user.establishmentTimezone) },
      },
      select: { createdAt: true, updatedAt: true },
    }),
  ]);

  const rows: KitchenOrder[] = orders.map((order) => {
    const next = nextStatusFor(order.status, user.role);
    return {
      id: order.id,
      createdAt: order.createdAt,
      tableNumber: order.table.number,
      tableZone: order.table.zone,
      status: order.status,
      fromClient: order.userId === null,
      paidByCard: order.paymentMethod === 'STRIPE',
      serverName: order.user?.name ?? null,
      nextStatus: next === 'PAYEE' ? null : next,
      items: order.orderItems.map((item) => ({
        dishName: item.dish.name,
        quantity: item.quantity,
      })),
    };
  });

  const avgDelayMs = served.length
    ? Math.round(
        served.reduce(
          (sum, order) =>
            sum + (order.updatedAt.getTime() - order.createdAt.getTime()),
          0
        ) / served.length
      )
    : 0;

  const stats: KitchenStats = {
    servedToday: served.length,
    avgDelayMs,
  };

  return (
    <main className="flex flex-1 flex-col gap-4 p-6">
      <KitchenBoard orders={rows} stats={stats} timezone={user.establishmentTimezone} />
    </main>
  );
}
