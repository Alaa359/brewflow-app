'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import type { OrderStatus, PaymentMethod } from '@/generated/client';
import { HourglassIcon, ReceiptTextIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { advanceOrderStatus, settlePendingOrder } from '@/actions/order-status';
import { ORDER_STATUS_LABEL, formatTime } from '@/lib/sales';
import { formatCost } from '@/lib/ingredients';

export type PendingOrderItem = { dishName: string; quantity: number };

export type PendingOrder = {
  id: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  fromClient: boolean;
  nextStatus: OrderStatus | null;
  items: PendingOrderItem[];
};

const STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  EN_ATTENTE: 'destructive',
  CONFIRMEE: 'secondary',
  EN_PREPARATION: 'default',
  PRETE: 'outline',
  PAYEE: 'outline',
};

const NEXT_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  CONFIRMEE: 'Confirmer',
  EN_PREPARATION: 'En préparation',
  PRETE: 'Prête',
};

export function PendingOrders({ orders }: { orders: PendingOrder[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reflect, setReflect] = useState<PendingOrder | null>(null);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(timer);
  }, [router]);

  function advance(order: PendingOrder, status: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const formData = new FormData();
      formData.set('orderId', order.id);
      formData.set('status', status);
      const result = await advanceOrderStatus(undefined, formData);
      if (result?.success) {
        toast.success(result.message ?? 'Commande mise à jour.');
        router.refresh();
      } else {
        toast.error(result?.message ?? 'Action impossible.');
        setError(result?.errors?.form?.[0] ?? null);
      }
    });
  }

  function openSettle(order: PendingOrder) {
    setReflect(order);
    setAmount(String(order.totalAmount));
    setError(null);
  }

  function settle() {
    if (!reflect) return;
    const formData = new FormData();
    formData.set('orderId', reflect.id);
    formData.set('amountReceived', amount);
    startTransition(async () => {
      const result = await settlePendingOrder(undefined, formData);
      if (result?.success) {
        toast.success(result.message ?? 'Commande encaissée.');
        setReflect(null);
        router.refresh();
      } else {
        const message =
          result?.errors?.amountReceived?.[0] ??
          result?.errors?.form?.[0] ??
          'Encaissement impossible.';
        setError(message);
        toast.error(result?.message ?? 'Encaissement impossible.');
      }
    });
  }

  const receivedNumber = Number.parseFloat(amount.replace(',', '.'));
  const change =
    reflect && !Number.isNaN(receivedNumber)
      ? receivedNumber - reflect.totalAmount
      : null;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          <HourglassIcon className="size-4" />
          Commandes en attente
          {orders.length > 0 && (
            <span className="bg-destructive rounded-full px-2 py-0.5 text-xs text-white">
              {orders.length}
            </span>
          )}
        </h2>
        <p className="text-muted-foreground text-sm">
          Commandes client à confirmer puis encaisser.
        </p>
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Heure</TableHead>
              <TableHead>Table</TableHead>
              <TableHead>Détail</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="w-40">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-muted-foreground h-20 text-center"
                >
                  Aucune commande en attente.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const next = order.nextStatus;
                const settleable = order.status === 'PRETE';
                return (
                  <TableRow key={order.id}>
                    <TableCell className="tabular-nums">
                      {formatTime(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      n° {order.tableNumber}
                      {order.tableZone ? ` — ${order.tableZone}` : ''}
                      {order.fromClient && (
                        <Badge variant="secondary" className="ml-2">
                          Client
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-72">
                      {order.items
                        .map((item) => `${item.quantity} × ${item.dishName}`)
                        .join(', ')}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCost(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANT[order.status]}>
                        {ORDER_STATUS_LABEL[order.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {settleable ? (
                        <Button
                          type="button"
                          size="sm"
                          disabled={isPending}
                          onClick={() => openSettle(order)}
                        >
                          <ReceiptTextIcon className="size-3.5" />
                          Encaisser
                        </Button>
                      ) : next ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isPending}
                          onClick={() => advance(order, next)}
                        >
                          {NEXT_ACTION_LABEL[next] ?? ORDER_STATUS_LABEL[next]}
                        </Button>
                      ) : (
                        '—'
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {error && (
        <p className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-xs">
          {error}
        </p>
      )}

      <Dialog
        open={reflect !== null}
        onOpenChange={(open) => {
          if (!open) setReflect(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Encaisser la commande n° {reflect?.tableNumber}
            </DialogTitle>
            <DialogDescription>
              Total à régler : {reflect ? formatCost(reflect.totalAmount) : ''}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="amountReceived">Montant reçu (TND)</Label>
            <Input
              id="amountReceived"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              inputMode="decimal"
              placeholder="0,00"
            />
            {change !== null && (
              <p
                className={
                  change >= 0
                    ? 'text-xs font-medium text-emerald-600'
                    : 'text-destructive text-xs font-medium'
                }
              >
                {change >= 0
                  ? `Monnaie à rendre : ${formatCost(change)}`
                  : 'Montant insuffisant.'}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setReflect(null)}
            >
              Annuler
            </Button>
            <Button
              type="button"
              disabled={isPending || change === null || change < 0}
              onClick={settle}
            >
              {isPending ? 'Encaissement…' : 'Encaisser'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
