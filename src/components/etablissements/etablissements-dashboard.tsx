'use client';

import { useRef, useCallback } from 'react';

export function EtablissementsDashboard() {
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
          'Test de latence global réussi : 3 sites joignables, ping moyen 3.2ms. Aucune anomalie détectée.';
        diagnosticToastRef.current.classList.remove('hidden');
      }
    }, 800);
  }, []);

  const testStation = useCallback((stationName: string) => {
    if (diagnosticToastRef.current && diagnosticToastTextRef.current) {
      diagnosticToastTextRef.current.textContent =
        'Signal de test transmis à la station ' + stationName + ' (accusé de réception reçu en 1.8ms).';
      diagnosticToastRef.current.classList.remove('hidden');
    }
  }, []);

  return (
    <div className="w-full">
      {/* Sub-header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex flex-col">
          <div className="flex items-center gap-1 text-outline font-label-caps text-label-caps uppercase tracking-widest mb-1">
            <span>Réseau Multi-Boutiques</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-primary font-semibold">Supervision des Sites &amp; Flotte POS</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Établissements &amp; Stations
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant font-label-caps text-label-caps">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              Cluster Sync Master
            </span>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface text-sm shadow-sm">
            <span className="material-symbols-outlined text-tertiary text-lg">cloud_done</span>
            <span className="font-label-numeric text-label-numeric font-medium">Auto-Sync (IndexedDB • 0 ms)</span>
          </div>
          <button
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-highest text-on-surface transition-all duration-150 shadow-sm cursor-pointer"
            onClick={runNetworkDiagnostics}
            type="button"
          >
            <span ref={pingIconRef} className="material-symbols-outlined text-lg text-primary">sensors</span>
            <span className="font-label-md text-label-md">Tester Ping Global</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all duration-150 shadow-md hover:shadow-lg cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-lg">add_location_alt</span>
            <span>Nouvel Établissement</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {/* KPI 1 */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/5 pointer-events-none group-hover:scale-125 transition-transform duration-300"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">CA Réseau Consolidé</span>
            <span className="p-2 rounded-lg bg-primary-fixed/40 text-primary">
              <span className="material-symbols-outlined text-xl">payments</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-metric-display text-metric-display text-on-surface tracking-tight">9 420.000</span>
              <span className="font-headline-sm text-headline-sm text-primary font-bold">DT</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-0.5 text-tertiary font-label-numeric text-label-numeric font-semibold">
                <span className="material-symbols-outlined text-sm">trending_up</span> +14.8%
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">vs hier (La Marsa 54.3%)</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">État des Points de Vente</span>
            <span className="p-2 rounded-lg bg-tertiary-fixed/40 text-tertiary">
              <span className="material-symbols-outlined text-xl">hub</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-metric-display text-metric-display text-on-surface">3 / 3</span>
              <span className="font-label-caps text-label-caps text-tertiary px-2 py-0.5 rounded-full bg-tertiary-fixed/30 uppercase">100% Opérationnels</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">PostgreSQL Master / Replica Tunis-DC synchro active</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Périphériques Matériels</span>
            <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-container">
              <span className="material-symbols-outlined text-xl">devices</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-metric-display text-metric-display text-on-surface">20</span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase">Périphériques</span>
            </div>
            <div className="flex items-center gap-1 text-sm font-label-numeric text-label-numeric text-on-surface-variant">
              <span>9 POS</span><span>•</span><span>6 Imprimantes ESC/POS</span><span>•</span><span>5 TPE</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Capacité &amp; Affluence Réseau</span>
            <span className="p-2 rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-xl">chair</span>
            </span>
          </div>
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-metric-display text-metric-display text-on-surface">68%</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Moyenne (142 / 210 sièges)</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-surface-container-high overflow-hidden">
              <div className="h-full bg-primary-container rounded-full" style={{ width: '68%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Chart & Breakdown */}
      <div className="p-5 rounded-xl bg-surface-container-lowest shadow-sm mb-6 flex flex-col lg:flex-row gap-6 items-stretch">
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Chiffre d&apos;Affaires Comparatif par Établissement</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Projection de la journée en direct (Actualisation automatique chaque minute)</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>La Marsa
              </div>
              <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>Carthage Byrsa
              </div>
              <div className="flex items-center gap-1.5 font-label-caps text-label-caps text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span>Sidi Bou Saïd
              </div>
            </div>
          </div>

          <div className="w-full h-48 relative">
            <svg className="w-full h-full" fill="none" preserveAspectRatio="none" viewBox="0 0 680 180">
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="680" y1="30" y2="30"></line>
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="680" y1="80" y2="80"></line>
              <line className="text-surface-container-highest" stroke="currentColor" strokeDasharray="4 4" strokeWidth="1" x1="0" x2="680" y1="130" y2="130"></line>

              <g className="transition-all hover:opacity-80 cursor-pointer">
                <rect className="fill-primary-container" height="90" rx="4" width="22" x="50" y="70"></rect>
                <rect className="fill-secondary" height="65" rx="4" width="22" x="76" y="95"></rect>
                <rect className="fill-tertiary-container" height="45" rx="4" width="22" x="102" y="115"></rect>
              </g>
              <g className="transition-all hover:opacity-80 cursor-pointer">
                <rect className="fill-primary-container" height="115" rx="4" width="22" x="180" y="45"></rect>
                <rect className="fill-secondary" height="80" rx="4" width="22" x="206" y="80"></rect>
                <rect className="fill-tertiary-container" height="60" rx="4" width="22" x="232" y="100"></rect>
              </g>
              <g className="transition-all hover:opacity-80 cursor-pointer">
                <rect className="fill-primary-container" height="140" rx="4" width="22" x="310" y="20"></rect>
                <rect className="fill-secondary" height="100" rx="4" width="22" x="336" y="60"></rect>
                <rect className="fill-tertiary-container" height="70" rx="4" width="22" x="362" y="90"></rect>
              </g>
              <g className="transition-all hover:opacity-80 cursor-pointer">
                <rect className="fill-primary-container" height="128" rx="4" width="22" x="440" y="32"></rect>
                <rect className="fill-secondary" height="88" rx="4" width="22" x="466" y="72"></rect>
                <rect className="fill-tertiary-container" height="75" rx="4" width="22" x="492" y="85"></rect>
              </g>
              <g className="transition-all hover:opacity-80 cursor-pointer">
                <rect className="fill-primary-container" height="105" rx="4" width="22" x="570" y="55"></rect>
                <rect className="fill-secondary" height="70" rx="4" width="22" x="596" y="90"></rect>
                <rect className="fill-tertiary-container" height="50" rx="4" width="22" x="622" y="110"></rect>
              </g>

              <line className="text-outline-variant" stroke="currentColor" strokeWidth="1.5" x1="20" x2="660" y1="160" y2="160"></line>
            </svg>
            <div className="flex justify-between px-6 pt-2 font-label-caps text-label-caps text-outline">
              <span>08h - 10h</span><span>10h - 12h</span><span>12h - 14h (Rush)</span><span>14h - 16h</span><span>16h - En cours</span>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-80 flex flex-col justify-between gap-3 bg-surface-container rounded-xl p-4">
          <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider">Répartition du Chiffre d&apos;Affaires</span>

          <div className="p-3 rounded-lg bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-container"></div>
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">1. La Marsa Flagship</div>
                <div className="font-body-sm text-body-sm text-outline">412 tickets réglés</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-label-numeric text-label-numeric text-primary font-bold">5 120.000 DT</div>
              <div className="font-label-caps text-label-caps text-tertiary">54.3%</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary"></div>
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">2. Carthage Byrsa Lab</div>
                <div className="font-body-sm text-body-sm text-outline">218 tickets réglés</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-label-numeric text-label-numeric text-on-surface font-bold">2 680.000 DT</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant">28.5%</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-container-lowest flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-tertiary-container"></div>
              <div>
                <div className="font-label-md text-label-md text-on-surface font-semibold">3. Sidi Bou Saïd Express</div>
                <div className="font-body-sm text-body-sm text-outline">164 tickets réglés</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-label-numeric text-label-numeric text-on-surface font-bold">1 620.000 DT</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant">17.2%</div>
            </div>
          </div>

          <div className="p-2 rounded-lg bg-surface-container-high/60 flex items-center gap-2 text-on-surface-variant">
            <span className="material-symbols-outlined text-base text-primary">price_change</span>
            <span className="font-label-caps text-label-caps">Ticket moyen réseau : <strong className="text-on-surface font-label-numeric">11.860 DT</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 2: Store Cards */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Points de Vente Actifs &amp; Équipes</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Supervision physique, responsables de service et conformité légale</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant transition-colors cursor-pointer" title="Vue grille" type="button">
              <span className="material-symbols-outlined text-lg">grid_view</span>
            </button>
            <button className="p-2 rounded-lg bg-surface-container-lowest text-primary shadow-sm cursor-pointer" title="Vue liste détaillée" type="button">
              <span className="material-symbols-outlined text-lg">view_list</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Store 1: La Marsa */}
          <StoreCard
            image="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop"
            badge="Flagship • Siège"
            badgeStyle="bg-primary-container text-on-primary"
            badgeIcon="star"
            status="Ouvert • 07:00 - 23:00"
            name="La Marsa Roastery"
            address="Avenue Habib Bourguiba, La Marsa Plage"
            siteNumber="Site #01"
            caJour="5 120 DT"
            tickets="412 cmd"
            moyen="12.420 DT"
            occupation="78% (51 / 65 places)"
            occupationPercent={78}
            occupationColor="bg-primary-container"
            occupationTextColor="text-primary"
            matricule="1489201/A/M/000"
            decret="N° 2021-344 (TVA 7% • Timbre 1.000 DT)"
            cle="Active [0x9F4C...B21]"
            managerName="Sami Ben Amor"
            managerRole="Directeur de Salle • +216 71 740 011"
            managerAvatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face"
          />

          {/* Store 2: Carthage Byrsa */}
          <StoreCard
            image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&h=400&fit=crop"
            badge="Coffee Lab • Dégustation"
            badgeStyle="bg-secondary text-on-secondary"
            badgeIcon="biotech"
            status="Ouvert • 08:00 - 21:00"
            name="Carthage Byrsa Coffee Lab"
            address="Colline de Byrsa, Site Archéologique, Carthage"
            siteNumber="Site #02"
            caJour="2 680 DT"
            tickets="218 cmd"
            moyen="12.290 DT"
            occupation="54% (27 / 50 places)"
            occupationPercent={54}
            occupationColor="bg-secondary"
            occupationTextColor="text-secondary"
            matricule="1489201/A/M/001"
            decret="N° 2021-344 (TVA 7% • Timbre 1.000 DT)"
            cle="Active [0x4E7A...C89]"
            managerName="Inès Chahed"
            managerRole="Lead Barista • +216 71 731 440"
            managerAvatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face"
          />

          {/* Store 3: Sidi Bou Said */}
          <StoreCard
            image="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop"
            badge="Express • Take-Away"
            badgeStyle="bg-tertiary text-on-tertiary"
            badgeIcon="flash_on"
            status="Ouvert • 07:30 - 22:00"
            name="Sidi Bou Saïd Express"
            address="Rue Habib Thameur, Sidi Bou Saïd"
            siteNumber="Site #03"
            caJour="1 620 DT"
            tickets="164 cmd"
            moyen="9.870 DT"
            occupation="65% (13 / 20 chaises)"
            occupationPercent={65}
            occupationColor="bg-tertiary-container"
            occupationTextColor="text-tertiary"
            matricule="1489201/A/M/002"
            decret="N° 2021-344 (TVA 7% • Timbre 1.000 DT)"
            cle="Active [0x1D8E...F44]"
            managerName="Yassine Dridi"
            managerRole="Gérant Shift • +216 71 748 902"
            managerAvatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
          />
        </div>
      </div>

      {/* SECTION 3: Station Table */}
      <div className="rounded-xl bg-surface-container-lowest shadow-sm p-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">precision_manufacturing</span>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Stations &amp; Matériel en Ligne (La Marsa Roastery - Actif)</h2>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Surveillance IP, protocoles d&apos;impression ESC/POS et passerelles TPE Bluetooth</p>
          </div>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-container">
            <button className="px-3 py-1.5 rounded-md bg-surface-container-lowest font-label-md text-label-md text-on-surface shadow-sm font-semibold cursor-pointer" type="button">Toutes les stations (3)</button>
            <button className="px-3 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer" type="button">Caisse &amp; POS</button>
            <button className="px-3 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer" type="button">KDS Barista</button>
            <button className="px-3 py-1.5 rounded-md text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer" type="button">KDS Pâtisserie</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low text-on-surface-variant font-label-caps text-label-caps uppercase">
                <th className="py-3 px-4 rounded-l-lg">ID Station &amp; Emplacement</th>
                <th className="py-3 px-4">Adresse Réseau &amp; Ping</th>
                <th className="py-3 px-4">Périphériques Associés</th>
                <th className="py-3 px-4">Mode Hors-Ligne (Fallback)</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {/* Station 1 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">point_of_sale</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">BF-TN01-COUNTER</span>
                      <span className="font-body-sm text-body-sm text-outline">Comptoir Principal (Tiroir sécurisé)</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-label-numeric text-label-numeric">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-tertiary text-base">lan</span>192.168.1.101
                  </div>
                  <span className="text-tertiary font-body-sm text-body-sm">Latence: 2.1 ms</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1 text-sm font-body-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-sm text-primary">print</span>
                      <span>Epson TM-T88VI (Rouleau 80mm OK)</span>
                    </div>
                    <div className="flex items-center gap-1 text-outline">
                      <span className="material-symbols-outlined text-sm">contactless</span>
                      <span>TPE Verifone V200c • Tiroir 24V Actif</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface">
                    <span className="material-symbols-outlined text-xs text-tertiary">lock_reset</span>IndexedDB 1500 tickets
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-label-caps text-label-caps">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>En Ligne
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer" onClick={() => testStation('BF-TN01-COUNTER')} title="Test d&apos;impression et ping" type="button">
                      <span className="material-symbols-outlined text-lg">receipt_long</span>
                    </button>
                    <button className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer" title="Paramètres Station" type="button">
                      <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Station 2 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">coffee_maker</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">BF-TN01-BARISTA</span>
                      <span className="font-body-sm text-body-sm text-outline">Station Extraction Synesso &amp; Filtre</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-label-numeric text-label-numeric">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-tertiary text-base">wifi</span>192.168.1.102
                  </div>
                  <span className="text-tertiary font-body-sm text-body-sm">Latence: 4.8 ms</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1 text-sm font-body-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-sm text-primary">monitor</span>
                      <span>Écran Tactile KDS 15.6&quot;</span>
                    </div>
                    <div className="flex items-center gap-1 text-outline">
                      <span className="material-symbols-outlined text-sm">scale</span>
                      <span>Balance Acaia Pearl BLE Connectée</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface">
                    <span className="material-symbols-outlined text-xs text-tertiary">sync</span>Queue Locale KDS
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-label-caps text-label-caps">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>En Ligne
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer" onClick={() => testStation('BF-TN01-BARISTA')} title="Envoyer commande test" type="button">
                      <span className="material-symbols-outlined text-lg">send</span>
                    </button>
                    <button className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer" title="Paramètres Station" type="button">
                      <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                  </div>
                </td>
              </tr>

              {/* Station 3 */}
              <tr className="hover:bg-surface-container-low/60 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-surface-container text-on-surface flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-xl">bakery_dining</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-md text-label-md font-bold text-on-surface">BF-TN01-CUISINE</span>
                      <span className="font-body-sm text-body-sm text-outline">Atelier Pâtisserie &amp; Brunch</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 font-label-numeric text-label-numeric">
                  <div className="flex items-center gap-1.5 text-on-surface">
                    <span className="material-symbols-outlined text-tertiary text-base">lan</span>192.168.1.103
                  </div>
                  <span className="text-tertiary font-body-sm text-body-sm">Latence: 1.9 ms</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex flex-col gap-1 text-sm font-body-sm">
                    <div className="flex items-center gap-1 text-on-surface">
                      <span className="material-symbols-outlined text-sm text-primary">monitor</span>
                      <span>Écran KDS Cuisine 21&quot;</span>
                    </div>
                    <div className="flex items-center gap-1 text-outline">
                      <span className="material-symbols-outlined text-sm">notifications_active</span>
                      <span>Sonnette Sonore Buzzer 85dB</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container font-label-caps text-label-caps text-on-surface">
                    <span className="material-symbols-outlined text-xs text-tertiary">alarm</span>Buffer local 24h
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-fixed/30 text-on-tertiary-fixed-variant font-label-caps text-label-caps">
                    <span className="w-2 h-2 rounded-full bg-tertiary"></span>En Ligne
                  </span>
                </td>
                <td className="py-4 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer" onClick={() => testStation('BF-TN01-CUISINE')} title="Tester le carillon" type="button">
                      <span className="material-symbols-outlined text-lg">campaign</span>
                    </button>
                    <button className="p-1.5 rounded text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer" title="Paramètres Station" type="button">
                      <span className="material-symbols-outlined text-lg">settings</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Diagnostic Toast */}
        <div ref={diagnosticToastRef} className="hidden mt-4 p-3 rounded-lg bg-tertiary-fixed/30 text-on-tertiary-fixed-variant flex items-center justify-between transition-all">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg text-tertiary">check_circle</span>
            <span ref={diagnosticToastTextRef} className="font-body-sm text-body-sm font-medium">
              Diagnostic complet terminé : Tous les ports 9100 (ESC/POS) et 5432 (Postgres) répondent en moins de 5ms.
            </span>
          </div>
          <button className="p-1 rounded text-on-tertiary-fixed-variant hover:bg-tertiary-fixed/40 cursor-pointer" onClick={hideDiagnosticToast} type="button">
            <span className="material-symbols-outlined text-base">close</span>
          </button>
        </div>
      </div>

      {/* SECTION 4: Compliance & Resilience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
        {/* Fiscal Compliance */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-xl">gavel</span>
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Conformité Fiscale Légale • République Tunisienne</h3>
              </div>
              <span className="font-label-caps text-label-caps text-tertiary bg-tertiary-fixed/30 px-2 py-0.5 rounded-full">Homologué DGI</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              Paramètres fiscaux certifiés conformes au Décret d&apos;application des caisses enregistreuses connectées.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Droit de Timbre Fiscal Obligatoire</span>
                  <span className="font-body-sm text-body-sm text-outline">Ajouté automatiquement par ticket émis</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-label-numeric text-label-numeric font-bold text-primary">1.000 DT</span>
                  <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Ventilation TVA Café &amp; Restauration</span>
                  <span className="font-body-sm text-body-sm text-outline">TVA 7% (Café sur place &amp; pâtisserie) / TVA 19% (Services &amp; Merch)</span>
                </div>
                <div className="flex items-center gap-1 font-label-numeric text-label-numeric text-on-surface font-semibold">
                  <span className="px-2 py-0.5 rounded bg-surface-container">7%</span>
                  <span className="px-2 py-0.5 rounded bg-surface-container">19%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Journal des Ventes &amp; Piste d&apos;Audit Fiable (PAF)</span>
                  <span className="font-body-sm text-body-sm text-outline">Registre inaltérable, horodatage certifié NTP Tunisie</span>
                </div>
                <span className="font-label-caps text-label-caps px-2 py-1 rounded bg-tertiary-fixed text-on-tertiary-fixed-variant font-semibold">Inaltérable</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-surface-container flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-outline">Dernier scellement cryptographique : il y a 3 minutes</span>
            <button className="font-label-md text-label-md text-primary hover:text-on-surface font-semibold flex items-center gap-1 transition-colors cursor-pointer" type="button">
              <span>Exporter Journal Fiscale (Z)</span>
              <span className="material-symbols-outlined text-sm">download</span>
            </button>
          </div>
        </div>

        {/* Resilience */}
        <div className="rounded-xl bg-surface-container-lowest shadow-sm p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-surface-container text-primary">
                  <span className="material-symbols-outlined text-xl">wifi_off</span>
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Résilience &amp; Mode Sans Connexion</h3>
              </div>
              <span className="font-label-caps text-label-caps text-primary px-2 py-0.5 rounded-full bg-primary-fixed">Haute Disponibilité</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
              En cas de coupure Internet ou 4G, le service de caisse continue sans interruption. Les encaissements sont stockés localement et synchronisés dès le retour de la liaison.
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Cache Local IndexedDB Haute Capacité</span>
                  <span className="font-body-sm text-body-sm text-outline">Jusqu&apos;à 10 000 transactions hors-ligne avec signatures SHA</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <div className="w-11 h-6 bg-primary rounded-full transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-5 transition-transform mt-0.5 ml-0.5"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Bascule Réseau Automatique (Failover 4G)</span>
                  <span className="font-body-sm text-body-sm text-outline">Routeur Mikrotik avec carte SIM de secours prête</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <div className="w-11 h-6 bg-primary rounded-full transition-colors">
                    <div className="w-5 h-5 bg-white rounded-full translate-x-5 transition-transform mt-0.5 ml-0.5"></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                <div className="flex flex-col">
                  <span className="font-label-md text-label-md text-on-surface font-semibold">Dernière Sauvegarde Cloud Déportée</span>
                  <span className="font-body-sm text-body-sm text-outline">Serveur PostgreSQL Cloud Tunis (14:38 UTC+1)</span>
                </div>
                <span className="font-label-numeric text-label-numeric text-tertiary font-semibold">À jour (Sync 100%)</span>
              </div>
            </div>
          </div>
          <div className="pt-4 mt-4 border-t border-surface-container flex items-center justify-between">
            <span className="font-body-sm text-body-sm text-outline">Mode secours prêt à tout moment</span>
            <button className="px-3.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold transition-colors cursor-pointer" type="button">
              Tester Coupure Réseau
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- StoreCard sub-component ---------- */

type StoreCardProps = {
  image: string;
  badge: string;
  badgeStyle: string;
  badgeIcon: string;
  status: string;
  name: string;
  address: string;
  siteNumber: string;
  caJour: string;
  tickets: string;
  moyen: string;
  occupation: string;
  occupationPercent: number;
  occupationColor: string;
  occupationTextColor: string;
  matricule: string;
  decret: string;
  cle: string;
  managerName: string;
  managerRole: string;
  managerAvatar: string;
};

function StoreCard({
  image, badge, badgeStyle, badgeIcon, status, name, address, siteNumber,
  caJour, tickets, moyen, occupation, occupationPercent, occupationColor, occupationTextColor,
  matricule, decret, cle, managerName, managerRole, managerAvatar,
}: StoreCardProps) {
  return (
    <div className="rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between overflow-hidden relative group hover:shadow-md transition-all">
      <div className="relative h-44 w-full overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          src={image}
          alt={name}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/85 via-inverse-surface/30 to-transparent"></div>
        <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${badgeStyle} font-label-caps text-label-caps uppercase shadow-sm`}>
          <span className="material-symbols-outlined text-xs">{badgeIcon}</span>
          {badge}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md text-tertiary font-label-caps text-label-caps">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          {status}
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-baseline justify-between text-on-primary">
          <div>
            <h3 className="font-headline-sm text-headline-sm font-bold text-white tracking-tight">{name}</h3>
            <p className="font-body-sm text-body-sm text-white/80 flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">place</span>
              {address}
            </p>
          </div>
          <span className="font-label-numeric text-label-numeric font-bold bg-surface/20 px-2 py-0.5 rounded backdrop-blur-sm">{siteNumber}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-container">
          <div className="flex flex-col">
            <span className="font-label-caps text-label-caps text-outline uppercase">CA Jour</span>
            <span className="font-label-numeric text-label-numeric font-bold text-primary">{caJour}</span>
          </div>
          <div className="flex flex-col border-x border-outline-variant/30 px-2">
            <span className="font-label-caps text-label-caps text-outline uppercase">Tickets</span>
            <span className="font-label-numeric text-label-numeric font-bold text-on-surface">{tickets}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="font-label-caps text-label-caps text-outline uppercase">Moyen</span>
            <span className="font-label-numeric text-label-numeric font-bold text-tertiary">{moyen}</span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between font-label-md text-label-md">
            <span className="text-on-surface-variant flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-primary">groups</span>
              Occupation en Direct
            </span>
            <span className={`font-label-numeric text-label-numeric font-semibold ${occupationTextColor}`}>{occupation}</span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div className={`h-full ${occupationColor} rounded-full transition-all duration-500`} style={{ width: `${occupationPercent}%` }}></div>
          </div>
        </div>

        <div className="space-y-1.5 text-sm font-body-sm text-on-surface-variant bg-surface-container-low p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Matricule Fiscal</span>
            <span className="font-label-numeric text-label-numeric font-medium text-on-surface">{matricule}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Décret &amp; TVA</span>
            <span className="font-label-numeric text-label-numeric font-medium text-on-surface">{decret}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-label-caps text-label-caps text-outline uppercase">Clé Scellement SHA-256</span>
            <span className="font-label-numeric text-label-numeric text-tertiary">{cle}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-surface-container">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-9 h-9 rounded-full object-cover" src={managerAvatar} alt={managerName} />
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-surface">{managerName}</span>
              <span className="font-body-sm text-body-sm text-outline">{managerRole}</span>
            </div>
          </div>
          <button className="p-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface transition-colors cursor-pointer" title="Gérer ce point de vente" type="button">
            <span className="material-symbols-outlined text-lg">tune</span>
          </button>
        </div>
      </div>
    </div>
  );
}
