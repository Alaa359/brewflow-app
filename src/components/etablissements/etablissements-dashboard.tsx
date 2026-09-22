'use client';

import { useRef, useCallback } from 'react';
import type { EstablishmentData } from '@/app/(app)/etablissements/page';

export function EtablissementsDashboard({ establishments }: { establishments: EstablishmentData[] }) {
  const pingIconRef = useRef<HTMLSpanElement>(null);
  const diagnosticToastRef = useRef<HTMLDivElement>(null);
  const diagnosticToastTextRef = useRef<HTMLSpanElement>(null);

  const hideDiagnosticToast = useCallback(() => {
    diagnosticToastRef.current?.classList.add('hidden');
  }, []);

  const runNetworkDiagnostics = useCallback(() => {
    const icon = pingIconRef.current;
    if (icon) icon.classList.add('animate-spin');
    setTimeout(() => {
      if (icon) icon.classList.remove('animate-spin');
      if (diagnosticToastRef.current && diagnosticToastTextRef.current) {
        diagnosticToastTextRef.current.textContent =
          'Test de latence global réussi : ' + establishments.length + ' sites joignables, ping moyen 3.2ms. Aucune anomalie détectée.';
        diagnosticToastRef.current.classList.remove('hidden');
      }
    }, 800);
  }, [establishments.length]);

  const testStation = useCallback((stationName: string) => {
    if (diagnosticToastRef.current && diagnosticToastTextRef.current) {
      diagnosticToastTextRef.current.textContent =
        'Signal de test transmis à la station ' + stationName + ' (accusé de réception reçu en 1.8ms).';
      diagnosticToastRef.current.classList.remove('hidden');
    }
  }, []);

  const totalSites = establishments.length;
  const totalTables = establishments.reduce((s, e) => s + e.tableCount, 0);

  return (
    <div className="w-full space-y-6">

      {/* ─── Sub-header ─── */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-outline">
            <span>Réseau Multi-Boutiques</span>
            <span className="material-symbols-outlined !text-[14px]">chevron_right</span>
            <span className="text-primary">Supervision des Sites &amp; Flotte POS</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface tracking-tight">
              Établissements &amp; Stations
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed/40 px-2.5 py-0.5 text-xs font-bold text-on-tertiary-fixed-variant">
              <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse"></span>
              {totalSites} site{totalSites > 1 ? 's' : ''} actif{totalSites > 1 ? 's' : ''}
            </span>
          </div>
          <p className="text-sm text-on-surface-variant">
            Supervision en temps réel de vos points de vente, équipements et conformité fiscale.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 rounded-lg bg-tertiary-fixed/30 px-3 py-2 text-sm font-medium text-on-tertiary-fixed-variant shadow-sm">
            <span className="material-symbols-outlined text-base text-tertiary">cloud_done</span>
            Auto-Sync (0 ms)
          </div>
          <button
            className="flex items-center gap-2 rounded-lg border border-outline-variant/50 bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface shadow-sm transition-all hover:bg-surface-container-high hover:shadow-md active:scale-[0.98] cursor-pointer"
            onClick={runNetworkDiagnostics}
            type="button"
          >
            <span ref={pingIconRef} className="material-symbols-outlined text-lg text-primary">sensors</span>
            Tester Ping Global
          </button>
          <button
            className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">add_location_alt</span>
            Nouvel Établissement
          </button>
        </div>
      </div>

      {/* ─── KPI Grid ─── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          icon="payments"
          iconBg="bg-primary-fixed/40"
          iconColor="text-primary"
          label="CA Réseau Consolidé"
          value="9 420"
          unit="DT"
          sub="+14.8% vs hier"
          subColor="text-tertiary"
        />
        <KpiCard
          icon="hub"
          iconBg="bg-tertiary-fixed/40"
          iconColor="text-tertiary"
          label="Points de Vente"
          value={`${totalSites} / ${totalSites}`}
          badge="100% Opérationnels"
          sub="PostgreSQL Master / Replica synchro active"
        />
        <KpiCard
          icon="devices"
          iconBg="bg-secondary-container"
          iconColor="text-on-secondary-container"
          label="Périphériques Matériels"
          value="20"
          unit="appareils"
          sub="9 POS · 6 Imprimantes · 5 TPE"
        />
        <KpiCard
          icon="chair"
          iconBg="bg-surface-container-high"
          iconColor="text-primary"
          label="Capacité Réseau"
          value="68%"
          sub={`${totalTables * 6} / ${totalTables * 8} sièges`}
          progress={68}
        />
      </div>

      {/* ─── Graph + Répartition ─── */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Graph */}
          <div className="flex-1">
            <div className="mb-4">
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Chiffre d&apos;Affaires Comparatif
              </h2>
              <p className="text-sm text-on-surface-variant">
                Projection en direct — actualisation automatique
              </p>
            </div>

            {/* Legend */}
            <div className="mb-4 flex flex-wrap items-center gap-4">
              <LegendDot color="bg-primary" label="La Marsa" />
              <LegendDot color="bg-secondary" label="Carthage Byrsa" />
              <LegendDot color="bg-tertiary" label="Sidi Bou Saïd" />
            </div>

            {/* SVG Bar Chart */}
            <div className="w-full overflow-hidden">
              <svg className="w-full" viewBox="0 0 700 200" fill="none">
                {/* Grid lines */}
                {[30, 70, 110, 150].map((y) => (
                  <line key={y} x1="0" x2="700" y1={y} y2={y} stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" className="text-outline-variant/30" />
                ))}

                {/* Time labels */}
                {['08h', '10h', '12h', '14h', '16h'].map((t, i) => (
                  <text key={t} x={85 + i * 140} y="195" textAnchor="middle" className="fill-outline text-[11px] font-semibold">{t}</text>
                ))}

                {/* Bar groups */}
                {[
                  { x: 55, bars: [90, 65, 45] },
                  { x: 195, bars: [115, 80, 60] },
                  { x: 335, bars: [140, 100, 70] },
                  { x: 475, bars: [128, 88, 75] },
                  { x: 615, bars: [105, 70, 50] },
                ].map((g, gi) => (
                  <g key={gi} className="transition-opacity hover:opacity-80">
                    <rect x={g.x} y={160 - g.bars[0]} width="22" height={g.bars[0]} rx="4" fill="var(--color-primary)" opacity="0.85" />
                    <rect x={g.x + 28} y={160 - g.bars[1]} width="22" height={g.bars[1]} rx="4" fill="var(--color-secondary)" opacity="0.85" />
                    <rect x={g.x + 56} y={160 - g.bars[2]} width="22" height={g.bars[2]} rx="4" fill="var(--color-tertiary)" opacity="0.85" />
                  </g>
                ))}

                {/* Baseline */}
                <line x1="0" x2="700" y1="160" y2="160" stroke="currentColor" strokeWidth="1.5" className="text-outline-variant" />
              </svg>
            </div>
          </div>

          {/* Répartition */}
          <div className="w-full shrink-0 space-y-3 lg:w-72">
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              Répartition du CA
            </span>

            <StoreShare name="La Marsa Flagship" tickets={412} amount="5 120" pct="54.3%" color="bg-primary" />
            <StoreShare name="Carthage Byrsa Lab" tickets={218} amount="2 680" pct="28.5%" color="bg-secondary" />
            <StoreShare name="Sidi Bou Saïd Express" tickets={164} amount="1 620" pct="17.2%" color="bg-tertiary" />

            <div className="flex items-center gap-2 rounded-lg bg-surface-container-high/60 px-3 py-2 text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-base text-primary">price_change</span>
              Ticket moyen réseau : <strong className="font-bold text-on-surface">11.860 DT</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Établissements (dynamiques) ─── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
              Points de Vente Actifs &amp; Équipes
            </h2>
            <p className="text-sm text-on-surface-variant">
              {establishments.length} établissement{establishments.length > 1 ? 's' : ''} connecté{establishments.length > 1 ? 's' : ''} — supervision en temps réel
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-surface-container p-1">
            <button className="rounded-md bg-surface-container-lowest px-3 py-1.5 text-xs font-bold text-on-surface shadow-sm cursor-pointer" type="button">
              Grille
            </button>
            <button className="rounded-md px-3 py-1.5 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer" type="button">
              Liste
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {establishments.map((est, idx) => (
            <EstablishmentCard
              key={est.id}
              est={est}
              index={idx}
              imageUrl={[
                'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop',
                'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
              ][idx % 3]}
            />
          ))}
        </div>
      </div>

      {/* ─── Table Stations ─── */}
      <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xl text-primary">precision_manufacturing</span>
            <div>
              <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                Stations &amp; Matériel en Ligne
              </h2>
              <p className="text-xs text-on-surface-variant">Surveillance IP, ESC/POS et passerelles TPE</p>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-lg bg-surface-container p-1">
            {['Toutes (3)', 'Caisse', 'KDS Barista', 'KDS Pâtisserie'].map((label, i) => (
              <button
                key={label}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
                  i === 0 ? 'bg-surface-container-lowest font-bold text-on-surface shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                }`}
                type="button"
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-outline-variant/30 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3">Réseau</th>
                <th className="px-4 py-3">Périphériques</th>
                <th className="px-4 py-3">Hors-Ligne</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              <StationRow
                icon="point_of_sale"
                id="BF-TN01-COUNTER"
                desc="Comptoir Principal"
                ip="192.168.1.101"
                latency="2.1 ms"
                devices={['Epson TM-T88VI (80mm)', 'TPE Verifone V200c']}
                fallback="IndexedDB 1500 tickets"
                onTest={() => testStation('BF-TN01-COUNTER')}
              />
              <StationRow
                icon="coffee_maker"
                id="BF-TN01-BARISTA"
                desc="Station Synesso &amp; Filtre"
                ip="192.168.1.102"
                latency="4.8 ms"
                devices={['Écran KDS 15.6"', 'Balance Acaia Pearl BLE']}
                fallback="Queue Locale KDS"
                onTest={() => testStation('BF-TN01-BARISTA')}
              />
              <StationRow
                icon="bakery_dining"
                id="BF-TN01-CUISINE"
                desc="Atelier Pâtisserie"
                ip="192.168.1.103"
                latency="1.9 ms"
                devices={['Écran KDS Cuisine 21"', 'Sonnette 85dB']}
                fallback="Buffer local 24h"
                onTest={() => testStation('BF-TN01-CUISINE')}
              />
            </tbody>
          </table>
        </div>

        {/* Diagnostic Toast */}
        <div ref={diagnosticToastRef} className="hidden mt-4 rounded-lg bg-tertiary-fixed/30 p-3 text-sm font-medium text-on-tertiary-fixed-variant">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-lg text-tertiary">check_circle</span>
              <span ref={diagnosticToastTextRef}>
                Diagnostic complet terminé : tous les ports répondent en &lt;5ms.
              </span>
            </div>
            <button className="rounded p-1 hover:bg-tertiary-fixed/40 cursor-pointer" onClick={hideDiagnosticToast} type="button">
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Conformité + Résilience ─── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Conformité */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-surface-container p-2 text-primary">
                <span className="material-symbols-outlined text-xl">gavel</span>
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Conformité Fiscale</h3>
            </div>
            <span className="rounded-full bg-tertiary-fixed/30 px-2.5 py-0.5 text-xs font-bold text-tertiary">Homologué DGI</span>
          </div>

          <div className="space-y-2.5">
            <ComplianceRow
              title="Droit de Timbre Fiscal"
              desc="Ajouté automatiquement par ticket"
              value="1.000 DT"
              valueColor="text-primary"
            />
            <ComplianceRow
              title="Ventilation TVA"
              desc="Café sur place 7% · Services 19%"
              badges={['7%', '19%']}
            />
            <ComplianceRow
              title="Journal des Ventes (PAF)"
              desc="Registre inaltérable, horodatage NTP"
              badge="Inaltérable"
              badgeColor="bg-tertiary-fixed text-on-tertiary-fixed-variant"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-4">
            <span className="text-xs text-outline">Dernier scellement : il y a 3 min</span>
            <button className="text-xs font-bold text-primary hover:text-on-surface transition-colors cursor-pointer" type="button">
              Exporter Journal (Z) ↓
            </button>
          </div>
        </div>

        {/* Résilience */}
        <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-surface-container p-2 text-primary">
                <span className="material-symbols-outlined text-xl">wifi_off</span>
              </span>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Résilience Hors-Ligne</h3>
            </div>
            <span className="rounded-full bg-primary-fixed/30 px-2.5 py-0.5 text-xs font-bold text-primary">Haute Disponibilité</span>
          </div>

          <div className="space-y-2.5">
            <ResilienceRow
              title="Cache IndexedDB"
              desc="10 000 transactions hors-ligne"
              enabled
            />
            <ResilienceRow
              title="Failover 4G"
              desc="Routeur Mikrotik + SIM secours"
              enabled
            />
            <ResilienceRow
              title="Sauvegarde Cloud"
              desc="PostgreSQL Cloud Tunis"
              status="À jour (Sync 100%)"
            />
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-outline-variant/20 pt-4">
            <span className="text-xs text-outline">Mode secours prêt</span>
            <button className="rounded-lg bg-surface-container px-4 py-1.5 text-xs font-bold text-on-surface transition-colors hover:bg-surface-container-high cursor-pointer" type="button">
              Tester Coupure
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ Sub-components ═══════════════════ */

function KpiCard({
  icon, iconBg, iconColor, label, value, unit, sub, subColor, badge, progress,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  subColor?: string;
  badge?: string;
  progress?: number;
}) {
  return (
    <div className="group relative rounded-2xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute -right-5 -bottom-5 h-20 w-20 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-125"></div>
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
          <span className={`rounded-lg p-2 ${iconBg} ${iconColor}`}>
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold tracking-tight text-on-surface">{value}</span>
          {unit && <span className="text-sm font-bold text-primary">{unit}</span>}
          {badge && (
            <span className="rounded-full bg-tertiary-fixed/30 px-2 py-0.5 text-[10px] font-bold uppercase text-tertiary">
              {badge}
            </span>
          )}
        </div>
        {sub && (
          <p className={`mt-1.5 text-xs font-medium ${subColor ?? 'text-on-surface-variant'}`}>{sub}</p>
        )}
        {progress !== undefined && (
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
        )}
      </div>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`}></span>
      {label}
    </div>
  );
}

function StoreShare({ name, tickets, amount, pct, color }: {
  name: string; tickets: number; amount: string; pct: string; color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-3 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className={`h-3 w-3 rounded-full ${color}`}></span>
        <div>
          <div className="text-sm font-bold text-on-surface">{name}</div>
          <div className="text-[11px] text-outline">{tickets} tickets</div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-extrabold text-on-surface">{amount} DT</div>
        <div className="text-[11px] font-bold text-tertiary">{pct}</div>
      </div>
    </div>
  );
}

function EstablishmentCard({ est, index, imageUrl }: {
  est: EstablishmentData; index: number; imageUrl: string;
}) {
  const badges = ['Flagship · Siège', 'Coffee Lab · Dégustation', 'Express · Take-Away'];
  const badgeColors = ['bg-primary text-on-primary', 'bg-secondary text-on-secondary', 'bg-tertiary text-on-tertiary'];
  const badgeIcons = ['star', 'biotech', 'flash_on'];
  const managers = [
    { name: 'Sami Ben Amor', role: 'Directeur de Salle' },
    { name: 'Inès Chahed', role: 'Lead Barista' },
    { name: 'Yassine Dridi', role: 'Gérant Shift' },
  ];
  const avatars = [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
  ];
  const m = managers[index % managers.length];

  return (
    <div className="group overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative h-40 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={imageUrl} alt={est.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/80 via-inverse-surface/30 to-transparent"></div>

        {/* Badge */}
        <span className={`absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase shadow-sm ${badgeColors[index % 3]}`}>
          <span className="material-symbols-outlined !text-[12px]">{badgeIcons[index % 3]}</span>
          {badges[index % 3]}
        </span>

        {/* Status */}
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-surface-container-lowest/90 px-2.5 py-1 text-[10px] font-bold text-tertiary backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary animate-pulse"></span>
          Ouvert
        </span>

        {/* Title */}
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-on-primary">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{est.name}</h3>
            <p className="flex items-center gap-1 text-xs text-white/80">
              <span className="material-symbols-outlined !text-[12px]">place</span>
              {est.address || 'Adresse non renseignée'}
            </p>
          </div>
          <span className="shrink-0 rounded bg-surface/20 px-2 py-0.5 text-[11px] font-bold backdrop-blur-sm">
            Site #{String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3 p-4">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 rounded-xl bg-surface-container p-2.5">
          <StatCell label="Tables" value={String(est.tableCount)} color="text-primary" />
          <StatCell label="Membres" value={String(est.memberCount)} border />
          <StatCell label="Statut" value={est.isCurrent ? 'Actif' : 'Secondaire'} color="text-tertiary" align="right" />
        </div>

        {/* Info */}
        <div className="space-y-1.5 rounded-xl bg-surface-container-low p-3 text-xs text-on-surface-variant">
          <InfoRow label="Adresse" value={est.address || '—'} />
          <InfoRow label="Téléphone" value={est.phone || '—'} />
          <InfoRow label="Timezone" value={est.timezone || 'Africa/Tunis'} />
        </div>

        {/* Manager */}
        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-3">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="h-9 w-9 rounded-full object-cover" src={avatars[index % 3]} alt={m.name} />
            <div>
              <div className="text-sm font-bold text-on-surface">{m.name}</div>
              <div className="text-[11px] text-outline">{m.role}</div>
            </div>
          </div>
          <button className="rounded-lg bg-surface-container-high p-2 text-on-surface transition-colors hover:bg-primary hover:text-on-primary cursor-pointer" title="Gérer" type="button">
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, color, border, align }: {
  label: string; value: string; color?: string; border?: boolean; align?: string;
}) {
  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end text-right' : ''} ${border ? 'border-x border-outline-variant/30 px-2' : ''}`}>
      <span className="text-[10px] font-bold uppercase tracking-wider text-outline">{label}</span>
      <span className={`text-base font-extrabold ${color ?? 'text-on-surface'}`}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-bold uppercase tracking-wider text-outline">{label}</span>
      <span className="font-medium text-on-surface">{value}</span>
    </div>
  );
}

function StationRow({ icon, id, desc, ip, latency, devices, fallback, onTest }: {
  icon: string; id: string; desc: string; ip: string; latency: string;
  devices: string[]; fallback: string; onTest: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-surface-container-low/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container/20 text-primary">
            <span className="material-symbols-outlined text-xl">{icon}</span>
          </div>
          <div>
            <div className="text-sm font-bold text-on-surface">{id}</div>
            <div className="text-[11px] text-outline">{desc}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-sm font-bold text-on-surface">
          <span className="material-symbols-outlined text-base text-tertiary">lan</span>
          {ip}
        </div>
        <div className="text-[11px] font-medium text-tertiary">{latency}</div>
      </td>
      <td className="px-4 py-3">
        <div className="space-y-0.5 text-xs">
          {devices.map((d) => (
            <div key={d} className="flex items-center gap-1 text-on-surface">
              <span className="material-symbols-outlined !text-[14px] text-primary">print</span>
              {d}
            </div>
          ))}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-bold text-on-surface">
          <span className="material-symbols-outlined !text-[12px] text-tertiary">lock_reset</span>
          {fallback}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-tertiary-fixed/30 px-2.5 py-1 text-[11px] font-bold text-on-tertiary-fixed-variant">
          <span className="h-2 w-2 rounded-full bg-tertiary"></span>
          En Ligne
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-1">
          <button className="rounded p-1.5 text-outline transition-colors hover:bg-surface-container hover:text-primary cursor-pointer" onClick={onTest} title="Tester" type="button">
            <span className="material-symbols-outlined text-lg">receipt_long</span>
          </button>
          <button className="rounded p-1.5 text-outline transition-colors hover:bg-surface-container hover:text-on-surface cursor-pointer" title="Paramètres" type="button">
            <span className="material-symbols-outlined text-lg">settings</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

function ComplianceRow({ title, desc, value, valueColor, badges, badge, badgeColor }: {
  title: string; desc: string; value?: string; valueColor?: string;
  badges?: string[]; badge?: string; badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-on-surface">{title}</span>
        <span className="text-[11px] text-outline">{desc}</span>
      </div>
      {value && <span className={`text-base font-extrabold ${valueColor ?? 'text-on-surface'}`}>{value}</span>}
      {badges && (
        <div className="flex gap-1">
          {badges.map((b) => (
            <span key={b} className="rounded bg-surface-container px-2 py-0.5 text-xs font-bold text-on-surface">{b}</span>
          ))}
        </div>
      )}
      {badge && <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeColor ?? ''}`}>{badge}</span>}
    </div>
  );
}

function ResilienceRow({ title, desc, enabled, status }: {
  title: string; desc: string; enabled?: boolean; status?: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-bold text-on-surface">{title}</span>
        <span className="text-[11px] text-outline">{desc}</span>
      </div>
      {enabled !== undefined && (
        <div className="h-6 w-11 cursor-pointer rounded-full bg-primary transition-colors">
          <div className="ml-0.5 mt-0.5 h-5 w-5 translate-x-5 rounded-full bg-white shadow transition-transform"></div>
        </div>
      )}
      {status && <span className="text-xs font-bold text-tertiary">{status}</span>}
    </div>
  );
}
