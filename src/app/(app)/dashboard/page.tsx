import { z } from 'zod';
import { Role } from '@/generated/client';
import { getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { periodStart, type Period } from '@/lib/sales';
import { TableauDeBordDashboard } from '@/components/dashboard/tableau-de-bord-dashboard';
import { roundMoney } from '@/lib/margins';

const periodSchema = z.enum(['jour', 'semaine', 'mois']).catch('jour');

const TUNIS_HOUR = new Intl.DateTimeFormat('fr-TN', {
  timeZone: 'Africa/Tunis',
  hour: 'numeric',
  hour12: false,
});

function tunisiaHour(date: Date): number {
  return Number(TUNIS_HOUR.format(date));
}

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

  const [orders, ingredients, employees] = await Promise.all([
    prisma.order.findMany({
      where: {
        table: { establishmentId: user.establishmentId },
        status: 'PAYEE',
        createdAt: { gte: start },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        totalAmount: true,
        paymentMethod: true,
        createdAt: true,
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            dish: {
              select: {
                name: true,
                price: true,
                imageUrl: true,
                category: { select: { name: true } },
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
        costPerUnit: true,
      },
    }),
    prisma.user.findMany({
      where: {
        memberships: { some: { establishmentId: user.establishmentId } },
      },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true },
    }),
  ]);

  const revenue = orders.reduce(
    (sum, order) => sum + order.totalAmount.toNumber(),
    0
  );
  const orderCount = orders.length;
  const averageBasket = orderCount > 0 ? revenue / orderCount : 0;

  let cashRevenue = 0;
  let cardRevenue = 0;
  const hourlyMap = new Map<number, { revenue: number; tickets: number }>();
  const categoryMap = new Map<string, number>();
  const dishMap = new Map<
    string,
    {
      name: string;
      quantity: number;
      revenue: number;
      cost: number;
      imageUrl: string | null;
      categoryName: string;
    }
  >();

  for (const order of orders) {
    const amount = order.totalAmount.toNumber();
    if (order.paymentMethod === 'CASH') cashRevenue += amount;
    if (order.paymentMethod === 'STRIPE') cardRevenue += amount;

    const hour = tunisiaHour(order.createdAt);
    const bucket = hourlyMap.get(hour) ?? { revenue: 0, tickets: 0 };
    bucket.revenue += amount;
    bucket.tickets += 1;
    hourlyMap.set(hour, bucket);

    for (const item of order.orderItems) {
      const quantity = item.quantity;
      const lineTotal = quantity * item.unitPrice.toNumber();
      categoryMap.set(
        item.dish.category.name,
        (categoryMap.get(item.dish.category.name) ?? 0) + lineTotal
      );

      const unitCost = item.dish.recipeIngredients.reduce(
        (sum, ri) =>
          sum +
          ri.quantityNeeded.toNumber() * ri.ingredient.costPerUnit.toNumber(),
        0
      );
      const entry = dishMap.get(item.dish.name) ?? {
        name: item.dish.name,
        quantity: 0,
        revenue: 0,
        cost: 0,
        imageUrl: item.dish.imageUrl,
        categoryName: item.dish.category.name,
      };
      entry.quantity += quantity;
      entry.revenue += lineTotal;
      entry.cost += quantity * unitCost;
      dishMap.set(item.dish.name, entry);
    }
  }

  const hourly = Array.from({ length: 15 }, (_, i) => 7 + i)
    .map((hour) => {
      const b = hourlyMap.get(hour) ?? { revenue: 0, tickets: 0 };
      return { hour, revenue: roundMoney(b.revenue), tickets: b.tickets };
    });

  const categories = [...categoryMap.entries()]
    .map(([name, amount]) => ({
      name,
      revenue: roundMoney(amount),
      sharePercent: revenue > 0 ? Math.round((amount / revenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const topDishes = [...dishMap.values()]
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5)
    .map((d) => ({
      name: d.name,
      quantity: d.quantity,
      revenue: roundMoney(d.revenue),
      cost: roundMoney(d.cost),
      imageUrl: d.imageUrl,
    }));

  const totalCost = [...dishMap.values()].reduce(
    (sum, d) => sum + d.cost,
    0
  );
  const totalMargin = roundMoney(revenue - totalCost);
  const marginRate = revenue > 0 ? (totalMargin / revenue) * 100 : 0;
  const foodCostRate = revenue > 0 ? (totalCost / revenue) * 100 : 0;

  const lowStock = ingredients
    .filter((ingredient) =>
      ingredient.currentStock.lessThan(ingredient.minThreshold)
    )
    .map((ingredient) => ({
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock.toNumber(),
      minThreshold: ingredient.minThreshold.toNumber(),
    }));

  const stockValue = ingredients.reduce(
    (sum, ing) => sum + ing.currentStock.toNumber() * ing.costPerUnit.toNumber(),
    0
  );

  const strategicIngredients = [...ingredients]
    .sort(
      (a, b) =>
        a.currentStock.minus(a.minThreshold).toNumber() -
        b.currentStock.minus(b.minThreshold).toNumber()
    )
    .slice(0, 6)
    .map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      currentStock: ingredient.currentStock.toNumber(),
      minThreshold: ingredient.minThreshold.toNumber(),
      costPerUnit: ingredient.costPerUnit.toNumber(),
      alert: ingredient.currentStock.lessThan(ingredient.minThreshold),
    }));

  return (
    <main className="flex w-full flex-1 flex-col">
      <TableauDeBordDashboard
        title={t('title')}
        establishmentName={user.establishmentName}
        period={period}
        revenue={roundMoney(revenue)}
        orderCount={orderCount}
        averageBasket={roundMoney(averageBasket)}
        cashRevenue={roundMoney(cashRevenue)}
        cardRevenue={roundMoney(cardRevenue)}
        totalMargin={totalMargin}
        marginRate={roundMoney(marginRate)}
        foodCostRate={roundMoney(foodCostRate)}
        stockValue={roundMoney(stockValue)}
        ingredientCount={ingredients.length}
        stockAlerts={lowStock.length}
        hourly={hourly}
        categories={categories}
        topDishes={topDishes}
        lowStock={lowStock}
        strategicIngredients={strategicIngredients}
        employees={employees.map((employee) => ({
          id: employee.id,
          name: employee.name,
          role: employee.role,
        }))}
      />
    </main>
  );
}