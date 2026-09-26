import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { OrderStatus, PaymentMethod } from '@/generated/client';
import { formatCost } from '@/lib/ingredients';
import { formatDateTime } from '@/lib/sales';

export type TicketOrderItem = {
  dishName: string;
  quantity: number;
  unitPrice: number;
};

export type TicketOrder = {
  id: string;
  number: string;
  createdAt: Date;
  tableNumber: number;
  tableZone: string | null;
  serverName: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod | null;
  items: TicketOrderItem[];
  totalAmount: number;
};

export type TicketEstablishment = {
  name: string;
  address: string | null;
  phone: string | null;
};

export type TicketLabels = {
  order: string;
  date: string;
  table: string;
  server: string;
  method: string;
  status: string;
  itemsHeader: string;
  totalHeader: string;
  perUnit: string;
  total: string;
  thanks: string;
  tableNumber: string;
  tableNumberWithZone: string;
};

const PAGE_WIDTH = 227;
const PAGE_PADDING = 14;

const itemRowHeight = 16;
const metaRowHeight = 13;

function pageHeightFor(itemCount: number): number {
  const contentBase =
    86 + metaRowHeight * 7 + 14 + itemRowHeight * itemCount + 40 + 46;
  return contentBase + PAGE_PADDING * 2;
}

function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

const styles = StyleSheet.create({
  page: {
    width: PAGE_WIDTH,
    padding: PAGE_PADDING,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
  },
  header: {
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  headerLine: {
    fontSize: 8,
    color: '#4B5563',
    marginTop: 1,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    marginVertical: 6,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  metaLabel: {
    color: '#6B7280',
  },
  metaValue: {
    fontWeight: 600,
  },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
    color: '#6B7280',
    fontSize: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  itemName: {
    maxWidth: 110,
  },
  itemSub: {
    fontSize: 7,
    color: '#6B7280',
    marginBottom: 2,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#111827',
    paddingTop: 6,
    marginTop: 6,
  },
  totalLabel: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    fontSize: 8,
    color: '#4B5563',
  },
});

export function TicketDocument({
  order,
  establishment,
  locale,
  statusLabel,
  methodLabel,
  labels,
  timezone,
}: {
  order: TicketOrder;
  establishment: TicketEstablishment;
  locale: string;
  statusLabel: string;
  methodLabel: string;
  labels: TicketLabels;
  timezone?: string;
}) {
  const lines = order.items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const tableLabel = order.tableZone
    ? fill(labels.tableNumberWithZone, {
        number: order.tableNumber,
        zone: order.tableZone,
      })
    : fill(labels.tableNumber, { number: order.tableNumber });

  return (
    <Document>
      <Page size={{ width: PAGE_WIDTH, height: pageHeightFor(lines.length) }}>
        <View style={styles.header}>
          <Text style={styles.name}>{establishment.name}</Text>
          {establishment.address ? (
            <Text style={styles.headerLine}>{establishment.address}</Text>
          ) : null}
          {establishment.phone ? (
            <Text style={styles.headerLine}>{establishment.phone}</Text>
          ) : null}
        </View>

        <View style={styles.divider} />

        <View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{labels.order}</Text>
            <Text style={styles.metaValue}>#{order.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{labels.date}</Text>
            <Text style={styles.metaValue}>
              {formatDateTime(order.createdAt, locale, timezone)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{labels.table}</Text>
            <Text style={styles.metaValue}>{tableLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{labels.server}</Text>
            <Text style={styles.metaValue}>{order.serverName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{labels.method}</Text>
            <Text style={styles.metaValue}>{methodLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{labels.status}</Text>
            <Text style={styles.metaValue}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsHeader}>
          <Text>{labels.itemsHeader}</Text>
          <Text>{labels.totalHeader}</Text>
        </View>

        {lines.map((line, index) => (
          <View key={index}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>
                {line.quantity} × {line.dishName}
              </Text>
              <Text>{formatCost(line.total, locale)}</Text>
            </View>
            <Text style={styles.itemSub}>
              {fill(labels.perUnit, {
                price: formatCost(line.unitPrice, locale),
              })}
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{labels.total}</Text>
          <Text style={styles.totalValue}>
            {formatCost(order.totalAmount, locale)}
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>{labels.thanks}</Text>
        </View>
      </Page>
    </Document>
  );
}
