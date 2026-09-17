import { Role } from '@/generated/client';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireRole } from '@/lib/auth/dal';
import { addDays, formatDateLabel } from '@/lib/planning';
import { startOfMonthTunisia, toDateInputTunisia } from '@/lib/sales';
import { reportRangeSchema } from '@/lib/validations/report';
import { buildReport } from '@/lib/reports';
import {
  ReportRangePicker,
  type ReportPreset,
} from '@/components/reports/report-range-picker';
import { ReportsView } from '@/components/reports/reports-view';

export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>;
}) {
  const user = await requireRole(Role.ADMIN);
  const { debut, fin } = await searchParams;
  const locale = await getLocale();
  const t = await getTranslations('Reports');

  const today = toDateInputTunisia();
  const monthStart = startOfMonthTunisia(new Date()).toISOString().slice(0, 10);

  const presets: ReportPreset[] = [
    { label: t('presets.today'), debut: today, fin: today },
    { label: t('presets.sevenDays'), debut: addDays(today, -6), fin: today },
    { label: t('presets.thirtyDays'), debut: addDays(today, -29), fin: today },
    { label: t('presets.thisMonth'), debut: monthStart, fin: today },
  ];

  const parsed = reportRangeSchema.safeParse({
    debut: debut ?? monthStart,
    fin: fin ?? today,
  });
  const range = parsed.success
    ? parsed.data
    : { debut: monthStart, fin: today };
  const error = parsed.success ? undefined : parsed.error.issues[0]?.message;

  const report = await buildReport(
    user.establishmentId,
    range.debut,
    range.fin
  );
  const downloadHref = `/api/reports/rapport?debut=${range.debut}&fin=${range.fin}`;

  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <section className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground text-sm">
            {formatDateLabel(range.debut, locale)} –{' '}
            {formatDateLabel(range.fin, locale)} · {user.establishmentName}
          </p>
        </div>
        <ReportRangePicker
          debut={range.debut}
          fin={range.fin}
          presets={presets}
          error={error}
        />
      </section>

      <ReportsView report={report} downloadHref={downloadHref} />
    </main>
  );
}
