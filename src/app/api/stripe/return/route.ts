import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe, stripeConfigured } from '@/lib/stripe';
import { getSaleContext } from '@/lib/i18n/sale-context';
import { completePendingOrder } from '@/lib/sales-core';

const CAISSE_URL = '/caisse';

export async function GET(request: NextRequest) {
  if (!stripeConfigured()) {
    return NextResponse.redirect(new URL(CAISSE_URL, request.nextUrl.origin));
  }

  const sessionId = request.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.redirect(new URL(CAISSE_URL, request.nextUrl.origin));
  }

  let orderId: string | undefined;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    orderId = session.metadata?.orderId;
    if (orderId) {
      if (session.payment_status === 'paid') {
        const saleContext = await getSaleContext();
        await completePendingOrder(
          orderId,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.id,
          saleContext
        );
      } else {
        await prisma.payment.updateMany({
          where: { orderId, method: 'STRIPE', status: 'PENDING' },
          data: { status: 'FAILED' },
        });
      }
    }
  } catch (error) {
    console.error('stripe return failed', { error, sessionId, orderId });
    if (orderId) {
      await prisma.payment.updateMany({
        where: { orderId, method: 'STRIPE', status: 'PENDING' },
        data: { status: 'FAILED' },
      });
    }
  }

  return NextResponse.redirect(new URL(CAISSE_URL, request.nextUrl.origin));
}
