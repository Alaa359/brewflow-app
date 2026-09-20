import { z } from 'zod';
import { Role } from '@/generated/client';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { periodStart, type Period } from '@/lib/sales';
import { PeriodSwitcher } from '@/components/dashboard/period-switcher';
import { KpiCards } from '@/components/dashboard/kpi-cards';
import { TopDishes, type TopDish } from '@/components/dashboard/top-dishes';
import {
  LowStockList,
  type LowStockIngredient,
} from '@/components/dashboard/low-stock-list';
import {
  MarginsPanel,
  type DishMargin,
} from '@/components/dashboard/margins-panel';
import { roundMoney } from '@/lib/margins';

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

  const t = await getTranslations('Dashboard');
  const tPeriod = await getTranslations('Period');

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
              include: {
                dish: {
                  select: {
                    name: true,
                    price: true,
                    recipeIngredients: {
                      select: {
                        quantityNeeded: true,
                        ingredient: { select: { costPerUnit: true } },
                      },
                    },
                  },
                },
              },
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
    { name: string; quantity: number; revenue: number; cost: number }
  >();
  for (const order of orders) {
    for (const item of order.orderItems) {
      const entry = dishMap.get(item.dishId) ?? {
        name: item.dish.name,
        quantity: 0,
        revenue: 0,
        cost: 0,
      };
      const unitCost = item.dish.recipeIngredients.reduce(
        (sum, ri) =>
          sum + ri.quantityNeeded.toNumber() * ri.ingredient.costPerUnit.toNumber(),
        0
      );
      entry.quantity += item.quantity;
      entry.revenue += item.quantity * item.unitPrice.toNumber();
      entry.cost += item.quantity * unitCost;
      dishMap.set(item.dishId, entry);
    }
  }
  const topDishes: TopDish[] = [...dishMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const marginDishes: DishMargin[] =
    orders.length > 0
      ? [...dishMap.values()].map(
          ({ name, quantity, revenue, cost }) => {
            const unitPrice =
              quantity > 0 ? Math.round((revenue / quantity) * 100) / 100 : 0;
            const unitCost =
              quantity > 0 ? Math.round((cost / quantity) * 100) / 100 : 0;
            const margin = Math.round((unitPrice - unitCost) * 100) / 100;
            const marginRate =
              unitPrice > 0 ? Math.round((margin / unitPrice) * 100) : 0;
            return {
              name,
              price: unitPrice,
              cost: unitCost,
              margin,
              marginRate,
              quantity,
            };
          }
        )
      : [];
  const totalRevenue = marginDishes.reduce(
    (sum, d) => sum + d.marginRate * 0 * d.price * d.quantity,
    0
  );
  const totalRevenueClean = orders.reduce(
    (sum, order) => sum + order.totalAmount.toNumber(),
    0
  );
  const totalCostClean = marginDishes.reduce(
    (sum, d) => sum + d.cost * d.quantity,
    0
  );

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
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {t('subtitle', {
              period: tPeriod(period).toLowerCase(),
              establishmentName: user.establishmentName,
            })}
          </p>
        </div>
        <PeriodSwitcher current={period} />
      </section>

      <KpiCards
        revenue={revenue}
        orderCount={orderCount}
        averageBasket={averageBasket}
      />

      <MarginsPanel
        dishes={marginDishes}
        totalRevenue={totalRevenueClean}
        totalCost={totalCostClean}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <TopDishes dishes={topDishes} />
        <LowStockList ingredients={lowStock} />
      </div>
    </main>
  );
}
