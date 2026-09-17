import type { OrderStatus, PaymentMethod } from '@/generated/client';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  EN_ATTENTE: 'En attente',
  CONFIRMEE: 'Confirmée',
  EN_PREPARATION: 'En préparation',
  PRETE: 'Prête',
  PAYEE: 'Payée',
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: 'Espèces',
  STRIPE: 'Carte',
};

const LOCAL_TIME_ZONE = 'Africa/Tunis';

const dateFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: LOCAL_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function startOfDayTunisia(date: Date): Date {
  const [year, month, day] = dateFormatter.format(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: LOCAL_TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
});

export function formatTime(date: Date): string {
  return timeFormatter.format(date);
}

const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', {
  timeZone: LOCAL_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDateTime(date: Date): string {
  return dateTimeFormatter.format(date);
}

export type Period = 'jour' | 'semaine' | 'mois';

export const PERIOD_LABEL: Record<Period, string> = {
  jour: 'Aujourd’hui',
  semaine: 'Cette semaine',
  mois: 'Ce mois',
};

const DAY_MS = 86_400_000;

export function startOfWeekTunisia(date: Date): Date {
  const start = startOfDayTunisia(date);
  const offset = (start.getUTCDay() + 6) % 7;
  return new Date(start.getTime() - offset * DAY_MS);
}

export function startOfMonthTunisia(date: Date): Date {
  const [year, month] = dateFormatter.format(date).split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

export function periodStart(period: Period, now: Date = new Date()): Date {
  if (period === 'jour') return startOfDayTunisia(now);
  if (period === 'semaine') return startOfWeekTunisia(now);
  return startOfMonthTunisia(now);
}
