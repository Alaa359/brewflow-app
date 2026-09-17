import { z } from 'zod';
import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { PERIOD_LABEL, periodStart, type Period } from '@/lib/sales';
import { PeriodSwitcher } from '@/components/dashboard/period-switcher';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { TopDishes, type TopDish } from '@/components/dashboard/top-dishes';
import {
  LowStockList,
  type LowStockIngredient,
} from '@/components/dashboard/low-stock-list';

const periodSchema = z.enum(['jour', 'semaine', 'mois']).catch('jour');

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const user = await requireRole(Role.ADMIN);
  const { periode } = await searchParams;
  const period: Period = periodSchema.parse(periode);
  const start = periodStart(period);

  const [orders, ingredients] = await Promise.all([
    prisma.order.findMany({
      where: {
        table: { establishmentId: user.establishmentId },
        status: 'PAYEE',
        createdAt: { gte: start },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        orderItems: {
          include: { dish: { select: { name: true } } },
        },
      },
    }),
    prisma.ingredient.findMany({
      where: { establishmentId: user.establishmentId },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        unit: true,
        currentStock: true,
        minThreshold: true,
      },
    }),
  ]);

  const revenue = orders.reduce(
    (sum, order) => sum + order.totalAmount.toNumber(),
    0
  );
  const orderCount = orders.length;
  const averageBasket = orderCount > 0 ? revenue / orderCount : 0;

  const dishMap = new Map<
    string,
    { name: string; quantity: number; revenue: number }
  >();
  for (const order of orders) {
    for (const item of order.orderItems) {
      const entry = dishMap.get(item.dishId) ?? {
        name: item.dish.name,
        quantity: 0,
        revenue: 0,
      };
      entry.quantity += item.quantity;
      entry.revenue += item.quantity * item.unitPrice.toNumber();
      dishMap.set(item.dishId, entry);
    }
  }
  const topDishes: TopDish[] = [...dishMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const lowStock: LowStockIngredient[] = ingredients
    .filter((ingredient) =>
      ingredient.currentStock.lessThan(ingredient.minThreshold)
    )
    .sort(
      (a, b) =>
        a.currentStock.minus(a.minThreshold).toNumber() -
        b.currentStock.minus(b.minThreshold).toNumber()
    )
    .map((ingredient) => ({
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock.toNumber(),
      minThreshold: ingredient.minThreshold.toNumber(),
    }));

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground text-sm">
            Ventes — {PERIOD_LABEL[period].toLocaleLowerCase('fr-FR')} ·{' '}
            {user.establishmentName}
          </p>
        </div>
        <PeriodSwitcher current={period} />
      </section>

      <KpiCards
        revenue={revenue}
        orderCount={orderCount}
        averageBasket={averageBasket}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopDishes dishes={topDishes} />
        <LowStockList ingredients={lowStock} />
      </div>
    </main>
  );
}
