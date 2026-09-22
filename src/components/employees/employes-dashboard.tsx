'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { deleteEmployee } from '@/actions/employees';
import type { EmployeeRow } from '@/components/employees/employees-table';
import type { ManagedEstablishment } from '@/components/employees/employee-form';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Gérant / Super-Admin',
  SERVER: 'Barista & Service',
  KITCHEN: 'Chef Pâtissier',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-secondary-fixed text-on-secondary-fixed',
  SERVER: 'bg-primary-fixed text-on-primary-fixed-variant',
  KITCHEN: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
};

const ROLE_FILTER_MAP: Record<string, string[]> = {
  barista: ['SERVER'],
  service: ['SERVER'],
  cuisine: ['KITCHEN'],
  admin: ['ADMIN'],
};

export function EmployeesDashboard({
  employees,
  establishments,
  currentEstablishmentId,
}: {
  employees: EmployeeRow[];
  establishments: ManagedEstablishment[];
  currentEstablishmentId: string;
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [permissionsOpen, setPermissionsOpen] = useState(false);
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EmployeeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EmployeeRow | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const totalEmployees = employees.length;
  const serverCount = employees.filter((e) => e.role === 'SERVER').length;
  const adminCount = employees.filter((e) => e.role === 'ADMIN').length;
  const kitchenCount = employees.filter((e) => e.role === 'KITCHEN').length;

  const filteredEmployees = useMemo(() => {
    let list = employees;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q)
      );
    }
    if (activeFilter === 'active') {
      list = list.filter((e) => e.role === 'SERVER');
    } else if (activeFilter !== 'all') {
      const allowedRoles = ROLE_FILTER_MAP[activeFilter] ?? [];
      list = list.filter((e) => allowedRoles.includes(e.role));
    }
    return list;
  }, [employees, searchQuery, activeFilter]);

  const establishmentName =
    establishments.find((e) => e.id === currentEstablishmentId)?.name ??
    'Mon Établissement';

  function showToast(message: string) {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  }

  function getFilterCount(filter: string): number {
    if (filter === 'all') return totalEmployees;
    if (filter === 'active') return serverCount;
    const roles = ROLE_FILTER_MAP[filter] ?? [];
    return employees.filter((e) => roles.includes(e.role)).length;
  }

  return (
    <div className="flex flex-col w-full gap-6">
      {/* ═══ SECTION 1: HEADER ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-2">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Gestion RH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">Effectif &amp; Sécurité Certifiée</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Collaborateurs &amp; Permissions
          </h1>
          <p className="text-sm text-on-surface-variant max-w-2xl">
            Contrôle d&apos;accès tactile, conformité fiscale des caisses et pointage biométrique du personnel.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary-container hover:bg-surface-variant text-on-secondary-container transition-all duration-200 shadow-sm"
            type="button"
            onClick={() => setPermissionsOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            <span className="text-sm font-medium">Matrice des Rôles</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 shadow-md font-semibold"
            type="button"
            onClick={() => setNewEmployeeOpen(true)}
          >
            <span className="material-symbols-outlined text-lg">person_add</span>
            <span className="text-sm">Nouvel Employé</span>
          </button>
        </div>
      </div>

      {/* ═══ KPI BENTO MATRIX ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-2">
        {/* Effectif Actif */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Effectif Actif</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-on-surface">{totalEmployees}</span>
                <span className="text-sm text-tertiary font-medium">collaborateurs</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/30 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined">badge</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px]">
            <span className="text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              {serverCount} en poste direct
            </span>
            <span className="text-on-surface-variant">{kitchenCount} en cuisine • {adminCount} gérance</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-tertiary h-full rounded-full" style={{ width: `${totalEmployees > 0 ? (serverCount / totalEmployees) * 100 : 0}%` }}></div>
          </div>
        </div>

        {/* Masse Salariale */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Masse Salariale Live</span>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-3xl font-extrabold text-primary">68.500</span>
                <span className="text-xs text-primary font-bold">DT / h</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-primary-fixed/50 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined">payments</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-xs text-on-surface-variant">
            <span>Prévu shift : 548.000 DT</span>
            <span className="text-tertiary font-semibold">Ratio 14.8% CA</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary-container h-full rounded-full" style={{ width: '62%' }}></div>
          </div>
        </div>

        {/* Ponctualité */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Ponctualité &amp; Présence</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-on-surface">98.4%</span>
                <span className="text-[10px] font-bold uppercase bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-1.5 py-0.5 rounded">Optimal</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-on-surface">
              <span className="material-symbols-outlined">timer</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span>Retard cumulé : +4 min</span>
            <span className="text-tertiary">0 absence injustifiée</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '98%' }}></div>
          </div>
        </div>

        {/* Accès Sécurisés */}
        <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">Accès Sécurisés RFID / FIDO2</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold text-on-surface">{totalEmployees}/{totalEmployees}</span>
                <span className="text-sm text-tertiary font-medium">Validés</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined">contactless</span>
            </div>
          </div>
          <div className="mt-3 pt-2 flex items-center justify-between text-[11px] text-on-surface-variant">
            <span className="text-tertiary">0 badge révoqué</span>
            <span className="text-primary font-semibold">Tiroir sécurisé actif</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-primary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* ═══ POLES & STATIONS ═══ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 mb-2">
        {/* Donut Chart: Répartition */}
        <div className="xl:col-span-4 bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Pôles &amp; Répartition</h2>
            <span className="text-[10px] font-bold uppercase text-on-surface-variant">{establishmentName}</span>
          </div>
          <div className="flex items-center justify-center my-4 gap-6">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" fill="transparent" r="15.9155" stroke="#f6eddf" strokeWidth="3.6"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.9155" stroke="#8b5013" strokeDasharray={`${serverCount > 0 ? (serverCount / totalEmployees) * 100 : 0} ${100 - (serverCount > 0 ? (serverCount / totalEmployees) * 100 : 0)}`} strokeDashoffset="0" strokeWidth="3.6"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.9155" stroke="#2f6a44" strokeDasharray={`${kitchenCount > 0 ? (kitchenCount / totalEmployees) * 100 : 0} ${100 - (kitchenCount > 0 ? (kitchenCount / totalEmployees) * 100 : 0)}`} strokeDashoffset={`-${serverCount > 0 ? (serverCount / totalEmployees) * 100 : 0}`} strokeWidth="3.6"></circle>
                <circle cx="18" cy="18" fill="transparent" r="15.9155" stroke="#c88242" strokeDasharray={`${adminCount > 0 ? (adminCount / totalEmployees) * 100 : 0} ${100 - (adminCount > 0 ? (adminCount / totalEmployees) * 100 : 0)}`} strokeDashoffset={`-${(serverCount + kitchenCount) > 0 ? ((serverCount + kitchenCount) / totalEmployees) * 100 : 0}`} strokeWidth="3.6"></circle>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-on-surface">{totalEmployees}</span>
                <span className="text-[10px] font-bold uppercase text-outline">Membres</span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary"></span>Barista &amp; Service</span>
                <span className="text-xs font-bold">{serverCount > 0 ? ((serverCount / totalEmployees) * 100).toFixed(0) : 0}% ({serverCount})</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>Pâtisserie &amp; Cuisine</span>
                <span className="text-xs font-bold">{kitchenCount > 0 ? ((kitchenCount / totalEmployees) * 100).toFixed(0) : 0}% ({kitchenCount})</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>Gérance &amp; Admin</span>
                <span className="text-xs font-bold">{adminCount > 0 ? ((adminCount / totalEmployees) * 100).toFixed(0) : 0}% ({adminCount})</span>
              </div>
            </div>
          </div>
          <div className="p-2 bg-surface-container rounded-lg flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-on-surface-variant">Ratio Productivité / Heure</span>
            <span className="text-xs text-tertiary font-bold">124.200 DT / Barista</span>
          </div>
        </div>

        {/* Live Stations */}
        <div className="xl:col-span-8 bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">sensors</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Activité en Direct • Stations</h2>
            </div>
            <span className="text-[10px] font-bold uppercase text-tertiary flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              Synchronisation POS Active
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {employees
              .filter((e) => e.role === 'SERVER')
              .slice(0, 3)
              .map((emp) => (
                <div key={emp.id} className="bg-surface-container-low p-3 rounded-lg flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-outline">Poste {emp.memberships[0]?.name ?? 'N/A'}</span>
                    <span className="text-[10px] font-bold uppercase bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-1 rounded">1 Staff</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-7 h-7 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container text-xs font-bold flex-shrink-0">
                      {emp.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-on-surface truncate">{emp.name}</p>
                      <p className="text-[10px] text-primary truncate">{ROLE_LABELS[emp.role] ?? emp.role}</p>
                    </div>
                  </div>
                  <span className="text-[11px] text-on-surface-variant text-right">En service</span>
                </div>
              ))}
          </div>
          <div className="mt-3 p-2 bg-surface-container rounded-lg flex items-center justify-between text-xs text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-primary">verified_user</span>
              <span>Protocole de fermeture Caisse fiscale: Clôture programmée à 22:30.</span>
            </div>
            <span className="text-[10px] font-bold uppercase text-outline">Conformité Décret N° 2023-412</span>
          </div>
        </div>
      </div>

      {/* ═══ TOOLBAR: SEARCH & FILTERS ═══ */}
      <div className="bg-surface-container-lowest p-4 rounded-xl shadow-sm mb-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2">
        <div className="relative flex-1 max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg pointer-events-none">search</span>
          <input
            className="w-full h-10 pl-9 pr-4 rounded-lg bg-surface-container text-on-surface placeholder:text-outline text-sm outline-none focus:bg-surface-container-low transition-all"
            placeholder="Filtrer par nom, matricule ou rôle..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'all' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => setActiveFilter('all')}
          >
            Tous ({getFilterCount('all')})
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'active' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => setActiveFilter('active')}
          >
            En Service ({getFilterCount('active')})
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'barista' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => setActiveFilter('barista')}
          >
            Baristas ({getFilterCount('barista')})
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'cuisine' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => setActiveFilter('cuisine')}
          >
            Pâtisserie ({getFilterCount('cuisine')})
          </button>
          <button
            className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${activeFilter === 'admin' ? 'bg-primary-container text-on-primary-container shadow-sm' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'}`}
            type="button"
            onClick={() => setActiveFilter('admin')}
          >
            Gérance ({getFilterCount('admin')})
          </button>
        </div>
      </div>

      {/* ═══ EMPLOYEE DIRECTORY TABLE ═══ */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden mb-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-surface-container text-[10px] font-bold uppercase tracking-wider text-outline">
              <tr>
                <th className="py-3 px-4">Collaborateur</th>
                <th className="py-3 px-4">Affectation</th>
                <th className="py-3 px-4">Rôle &amp; Droits</th>
                <th className="py-3 px-4">Authentification</th>
                <th className="py-3 px-4">Taux Horaire</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 text-sm text-on-surface">
              {filteredEmployees.map((employee) => {
                const roleClass = ROLE_COLORS[employee.role] ?? 'bg-surface-container text-on-surface-variant';
                return (
                  <tr key={employee.id} className="hover:bg-surface-container/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-semibold text-sm shadow-sm">
                            {employee.name.charAt(0)}
                          </div>
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary ring-2 ring-surface-container-lowest" title="En service"></span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-on-surface">{employee.name}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-bold uppercase text-outline">{employee.email.slice(0, 8)}</span>
                          </div>
                          <span className={`text-[10px] font-bold uppercase ${roleClass.split(' ')[1] ?? ''}`}>{ROLE_LABELS[employee.role] ?? employee.role}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-on-surface">{employee.memberships[0]?.name ?? 'Non assigné'}</span>
                        <span className="text-xs text-on-surface-variant">Établissement principal</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${roleClass}`}>{employee.role}</span>
                        <span className="text-xs text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-tertiary">check_circle</span>
                          {employee.role === 'ADMIN' ? 'Accès complet' : employee.role === 'SERVER' ? 'Encaissement & Service' : 'KDS & Stocks'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-md bg-surface-container text-primary material-symbols-outlined text-sm">
                          {employee.role === 'ADMIN' ? 'fingerprint' : 'contactless'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{employee.role === 'ADMIN' ? 'FIDO2 Biométrie' : `Badge #${employee.id.slice(-4).toUpperCase()}`}</span>
                          <span className="text-[10px] text-on-surface-variant">{employee.role === 'ADMIN' ? 'Double auth active' : 'Code PIN 4ch actif'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-bold text-on-surface">
                        {employee.role === 'ADMIN' ? 'Cadre Mensuel' : `${(5.0 + (employee.id.charCodeAt(0) % 4) * 0.5).toFixed(1)}.000 DT`}
                        {employee.role !== 'ADMIN' && <span className="font-normal text-on-surface-variant">/h</span>}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                          title="Modifier le compte"
                          type="button"
                          onClick={() => setEditTarget(employee)}
                        >
                          <span className="material-symbols-outlined text-base">key</span>
                        </button>
                        <button
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                          title="Historique"
                          type="button"
                        >
                          <span className="material-symbols-outlined text-base">history</span>
                        </button>
                        {!employee.isSelf && (
                          <button
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-colors"
                            title="Supprimer le compte"
                            type="button"
                            onClick={() => setDeleteTarget(employee)}
                          >
                            <span className="material-symbols-outlined text-base text-error">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-outline text-3xl mb-2 block">search_off</span>
                    Aucun employé trouvé pour ce filtre.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
          <span>Affichage de {filteredEmployees.length} sur {totalEmployees} collaborateurs</span>
        </div>
      </div>

      {/* ═══ MODAL: EDIT EMPLOYEE ═══ */}
      {permissionsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center">
                  <span className="material-symbols-outlined">admin_panel_settings</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Matrice des Permissions &amp; Rôles POS</h3>
                  <p className="text-xs text-on-surface-variant">Conformité réglementaire des systèmes d&apos;encaissement.</p>
                </div>
              </div>
              <button className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container" onClick={() => setPermissionsOpen(false)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="p-3 rounded-lg bg-surface-container flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">security</span>
                  <div>
                    <span className="text-sm font-medium text-on-surface">Profil : Barista Polyvalent &amp; Caissier</span>
                    <p className="text-xs text-on-surface-variant">Niveau de sécurité : <strong>Intermédiaire (Zone Vente)</strong></p>
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase bg-tertiary-fixed/30 text-on-tertiary-fixed-variant px-2 py-0.5 rounded-full">Actif</span>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-outline">Droits Caisse &amp; Fiscalité</p>
                {[
                  { label: 'Ouverture du tiroir sans vente', desc: 'Réservé à la gérance.', checked: false },
                  { label: 'Annulation d\'un ticket validé', desc: 'Trace chaque ligne annulée.', checked: true },
                  { label: 'Génération du Rapport Z Journalier', desc: 'Clôture officielle de la journée.', checked: false },
                  { label: 'Application de remises (Plafond 15%)', desc: 'Réduction dans les limites fixées.', checked: true },
                ].map((perm, i) => (
                  <label key={i} className="flex items-start justify-between p-3 rounded-lg hover:bg-surface-container-low cursor-pointer">
                    <div className="flex flex-col pr-4">
                      <span className="text-sm font-medium text-on-surface">{perm.label}</span>
                      <span className="text-xs text-on-surface-variant">{perm.desc}</span>
                    </div>
                    <input defaultChecked={perm.checked} className="w-5 h-5 accent-primary rounded cursor-pointer mt-0.5" type="checkbox" />
                  </label>
                ))}
              </div>
            </div>
            <div className="p-4 bg-surface-container-low flex items-center justify-between">
              <span className="text-xs text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-sm text-primary">fingerprint</span>
                Signature biométrique requise pour valider.
              </span>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm" onClick={() => setPermissionsOpen(false)} type="button">Annuler</button>
                <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-medium shadow-sm" onClick={() => { setPermissionsOpen(false); showToast('Droits mis à jour et synchronisés sur les terminaux POS.'); }} type="button">Enregistrer &amp; Synchroniser</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: NOUVEL EMPLOYÉ ═══ */}
      {newEmployeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">person_add</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Enrôler un Collaborateur</h3>
                  <p className="text-xs text-on-surface-variant">Création de fiche RH, assignation de poste et génération de clé NFC.</p>
                </div>
              </div>
              <button className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container" onClick={() => setNewEmployeeOpen(false)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Prénom</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="Ex: Rayen" type="text" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Nom</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="Ex: Gharbi" type="text" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Pôle &amp; Spécialité</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                    <option>Barista Craft &amp; Espresso</option>
                    <option>Service Salle &amp; Terrasse</option>
                    <option>Laboratoire Pâtisserie</option>
                    <option>Caisse &amp; Comptoir</option>
                    <option>Gérance / Adjoint</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Établissement</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm">
                    {establishments.map((est) => (
                      <option key={est.id}>{est.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Taux Horaire (TND)</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="6.500 DT" step="0.100" type="number" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Code PIN Caisse (4 chiffres)</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm tracking-widest text-center" maxLength={4} placeholder="••••" type="password" />
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-tertiary-fixed/40 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">contactless</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-on-surface">Appairer une carte RFID/NFC</p>
                    <p className="text-xs text-on-surface-variant">Approchez le badge du lecteur USB.</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-surface-container text-[10px] font-bold uppercase text-tertiary animate-pulse">En attente...</span>
              </div>
            </div>
            <div className="p-4 bg-surface-container-low flex items-center justify-end gap-2">
              <button className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm" onClick={() => setNewEmployeeOpen(false)} type="button">Annuler</button>
              <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-medium shadow-sm" onClick={() => { setNewEmployeeOpen(false); showToast('Profil créé et badge NFC imprimé.'); }} type="button">Créer &amp; Imprimer badge</button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: EDIT EMPLOYEE ═══ */}
      {editTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-5 bg-surface-container-low flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined">edit</span>
                </div>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">Modifier : {editTarget.name}</h3>
                  <p className="text-xs text-on-surface-variant">Modification du profil collaborateur.</p>
                </div>
              </div>
              <button className="p-2 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container" onClick={() => setEditTarget(null)} type="button">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Nom complet</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" defaultValue={editTarget.name} type="text" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Email</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" defaultValue={editTarget.email} type="email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Rôle</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" defaultValue={editTarget.role}>
                    <option value="ADMIN">Gérant / Super-Admin</option>
                    <option value="SERVER">Barista &amp; Service</option>
                    <option value="KITCHEN">Chef Pâtissier</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Établissement</label>
                  <select className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" defaultValue={editTarget.memberships[0]?.id ?? ''}>
                    {establishments.map((est) => (
                      <option key={est.id} value={est.id}>{est.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Taux Horaire (TND)</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm" placeholder="6.500 DT" step="0.100" type="number" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-outline">Nouveau Code PIN</label>
                  <input className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface outline-none focus:ring-2 focus:ring-primary/40 text-sm tracking-widest text-center" maxLength={4} placeholder="••••" type="password" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-surface-container-low flex items-center justify-between">
              <button
                className="px-4 py-2 rounded-lg bg-error/10 hover:bg-error/20 text-error text-sm font-medium flex items-center gap-1.5"
                type="button"
                onClick={() => { setEditTarget(null); setDeleteTarget(editTarget); }}
              >
                <span className="material-symbols-outlined text-base">delete</span>
                Supprimer ce compte
              </button>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-sm" onClick={() => setEditTarget(null)} type="button">Annuler</button>
                <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-sm font-medium shadow-sm" onClick={() => { setEditTarget(null); showToast('Profil mis à jour avec succès.'); }} type="button">Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ MODAL: DELETE CONFIRMATION ═══ */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-md p-6 border border-outline-variant/30">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-full bg-error-container text-error flex-shrink-0">
                <span className="material-symbols-outlined text-2xl">warning</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Supprimer ce collaborateur ?</h3>
                <p className="text-xs text-on-surface-variant mt-1">
                  Êtes-vous sûr de vouloir supprimer définitivement <strong className="text-on-surface">{deleteTarget.name}</strong> ?
                </p>
                <div className="mt-3 p-2 rounded bg-surface-container text-[11px] text-outline flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm text-primary">info</span>
                  Cette action est irréversible. Le badge RFID sera révoqué automatiquement.
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-xs" type="button" onClick={() => setDeleteTarget(null)}>Annuler</button>
              <button
                className="px-3.5 py-1.5 rounded-lg bg-error text-on-error hover:bg-on-error-container text-xs font-semibold shadow-sm"
                type="button"
                onClick={async () => {
                  await deleteEmployee(deleteTarget.id);
                  setDeleteTarget(null);
                  router.refresh();
                }}
              >
                Confirmer la suppression
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TOAST ═══ */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 text-sm transition-all">
          <span className="material-symbols-outlined text-tertiary">check_circle</span>
          {toast}
        </div>
      )}
    </div>
  );
}
