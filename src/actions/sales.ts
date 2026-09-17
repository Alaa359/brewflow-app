'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Prisma, Role, PaymentMethod } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import {
  amountReceivedSchema,
  paymentMethodSchema,
  saleItemsSchema,
  tableIdSchema,
} from '@/lib/validations/sale';
import {
  buildSalePlan,
  consolidateItems,
  decrementStock,
  SALE_TX_OPTIONS,
  SaleValidationError,
  StockCheckError,
} from '@/lib/sales-core';
import {
  STRIPE_CURRENCY,
  getStripe,
  stripeConfigured,
  tndToEuroCents,
} from '@/lib/stripe';

export type SaleErrors = {
  items?: string[];
  tableId?: string[];
  amountReceived?: string[];
  form?: string[];
};

export type SaleState =
  | {
      errors?: SaleErrors;
      message?: string;
      success?: boolean;
      orderId?: string;
    }
  | undefined;

function formError(
  errors: SaleErrors['form'],
  message = 'Vente impossible.'
): SaleState {
  return { errors: { form: errors }, message } satisfies SaleState;
}

async function resolveSaleContext(formData: FormData) {
  const user = await requireRole(Role.SERVER, Role.ADMIN);

  const tableParsed = tableIdSchema.safeParse(formData.get('tableId'));
  if (!tableParsed.success) {
    return {
      user,
      error: {
        errors: { tableId: tableParsed.error.issues.map((i) => i.message) },
        message: 'Vente impossible.',
      } satisfies SaleState,
    };
  }

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get('items') ?? ''));
  } catch {
    return {
      user,
      error: {
        errors: { items: ['Le panier est invalide.'] },
        message: 'Vente impossible.',
      } satisfies SaleState,
    };
  }

  const itemsParsed = saleItemsSchema.safeParse(rawItems);
  if (!itemsParsed.success) {
    const empty = Array.isArray(rawItems) && rawItems.length === 0;
    return {
      user,
      error: {
        errors: {
          items: empty
            ? ['Le panier est vide.']
            : ['Un article du panier est invalide.'],
        },
        message: 'Vente impossible.',
      } satisfies SaleState,
    };
  }

  const table = await prisma.table.findFirst({
    where: {
      id: tableParsed.data,
      establishmentId: user.establishmentId,
    },
    select: { id: true },
  });
  if (!table) {
    return {
      user,
      error: {
        errors: { tableId: ['Table inconnue.'] },
        message: 'Vente impossible.',
      } satisfies SaleState,
    };
  }

  return {
    user,
    tableId: table.id,
    lines: consolidateItems(itemsParsed.data),
  };
}

function mapSaleError(error: unknown): SaleState {
  if (error instanceof StockCheckError) {
    return {
      errors: { form: [error.message] },
      message: 'Vente impossible.',
    } satisfies SaleState;
  }
  if (error instanceof SaleValidationError) {
    return {
      errors: { form: error.errors },
      message: error.message,
    } satisfies SaleState;
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2034'
  ) {
    return formError(['Vente en cours sur le même stock, réessayez.']);
  }
  throw error;
}

export async function validateSale(
  _prev: SaleState,
  formData: FormData
): Promise<SaleState> {
  const context = await resolveSaleContext(formData);
  if ('error' in context) return context.error;

  const methodParsed = paymentMethodSchema.safeParse(formData.get('method'));
  if (!methodParsed.success) {
    return formError(methodParsed.error.issues.map((i) => i.message));
  }
  const method = methodParsed.data;

  let amountReceived: Prisma.Decimal | null = null;
  if (method === PaymentMethod.CASH) {
    const receivedParsed = amountReceivedSchema.safeParse(
      formData.get('amountReceived')
    );
    if (!receivedParsed.success) {
      return {
        errors: {
          amountReceived: receivedParsed.error.issues.map((i) => i.message),
        },
        message: 'Encaissement impossible.',
      } satisfies SaleState;
    }
    amountReceived = new Prisma.Decimal(receivedParsed.data);
  }

  let orderId: string;
  try {
    orderId = await prisma.$transaction(async (tx) => {
      const plan = await buildSalePlan(
        tx,
        context.user.establishmentId,
        context.lines
      );

      if (method === PaymentMethod.CASH) {
        if (!amountReceived!.gte(plan.totalAmount)) {
          throw new SaleValidationError(['Montant reçu insuffisant.']);
        }
        const order = await tx.order.create({
          data: {
            tableId: context.tableId,
            status: 'PAYEE',
            paymentMethod: 'CASH',
            totalAmount: plan.totalAmount,
            userId: context.user.id,
            orderItems: {
              create: context.lines.map((line) => ({
                dishId: line.dishId,
                quantity: line.quantity,
                unitPrice: plan.dishById.get(line.dishId)!.price,
              })),
            },
            payments: {
              create: {
                method: 'CASH',
                amount: plan.totalAmount,
                status: 'COMPLETED',
              },
            },
          },
          select: { id: true },
        });
        await decrementStock(
          tx,
          context.user.establishmentId,
          plan.needed,
          plan.ingredientMeta,
          plan.stockById
        );
        return order.id;
      }

      const order = await tx.order.create({
        data: {
          tableId: context.tableId,
          status: 'EN_ATTENTE',
          paymentMethod: 'STRIPE',
          totalAmount: plan.totalAmount,
          userId: context.user.id,
          orderItems: {
            create: context.lines.map((line) => ({
              dishId: line.dishId,
              quantity: line.quantity,
              unitPrice: plan.dishById.get(line.dishId)!.price,
            })),
          },
          payments: {
            create: {
              method: 'STRIPE',
              amount: plan.totalAmount,
              status: 'PENDING',
            },
          },
        },
        select: { id: true },
      });
      return order.id;
    }, SALE_TX_OPTIONS);
  } catch (error) {
    return mapSaleError(error);
  }

  revalidatePath('/caisse');
  return {
    success: true,
    message:
      method === PaymentMethod.CASH ? 'Vente enregistrée.' : 'Paiement lancé.',
    orderId,
  } satisfies SaleState;
}

export async function createCheckoutSession(
  _prev: SaleState,
  formData: FormData
): Promise<SaleState> {
  const context = await resolveSaleContext(formData);
  if ('error' in context) return context.error;

  let orderId: string;
  let totalAmount: Prisma.Decimal;
  try {
    const created = await prisma.$transaction(async (tx) => {
      const plan = await buildSalePlan(
        tx,
        context.user.establishmentId,
        context.lines
      );
      const order = await tx.order.create({
        data: {
          tableId: context.tableId,
          status: 'EN_ATTENTE',
          paymentMethod: 'STRIPE',
          totalAmount: plan.totalAmount,
          userId: context.user.id,
          orderItems: {
            create: context.lines.map((line) => ({
              dishId: line.dishId,
              quantity: line.quantity,
              unitPrice: plan.dishById.get(line.dishId)!.price,
            })),
          },
          payments: {
            create: {
              method: 'STRIPE',
              amount: plan.totalAmount,
              status: 'PENDING',
            },
          },
        },
        select: { id: true, totalAmount: true },
      });
      return order;
    }, SALE_TX_OPTIONS);
    orderId = created.id;
    totalAmount = created.totalAmount;
  } catch (error) {
    return mapSaleError(error);
  }

  if (!stripeConfigured()) {
    return {
      errors: { form: ['Paiement par carte indisponible.'] },
      message: 'Paiement impossible.',
      orderId,
    } satisfies SaleState;
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  let sessionUrl: string;
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: STRIPE_CURRENCY,
            unit_amount: tndToEuroCents(totalAmount.toNumber()),
            product_data: {
              name: `Commande — ${context.user.establishmentName}`,
            },
          },
        },
      ],
      metadata: { orderId },
      success_url: `${baseUrl}/api/stripe/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/caisse`,
    });
    sessionUrl = session.url!;
  } catch (error) {
    console.error('createCheckoutSession failed', error);
    return {
      errors: { form: ['Le paiement par carte a échoué.'] },
      message: 'Paiement impossible.',
      orderId,
    } satisfies SaleState;
  }

  revalidatePath('/caisse');
  redirect(sessionUrl);
}
