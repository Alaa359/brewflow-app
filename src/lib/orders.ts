import 'server-only';
import { OrderStatus } from '@/generated/client';
import { prisma } from '@/lib/prisma';

export {
  ACTIVE_ORDER_STATUSES,
  ORDER_NEXT_STATUS,
  canSettle,
  canTransition,
  nextStatusFor,
} from '@/lib/order-flow';

export async function transitionOrderStatus(
  orderId: string,
  establishmentId: string,
  from: OrderStatus,
  to: OrderStatus
): Promise<boolean> {
  const result = await prisma.order.updateMany({
    where: {
      id: orderId,
      status: from,
      table: { establishmentId },
    },
    data: { status: to },
  });
  return result.count === 1;
}
