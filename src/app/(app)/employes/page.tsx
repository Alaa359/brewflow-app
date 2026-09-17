import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import {
  EmployeesTable,
  type EmployeeRow,
} from '@/components/employees/employees-table';
import type { ManagedEstablishment } from '@/components/employees/employee-form';

export default async function EmployeesPage() {
  const user = await requireRole(Role.ADMIN);

  const [employees, establishments] = await Promise.all([
    prisma.user.findMany({
      where: {
        memberships: { some: { establishmentId: user.establishmentId } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        memberships: {
          select: {
            establishmentId: true,
            establishment: { select: { name: true } },
          },
          orderBy: { establishment: { name: 'asc' } },
        },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.establishment.findMany({
      where: { memberships: { some: { userId: user.id } } },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  const rows: EmployeeRow[] = employees.map((employee) => ({
    id: employee.id,
    name: employee.name,
    email: employee.email,
    role: employee.role,
    isSelf: employee.id === user.id,
    establishmentIds: employee.memberships.map(
      (membership) => membership.establishmentId
    ),
    memberships: employee.memberships.map((membership) => ({
      id: membership.establishmentId,
      name: membership.establishment.name,
    })),
  }));

  const managedEstablishments: ManagedEstablishment[] = establishments.map(
    (establishment) => ({
      id: establishment.id,
      name: establishment.name,
    })
  );

  return (
    <main className="flex flex-1 flex-col p-6">
      <EmployeesTable
        employees={rows}
        establishments={managedEstablishments}
        currentEstablishmentId={user.establishmentId}
      />
    </main>
  );
}
