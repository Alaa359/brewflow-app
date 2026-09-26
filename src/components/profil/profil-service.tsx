'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import type { Role } from '@/generated/client';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import type { ProfilRange } from './profil-cuisine';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ProfilServiceProps = {
  user: { name: string; email: string; role: Role };
  establishmentName: string;
  establishmentPhone: string | null;
  establishmentAddress: string | null;
  timezone: string;
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

export function ProfilService({
  user,
  establishmentName,
  establishmentPhone,
  establishmentAddress,
  timezone,
  memberCount,
  dayName,
  todayRanges,
  onDuty,
  weeklyRanges,
}: ProfilServiceProps) {
  const tRoles = useTranslations('Roles');
  const tCommon = useTranslations('Common');
  const activeLocale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSelectLocale(locale: Locale) {
    if (locale === activeLocale || pending) return;
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  const initials = user.name.slice(0, 2).toUpperCase();
  const statusPill = onDuty
    ? { active: true, label: `En service actif • ${onDuty.start} – ${onDuty.end}` }
    : todayRanges.length > 0
      ? { active: false, label: `Shift du jour • ${formatRanges(todayRanges)}` }
      : null;

  return (
    <div className="mx-auto w-full max-w-5xl px-2 py-9">
      {/* Fil d'Ariane & état de session */}
      <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 font-label-caps text-label-caps tracking-wider text-on-surface-variant uppercase">
          <span>Comptes &amp; Profils</span>
          <span className="material-symbols-outlined text-sm text-outline">
            chevron_right
          </span>
          <span className="font-bold text-primary">Profil Service &amp; Salle</span>
        </div>
        <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-surface-container px-3 py-1 shadow-sm sm:self-auto">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          <span className="font-label-numeric text-label-numeric text-tertiary">
            Session Active &bull; {tRoles(user.role)}
          </span>
        </div>
      </div>

      {/* Bloc identité principal */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-md sm:p-9">
        <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-secondary-container/40 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
          <div className="relative shrink-0">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-surface-container-high shadow-lg md:h-36 md:w-36">
              <span className="font-headline-lg text-headline-lg font-bold text-primary">
                {initials}
              </span>
            </div>
            {onDuty && (
              <span className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-tertiary shadow-md">
                <span
                  className="material-symbols-outlined text-sm text-on-tertiary"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  check
                </span>
              </span>
            )}
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center">
            {statusPill && (
              <span className="mb-2 inline-flex w-fit items-center gap-1.5 self-center rounded-full bg-secondary-fixed px-3 py-1 font-label-caps text-label-caps uppercase text-on-secondary-container md:self-start">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    statusPill.active ? 'animate-pulse bg-primary' : 'bg-outline'
                  }`}
                />
                {statusPill.label}
              </span>
            )}
            <h1 className="font-headline-lg text-headline-lg mb-1 tracking-tight text-on-surface">
              {user.name}
            </h1>
            <p className="mb-4 text-base font-medium text-on-surface-variant">
              {tRoles(user.role)}
            </p>

            <div className="mb-6 flex flex-wrap items-center justify-center gap-1 md:justify-start md:gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1 font-label-numeric text-label-numeric text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-primary">
                  room_service
                </span>
                {tRoles(user.role)}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1 font-label-numeric text-label-numeric text-on-surface-variant">
                <span className="material-symbols-outlined text-base text-primary">
                  storefront
                </span>
                {establishmentName}
              </span>
              {todayRanges.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1 font-label-numeric text-label-numeric text-on-surface-variant">
                  <span className="material-symbols-outlined text-base text-tertiary">
                    schedule
                  </span>
                  {capitalize(dayName)} &bull; {formatRanges(todayRanges)}
                </span>
              )}
              {weeklyRanges.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary-fixed px-3 py-1 font-label-caps text-label-caps uppercase text-on-secondary-container">
                  {weeklyRanges.length} services / semaine
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
              <Link
                href="/planning"
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container px-4 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-lg leading-none">
                  calendar_today
                </span>
                Consulter mes shifts
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Grille 2 colonnes */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Coordonnées de contact */}
        <div className="rounded-xl bg-surface-container-low p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-fixed text-primary">
              <span className="material-symbols-outlined text-lg">call</span>
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Coordonnées de contact
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Lignes directes pour le service et la salle
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex flex-col rounded-lg bg-surface-container-lowest p-2 shadow-sm">
              <span className="font-label-caps text-label-caps tracking-wider text-outline uppercase">
                Email professionnel
              </span>
              <span className="mt-1 select-all text-sm font-medium text-on-surface">
                {user.email}
              </span>
            </div>

            {establishmentPhone && (
              <div className="flex flex-col rounded-lg bg-surface-container-lowest p-2 shadow-sm">
                <span className="font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Téléphone de la station
                </span>
                <span className="mt-1 font-label-numeric text-label-numeric font-bold text-on-surface">
                  {establishmentPhone}
                </span>
              </div>
            )}

            {establishmentAddress && (
              <div className="flex flex-col rounded-lg bg-surface-container-lowest p-2 shadow-sm">
                <span className="font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Adresse de la station
                </span>
                <span className="mt-1 text-sm font-medium text-on-surface">
                  {establishmentAddress}
                </span>
              </div>
            )}

            <div className="flex flex-col rounded-lg bg-surface-container-lowest p-2 shadow-sm">
              <span className="font-label-caps text-label-caps tracking-wider text-outline uppercase">
                Fuseau horaire
              </span>
              <span className="mt-1 font-label-numeric text-label-numeric font-medium text-on-surface">
                {timezone}
              </span>
            </div>
          </div>
        </div>

        {/* Affectation & prise de poste */}
        <div className="rounded-xl bg-surface-container-low p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-fixed text-primary">
              <span className="material-symbols-outlined text-lg">badge</span>
            </span>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                Affectation &amp; Prise de poste
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Paramètres de service et shift du jour
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-surface-container-lowest p-2 shadow-sm">
                <span className="block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Rôle
                </span>
                <span className="mt-1 block font-label-numeric text-label-numeric font-bold text-primary">
                  {tRoles(user.role)}
                </span>
              </div>
              <div className="rounded-lg bg-surface-container-lowest p-2 shadow-sm">
                <span className="block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Équipe rattachée
                </span>
                <span className="mt-1 block text-sm font-semibold text-on-surface">
                  {memberCount} personne{memberCount > 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-surface-container-lowest p-2 shadow-sm">
              <span className="mb-1 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                Établissement rattaché
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

            {weeklyRanges.length > 0 && (
              <div className="rounded-lg bg-surface-container-lowest p-2 shadow-sm">
                <span className="block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Horaires habituels
                </span>
                <span className="mt-1 block font-label-numeric text-label-numeric font-medium text-on-surface">
                  {formatRanges(weeklyRanges)}
                </span>
              </div>
            )}

            <div className="flex flex-col rounded-lg bg-surface-container p-2 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-label-caps text-label-caps font-bold tracking-wider text-primary uppercase">
                  {onDuty ? 'Shift en cours' : 'Shift du jour'}
                </span>
                <span className="material-symbols-outlined text-base text-primary">
                  schedule
                </span>
              </div>
              <span className="mt-1 font-label-numeric text-label-numeric font-bold text-on-surface">
                {todayRanges.length > 0
                  ? `Aujourd'hui : ${formatRanges(todayRanges)}`
                  : 'Aucun shift planifié aujourd’hui'}
              </span>
              <span className="mt-0.5 text-body-sm text-on-surface-variant">
                {onDuty
                  ? `Service en cours jusqu’à ${onDuty.end}`
                  : todayRanges.length > 0
                    ? `Début de service à ${todayRanges[0].start}`
                    : `${weeklyRanges.length} services cette semaine`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Préférences de l'interface */}
      <div className="rounded-xl bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
            <span className="material-symbols-outlined text-lg">language</span>
          </span>
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Préférences de l&apos;interface
            </h2>
            <p className="text-body-sm text-on-surface-variant">
              Langue d&apos;affichage et devise de transaction
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-low p-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="material-symbols-outlined shrink-0 text-xl text-outline">
                language
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-medium text-on-surface">
                  Langue de l&apos;interface &amp; Paramètres régionaux
                </span>
                <span className="block truncate text-body-sm text-outline">
                  Devise de transaction définie sur le {tCommon('currency')}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  disabled={pending}
                  aria-label={tCommon('language')}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container px-3 py-1.5 text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-60"
                >
                  <span className="text-sm font-semibold">
                    {tCommon(`locale.${activeLocale}`)} ({tCommon('currency')})
                  </span>
                  <span className="material-symbols-outlined text-base text-outline">
                    expand_more
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{tCommon('language')}</DropdownMenuLabel>
                {locales.map((locale) => (
                  <DropdownMenuItem
                    key={locale}
                    disabled={locale === activeLocale || pending}
                    onClick={() => handleSelectLocale(locale)}
                  >
                    {tCommon(`locale.${locale}`)}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
