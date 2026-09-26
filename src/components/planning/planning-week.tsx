'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { toast } from 'sonner';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  Trash2Icon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteShift } from '@/actions/shifts';
import { addDays, formatWeekRange, mondayOfWeek } from '@/lib/planning';
import type { EmployeeRole } from '@/lib/validations/employee';
import { ShiftDialog } from '@/components/planning/shift-dialog';
import type { WeekDay } from '@/lib/planning';

export type PlanningShiftRow = {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  employeeId: string;
  employeeName: string;
};

const ROLE_META: Record<EmployeeRole, { label: string; color: string; station: string }> = {
  ADMIN: { label: 'Gérance', color: 'text-primary', station: 'Direction' },
  SERVER: { label: 'Service', color: 'text-secondary', station: 'Salle' },
  KITCHEN: { label: 'Cuisine', color: 'text-tertiary', station: 'Fournil' },
};

function hoursBetween(start: string, end: string): number {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return (eh * 60 + em - sh * 60 - sm) / 60;
}

export function PlanningWeek({
  monday,
  todayIso,
  establishmentName,
  employees,
  shifts,
  days,
  readOnly = false,
  currentUserId,
}: {
  monday: string;
  todayIso: string;
  establishmentName: string;
  employees: { id: string; name: string; role: EmployeeRole }[];
  shifts: PlanningShiftRow[];
  days: WeekDay[];
  readOnly?: boolean;
  currentUserId?: string;
}) {
  const router = useRouter();
  const t = useTranslations('Planning');
  const tCommon = useTranslations('Common');
  const locale = useLocale();
  const [dialogDay, setDialogDay] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanningShiftRow | null>(null);

  const shiftsByDay = new Map<number, PlanningShiftRow[]>();
  for (const shift of shifts) {
    const list = shiftsByDay.get(shift.dayOfWeek) ?? [];
    list.push(shift);
    shiftsByDay.set(shift.dayOfWeek, list);
  }

  const me = employees.find((e) => e.id === currentUserId) ?? employees[0];
  const roleMeta = me ? (ROLE_META[me.role] ?? { label: me.role, color: 'text-on-surface', station: '' }) : null;

  const prevMonday = addDays(monday, -7);
  const nextMonday = addDays(monday, 7);

  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((acc, s) => acc + hoursBetween(s.startTime, s.endTime), 0);
  const freeDays = 7 - new Set(shifts.map((s) => s.dayOfWeek)).size;
  const isTodayWeek = mondayOfWeek(todayIso) === monday;

  const kpis = [
    {
      icon: 'event_available',
      label: t('kpis.shifts'),
      value: String(totalShifts),
      sub: t('kpis.shiftsSub', { count: totalShifts }),
      color: 'bg-primary-container text-on-primary-container',
    },
    {
      icon: 'schedule',
      label: t('kpis.hours'),
      value: `${totalHours.toFixed(1)}h`,
      sub: t('kpis.hoursSub'),
      color: 'bg-secondary-container text-on-secondary-container',
    },
    {
      icon: 'hotel',
      label: t('kpis.free'),
      value: String(freeDays),
      sub: t('kpis.freeSub'),
      color: 'bg-tertiary-container/40 text-tertiary',
    },
    {
      icon: 'verified',
      label: t('kpis.status'),
      value: t('kpis.statusValue'),
      sub: t('kpis.statusSub'),
      color: 'bg-tertiary-fixed/30 text-tertiary',
    },
  ];

  return (
    <div className="flex flex-col gap-6 min-h-0">
      {/* HEADER */}
      <div className="anim-fade-up bg-surface-container-low p-5 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-label-caps text-label-caps font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                {t('badgePersonal')}
              </span>
              <span className="text-on-surface-variant text-xs">•</span>
              <span className="font-bold text-primary text-sm">
                {establishmentName}
                {isTodayWeek ? ` · ${t('thisWeek')}` : ''}
              </span>
              <span className="text-on-surface-variant text-xs">•</span>
              <span className="font-bold text-on-surface text-sm">
                {formatWeekRange(monday, locale)}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              {t('myTitle')}
            </h1>
            <p className="text-sm text-on-surface-variant">
              {t('mySubtitle')}
              {me ? ` · ${me.name}` : ''}
              {roleMeta ? ` — ${roleMeta.label}` : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <div className="flex items-center bg-surface rounded-xl p-1 shadow-sm border border-outline-variant/40">
              <Link
                href={`/planning?semaine=${prevMonday}`}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface transition-all hover:scale-110 active:scale-95"
                aria-label={t('prevWeek')}
              >
                <ChevronLeftIcon className="size-4" />
              </Link>
              <Link
                href={`/planning?semaine=${mondayOfWeek(todayIso)}`}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
              >
                {t('currentWeek')}
              </Link>
              <Link
                href={`/planning?semaine=${nextMonday}`}
                className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface transition-all hover:scale-110 active:scale-95"
                aria-label={t('nextWeek')}
              >
                <ChevronRightIcon className="size-4" />
              </Link>
            </div>
            {!readOnly && (
              <Button
                className="h-10 rounded-xl bg-primary text-on-primary font-semibold shadow-md hover:bg-primary/90 hover:shadow-lg transition-all active:scale-[0.98]"
                onClick={() => setDialogDay(days.find((d) => d.dow !== 0)?.dow ?? days[0]?.dow ?? 0)}
                disabled={employees.length === 0}
              >
                <PlusIcon className="size-4" />
                {t('newShift')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div
            key={kpi.label}
            className={`anim-fade-up-d${Math.min(i + 1, 4)} bg-surface-container-low p-4 rounded-2xl shadow-sm border border-outline-variant/30 flex flex-col gap-2 transition-all hover:shadow-md hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${kpi.color}`}>
                <span className="material-symbols-outlined text-lg">{kpi.icon}</span>
              </div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                {kpi.label}
              </span>
            </div>
            <span className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">
              {kpi.value}
            </span>
            <span className="text-xs text-on-surface-variant">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* WEEK GRID */}
      <div className="anim-fade-up-d2 bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-surface-container-high/40 border-b border-outline-variant/30">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">calendar_view_week</span>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
              {t('weekGridTitle')}
            </span>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1.5 text-on-surface-variant text-xs">
              <span className="material-symbols-outlined text-[14px] text-primary">add_circle</span>
              {t('weekGridHint')}
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <div className="grid min-w-[980px] grid-cols-7 gap-2 p-4">
            {days.map((day, dayIndex) => {
              const dayShifts = shiftsByDay.get(day.dow) ?? [];
              const isToday = day.iso === todayIso;
              const isWeekend = dayIndex >= 5;

              return (
                <div
                  key={day.iso}
                  className={`anim-fade-up flex flex-col gap-2 rounded-xl p-3 min-h-[220px] transition-all ${
                    isToday
                      ? 'bg-primary-container/40 ring-2 ring-primary shadow-md'
                      : isWeekend
                        ? 'bg-surface-container-highest/50'
                        : 'bg-surface-container'
                  }`}
                  style={{ animationDelay: `${0.05 * dayIndex}s` }}
                >
                  <div className="flex items-start justify-between gap-1">
                    <div className="flex flex-col">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider ${
                          isToday ? 'text-primary' : isWeekend ? 'text-tertiary' : 'text-on-surface-variant'
                        }`}
                      >
                        {t(`daysShort.${day.dow}`)}
                      </span>
                      <span
                        className={`font-headline-sm text-headline-sm font-semibold ${
                          isToday ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {day.dayNumber}
                      </span>
                    </div>
                    {!readOnly && (
                      <button
                        type="button"
                        className="size-7 rounded-lg bg-surface hover:bg-primary hover:text-on-primary text-on-surface-variant flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                        disabled={employees.length === 0}
                        onClick={() => setDialogDay(day.dow)}
                        aria-label={t('addSlot', {
                          day: t(`days.${day.dow}`).toLowerCase(),
                        })}
                      >
                        <PlusIcon className="size-4" />
                      </button>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col gap-2">
                    {dayShifts.length === 0 ? (
                      <div className="flex-1 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-outline-variant/50 py-4 opacity-70">
                        <span className="material-symbols-outlined text-on-surface-variant text-xl">free_breakfast</span>
                        <span className="text-[10px] font-bold uppercase text-on-surface-variant">
                          {t('free')}
                        </span>
                      </div>
                    ) : (
                      dayShifts.map((shift, si) => {
                        const hours = hoursBetween(shift.startTime, shift.endTime);
                        const isMine =
                          currentUserId !== undefined &&
                          shift.employeeId === currentUserId;
                        return (
                          <div
                            key={shift.id}
                            className={`group relative overflow-hidden rounded-xl p-2.5 text-xs transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default ${
                              isMine
                                ? 'bg-primary text-on-primary shadow-sm'
                                : 'bg-surface text-on-surface border border-outline-variant/40'
                            }`}
                            style={{ animationDelay: `${0.08 * si}s` }}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <div className="flex flex-col min-w-0">
                                <span className="flex items-center gap-1 font-bold text-[11px] truncate">
                                  <span className="material-symbols-outlined text-[13px] opacity-80">
                                    schedule
                                  </span>
                                  {shift.startTime}–{shift.endTime}
                                </span>
                                <span className={`text-[10px] ${isMine ? 'opacity-85' : 'text-on-surface-variant'}`}>
                                  {hours.toFixed(1)}h · {roleMeta?.station || t('shiftLabel')}
                                </span>
                              </div>
                              {!readOnly && (
                                <button
                                  type="button"
                                  className="opacity-0 group-hover:opacity-100 shrink-0 p-1 rounded-md transition-all hover:scale-110 active:scale-95"
                                  style={{
                                    backgroundColor: isMine ? 'rgba(255,255,255,0.2)' : 'var(--error-container)',
                                  }}
                                  title={t('removeSlot', {
                                    name: shift.employeeName,
                                    times: `${shift.startTime}–${shift.endTime}`,
                                  })}
                                  onClick={() => setDeleteTarget(shift)}
                                  aria-label={t('removeSlot', {
                                    name: shift.employeeName,
                                    times: `${shift.startTime}–${shift.endTime}`,
                                  })}
                                >
                                  <Trash2Icon className="size-3.5" />
                                </button>
                              )}
                            </div>
                            {isToday && (
                              <span className="absolute -right-2 -top-2 size-8 rounded-full bg-on-primary/10" />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* EMPTY */}
      {employees.length === 0 && !readOnly && (
        <div className="anim-fade-up bg-surface-container-low rounded-2xl p-6 text-center border border-outline-variant/30">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">group_off</span>
          <p className="text-sm text-on-surface-variant">
            {t('noEmployees')}{' '}
            <Link href="/employes" className="font-medium text-primary underline">
              {t('noEmployeesLink')}
            </Link>{' '}
            {t('noEmployeesHint')}
          </p>
        </div>
      )}

      {dialogDay !== null && !readOnly && (
        <ShiftDialog
          dayOfWeek={dialogDay}
          employees={employees}
          currentUserId={currentUserId}
          hideEmployeeSelect
          onClose={() => {
            setDialogDay(null);
            router.refresh();
          }}
        />
      )}

      {!readOnly && (
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent className="sm:max-w-sm rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-headline-sm text-headline-sm">
                {t('removeSlotTitle')}
              </DialogTitle>
              <DialogDescription>
                {deleteTarget
                  ? t('removeSlotConfirm', {
                      name: deleteTarget.employeeName,
                      day: t(`days.${deleteTarget.dayOfWeek}`).toLowerCase(),
                      times: `${deleteTarget.startTime}–${deleteTarget.endTime}`,
                    })
                  : ''}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                className="rounded-xl"
                onClick={() => setDeleteTarget(null)}
              >
                {tCommon('actions.cancel')}
              </Button>
              {deleteTarget && (
                <form
                  action={async () => {
                    const result = await deleteShift(deleteTarget.id);
                    setDeleteTarget(null);
                    if (!result.success) {
                      toast.error(t('removeSlotFailed'));
                    }
                    router.refresh();
                  }}
                >
                  <Button
                    variant="destructive"
                    type="submit"
                    className="rounded-xl"
                  >
                    <Trash2Icon />
                    {tCommon('actions.remove')}
                  </Button>
                </form>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
