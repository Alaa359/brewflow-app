import 'server-only';
import Stripe from 'stripe';

export const STRIPE_CURRENCY = 'eur';

const DEFAULT_TND_PER_EUR = 3.2;

export function stripeConfigured(): boolean {
  return Boolean(
    process.env.STRIPE_SECRET_KEY &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  );
}

function tndPerUnit(): number {
  const raw = Number(process.env.STRIPE_TND_PER_UNIT ?? '');
  return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_TND_PER_EUR;
}

export function tndToEuroCents(tnd: number): number {
  return Math.round((tnd / tndPerUnit()) * 100);
}

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY manquante.');
  return new Stripe(key);
}
