import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { startOfDayTunisia } from '@/lib/sales';
import {
  PosClient,
  type PosCategory,
  type PosDish,
  type PosTable,
} from '@/components/sales/pos-client';
import {
  TodaySales,
  type TodayOrder,
  type TodayOrderItem,
} from '@/components/sales/today-sales';
import {
  PendingOrders,
  type PendingOrder,
} from '@/components/sales/pending-orders';
import { nextStatusFor } from '@/lib/order-flow';
import { stripeConfigured } from '@/lib/stripe';
import { SalesTodayHeader } from '@/components/sales/sales-today-header';

export default async function CaissePage() {
  const user = await requireRole(Role.SERVER, Role.ADMIN);

  const [categories, dishes, tables, activeOrders, paidOrders] =
    await Promise.all([
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
          price: true,
          categoryId: true,
          imageUrl: true,
        },
      }),
      prisma.table.findMany({
        where: { establishmentId: user.establishmentId },
        orderBy: { number: 'asc' },
        select: { id: true, number: true, zone: true },
      }),
      prisma.order.findMany({
        where: {
          table: { establishmentId: user.establishmentId },
          status: { not: 'PAYEE' },
        },
        orderBy: { createdAt: 'desc' },
        take: 200,
        include: {
          table: { select: { number: true, zone: true } },
          orderItems: {
            include: { dish: { select: { name: true } } },
          },
        },
      }),
      prisma.order.findMany({
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
      }),
    ]);

  const categoryRows: PosCategory[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  const dishRows: PosDish[] = dishes.map((dish) => ({
    id: dish.id,
    name: dish.name,
    price: dish.price.toNumber(),
    categoryId: dish.categoryId,
    imageUrl: dish.imageUrl,
  }));

  const tableRows: PosTable[] = tables.map((table) => ({
    id: table.id,
    number: table.number,
    zone: table.zone,
  }));

  const todayRows: TodayOrder[] = paidOrders.map((order) => {
    const items: TodayOrderItem[] = order.orderItems.map((item) => ({
      dishName: item.dish.name,
      quantity: item.quantity,
    }));
    return {
      id: order.id,
      createdAt: order.createdAt,
      totalAmount: order.totalAmount.toNumber(),
      status: order.status,
      paymentMethod: order.paymentMethod,
      userId: order.userId,
      items,
    };
  });

  const kpis = {
    revenue: todayRows.reduce((acc, order) => acc + order.totalAmount, 0),
    tickets: todayRows.length,
    cash: todayRows
      .filter((order) => order.paymentMethod === 'CASH')
      .reduce((acc, order) => acc + order.totalAmount, 0),
    card: todayRows
      .filter((order) => order.paymentMethod === 'STRIPE')
      .reduce((acc, order) => acc + order.totalAmount, 0),
  };

  const pendingRows: PendingOrder[] = activeOrders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    tableNumber: order.table.number,
    tableZone: order.table.zone,
    totalAmount: order.totalAmount.toNumber(),
    status: order.status,
    paymentMethod: order.paymentMethod,
    fromClient: order.userId === null,
    nextStatus: nextStatusFor(order.status, user.role),
    items: order.orderItems.map((item) => ({
      dishName: item.dish.name,
      quantity: item.quantity,
    })),
  }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <PosClient
        categories={categoryRows}
        dishes={dishRows}
        tables={tableRows}
        canStripe={stripeConfigured()}
      />
      <PendingOrders orders={pendingRows} />
      <SalesTodayHeader kpis={kpis} />
      <TodaySales orders={todayRows} currentUserId={user.id} />
    </main>
  );
}
