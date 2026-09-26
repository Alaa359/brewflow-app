'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import type { Role } from '@/generated/client';
import {
  KDS_CONTRAST_KEY,
  KDS_SOUND_KEY,
  readKdsPref,
  writeKdsPref,
} from '@/lib/kds-prefs';

export type ProfilRange = { start: string; end: string };

type ProfilCuisineProps = {
  user: { name: string; email: string; role: Role };
  establishmentName: string;
  establishmentPhone: string | null;
  memberCount: number;
  dayName: string;
  todayRanges: ProfilRange[];
  onDuty: ProfilRange | null;
  weeklyRanges: ProfilRange[];
};

function formatRanges(ranges: ProfilRange[]): string {
  return ranges.map((range) => `${range.start} – ${range.end}`).join(' · ');
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function PrefToggle({
  checked,
  onToggle,
  icon,
  title,
  description,
}: {
  checked: boolean;
  onToggle: () => void;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-low p-4 transition-colors hover:bg-surface-container">
      <div className="flex items-center gap-4 pr-4">
        <span className="material-symbols-outlined shrink-0 text-xl text-primary">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-on-surface">{title}</p>
          <p className="text-body-sm text-on-surface-variant">{description}</p>
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none ${
          checked ? 'bg-primary-container' : 'bg-surface-container-highest'
        }`}
      >
        <span
          className={`pointer-events-none my-0.5 ml-0.5 inline-block h-5 w-5 transform rounded-full bg-surface-container-lowest shadow-sm transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

export function ProfilCuisine({
  user,
  establishmentName,
  establishmentPhone,
  memberCount,
  dayName,
  todayRanges,
  onDuty,
  weeklyRanges,
}: ProfilCuisineProps) {
  const tRoles = useTranslations('Roles');
  const [soundOn, setSoundOn] = useState(false);
  const [contrastOn, setContrastOn] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSoundOn(readKdsPref(KDS_SOUND_KEY));
    setContrastOn(readKdsPref(KDS_CONTRAST_KEY));
    function onStorage(event: StorageEvent) {
      if (event.key === KDS_SOUND_KEY) setSoundOn(event.newValue === '1');
      if (event.key === KDS_CONTRAST_KEY)
        setContrastOn(event.newValue === '1');
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papiers indisponible
    }
  }

  function toggleSound() {
    const next = !soundOn;
    setSoundOn(next);
    writeKdsPref(KDS_SOUND_KEY, next);
  }

  function toggleContrast() {
    const next = !contrastOn;
    setContrastOn(next);
    writeKdsPref(KDS_CONTRAST_KEY, next);
  }

  const initials = user.name.slice(0, 2).toUpperCase();
  const statusPill = onDuty
    ? { active: true, label: `En poste • ${onDuty.start} – ${onDuty.end}` }
    : todayRanges.length > 0
      ? { active: false, label: `Shift du jour • ${formatRanges(todayRanges)}` }
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-2 py-9">
      {/* Fil d'Ariane & état de session */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 font-label-caps text-label-caps tracking-wider text-on-surface-variant uppercase">
          <span>Comptes &amp; Profils</span>
          <span className="material-symbols-outlined text-sm text-outline">
            chevron_right
          </span>
          <span className="font-bold text-primary">Profil Cuisine</span>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-secondary-fixed px-3 py-1 font-label-caps text-label-caps text-tertiary uppercase sm:self-auto">
          <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
          Session Active &bull; {tRoles(user.role)}
        </span>
      </div>

      {/* Bloc identité principal */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-surface-container-low p-6 shadow-md sm:p-9">
        <div className="pointer-events-none absolute -top-24 -right-24 h-80 w-80 rounded-full bg-primary-container/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-secondary-container/40 blur-2xl" />
        <div className="relative z-10 flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <div className="flex h-36 w-36 items-center justify-center overflow-hidden rounded-full bg-surface-container-highest shadow-xl sm:h-44 sm:w-44">
              <span className="font-headline-lg text-headline-lg font-bold text-primary">
                {initials}
              </span>
            </div>
            {statusPill && (
              <div
                className={`absolute -bottom-2.5 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1 font-label-caps text-label-caps whitespace-nowrap shadow-md uppercase ${
                  statusPill.active ? 'text-tertiary' : 'text-on-surface-variant'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    statusPill.active
                      ? 'animate-pulse bg-tertiary'
                      : 'bg-outline'
                  }`}
                />
                {statusPill.label}
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center text-center md:text-left">
            <div>
              <span className="mb-1 block font-label-caps text-label-caps font-bold tracking-widest text-primary uppercase">
                {establishmentName} &bull; Atelier Cuisine
              </span>
              <h1 className="font-headline-lg text-headline-lg tracking-tight text-on-surface">
                {user.name}
              </h1>
            </div>
            <p className="mt-1 mb-4 text-base font-medium text-on-surface-variant">
              {tRoles(user.role)}
            </p>
            <div className="mb-6 flex flex-wrap items-center justify-center gap-1 md:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1 font-label-caps text-label-caps text-on-surface-variant uppercase">
                <span className="material-symbols-outlined text-sm text-primary">
                  skillet
                </span>
                {tRoles(user.role)}
              </span>
              {todayRanges.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1 font-label-caps text-label-caps text-on-surface-variant uppercase">
                  <span className="material-symbols-outlined text-sm text-tertiary">
                    schedule
                  </span>
                  {capitalize(dayName)} &bull; {formatRanges(todayRanges)}
                </span>
              )}
              {weeklyRanges.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-fixed px-3 py-1 font-label-caps text-label-caps text-on-secondary-container uppercase">
                  {weeklyRanges.length} plages / semaine
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 md:justify-start">
              <Link
                href="/planning"
                className="inline-flex items-center gap-2 rounded-lg bg-surface-container-lowest px-4 py-2.5 text-sm font-medium text-on-surface shadow-sm transition-all duration-200 hover:bg-surface-container active:scale-95"
              >
                <span className="material-symbols-outlined text-lg leading-none text-outline">
                  calendar_today
                </span>
                Mon Planning de Service
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="flex flex-col rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-lg">call</span>
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Coordonn&eacute;es &amp; Contact
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Profil et lignes de la station
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-1">
            <div className="flex items-start justify-between gap-2 rounded-lg bg-surface-container-low p-2">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-lg text-outline">
                  mail
                </span>
                <div>
                  <span className="block font-label-caps text-label-caps text-outline uppercase">
                    Email Professionnel
                  </span>
                  <span className="text-sm font-medium text-on-surface">
                    {user.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                title={copied ? 'Email copié' : "Copier l'email"}
                className="rounded p-1 text-primary transition-colors hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-base">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>

            {establishmentPhone && (
              <div className="flex items-start justify-between gap-2 rounded-lg bg-surface-container-low p-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-outline">
                    smartphone
                  </span>
                  <div>
                    <span className="block font-label-caps text-label-caps text-outline uppercase">
                      T&eacute;l&eacute;phone de la station
                    </span>
                    <span className="font-label-numeric text-label-numeric font-medium text-on-surface">
                      {establishmentPhone}
                    </span>
                  </div>
                </div>
                <span className="self-center rounded bg-secondary-fixed px-2 py-0.5 font-label-caps text-label-caps text-tertiary uppercase">
                  Station
                </span>
              </div>
            )}

            {todayRanges.length > 0 && (
              <div className="flex items-start justify-between gap-2 rounded-lg bg-surface-container-low p-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-outline">
                    today
                  </span>
                  <div>
                    <span className="block font-label-caps text-label-caps text-outline uppercase">
                      Shift du jour ({capitalize(dayName)})
                    </span>
                    <span className="font-label-numeric text-label-numeric font-medium text-on-surface">
                      {formatRanges(todayRanges)}
                    </span>
                  </div>
                </div>
                <span className="self-center rounded bg-surface-container px-2 py-0.5 font-label-caps text-label-caps text-on-surface-variant uppercase">
                  {onDuty ? 'En poste' : 'Planifié'}
                </span>
              </div>
            )}

            {weeklyRanges.length > 0 && (
              <div className="flex items-start justify-between gap-2 rounded-lg bg-surface-container-low p-2">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-lg text-outline">
                    schedule
                  </span>
                  <div>
                    <span className="block font-label-caps text-label-caps text-outline uppercase">
                      Horaires habituels de shift
                    </span>
                    <span className="font-label-numeric text-label-numeric font-medium text-on-surface">
                      {formatRanges(weeklyRanges)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col rounded-xl bg-surface-container-lowest p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-lg">
                restaurant
              </span>
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                &Eacute;quipe &amp; Rattachement
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Station d&apos;effectif et &eacute;tablissement
              </p>
            </div>
          </div>
          <div className="space-y-4 pt-1">
            <div className="rounded-lg bg-surface-container-low p-2">
              <span className="mb-0.5 block font-label-caps text-label-caps text-outline uppercase">
                &Eacute;tablissement rattach&eacute;
              </span>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-on-surface">
                  {establishmentName}
                </span>
                <span className="rounded bg-primary-fixed px-2 py-0.5 font-label-caps text-label-caps text-primary uppercase">
                  Principal
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-surface-container-low p-2">
              <span className="mb-0.5 block font-label-caps text-label-caps text-outline uppercase">
                &Eacute;quipe rattach&eacute;e &agrave; la station
              </span>
              <p className="text-sm font-medium text-on-surface">
                {memberCount} personne{memberCount > 1 ? 's' : ''}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-low p-2">
              <div>
                <span className="mb-0.5 block font-label-caps text-label-caps text-outline uppercase">
                  Poste
                </span>
                <span className="text-sm font-semibold text-tertiary">
                  {tRoles(user.role)}
                </span>
              </div>
              <span className="material-symbols-outlined text-2xl text-tertiary">
                check_circle
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Préférences KDS */}
      <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container-high text-primary">
              <span className="material-symbols-outlined text-lg">tune</span>
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Pr&eacute;f&eacute;rences KDS &Eacute;cran Cuisine
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Personnalisation de l&apos;affichage KDS de la cuisine
              </p>
            </div>
          </div>
          <span className="self-start rounded bg-surface-container-low px-3 py-1 font-label-caps text-label-caps text-outline uppercase sm:self-auto">
            Enregistr&eacute; sur cet appareil
          </span>
        </div>
        <div className="space-y-2">
          <PrefToggle
            checked={contrastOn}
            onToggle={toggleContrast}
            icon="contrast"
            title="Affichage KDS grand format à fort contraste"
            description="Optimise la lecture des tickets de préparation à distance au-dessus des fourneaux."
          />
          <PrefToggle
            checked={soundOn}
            onToggle={toggleSound}
            icon="notifications_active"
            title="Signal sonore modéré à l'arrivée d'une nouvelle commande"
            description="Bip discret haute fréquence traversant l'ambiance sonore du fournil."
          />
        </div>
      </div>

      <div className="mt-6 text-center">
        <span className="font-label-caps text-label-caps tracking-widest text-outline uppercase">
          BrewFlow &bull; Module Profil Cuisine
        </span>
      </div>
    </div>
  );
}
