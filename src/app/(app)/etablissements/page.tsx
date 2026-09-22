import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { EtablissementsDashboard } from '@/components/etablissements/etablissements-dashboard';

export type EstablishmentData = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  timezone: string;
  tableCount: number;
  memberCount: number;
  isCurrent: boolean;
};

export default async function EstablishmentsPage() {
  const user = await requireRole(Role.ADMIN);

  const establishments = await prisma.establishment.findMany({
    where: {
      memberships: { some: { userId: user.id } },
    },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      address: true,
      phone: true,
      timezone: true,
      _count: { select: { tables: true, memberships: true } },
    },
  });

  const data: EstablishmentData[] = establishments.map((est) => ({
    id: est.id,
    name: est.name,
    address: est.address,
    phone: est.phone,
    timezone: est.timezone,
    tableCount: est._count.tables,
    memberCount: est._count.memberships,
    isCurrent: est.id === user.establishmentId,
  }));

  return (
    <main className="flex flex-1 flex-col p-6">
      <EtablissementsDashboard establishments={data} />
    </main>
  );
}
