import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { prisma } from '@/lib/prisma';
import { parseISODate, todayInTZ } from '@/lib/planning';
import {
  ProfilCuisine,
  type ProfilRange,
} from '@/components/profil/profil-cuisine';
import {
  ProfilAdmin,
  type ProfilEstablishment,
} from '@/components/profil/profil-admin';
import { ProfilService } from '@/components/profil/profil-service';

function toMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

export default async function ProfilPage() {
  const user = await requireRole(Role.KITCHEN, Role.ADMIN, Role.SERVER);

  if (user.role === Role.ADMIN) {
    const [account, establishment] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: { createdAt: true },
      }),
      prisma.establishment.findUnique({
        where: { id: user.establishmentId },
        select: { phone: true },
      }),
    ]);

    const establishments: ProfilEstablishment[] = user.establishments.map(
      (item) => ({
        ...item,
        isCurrent: item.id === user.establishmentId,
      })
    );

    return (
      <main className="bg-surface selection:bg-primary-container selection:text-on-primary flex w-full flex-1 flex-col px-4">
        <ProfilAdmin
          user={{ name: user.name, email: user.email, role: user.role }}
          establishmentName={user.establishmentName}
          establishmentPhone={establishment?.phone ?? null}
          timezone={user.establishmentTimezone}
          memberSince={account?.createdAt ?? null}
          establishments={establishments}
        />
      </main>
    );
  }

  const [shifts, memberCount, establishment] = await Promise.all([
    prisma.shift.findMany({
      where: { userId: user.id, establishmentId: user.establishmentId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    }),
    prisma.membership.count({
      where: { establishmentId: user.establishmentId },
    }),
    prisma.establishment.findUnique({
      where: { id: user.establishmentId },
      select: { phone: true, address: true, timezone: true },
    }),
  ]);

  const todayDate = parseISODate(todayInTZ(user.establishmentTimezone));
  const dow = todayDate ? (todayDate.getUTCDay() + 6) % 7 : -1;
  const dayName = todayDate
    ? new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        timeZone: 'UTC',
      }).format(todayDate)
    : '';

  const todayRanges: ProfilRange[] = shifts
    .filter((shift) => shift.dayOfWeek === dow)
    .map((shift) => ({ start: shift.startTime, end: shift.endTime }));

  const nowHm = new Intl.DateTimeFormat('en-GB', {
    timeZone: user.establishmentTimezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
  const nowMinutes = toMinutes(nowHm);
  const onDuty =
    todayRanges.find(
      (range) =>
        toMinutes(range.start) <= nowMinutes && nowMinutes < toMinutes(range.end)
    ) ?? null;

  const weeklyRanges: ProfilRange[] = [
    ...new Map(
      shifts.map((shift) => [
        `${shift.startTime}-${shift.endTime}`,
        { start: shift.startTime, end: shift.endTime },
      ])
    ).values(),
  ].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));

  if (user.role === Role.SERVER) {
    return (
      <main className="bg-surface selection:bg-primary-container selection:text-on-primary flex w-full flex-1 flex-col px-4">
        <ProfilService
          user={{ name: user.name, email: user.email, role: user.role }}
          establishmentName={user.establishmentName}
          establishmentPhone={establishment?.phone ?? null}
          establishmentAddress={establishment?.address ?? null}
          timezone={establishment?.timezone ?? user.establishmentTimezone}
          memberCount={memberCount}
          dayName={dayName}
          todayRanges={todayRanges}
          onDuty={onDuty}
          weeklyRanges={weeklyRanges}
        />
      </main>
    );
  }

  return (
    <main className="bg-surface selection:bg-primary-container selection:text-on-primary flex w-full flex-1 flex-col px-4">
      <ProfilCuisine
        user={{ name: user.name, email: user.email, role: user.role }}
        establishmentName={user.establishmentName}
        establishmentPhone={establishment?.phone ?? null}
        memberCount={memberCount}
        dayName={dayName}
        todayRanges={todayRanges}
        onDuty={onDuty}
        weeklyRanges={weeklyRanges}
      />
    </main>
  );
}
