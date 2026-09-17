import { NextRequest } from 'next/server';
import { getLocale, getTranslations } from 'next-intl/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { buildReport } from '@/lib/reports';
import { createReportRangeSchema } from '@/lib/validations/report';
import {
  ReportDocument,
  type ReportLabels,
} from '@/components/reports/report-document';

export async function GET(request: NextRequest) {
  const user = await requireRole(Role.ADMIN);

  const tValidation = await getTranslations('Validation');
  const parsed = createReportRangeSchema(tValidation).safeParse({
    debut: request.nextUrl.searchParams.get('debut') ?? '',
    fin: request.nextUrl.searchParams.get('fin') ?? '',
  });
  if (!parsed.success) {
    return new Response('Période invalide.', { status: 400 });
  }

  const establishment = await prisma.establishment.findUnique({
    where: { id: user.establishmentId },
    select: { name: true, address: true, phone: true },
  });
  if (!establishment) {
    return new Response('Établissement introuvable.', { status: 404 });
  }

  const report = await buildReport(
    user.establishmentId,
    parsed.data.debut,
    parsed.data.fin
  );

  const locale = await getLocale();
  const pdfLocale = locale === 'ar' ? 'fr' : locale;
  const [t, tUnits] = await Promise.all([
    getTranslations({ locale: pdfLocale, namespace: 'Pdf.report' }),
    getTranslations({ locale: pdfLocale, namespace: 'Units' }),
  ]);

  const labels: ReportLabels = {
    title: t('title'),
    documentTitle: t('documentTitle'),
    headerMeta: t('headerMeta'),
    generatedAt: t('generatedAt'),
    page: t('page'),
    period: t('period'),
    summary: t('summary'),
    revenue: t('revenue'),
    settledOrders: t('settledOrders'),
    itemsSold: t('itemsSold'),
    averageBasket: t('averageBasket'),
    cashRevenue: t('cashRevenue'),
    cardRevenue: t('cardRevenue'),
    byCategory: t('byCategory'),
    byDish: t('byDish'),
    restockByIngredient: t('restockByIngredient'),
    restockDetails: t('restockDetails'),
    restockTruncated: t('restockTruncated'),
    colCategory: t('colCategory'),
    colDish: t('colDish'),
    colIngredient: t('colIngredient'),
    colQuantity: t('colQuantity'),
    colQty: t('colQty'),
    colRevenue: t('colRevenue'),
    colCost: t('colCost'),
    colMargin: t('colMargin'),
    colMarginPercent: t('colMarginPercent'),
    colShare: t('colShare'),
    colEntries: t('colEntries'),
    colSuppliers: t('colSuppliers'),
    colDate: t('colDate'),
    colSupplier: t('colSupplier'),
    colUser: t('colUser'),
    noSales: t('noSales'),
    noRestock: t('noRestock'),
  };

  const unitLabels: Record<string, string> = {
    KG: tUnits('KG'),
    L: tUnits('L'),
    PIECE: tUnits('PIECE'),
  };

  const buffer = await renderToBuffer(
    <ReportDocument
      report={report}
      establishment={establishment}
      locale={pdfLocale}
      labels={labels}
      unitLabels={unitLabels}
    />
  );

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="rapport-${parsed.data.debut}_${parsed.data.fin}.pdf"`,
    },
  });
}
