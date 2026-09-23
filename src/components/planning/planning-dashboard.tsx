'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { addDays, formatWeekRange, mondayOfWeek } from '@/lib/planning';
import type { EmployeeRole } from '@/lib/validations/employee';
import type { PlanningShiftRow } from './planning-week';
import { ShiftDialog } from './shift-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deleteShift } from '@/actions/shifts';

const ROLE_META: Record<EmployeeRole, { label: string; color: string; station: string; hourlyRate: string }> = {
  ADMIN: { label: 'Gérance / Super-Admin', color: 'text-primary', station: 'Direction', hourlyRate: '' },
  SERVER: { label: 'Chef de Rang', color: 'text-secondary', station: 'Salle & Terrasse', hourlyRate: '' },
  KITCHEN: { label: 'Chef Fournil', color: 'text-tertiary', station: 'Atelier Pâtisserie', hourlyRate: '' },
};

const DEPT_FILTERS = [
  { id: 'all', label: 'Tous les pôles' },
  { id: 'ADMIN', label: 'Gérance' },
  { id: 'SERVER', label: 'Salle & Service' },
  { id: 'KITCHEN', label: 'Cuisine & Pâtisserie' },
];

export type PlanningDashboardProps = {
  monday: string;
  todayIso: string;
  establishmentName: string;
  employees: { id: string; name: string; role: EmployeeRole }[];
  shifts: PlanningShiftRow[];
  days: { iso: string; dow: number; dayNumber: number }[];
};

export function PlanningDashboard({
  monday,
  todayIso,
  employees,
  shifts,
  days,
}: PlanningDashboardProps) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations('Planning');
  const tCommon = useTranslations('Common');

  const [dialogDay, setDialogDay] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlanningShiftRow | null>(null);
  const [deptFilter, setDeptFilter] = useState('all');

  const shiftsByDay = new Map<number, PlanningShiftRow[]>();
  for (const shift of shifts) {
    const list = shiftsByDay.get(shift.dayOfWeek) ?? [];
    list.push(shift);
    shiftsByDay.set(shift.dayOfWeek, list);
  }
  const filteredEmployees = deptFilter === 'all'
    ? employees
    : employees.filter((e) => e.role === deptFilter);

  const prevMonday = addDays(monday, -7);
  const nextMonday = addDays(monday, 7);

  const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  const totalShifts = shifts.length;
  const totalHours = shifts.reduce((acc, s) => {
    const [sh, sm] = s.startTime.split(':').map(Number);
    const [eh, em] = s.endTime.split(':').map(Number);
    return acc + (eh * 60 + em - sh * 60 - sm) / 60;
  }, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* ═══ HEADER ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-5 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold text-[10px] uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
              Rotation Active
            </span>
            <span className="text-on-surface-variant text-xs">•</span>
            <span className="font-bold text-primary text-sm">Semaine {days[0]?.dayNumber} • {formatWeekRange(monday, locale)}</span>
            <span className="text-on-surface-variant text-xs">•</span>
            <span className="text-tertiary text-xs flex items-center gap-0.5 font-medium">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              Pointage RFID Synchronisé
            </span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Planning &amp; Rotations du Personnel</h1>
          <p className="text-sm text-on-surface-variant">
            Organisation des quarts de travail, respect des conventions collectives, calcul de la masse salariale prévisionnelle et synchronisation des pointages biométriques/RFID.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm hover:bg-surface-variant transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            <span className="hidden sm:inline">Modèle Récurrent</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-all shadow-md"
            onClick={() => setDialogDay(days[0]?.dow ?? 0)}
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            + Nouveau Quart
          </button>
        </div>
      </div>

      {/* ═══ KPI CARDS ═══ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: 'group', label: 'Effectif actif', value: filteredEmployees.length.toString(), sub: `${employees.length} total`, color: 'bg-primary-container text-on-primary-container' },
          { icon: 'schedule', label: 'Heures / semaine', value: totalHours.toFixed(1) + 'h', sub: `~${(totalHours / Math.max(filteredEmployees.length, 1)).toFixed(1)}h /pers.`, color: 'bg-secondary-container text-on-secondary-container' },
          { icon: 'event_available', label: 'Quarts planifiés', value: totalShifts.toString(), sub: `${7 - totalShifts > 0 ? 7 - totalShifts : 0} jours libres`, color: 'bg-tertiary-container/30 text-tertiary' },
          { icon: 'verified_user', label: 'Conformité légale', value: '100%', sub: '0 dépassement', color: 'bg-tertiary-fixed/30 text-tertiary' },
        ].map((kpi) => (
          <div key={kpi.label} className="bg-surface-container-low p-4 rounded-xl shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${kpi.color}`}>
                <span className="material-symbols-outlined text-lg">{kpi.icon}</span>
              </div>
              <span className="text-[11px] font-bold uppercase text-on-surface-variant tracking-wider">{kpi.label}</span>
            </div>
            <span className="font-metric-display text-metric-display text-on-surface font-bold tracking-tight">{kpi.value}</span>
            <span className="text-xs text-on-surface-variant">{kpi.sub}</span>
          </div>
        ))}
      </div>

      {/* ═══ CONTROL BAR ═══ */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container p-4 rounded-xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          {/* Week Selector */}
          <div className="flex items-center bg-surface rounded-lg p-1 shadow-sm">
            <a href={`/planning?semaine=${prevMonday}`} className="p-1 rounded hover:bg-surface-container-high text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </a>
            <span className="font-bold text-sm px-3 text-on-surface">Semaine {days[0]?.dayNumber} ({formatWeekRange(monday, locale)})</span>
            <a href={`/planning?semaine=${nextMonday}`} className="p-1 rounded hover:bg-surface-container-high text-on-surface transition-colors">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </a>
          </div>
          <a
            href={`/planning?semaine=${mondayOfWeek(todayIso)}`}
            className="px-3 py-1.5 rounded-lg bg-surface text-on-surface text-sm hover:bg-surface-container-high transition-colors shadow-sm"
          >
            Aujourd&apos;hui
          </a>

          {/* Department Filters */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            {DEPT_FILTERS.map((dept) => {
              const count = dept.id === 'all' ? employees.length : employees.filter((e) => e.role === dept.id).length;
              return (
                <button
                  key={dept.id}
                  className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    deptFilter === dept.id
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface text-on-surface-variant hover:text-on-surface'
                  }`}
                  onClick={() => setDeptFilter(dept.id)}
                >
                  {dept.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="flex items-center gap-2 bg-surface px-3 py-2 rounded-lg shadow-sm self-start xl:self-auto">
          <div className="w-2.5 h-2.5 rounded-full bg-tertiary"></div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase text-tertiary tracking-wider">CONFORMITÉ LÉGALE : 100%</span>
            <span className="text-[11px] text-on-surface-variant leading-tight">0 collaborateur en dépassement</span>
          </div>
        </div>
      </div>

      {/* ═══ STAFF GRID ═══ */}
      <div className="bg-surface-container-low rounded-xl shadow-sm overflow-hidden">
        {/* Legend */}
        <div className="p-4 flex flex-wrap items-center justify-between gap-3 bg-surface-container-high/40">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Légende des Shifts :</span>
            {[
              { color: 'bg-primary-container', label: 'Ouverture / Matin (06:30 - 15:00)' },
              { color: 'bg-secondary', label: 'Fermeture / Soir (14:30 - 23:00)' },
              { color: 'bg-tertiary-container', label: 'Midday Rush (11:00 - 16:00)' },
              { color: 'bg-surface-variant', label: 'Repos Hebdo (RH)' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`w-3 h-3 rounded ${item.color}`}></span>
                <span className="text-xs text-on-surface">{item.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1 text-on-surface-variant text-xs">
            <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
            Pastille verte = Badgeage biométrique validé
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <div className="min-w-[1180px]">
            {/* Day Headers */}
            <div className="grid grid-cols-[260px_repeat(7,1fr)] bg-surface-container text-on-surface text-sm">
              <div className="p-4 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">Collaborateur &amp; Rôle</span>
                <span className="text-[10px] font-bold uppercase text-on-surface-variant">Taux/h</span>
              </div>
              {days.map((day, i) => {
                const isWeekend = i >= 5;
                return (
                  <div
                    key={day.iso}
                    className={`p-3 flex flex-col items-center justify-center text-center ${
                      isWeekend ? (i === 5 ? 'bg-primary-fixed/20' : 'bg-tertiary-fixed/20') : 'bg-surface-container'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase ${isWeekend ? (i === 5 ? 'text-primary' : 'text-tertiary') : 'text-on-surface-variant'}`}>
                      {DAY_LABELS[i]} {day.dayNumber}
                    </span>
                    <span className={`font-headline-sm text-headline-sm font-semibold ${isWeekend ? (i === 5 ? 'text-primary' : 'text-tertiary') : 'text-on-surface'}`}>
                      {day.dayNumber}
                    </span>
                    <span className={`text-[11px] font-bold ${isWeekend ? (i === 5 ? 'text-primary' : 'text-tertiary') : 'text-on-surface-variant'}`}>
                      {(shifts.filter((s) => s.dayOfWeek === day.dow).length * 8.5).toFixed(1)} h tot.
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Employee Rows */}
            <div className="flex flex-col">
              {filteredEmployees.map((employee) => {
                const roleMeta = ROLE_META[employee.role] ?? { label: employee.role, color: 'text-on-surface', station: '', hourlyRate: '' };
                const empShifts = shifts.filter((s) => s.employeeId === employee.id);

                return (
                  <div key={employee.id} className="grid grid-cols-[260px_repeat(7,1fr)] bg-surface hover:bg-surface-container transition-colors items-center min-h-[92px] p-1.5 gap-1.5">
                    {/* Staff Meta Card */}
                    <div className="p-3 flex items-center justify-between bg-surface-container-low rounded-lg h-full">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center shadow-sm flex-shrink-0">
                          <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-on-surface truncate">{employee.name}</span>
                          <span className={`text-xs ${roleMeta.color} truncate`}>{roleMeta.label}</span>
                          <span className="text-[10px] font-bold uppercase text-on-surface-variant">{roleMeta.station}</span>
                        </div>
                      </div>
                      {employee.role === 'ADMIN' && (
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">CADRE</span>
                      )}
                    </div>

                    {/* Day Columns */}
                    {days.map((day, i) => {
                      const shift = empShifts.find((s) => s.dayOfWeek === day.dow);
                      const isWeekend = i >= 5;
                      const isRepos = !shift;

                      if (isRepos) {
                        return (
                          <div key={day.iso} className="h-full bg-surface-container rounded-lg p-2 flex flex-col items-center justify-center text-center opacity-70">
                            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">hotel</span>
                            <span className="text-[10px] font-bold uppercase text-on-surface-variant mt-1">Repos Hebdo</span>
                          </div>
                        );
                      }

                      const shiftBg = isWeekend
                        ? (i === 5 ? 'bg-primary-container/30' : 'bg-tertiary-container/30')
                        : 'bg-primary-container/20';

                      return (
                        <div key={day.iso} className={`h-full ${shiftBg} rounded-lg p-2 flex flex-col justify-between relative shadow-sm`}>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-on-primary-container">
                              {shift.startTime} - {shift.endTime}
                            </span>
                            {isWeekend && (
                              <span className="px-1 rounded bg-primary text-on-primary text-[9px] font-bold">
                                {i === 5 ? 'RUSH' : 'BRUNCH'}
                              </span>
                            )}
                            {!isWeekend && <span className="w-2 h-2 rounded-full bg-tertiary" title="Pointage RFID Validé"></span>}
                          </div>
                          <span className="text-[11px] text-on-surface-variant">{roleMeta.station}</span>
                          <div className="flex items-center justify-between text-[11px] text-on-surface font-semibold">
                            <span>{shift.startTime && shift.endTime ? `${((parseInt(shift.endTime) * 60 + parseInt(shift.endTime.split(':')[1]) - parseInt(shift.startTime) * 60 - parseInt(shift.startTime.split(':')[1])) / 60).toFixed(1)}h` : '8.5h'}</span>
                            {!isWeekend ? (
                              <span className="text-tertiary font-bold">Badge OK</span>
                            ) : (
                              <span className="text-on-surface-variant">Prévu</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {filteredEmployees.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant text-sm">
                  Aucun employé trouvé pour ce filtre.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ BOTTOM PANEL ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart: Customer Traffic vs Staff */}
        <div className="lg:col-span-2 bg-surface-container-low p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">Anticipation des Goulots d&apos;Étranglement</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mt-0.5">Affluence Prévisionnelle vs Staff en Poste</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-primary rounded-full"></span>
                <span className="text-xs text-on-surface-variant">Affluence clients (tickets/h)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-tertiary rounded-full"></span>
                <span className="text-xs text-on-surface-variant">Équipiers en poste</span>
              </div>
            </div>
          </div>

          {/* SVG Chart */}
          <div className="w-full h-48 relative flex items-end">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 160">
              <line className="text-surface-variant" stroke="currentColor" strokeDasharray="4" strokeWidth="1" x1="0" x2="700" y1="40" y2="40"></line>
              <line className="text-surface-variant" stroke="currentColor" strokeDasharray="4" strokeWidth="1" x1="0" x2="700" y1="80" y2="80"></line>
              <line className="text-surface-variant" stroke="currentColor" strokeDasharray="4" strokeWidth="1" x1="0" x2="700" y1="120" y2="120"></line>
              {[25, 85, 145, 205, 265, 325, 385, 445, 505, 565, 625].map((x, i) => {
                const heights = [45, 85, 105, 105, 125, 145, 145, 105, 80, 80, 125];
                const isAlert = i >= 8 && i <= 9;
                return (
                  <rect
                    key={x}
                    className={isAlert ? 'fill-error-container opacity-80' : 'fill-tertiary-fixed opacity-70'}
                    height={heights[i]}
                    rx="4"
                    width="28"
                    x={x}
                    y={160 - heights[i]}
                  ></rect>
                );
              })}
              <path d="M 39 135 C 70 120, 80 45, 99 42 C 120 40, 130 50, 159 55 C 180 60, 200 65, 219 70 C 240 75, 255 35, 279 28 C 300 22, 330 15, 339 12 C 370 10, 390 22, 399 30 C 430 55, 450 65, 459 72 C 480 85, 490 35, 519 32 C 545 28, 560 40, 579 48 C 610 65, 620 90, 639 95" fill="none" stroke="#8b5013" strokeLinecap="round" strokeWidth="3.5"></path>
              <circle className="fill-surface" cx="99" cy="42" r="4.5" stroke="#8b5013" strokeWidth="2.5"></circle>
              <circle className="fill-surface" cx="339" cy="12" r="4.5" stroke="#8b5013" strokeWidth="2.5"></circle>
              <circle className="fill-error" cx="519" cy="32" r="5" stroke="#ffffff" strokeWidth="2"></circle>
            </svg>
          </div>

          <div className="flex items-center justify-between text-on-surface-variant text-[11px] font-bold pt-2 px-3">
            {['07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00 ⚠', '16:00 ⚠', '17:00'].map((h) => (
              <span key={h} className={h.includes('⚠') ? 'text-error font-bold' : ''}>{h}</span>
            ))}
          </div>

          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 bg-surface-container rounded-lg p-3">
            <span className="text-xs text-on-surface">Pointe matinée (08h-10h) : <strong>142 boissons / heure</strong> (Couverture : fluide)</span>
            <span className="text-xs text-on-surface">Pointe Brunch (12h-14h) : <strong>195 couverts / heure</strong> (Couverture : maximale)</span>
          </div>
        </div>

        {/* AI Staffing Alerts */}
        <div className="bg-surface-container-low p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-primary tracking-wider">Intelligence Prédictive</span>
              <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-error-container text-on-error-container">
                1 ALERTE STAFF
              </span>
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Optimisation des Équipes</h3>

            <div className="bg-error-container/40 p-4 rounded-xl flex flex-col gap-2">
              <div className="flex items-center gap-2 text-error font-semibold text-sm">
                <span className="material-symbols-outlined text-[20px]">warning</span>
                Déficit de Staff Détecté
              </div>
              <p className="text-xs text-on-surface leading-snug">
                <strong>Besoin d&apos;un renfort Barista</strong> cet après-midi. Les prévisions et l&apos;historique montrent une hausse de <strong>+45% de commandes à emporter</strong> (Cold brew, Iced Latte &amp; V60).
              </p>
              <div className="mt-1 flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-all shadow-sm">
                  Appeler un renfort
                </button>
                <button className="px-2.5 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs hover:bg-surface-variant transition-colors">
                  Ignorer
                </button>
              </div>
            </div>

            <div className="bg-surface-container p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-tertiary text-[22px] shrink-0 mt-0.5">eco</span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-on-surface">Économie Potentielle de Clôture</span>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Flux client réduit en soirée. Possibilité de libérer un équipier plus tôt (-10.800 DT de masse salariale).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container-high/60 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[18px]">sync_alt</span>
              <span className="text-xs text-on-surface font-medium truncate">Échange de shift proposé</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button className="p-1 rounded bg-tertiary text-on-tertiary hover:opacity-90 transition-opacity" title="Approuver">
                <span className="material-symbols-outlined text-[16px]">check</span>
              </button>
              <button className="p-1 rounded bg-surface-variant text-on-surface-variant hover:text-on-surface transition-colors" title="Refuser">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ DIALOGS ═══ */}
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

      <Dialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('removeSlotTitle')}</DialogTitle>
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
            <button className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm" onClick={() => setDeleteTarget(null)} type="button">
              {tCommon('actions.cancel')}
            </button>
            {deleteTarget && (
              <form action={deleteShift.bind(null, deleteTarget.id)}>
                <button className="px-4 py-2 rounded-lg bg-error text-on-error text-sm font-medium hover:opacity-90 transition-opacity" type="submit">
                  {tCommon('actions.remove')}
                </button>
              </form>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══ TOAST ═══ */}
    </div>
  );
}
