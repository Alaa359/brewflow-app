import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { formatCost, formatQuantity } from '@/lib/ingredients';
import { formatPercent } from '@/lib/margins';
import { formatDateTime } from '@/lib/sales';
import { formatDateLabel } from '@/lib/planning';
import type { ReportData } from '@/lib/reports';

export type ReportEstablishment = {
  name: string;
  address: string | null;
  phone: string | null;
};

export type ReportLabels = {
  title: string;
  documentTitle: string;
  headerMeta: string;
  generatedAt: string;
  page: string;
  period: string;
  summary: string;
  revenue: string;
  settledOrders: string;
  itemsSold: string;
  averageBasket: string;
  cashRevenue: string;
  cardRevenue: string;
  byCategory: string;
  byDish: string;
  restockByIngredient: string;
  restockDetails: string;
  restockTruncated: string;
  colCategory: string;
  colDish: string;
  colIngredient: string;
  colQuantity: string;
  colQty: string;
  colRevenue: string;
  colCost: string;
  colMargin: string;
  colMarginPercent: string;
  colShare: string;
  colEntries: string;
  colSuppliers: string;
  colDate: string;
  colSupplier: string;
  colUser: string;
  noSales: string;
  noRestock: string;
};

type Column = { label: string; width: string; right?: boolean };

function fill(
  template: string,
  values: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 46,
    paddingBottom: 40,
    paddingHorizontal: 32,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#111827',
  },
  pageHeader: {
    position: 'absolute',
    top: 20,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    paddingBottom: 4,
  },
  pageHeaderName: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  pageHeaderMeta: {
    fontSize: 8,
    color: '#6B7280',
  },
  pageFooter: {
    position: 'absolute',
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 7,
    color: '#6B7280',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 9,
    color: '#4B5563',
    marginTop: 2,
  },
  rule: {
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    marginTop: 8,
    marginBottom: 4,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  summaryLabel: {
    color: '#6B7280',
  },
  summaryValue: {
    fontWeight: 600,
  },
  th: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#374151',
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tr: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  trAlt: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  td: {
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  right: {
    textAlign: 'right',
  },
  empty: {
    fontSize: 8,
    color: '#6B7280',
    fontStyle: 'italic',
    paddingVertical: 3,
  },
});

function ReportTable({
  columns,
  rows,
  emptyLabel,
}: {
  columns: Column[];
  rows: string[][];
  emptyLabel: string;
}) {
  return (
    <View>
      <View style={styles.tr}>
        {columns.map((column) => (
          <Text
            key={column.label}
            style={[
              styles.th,
              ...(column.right ? [styles.right] : []),
              { width: column.width },
            ]}
          >
            {column.label}
          </Text>
        ))}
      </View>
      {rows.length === 0 ? (
        <Text style={styles.empty}>{emptyLabel}</Text>
      ) : (
        rows.map((row, index) => (
          <View
            key={index}
            style={index % 2 === 1 ? styles.trAlt : styles.tr}
            wrap={false}
          >
            {columns.map((column, cellIndex) => (
              <Text
                key={column.label}
                style={[
                  styles.td,
                  ...(column.right ? [styles.right] : []),
                  { width: column.width },
                ]}
              >
                {row[cellIndex] ?? ''}
              </Text>
            ))}
          </View>
        ))
      )}
    </View>
  );
}

export function ReportDocument({
  report,
  establishment,
  locale,
  labels,
  unitLabels,
  timezone,
}: {
  report: ReportData;
  establishment: ReportEstablishment;
  locale: string;
  labels: ReportLabels;
  unitLabels: Record<string, string>;
  timezone?: string;
}) {
  const { totals } = report;
  const periodLabel = `${formatDateLabel(report.range.from, locale)} – ${formatDateLabel(
    report.range.to,
    locale
  )}`;
  const quantity = (value: number, unit: string) =>
    formatQuantity(value, unit, locale, unitLabels[unit]);

  const summary: { label: string; value: string }[] = [
    { label: labels.revenue, value: formatCost(totals.revenue, locale) },
    { label: labels.settledOrders, value: String(totals.orderCount) },
    { label: labels.itemsSold, value: String(totals.itemCount) },
    {
      label: labels.averageBasket,
      value: formatCost(totals.averageBasket, locale),
    },
    {
      label: labels.cashRevenue,
      value: formatCost(totals.cashRevenue, locale),
    },
    {
      label: labels.cardRevenue,
      value: formatCost(totals.cardRevenue, locale),
    },
  ];

  return (
    <Document
      title={fill(labels.documentTitle, { period: periodLabel })}
      author={establishment.name}
    >
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.pageHeader}>
          <Text style={styles.pageHeaderName}>{establishment.name}</Text>
          <Text style={styles.pageHeaderMeta}>
            {fill(labels.headerMeta, { period: periodLabel })}
          </Text>
        </View>

        <View fixed style={styles.pageFooter}>
          <Text>
            {fill(labels.generatedAt, {
              date: formatDateTime(report.generatedAt, locale, timezone),
            })}
          </Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              fill(labels.page, { page: pageNumber, total: totalPages })
            }
          />
        </View>

        <Text style={styles.title}>{labels.title}</Text>
        <Text style={styles.subtitle}>
          {establishment.address ?? ''}
          {establishment.address && establishment.phone ? ' · ' : ''}
          {establishment.phone ?? ''}
        </Text>
        <Text style={styles.subtitle}>
          {fill(labels.period, { period: periodLabel })}
        </Text>
        <View style={styles.rule} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.summary}</Text>
          {summary.map((line) => (
            <View key={line.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{line.label}</Text>
              <Text style={styles.summaryValue}>{line.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.byCategory}</Text>
          <ReportTable
            columns={[
              { label: labels.colCategory, width: '40%' },
              { label: labels.colQty, width: '15%', right: true },
              { label: labels.colRevenue, width: '25%', right: true },
              { label: labels.colShare, width: '20%', right: true },
            ]}
            rows={report.categories.map((category) => [
              category.categoryName,
              String(category.quantity),
              formatCost(category.revenue, locale),
              `${category.sharePercent} %`,
            ])}
            emptyLabel={labels.noSales}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.byDish}</Text>
          <ReportTable
            columns={[
              { label: labels.colDish, width: '28%' },
              { label: labels.colQty, width: '9%', right: true },
              { label: labels.colRevenue, width: '19%', right: true },
              { label: labels.colCost, width: '16%', right: true },
              { label: labels.colMargin, width: '16%', right: true },
              { label: labels.colMarginPercent, width: '12%', right: true },
            ]}
            rows={report.dishes.map((dish) => [
              dish.dishName,
              String(dish.quantity),
              formatCost(dish.revenue, locale),
              formatCost(dish.cost, locale),
              formatCost(dish.margin, locale),
              dish.marginPercent === null
                ? '—'
                : formatPercent(dish.marginPercent, locale),
            ])}
            emptyLabel={labels.noSales}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.restockByIngredient}</Text>
          <ReportTable
            columns={[
              { label: labels.colIngredient, width: '34%' },
              { label: labels.colQuantity, width: '20%', right: true },
              { label: labels.colEntries, width: '14%', right: true },
              { label: labels.colSuppliers, width: '32%' },
            ]}
            rows={report.restock.map((line) => [
              line.ingredientName,
              quantity(line.quantityAdded, line.unit),
              String(line.entryCount),
              line.suppliers.length > 0 ? line.suppliers.join(', ') : '—',
            ])}
            emptyLabel={labels.noRestock}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {labels.restockDetails}
            {report.restockEntryCount > report.restockEntries.length
              ? ` (${fill(labels.restockTruncated, {
                  shown: report.restockEntries.length,
                  total: report.restockEntryCount,
                })})`
              : ''}
          </Text>
          <ReportTable
            columns={[
              { label: labels.colDate, width: '14%' },
              { label: labels.colIngredient, width: '28%' },
              { label: labels.colQuantity, width: '18%', right: true },
              { label: labels.colSupplier, width: '22%' },
              { label: labels.colUser, width: '18%' },
            ]}
            rows={report.restockEntries.map((entry) => [
              entry.dateLabel,
              entry.ingredientName,
              quantity(entry.quantityAdded, entry.unit),
              entry.supplierName ?? '—',
              entry.userName,
            ])}
            emptyLabel={labels.noRestock}
          />
        </View>
      </Page>
    </Document>
  );
}
