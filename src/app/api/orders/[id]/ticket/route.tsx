import type { NextRequest } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import {
  TicketDocument,
  type TicketEstablishment,
  type TicketLabels,
  type TicketOrder,
  type TicketOrderItem,
} from '@/components/sales/ticket-document';

export async function GET(
  _request: NextRequest,
  { params }: RouteContext<'/api/orders/[id]/ticket'>
) {
  const user = await requireRole(Role.SERVER, Role.ADMIN);
  const { id } = await params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      table: { establishmentId: user.establishmentId },
    },
    include: {
      orderItems: {
        include: { dish: { select: { name: true } } },
      },
      table: { select: { number: true, zone: true } },
      user: { select: { name: true } },
    },
  });

  if (!order) {
    return new Response('Commande introuvable.', { status: 404 });
  }
  if (order.status !== 'PAYEE') {
    return new Response('Ticket disponible seulement après encaissement.', {
      status: 409,
    });
  }

  const establishment = await prisma.establishment.findUnique({
    where: { id: user.establishmentId },
    select: { name: true, address: true, phone: true },
  });
  if (!establishment) {
    return new Response('Établissement introuvable.', { status: 404 });
  }

  const locale = await getLocale();
  const pdfLocale = locale === 'ar' ? 'fr' : locale;
  const [t, tStatus, tPayment] = await Promise.all([
    getTranslations({ locale: pdfLocale, namespace: 'Pdf.ticket' }),
    getTranslations({ locale: pdfLocale, namespace: 'OrderStatus' }),
    getTranslations({ locale: pdfLocale, namespace: 'PaymentMethod' }),
  ]);

  const items: TicketOrderItem[] = order.orderItems.map((item) => ({
    dishName: item.dish.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice.toNumber(),
  }));

  const ticketOrder: TicketOrder = {
    id: order.id,
    number: order.id.slice(0, 8).toUpperCase(),
    createdAt: order.createdAt,
    tableNumber: order.table.number,
    tableZone: order.table.zone,
    serverName: order.user?.name ?? t('clientOrder'),
    status: order.status,
    paymentMethod: order.paymentMethod,
    items,
    totalAmount: order.totalAmount.toNumber(),
  };

  const ticketEstablishment: TicketEstablishment = {
    name: establishment.name,
    address: establishment.address,
    phone: establishment.phone,
  };

  const labels: TicketLabels = {
    order: t('order'),
    date: t('date'),
    table: t('table'),
    server: t('server'),
    method: t('method'),
    status: t('status'),
    itemsHeader: t('itemsHeader'),
    totalHeader: t('totalHeader'),
    perUnit: t('perUnit'),
    total: t('total'),
    thanks: t('thanks'),
    tableNumber: t('tableNumber'),
    tableNumberWithZone: t('tableNumberWithZone'),
  };

  const buffer = await renderToBuffer(
    <TicketDocument
      order={ticketOrder}
      establishment={ticketEstablishment}
      locale={pdfLocale}
      statusLabel={tStatus(order.status)}
      methodLabel={order.paymentMethod ? tPayment(order.paymentMethod) : '—'}
      labels={labels}
      timezone={user.establishmentTimezone}
    />
  );

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="ticket-${ticketOrder.number}.pdf"`,
    },
  });
}
