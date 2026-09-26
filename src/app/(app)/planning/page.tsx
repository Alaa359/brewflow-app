import { Role } from '@/generated/client';
import { redirect } from 'next/navigation';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { mondayOfWeek, todayInTZ, weekDays } from '@/lib/planning';
import {
  PlanningDashboard,
  type PlanningDashboardProps,
} from '@/components/planning/planning-dashboard';
import { PlanningWeek } from '@/components/planning/planning-week';

export default async function PlanningPage({
  searchParams,
}: {
  searchParams: Promise<{ semaine?: string }>;
}) {
  const user = await requireRole(Role.ADMIN, Role.SERVER, Role.KITCHEN);
  const isAdmin = user.role === Role.ADMIN;

  const establishment = await prisma.establishment.findUnique({
    where: { id: user.establishmentId },
    select: { name: true, timezone: true },
  });
  const timezone = establishment?.timezone ?? 'Africa/Tunis';

  const today = todayInTZ(timezone);
  const monday = mondayOfWeek((await searchParams).semaine ?? today);
  if (!monday) redirect('/planning');

  const [employees, shifts] = await Promise.all([
    prisma.user.findMany({
      where: {
        memberships: { some: { establishmentId: user.establishmentId } },
        ...(isAdmin ? {} : { id: user.id }),
      },
      select: { id: true, name: true, role: true },
      orderBy: { name: 'asc' },
    }),
    prisma.shift.findMany({
      where: {
        establishmentId: user.establishmentId,
        ...(isAdmin ? {} : { userId: user.id }),
      },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        user: { select: { id: true, name: true } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }),
  ]);

  const shiftRows: PlanningDashboardProps['shifts'] = shifts.map((shift) => ({
    id: shift.id,
    dayOfWeek: shift.dayOfWeek,
    startTime: shift.startTime,
    endTime: shift.endTime,
    employeeId: shift.user.id,
    employeeName: shift.user.name,
  }));

  const shared = {
    monday,
    todayIso: today,
    establishmentName: establishment?.name ?? '',
    employees,
    shifts: shiftRows,
    days: weekDays(monday),
  };

  return (
    <main className="flex flex-1 flex-col p-6 min-h-0">
      {isAdmin ? (
        <PlanningDashboard {...shared} readOnly={false} currentUserId={user.id} />
      ) : (
        <PlanningWeek {...shared} readOnly={false} currentUserId={user.id} />
      )}
    </main>
  );
}
