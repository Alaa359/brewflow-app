import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getStripe, stripeConfigured } from '@/lib/stripe';
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

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const orderId = session.metadata?.orderId;
    if (orderId) {
      if (session.payment_status === 'paid') {
        await completePendingOrder(
          orderId,
          typeof session.payment_intent === 'string'
            ? session.payment_intent
            : session.id
        );
      } else {
        await prisma.payment.updateMany({
          where: { orderId, method: 'STRIPE', status: 'PENDING' },
          data: { status: 'FAILED' },
        });
      }
    }
  } catch (error) {
    console.error('stripe return failed', error);
  }

  return NextResponse.redirect(new URL(CAISSE_URL, request.nextUrl.origin));
}
