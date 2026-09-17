import { NextRequest } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { Role } from '@/generated/client';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth/dal';
import { buildReport } from '@/lib/reports';
import { reportRangeSchema } from '@/lib/validations/report';
import { ReportDocument } from '@/components/reports/report-document';

export async function GET(request: NextRequest) {
  const user = await requireRole(Role.ADMIN);

  const parsed = reportRangeSchema.safeParse({
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

  const buffer = await renderToBuffer(
    <ReportDocument report={report} establishment={establishment} />
  );

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="rapport-${parsed.data.debut}_${parsed.data.fin}.pdf"`,
    },
  });
}
