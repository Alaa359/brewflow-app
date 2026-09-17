'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import type { OrderStatus } from '@/generated/client';
import { ChefHatIcon, ClockIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { advanceOrderStatus } from '@/actions/order-status';
import { formatTime } from '@/lib/sales';

export type KitchenOrder = {
  id: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  status: OrderStatus;
  fromClient: boolean;
  paidByCard: boolean;
  nextStatus: OrderStatus | null;
  items: { dishName: string; quantity: number }[];
};

const COLUMNS: {
  key: string;
  titleKey: string;
  statuses: OrderStatus[];
}[] = [
  {
    key: 'a-preparer',
    titleKey: 'columns.toPrepare',
    statuses: ['EN_ATTENTE', 'CONFIRMEE'],
  },
  {
    key: 'en-preparation',
    titleKey: 'columns.preparing',
    statuses: ['EN_PREPARATION'],
  },
  { key: 'prete', titleKey: 'columns.ready', statuses: ['PRETE'] },
];

export function KitchenBoard({ orders }: { orders: KitchenOrder[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const seenRef = useRef<Set<string> | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const t = useTranslations('Kitchen');
  const tCommon = useTranslations('Common');
  const tStatus = useTranslations('OrderStatus');
  const locale = useLocale();

  function actionLabel(next: OrderStatus): string {
    if (next === 'CONFIRMEE') return tCommon('actions.confirm');
    if (next === 'EN_PREPARATION') return t('action.start');
    if (next === 'PRETE') return tStatus('PRETE');
    return tStatus(next);
  }

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(timer);
  }, [router]);

  useEffect(() => {
    const ids = orders.map((order) => order.id);
    if (seenRef.current === null) {
      seenRef.current = new Set(ids);
      return;
    }
    const fresh = ids.filter((id) => !seenRef.current!.has(id));
    ids.forEach((id) => seenRef.current!.add(id));
    if (fresh.length > 0) {
      setNewIds(new Set(fresh));
    }
  }, [orders]);

  function advance(order: KitchenOrder, status: OrderStatus) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set('orderId', order.id);
      formData.set('status', status);
      const result = await advanceOrderStatus(undefined, formData);
      if (result?.success) {
        toast.success(result.message ?? t('updatedToast'));
        router.refresh();
      } else {
        toast.error(result?.message ?? t('actionImpossibleToast'));
      }
    });
  }

  const total = orders.length;

  return (
    <section className="flex flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <ChefHatIcon className="size-5" />
          {t('title')}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t('count', { count: total })}
        </p>
      </div>

      <div className="grid flex-1 items-start gap-4 lg:grid-cols-3">
        {COLUMNS.map((column) => {
          const columnOrders = orders.filter((order) =>
            column.statuses.includes(order.status)
          );
          return (
            <div key={column.key} className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">
                  {t(column.titleKey)}
                </h2>
                <Badge
                  variant={columnOrders.length > 0 ? 'default' : 'outline'}
                >
                  {columnOrders.length}
                </Badge>
              </div>

              {columnOrders.length === 0 ? (
                <p className="text-muted-foreground rounded-xl border border-dashed px-3 py-8 text-center text-sm">
                  {t('empty')}
                </p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {columnOrders.map((order) => {
                    const next = order.nextStatus;
                    const isNew = newIds.has(order.id);
                    return (
                      <li
                        key={order.id}
                        className={`bg-background flex flex-col gap-2 rounded-xl border p-3 ${
                          isNew
                            ? 'border-destructive ring-destructive/40 animate-pulse ring-2'
                            : ''
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">
                            {t('tableNumber', { number: order.tableNumber })}
                            {order.tableZone ? ` · ${order.tableZone}` : ''}
                          </span>
                          <span className="text-muted-foreground flex items-center gap-1 text-xs tabular-nums">
                            <ClockIcon className="size-3.5" />
                            {formatTime(order.createdAt, locale)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="secondary">
                            {tStatus(order.status)}
                          </Badge>
                          {order.fromClient && (
                            <Badge variant="outline">{t('clientBadge')}</Badge>
                          )}
                          {order.paidByCard && (
                            <Badge variant="outline">
                              {t('paidOnlineBadge')}
                            </Badge>
                          )}
                        </div>

                        <ul className="text-sm">
                          {order.items.map((item) => (
                            <li key={item.dishName}>
                              <span className="font-medium tabular-nums">
                                {item.quantity} ×
                              </span>{' '}
                              {item.dishName}
                            </li>
                          ))}
                        </ul>

                        {next ? (
                          <Button
                            type="button"
                            size="sm"
                            disabled={isPending}
                            onClick={() => advance(order, next)}
                          >
                            {actionLabel(next)}
                          </Button>
                        ) : (
                          <p className="text-muted-foreground text-xs">
                            {order.status === 'PRETE'
                              ? t('readyWaiting')
                              : t('awaitingConfirmation')}
                          </p>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
