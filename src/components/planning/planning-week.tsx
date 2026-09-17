'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CalendarDaysIcon,
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
import { DAY_NAMES, DAY_SHORT } from '@/lib/validations/shift';
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

const ROLE_COLOR: Record<EmployeeRole, string> = {
  ADMIN: 'bg-amber-100 text-amber-800',
  SERVER: 'bg-sky-100 text-sky-800',
  KITCHEN: 'bg-emerald-100 text-emerald-800',
};

export function PlanningWeek({
  monday,
  todayIso,
  establishmentName,
  employees,
  shifts,
  days,
}: {
  monday: string;
  todayIso: string;
  establishmentName: string;
  employees: { id: string; name: string; role: EmployeeRole }[];
  shifts: PlanningShiftRow[];
  days: WeekDay[];
}) {
  const router = useRouter();
  const [dialogDay, setDialogDay] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanningShiftRow | null>(
    null
  );

  const shiftsByDay = new Map<number, PlanningShiftRow[]>();
  for (const shift of shifts) {
    const list = shiftsByDay.get(shift.dayOfWeek) ?? [];
    list.push(shift);
    shiftsByDay.set(shift.dayOfWeek, list);
  }
  const employeeById = new Map(
    employees.map((employee) => [employee.id, employee])
  );

  const prevMonday = addDays(monday, -7);
  const nextMonday = addDays(monday, 7);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Planning</h1>
          <p className="text-muted-foreground text-sm">
            {establishmentName} · {formatWeekRange(monday)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/planning?semaine=${mondayOfWeek(todayIso)}`}>
              <CalendarDaysIcon />
              Semaine actuelle
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/planning?semaine=${prevMonday}`}>
              <ChevronLeftIcon />
              <span className="sr-only">Semaine précédente</span>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href={`/planning?semaine=${nextMonday}`}>
              <ChevronRightIcon />
              <span className="sr-only">Semaine suivante</span>
            </Link>
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[880px] grid-cols-7 gap-2">
          {days.map((day) => {
            const dayShifts = shiftsByDay.get(day.dow) ?? [];
            const isToday = day.iso === todayIso;
            return (
              <div
                key={day.iso}
                className={`flex flex-col gap-2 rounded-xl border p-3 ${
                  isToday ? 'ring-primary ring-2' : 'bg-card border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium capitalize">
                      {DAY_SHORT[day.dow]}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {day.dayNumber}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={employees.length === 0}
                    onClick={() => setDialogDay(day.dow)}
                    aria-label={`Ajouter un créneau ${DAY_NAMES[day.dow].toLowerCase()}`}
                  >
                    <PlusIcon />
                  </Button>
                </div>

                <div className="flex flex-1 flex-col gap-1.5">
                  {dayShifts.length === 0 ? (
                    <p className="text-muted-foreground px-1 text-xs">
                      — libre
                    </p>
                  ) : (
                    dayShifts.map((shift) => {
                      const employee = employeeById.get(shift.employeeId);
                      return (
                        <div
                          key={shift.id}
                          className={`group flex items-center justify-between gap-1 rounded-lg px-2 py-1.5 text-xs ${
                            employee
                              ? (ROLE_COLOR[employee.role] ??
                                'bg-muted text-foreground')
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <span className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">
                              {shift.employeeName}
                            </span>
                            <span className="opacity-80">
                              {shift.startTime}–{shift.endTime}
                            </span>
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={() => setDeleteTarget(shift)}
                            aria-label={`Retirer ${shift.employeeName} (${shift.startTime}–${shift.endTime})`}
                          >
                            <Trash2Icon />
                          </Button>
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

      {employees.length === 0 && (
        <p className="text-muted-foreground text-sm">
          Aucun employé dans cet établissement :{' '}
          <Link href="/employes" className="font-medium underline">
            créer un employé
          </Link>{' '}
          pour pouvoir planifier des créneaux.
        </p>
      )}

      {dialogDay !== null && (
        <ShiftDialog
          dayOfWeek={dialogDay}
          employees={employees}
          onClose={() => {
            setDialogDay(null);
            router.refresh();
          }}
        />
      )}

      <Dialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Retirer ce créneau ?</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `${deleteTarget.employeeName}, ${DAY_NAMES[deleteTarget.dayOfWeek].toLowerCase()} ${deleteTarget.startTime}–${deleteTarget.endTime} ne sera plus planifié.`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Annuler
            </Button>
            {deleteTarget && (
              <form action={deleteShift.bind(null, deleteTarget.id)}>
                <Button variant="destructive" type="submit">
                  <Trash2Icon />
                  Retirer
                </Button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
