import { Role } from '@/generated/client';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/dal';
import { addDays, formatDateLabel } from '@/lib/planning';
import {
  startOfMonthTunisia,
  toDateInputTunisia,
} from '@/lib/sales';
import { createReportRangeSchema } from '@/lib/validations/report';
import { buildReport } from '@/lib/reports';
import {
  type ReportPreset,
} from '@/components/reports/report-range-picker';
import { RapportsDashboard } from '@/components/reports/rapports-dashboard';

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const user = await requireRole(Role.ADMIN);
  const { debut, fin } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations('Reports');

  const timezone = user.establishmentTimezone;
  const today = toDateInputTunisia(new Date(), timezone);
  const monthStart = toDateInputTunisia(
    startOfMonthTunisia(new Date(), timezone),
    timezone
  );

  const presets: ReportPreset[] = [
    { label: t('presets.today'), debut: today, fin: today },
    { label: t('presets.sevenDays'), debut: addDays(today, -6), fin: today },
    { label: t('presets.thirtyDays'), debut: addDays(today, -29), fin: today },
    { label: t('presets.thisMonth'), debut: monthStart, fin: today },
  ];

  const tValidation = await getTranslations('Validation');
  const parsed = createReportRangeSchema(tValidation).safeParse({
    debut: debut ?? monthStart,
    fin: fin ?? today,
  });
  const range = parsed.success
    ? parsed.data
    : { debut: monthStart, fin: today };

  const report = await buildReport(
    user.establishmentId,
    range.debut,
    range.fin,
    timezone
  );
  const downloadHref = `/api/reports/rapport?debut=${range.debut}&fin=${range.fin}`;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {formatDateLabel(range.debut, locale)} –{' '}
            {formatDateLabel(range.fin, locale)} · {user.establishmentName}
          </p>
        </div>
      </div>

      <RapportsDashboard
        report={report}
        presets={presets}
        range={range}
        downloadHref={downloadHref}
        establishmentName={user.establishmentName}
      />
    </main>
  );
}
