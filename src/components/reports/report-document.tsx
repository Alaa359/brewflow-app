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

type Column = { label: string; width: string; right?: boolean };

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
}: {
  report: ReportData;
  establishment: ReportEstablishment;
}) {
  const { totals } = report;
  const periodLabel = `${formatDateLabel(report.range.from)} – ${formatDateLabel(
    report.range.to
  )}`;

  const summary: { label: string; value: string }[] = [
    { label: 'Chiffre d’affaires', value: formatCost(totals.revenue) },
    { label: 'Commandes encaissées', value: String(totals.orderCount) },
    { label: 'Articles vendus', value: String(totals.itemCount) },
    { label: 'Panier moyen', value: formatCost(totals.averageBasket) },
    { label: 'Encaissé espèces', value: formatCost(totals.cashRevenue) },
    { label: 'Encaissé carte', value: formatCost(totals.cardRevenue) },
  ];

  return (
    <Document
      title={`Rapport d’activité ${periodLabel}`}
      author={establishment.name}
    >
      <Page size="A4" style={styles.page}>
        <View fixed style={styles.pageHeader}>
          <Text style={styles.pageHeaderName}>{establishment.name}</Text>
          <Text style={styles.pageHeaderMeta}>
            Rapport d’activité · {periodLabel}
          </Text>
        </View>

        <View fixed style={styles.pageFooter}>
          <Text>Édité le {formatDateTime(report.generatedAt)}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>

        <Text style={styles.title}>Rapport d’activité</Text>
        <Text style={styles.subtitle}>
          {establishment.address ?? ''}
          {establishment.address && establishment.phone ? ' · ' : ''}
          {establishment.phone ?? ''}
        </Text>
        <Text style={styles.subtitle}>Période : {periodLabel}</Text>
        <View style={styles.rule} />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synthèse</Text>
          {summary.map((line) => (
            <View key={line.label} style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{line.label}</Text>
              <Text style={styles.summaryValue}>{line.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chiffre d’affaires par catégorie
          </Text>
          <ReportTable
            columns={[
              { label: 'Catégorie', width: '40%' },
              { label: 'Qté', width: '15%', right: true },
              { label: 'CA', width: '25%', right: true },
              { label: 'Part', width: '20%', right: true },
            ]}
            rows={report.categories.map((category) => [
              category.categoryName,
              String(category.quantity),
              formatCost(category.revenue),
              `${category.sharePercent} %`,
            ])}
            emptyLabel="Aucune vente sur la période."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Chiffre d’affaires & marge par plat
          </Text>
          <ReportTable
            columns={[
              { label: 'Plat', width: '28%' },
              { label: 'Qté', width: '9%', right: true },
              { label: 'CA', width: '19%', right: true },
              { label: 'Coût', width: '16%', right: true },
              { label: 'Marge', width: '16%', right: true },
              { label: 'Marge %', width: '12%', right: true },
            ]}
            rows={report.dishes.map((dish) => [
              dish.dishName,
              String(dish.quantity),
              formatCost(dish.revenue),
              formatCost(dish.cost),
              formatCost(dish.margin),
              dish.marginPercent === null
                ? '—'
                : formatPercent(dish.marginPercent),
            ])}
            emptyLabel="Aucune vente sur la période."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Réapprovisionnements par ingrédient
          </Text>
          <ReportTable
            columns={[
              { label: 'Ingrédient', width: '34%' },
              { label: 'Quantité', width: '20%', right: true },
              { label: 'Entrées', width: '14%', right: true },
              { label: 'Fournisseurs', width: '32%' },
            ]}
            rows={report.restock.map((line) => [
              line.ingredientName,
              formatQuantity(line.quantityAdded, line.unit),
              String(line.entryCount),
              line.suppliers.length > 0 ? line.suppliers.join(', ') : '—',
            ])}
            emptyLabel="Aucun réapprovisionnement sur la période."
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Détail des réapprovisionnements
            {report.restockEntryCount > report.restockEntries.length
              ? ` (${report.restockEntries.length} plus récents sur ${report.restockEntryCount})`
              : ''}
          </Text>
          <ReportTable
            columns={[
              { label: 'Date', width: '14%' },
              { label: 'Ingrédient', width: '28%' },
              { label: 'Quantité', width: '18%', right: true },
              { label: 'Fournisseur', width: '22%' },
              { label: 'Saisi par', width: '18%' },
            ]}
            rows={report.restockEntries.map((entry) => [
              entry.dateLabel,
              entry.ingredientName,
              formatQuantity(entry.quantityAdded, entry.unit),
              entry.supplierName ?? '—',
              entry.userName,
            ])}
            emptyLabel="Aucun réapprovisionnement sur la période."
          />
        </View>
      </Page>
    </Document>
  );
}
