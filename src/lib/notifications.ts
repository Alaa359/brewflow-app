import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import { Role } from '@/generated/client';
import { ACTIVE_ORDER_STATUSES } from '@/lib/order-flow';
import type { AppNotification } from '@/lib/notifications-types';

export type { AppNotification } from '@/lib/notifications-types';

export const getHeaderNotifications = cache(
  async (
    role: Role,
    establishmentId: string
  ): Promise<AppNotification[]> => {
    const showOrders = true;
    const showStock = role === Role.ADMIN;

    const [pendingOrders, lowStockRows] = await Promise.all([
      showOrders
        ? prisma.order.count({
            where: {
              status: { in: ACTIVE_ORDER_STATUSES },
              table: { establishmentId },
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
              },
            },
          })
        : Promise.resolve(0),
      showStock
        ? prisma.ingredient.findMany({
            where: { establishmentId },
            select: { currentStock: true, minThreshold: true },
          })
        : Promise.resolve([] as { currentStock: unknown; minThreshold: unknown }[]),
    ]);

    const lowStock = showStock
      ? lowStockRows.filter((row) => {
          const current = row.currentStock as { lessThan: (v: unknown) => boolean };
          const min = row.minThreshold;
          return current.lessThan(min);
        }).length
      : 0;

    const notifications: AppNotification[] = [];
    const nowIso = new Date().toISOString();

    if (pendingOrders > 0) {
      notifications.push({
        id: `orders-pending-${establishmentId}`,
        kind: 'order',
        titleKey: 'pendingOrders',
        params: { count: pendingOrders },
        href: role === Role.KITCHEN ? '/cuisine/kds' : '/caisse/pos',
        createdAt: nowIso,
      });
    }

    if (lowStock > 0) {
      notifications.push({
        id: `stock-low-${establishmentId}`,
        kind: 'stock',
        titleKey: 'lowStock',
        params: { count: lowStock },
        href: '/ingredients',
        createdAt: nowIso,
      });
    }

    return notifications;
  }
);
