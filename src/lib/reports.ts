import 'server-only';
import { prisma } from '@/lib/prisma';
import { computeMargins, roundMoney } from '@/lib/margins';
import { startOfDayTunisia, toDateInputTunisia } from '@/lib/sales';
import { addDays, formatDateLabel, parseISODate } from '@/lib/planning';

export type ReportCategoryLine = {
  categoryName: string;
  quantity: number;
  revenue: number;
  sharePercent: number;
};

export type ReportDishLine = {
  dishName: string;
  categoryName: string;
  quantity: number;
  revenue: number;
  cost: number;
  margin: number;
  marginPercent: number | null;
};

export type ReportRestockLine = {
  ingredientName: string;
  unit: string;
  quantityAdded: number;
  entryCount: number;
  suppliers: string[];
};

export type ReportRestockEntry = {
  dateLabel: string;
  ingredientName: string;
  unit: string;
  quantityAdded: number;
  supplierName: string | null;
  userName: string;
};

export type ReportTotals = {
  revenue: number;
  orderCount: number;
  itemCount: number;
  averageBasket: number;
  cashRevenue: number;
  cardRevenue: number;
};

export type ReportData = {
  range: { from: string; to: string };
  generatedAt: Date;
  totals: ReportTotals;
  categories: ReportCategoryLine[];
  dishes: ReportDishLine[];
  restock: ReportRestockLine[];
  restockEntries: ReportRestockEntry[];
  restockEntryCount: number;
};

const RESTOCK_DETAIL_LIMIT = 50;

export async function buildReport(
  establishmentId: string,
  fromIso: string,
  toIso: string
): Promise<ReportData> {
  const fromDate = parseISODate(fromIso);
  const toDate = parseISODate(toIso);
  if (!fromDate || !toDate) {
    throw new Error('Période invalide.');
  }

  const start = startOfDayTunisia(fromDate);
  const endExclusive = startOfDayTunisia(parseISODate(addDays(toIso, 1))!);

  const [orders, stockEntries] = await Promise.all([
    prisma.order.findMany({
      where: {
        table: { establishmentId },
        status: 'PAYEE',
        createdAt: { gte: start, lt: endExclusive },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        totalAmount: true,
        paymentMethod: true,
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            dish: {
              select: {
                name: true,
                price: true,
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
    prisma.stockEntry.findMany({
      where: {
        ingredient: { establishmentId },
        date: { gte: start, lt: endExclusive },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: {
        date: true,
        quantityAdded: true,
        supplierName: true,
        ingredient: { select: { id: true, name: true, unit: true } },
        user: { select: { name: true } },
      },
    }),
  ]);

  let revenue = 0;
  let itemCount = 0;
  let cashRevenue = 0;
  let cardRevenue = 0;

  const categoryMap = new Map<
    string,
    { categoryName: string; quantity: number; revenue: number }
  >();
  const dishMap = new Map<
    string,
    {
      dishName: string;
      categoryName: string;
      quantity: number;
      revenue: number;
      unitCost: number;
    }
  >();

  for (const order of orders) {
    const amount = order.totalAmount.toNumber();
    revenue += amount;
    if (order.paymentMethod === 'CASH') cashRevenue += amount;
    if (order.paymentMethod === 'STRIPE') cardRevenue += amount;

    for (const item of order.orderItems) {
      const quantity = item.quantity;
      const lineTotal = quantity * item.unitPrice.toNumber();
      itemCount += quantity;

      const categoryName = item.dish.category.name;
      const category = categoryMap.get(categoryName) ?? {
        categoryName,
        quantity: 0,
        revenue: 0,
      };
      category.quantity += quantity;
      category.revenue += lineTotal;
      categoryMap.set(categoryName, category);

      const unitCost = computeMargins(
        item.dish.price.toNumber(),
        item.dish.recipeIngredients.map((ri) => ({
          quantityNeeded: ri.quantityNeeded.toNumber(),
          costPerUnit: ri.ingredient.costPerUnit.toNumber(),
        }))
      ).cost;

      const dish = dishMap.get(item.dish.name) ?? {
        dishName: item.dish.name,
        categoryName,
        quantity: 0,
        revenue: 0,
        unitCost,
      };
      dish.quantity += quantity;
      dish.revenue += lineTotal;
      dishMap.set(item.dish.name, dish);
    }
  }

  revenue = roundMoney(revenue);
  cashRevenue = roundMoney(cashRevenue);
  cardRevenue = roundMoney(cardRevenue);

  const categories: ReportCategoryLine[] = [...categoryMap.values()]
    .map((category) => ({
      categoryName: category.categoryName,
      quantity: category.quantity,
      revenue: roundMoney(category.revenue),
      sharePercent:
        revenue > 0 ? Math.round((category.revenue / revenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  const dishes: ReportDishLine[] = [...dishMap.values()]
    .map((dish) => {
      const dishRevenue = roundMoney(dish.revenue);
      const cost = roundMoney(dish.unitCost * dish.quantity);
      const margin = roundMoney(dishRevenue - cost);
      return {
        dishName: dish.dishName,
        categoryName: dish.categoryName,
        quantity: dish.quantity,
        revenue: dishRevenue,
        cost,
        margin,
        marginPercent:
          dishRevenue > 0 ? Math.round((margin / dishRevenue) * 100) : null,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const restockMap = new Map<
    string,
    {
      ingredientName: string;
      unit: string;
      quantityAdded: number;
      entryCount: number;
      suppliers: Set<string>;
    }
  >();
  for (const entry of stockEntries) {
    const key = entry.ingredient.id;
    const line = restockMap.get(key) ?? {
      ingredientName: entry.ingredient.name,
      unit: entry.ingredient.unit,
      quantityAdded: 0,
      entryCount: 0,
      suppliers: new Set<string>(),
    };
    line.quantityAdded += entry.quantityAdded.toNumber();
    line.entryCount += 1;
    if (entry.supplierName) line.suppliers.add(entry.supplierName);
    restockMap.set(key, line);
  }

  const restock: ReportRestockLine[] = [...restockMap.values()]
    .map((line) => ({
      ingredientName: line.ingredientName,
      unit: line.unit,
      quantityAdded: roundMoney(line.quantityAdded),
      entryCount: line.entryCount,
      suppliers: [...line.suppliers].sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));

  const restockEntries: ReportRestockEntry[] = stockEntries
    .slice(0, RESTOCK_DETAIL_LIMIT)
    .map((entry) => ({
      dateLabel: formatDateLabel(toDateInputTunisia(entry.date)),
      ingredientName: entry.ingredient.name,
      unit: entry.ingredient.unit,
      quantityAdded: entry.quantityAdded.toNumber(),
      supplierName: entry.supplierName,
      userName: entry.user.name,
    }));

  const orderCount = orders.length;

  return {
    range: { from: fromIso, to: toIso },
    generatedAt: new Date(),
    totals: {
      revenue,
      orderCount,
      itemCount,
      averageBasket: orderCount > 0 ? roundMoney(revenue / orderCount) : 0,
      cashRevenue,
      cardRevenue,
    },
    categories,
    dishes,
    restock,
    restockEntries,
    restockEntryCount: stockEntries.length,
  };
}
