import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import {
  TablesTable,
  type TableListRow,
} from '@/components/tables/tables-table';

export default async function TablesPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  const user = await requireRole(Role.ADMIN);

  const tables = await prisma.table.findMany({
    where: { establishmentId: user.establishmentId },
    orderBy: [{ number: 'asc' }],
    select: {
      id: true,
      number: true,
      zone: true,
      qrCode: true,
      _count: { select: { orders: true } },
    },
  });

  const rows: TableListRow[] = tables.map((table) => ({
    id: table.id,
    number: table.number,
    zone: table.zone,
    qrCode: table.qrCode,
    orderCount: table._count.orders,
  }));

  return (
    <main className="flex flex-1 flex-col p-6">
      <TablesTable
        tables={rows}
        establishmentName={user.establishmentName}
        error={(await searchParams).erreur}
      />
    </main>
  );
}
