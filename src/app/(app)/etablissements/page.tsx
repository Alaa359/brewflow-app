import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import {
  EstablishmentsTable,
  type EstablishmentRow,
} from '@/components/establishments/establishments-table';

export default async function EstablishmentsPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
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
      _count: { select: { memberships: true } },
    },
  });

  const rows: EstablishmentRow[] = establishments.map((est) => ({
    id: est.id,
    name: est.name,
    address: est.address,
    phone: est.phone,
    timezone: est.timezone,
    memberCount: est._count.memberships,
    isCurrent: est.id === user.establishmentId,
  }));

  return (
    <main className="flex flex-1 flex-col p-6">
      <EstablishmentsTable
        establishments={rows}
        membershipCount={user.establishments.length}
        error={(await searchParams).erreur}
      />
    </main>
  );
}
