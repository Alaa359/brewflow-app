import 'server-only';
import { OrderStatus, PaymentMethod, Prisma } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { formatQuantity } from '@/lib/ingredients';

export type SaleLine = { dishId: string; quantity: number };

export type DishWithRecipe = {
  id: string;
  price: Prisma.Decimal;
  recipeIngredients: {
    ingredientId: string;
    quantityNeeded: Prisma.Decimal;
    ingredient: { id: string; name: string; unit: string };
  }[];
};

type LockedRow = {
  id: string;
  name: string;
  unit: string;
  currentStock: string;
};

export const SALE_TX_OPTIONS = {
  isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
  maxWait: 5000,
  timeout: 15000,
} as const;

export class SaleValidationError extends Error {
  errors: string[];

  constructor(errors: string[], message = 'Vente impossible.') {
    super(message);
    this.name = 'SaleValidationError';
    this.errors = errors;
  }
}

export class StockCheckError extends Error {}

export type SalePlan = {
  dishById: Map<string, DishWithRecipe>;
  needed: Map<string, Prisma.Decimal>;
  ingredientMeta: Map<string, { name: string; unit: string }>;
  stockById: Map<string, Prisma.Decimal>;
  totalAmount: Prisma.Decimal;
};

async function fetchSaleDishes(
  tx: Prisma.TransactionClient,
  establishmentId: string,
  lines: SaleLine[]
): Promise<DishWithRecipe[]> {
  const dishes = await tx.dish.findMany({
    where: {
      id: { in: lines.map((l) => l.dishId) },
      establishmentId,
      isActive: true,
    },
    include: {
      recipeIngredients: {
        include: {
          ingredient: { select: { id: true, name: true, unit: true } },
        },
      },
    },
  });
  if (dishes.length !== lines.length) {
    throw new SaleValidationError(['Un article du panier est indisponible.']);
  }
  return dishes;
}

export async function buildSalePlan(
  tx: Prisma.TransactionClient,
  establishmentId: string,
  lines: SaleLine[]
): Promise<SalePlan> {
  const dishes = await fetchSaleDishes(tx, establishmentId, lines);
  const dishById = new Map(dishes.map((dish) => [dish.id, dish]));

  const ingredientIds = [
    ...new Set(
      dishes.flatMap((dish) =>
        dish.recipeIngredients.map((ri) => ri.ingredientId)
      )
    ),
  ];

  let locked: LockedRow[] = [];
  if (ingredientIds.length > 0) {
    locked = await tx.$queryRaw<LockedRow[]>(
      Prisma.sql`SELECT id, name, unit, "currentStock"::text AS "currentStock" FROM "Ingredient" WHERE id IN (${Prisma.join(ingredientIds)}) FOR UPDATE`
    );
  }
  const stockById = new Map(
    locked.map((row) => [row.id, new Prisma.Decimal(row.currentStock)])
  );

  const ingredientMeta = new Map<string, { name: string; unit: string }>();
  for (const dish of dishes) {
    for (const ri of dish.recipeIngredients) {
      ingredientMeta.set(ri.ingredientId, {
        name: ri.ingredient.name,
        unit: ri.ingredient.unit,
      });
    }
  }

  const needed = new Map<string, Prisma.Decimal>();
  for (const line of lines) {
    const dish = dishById.get(line.dishId)!;
    for (const ri of dish.recipeIngredients) {
      const current = needed.get(ri.ingredientId) ?? new Prisma.Decimal(0);
      needed.set(
        ri.ingredientId,
        current.add(ri.quantityNeeded.mul(line.quantity))
      );
    }
  }

  const shortfalls: string[] = [];
  for (const [ingredientId, required] of needed) {
    const available = stockById.get(ingredientId);
    if (!available) {
      shortfalls.push('Un ingrédient requis est introuvable.');
      continue;
    }
    if (available.lt(required)) {
      const meta = ingredientMeta.get(ingredientId)!;
      shortfalls.push(
        `Stock insuffisant : ${meta.name} — reste ${formatQuantity(available.toNumber(), meta.unit)}, besoin ${formatQuantity(required.toNumber(), meta.unit)}.`
      );
    }
  }
  if (shortfalls.length > 0) {
    throw new SaleValidationError(shortfalls);
  }

  const totalAmount = lines.reduce(
    (acc, line) => acc.add(dishById.get(line.dishId)!.price.mul(line.quantity)),
    new Prisma.Decimal(0)
  );

  return { dishById, needed, ingredientMeta, stockById, totalAmount };
}

export async function decrementStock(
  tx: Prisma.TransactionClient,
  establishmentId: string,
  needed: Map<string, Prisma.Decimal>,
  ingredientMeta: Map<string, { name: string; unit: string }>,
  stockById: Map<string, Prisma.Decimal>
): Promise<void> {
  for (const [ingredientId, required] of needed) {
    if (required.isZero()) continue;
    const meta = ingredientMeta.get(ingredientId)!;
    const updated = await tx.ingredient.updateMany({
      where: {
        id: ingredientId,
        establishmentId,
        currentStock: { gte: required },
      },
      data: { currentStock: { decrement: required } },
    });
    if (updated.count !== 1) {
      throw new StockCheckError(
        `Stock insuffisant : ${meta.name} — reste ${formatQuantity(stockById.get(ingredientId)?.toNumber() ?? 0, meta.unit)}, besoin ${formatQuantity(required.toNumber(), meta.unit)}.`
      );
    }
  }
}

export type SettleOrderInput = {
  orderId: string;
  method: PaymentMethod;
  establishmentId?: string;
  userId?: string | null;
  amountReceived?: Prisma.Decimal | null;
  transactionId?: string | null;
  allowedStatuses?: OrderStatus[];
};

const SETTLEABLE_STATUSES: OrderStatus[] = [
  'EN_ATTENTE',
  'CONFIRMEE',
  'EN_PREPARATION',
  'PRETE',
];

export async function settleOrder(input: SettleOrderInput): Promise<string> {
  const order = await prisma.order.findUnique({
    where: { id: input.orderId },
    include: {
      table: { select: { establishmentId: true } },
      orderItems: { select: { dishId: true, quantity: true } },
    },
  });
  if (!order) {
    throw new SaleValidationError(['Commande introuvable.']);
  }
  if (
    input.establishmentId &&
    order.table.establishmentId !== input.establishmentId
  ) {
    throw new SaleValidationError(['Commande introuvable.']);
  }

  const allowed = input.allowedStatuses ?? SETTLEABLE_STATUSES;
  if (!allowed.includes(order.status)) {
    throw new SaleValidationError([
      'Cette commande ne peut plus être encaissée.',
    ]);
  }

  const lines: SaleLine[] = order.orderItems.map((item) => ({
    dishId: item.dishId,
    quantity: item.quantity,
  }));

  return prisma.$transaction(async (tx) => {
    const plan = await buildSalePlan(tx, order.table.establishmentId, lines);

    if (input.amountReceived && input.amountReceived.lt(plan.totalAmount)) {
      throw new SaleValidationError(['Montant reçu insuffisant.']);
    }

    await decrementStock(
      tx,
      order.table.establishmentId,
      plan.needed,
      plan.ingredientMeta,
      plan.stockById
    );

    const updated = await tx.order.updateMany({
      where: {
        id: order.id,
        status: order.status,
        table: { establishmentId: order.table.establishmentId },
      },
      data: {
        status: 'PAYEE',
        paymentMethod: input.method,
        ...(input.userId !== undefined ? { userId: input.userId } : {}),
      },
    });
    if (updated.count !== 1) {
      throw new SaleValidationError(['Commande déjà encaissée.']);
    }

    if (input.method === 'STRIPE') {
      await tx.payment.updateMany({
        where: { orderId: order.id, method: 'STRIPE', status: 'PENDING' },
        data: {
          status: 'COMPLETED',
          transactionId: input.transactionId ?? null,
        },
      });
    } else {
      await tx.payment.create({
        data: {
          orderId: order.id,
          method: 'CASH',
          amount: plan.totalAmount,
          status: 'COMPLETED',
        },
      });
    }

    return order.id;
  }, SALE_TX_OPTIONS);
}

export async function completePendingOrder(
  orderId: string,
  transactionId: string | null
): Promise<string> {
  return settleOrder({ orderId, method: 'STRIPE', transactionId });
}

export function consolidateItems(items: SaleLine[]): SaleLine[] {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(item.dishId, (merged.get(item.dishId) ?? 0) + item.quantity);
  }
  return [...merged.entries()].map(([dishId, quantity]) => ({
    dishId,
    quantity,
  }));
}
