import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { OrderStatus, PaymentMethod } from '@/generated/client';
import {
  ORDER_STATUS_LABEL,
  PAYMENT_METHOD_LABEL,
  formatDateTime,
} from '@/lib/sales';

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

const PAGE_WIDTH = 227;
const PAGE_PADDING = 14;

const itemRowHeight = 16;
const metaRowHeight = 13;

function pageHeightFor(itemCount: number): number {
  const contentBase =
    86 + metaRowHeight * 7 + 14 + itemRowHeight * itemCount + 40 + 46;
  return contentBase + PAGE_PADDING * 2;
}

const numberFormatter = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 3,
});

function formatCost(value: number): string {
  return `${numberFormatter.format(value)} DT`;
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
}: {
  order: TicketOrder;
  establishment: TicketEstablishment;
}) {
  const lines = order.items.map((item) => ({
    ...item,
    total: item.quantity * item.unitPrice,
  }));
  const tableLabel = `n° ${order.tableNumber}${
    order.tableZone ? ` — ${order.tableZone}` : ''
  }`;
  const methodLabel = order.paymentMethod
    ? (PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod)
    : '—';
  const statusLabel = ORDER_STATUS_LABEL[order.status] ?? order.status;

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
            <Text style={styles.metaLabel}>Commande</Text>
            <Text style={styles.metaValue}>#{order.number}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date</Text>
            <Text style={styles.metaValue}>
              {formatDateTime(order.createdAt)}
            </Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Table</Text>
            <Text style={styles.metaValue}>{tableLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Serveur</Text>
            <Text style={styles.metaValue}>{order.serverName}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Méthode</Text>
            <Text style={styles.metaValue}>{methodLabel}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Statut</Text>
            <Text style={styles.metaValue}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.itemsHeader}>
          <Text>Article</Text>
          <Text>Total</Text>
        </View>

        {lines.map((line, index) => (
          <View key={index}>
            <View style={styles.itemRow}>
              <Text style={styles.itemName}>
                {line.quantity} × {line.dishName}
              </Text>
              <Text>{formatCost(line.total)}</Text>
            </View>
            <Text style={styles.itemSub}>
              {formatCost(line.unitPrice)} / unité
            </Text>
          </View>
        ))}

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>TOTAL</Text>
          <Text style={styles.totalValue}>{formatCost(order.totalAmount)}</Text>
        </View>

        <View style={styles.footer}>
          <Text>Merci de votre visite !</Text>
        </View>
      </Page>
    </Document>
  );
}
