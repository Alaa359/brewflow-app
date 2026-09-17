import { OrderStatus, Role } from '@/generated/client';

export const ORDER_NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  EN_ATTENTE: 'CONFIRMEE',
  CONFIRMEE: 'EN_PREPARATION',
  EN_PREPARATION: 'PRETE',
  PRETE: 'PAYEE',
  PAYEE: null,
};

const TRANSITION_ROLES: Record<OrderStatus, Role[]> = {
  EN_ATTENTE: [],
  CONFIRMEE: [Role.SERVER, Role.ADMIN],
  EN_PREPARATION: [Role.KITCHEN, Role.ADMIN],
  PRETE: [Role.KITCHEN, Role.ADMIN],
  PAYEE: [Role.SERVER, Role.ADMIN],
};

export function canTransition(
  from: OrderStatus,
  to: OrderStatus,
  role: Role
): boolean {
  if (ORDER_NEXT_STATUS[from] !== to) return false;
  return TRANSITION_ROLES[to].includes(role);
}

export function nextStatusFor(
  from: OrderStatus,
  role: Role
): OrderStatus | null {
  const next = ORDER_NEXT_STATUS[from];
  if (!next) return null;
  return TRANSITION_ROLES[next].includes(role) ? next : null;
}

export function canSettle(from: OrderStatus, role: Role): boolean {
  return from === 'PRETE' && TRANSITION_ROLES.PAYEE.includes(role);
}

export const ACTIVE_ORDER_STATUSES: OrderStatus[] = [
  'EN_ATTENTE',
  'CONFIRMEE',
  'EN_PREPARATION',
  'PRETE',
];
