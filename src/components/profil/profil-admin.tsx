'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition, useState } from 'react';
import type { Role } from '@/generated/client';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { formatDateLabel } from '@/lib/planning';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ProfilEstablishment = {
  id: string;
  name: string;
  isCurrent: boolean;
};

type ProfilAdminProps = {
  user: { name: string; email: string; role: Role };
  establishmentName: string;
  establishmentPhone: string | null;
  timezone: string;
  memberSince: Date | null;
  establishments: ProfilEstablishment[];
};

export function ProfilAdmin({
  user,
  establishmentName,
  establishmentPhone,
  timezone,
  memberSince,
  establishments,
}: ProfilAdminProps) {
  const tRoles = useTranslations('Roles');
  const tCommon = useTranslations('Common');
  const activeLocale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function handleSelectLocale(locale: Locale) {
    if (locale === activeLocale || pending) return;
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papiers indisponible
    }
  }

  const initials = user.name.slice(0, 2).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-5xl px-2 py-9">
      {/* Fil d'Ariane & contexte */}
      <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1 font-label-caps text-label-caps tracking-wider text-outline uppercase">
          <span>Comptes &amp; Utilisateurs</span>
          <span className="material-symbols-outlined text-sm leading-none">
            chevron_right
          </span>
          <span className="font-bold text-primary">
            Profil Direction &amp; G&eacute;rance
          </span>
        </div>
        <div className="flex items-center gap-1.5 font-label-numeric text-label-numeric text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-tertiary" />
          <span>
            {memberSince
              ? `Compte cr\u00e9e le ${formatDateLabel(memberSince.toISOString().slice(0, 10))}`
              : 'Session active'}
          </span>
        </div>
      </div>

      {/* Carte identité */}
      <div className="relative mb-6 overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-md sm:p-9">
        <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="relative flex flex-col items-center gap-6 md:flex-row md:items-start">
          <div className="relative shrink-0">
            <div className="h-36 w-36 overflow-hidden rounded-2xl bg-surface-container p-1 shadow-sm md:h-44 md:w-44">
              <div className="flex h-full w-full items-center justify-center rounded-xl bg-surface-container-highest">
                <span className="font-headline-lg text-headline-lg font-bold text-primary">
                  {initials}
                </span>
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1 whitespace-nowrap shadow-sm md:left-4 md:translate-x-0">
              <span className="h-2 w-2 animate-pulse rounded-full bg-tertiary" />
              <span className="font-label-caps text-label-caps tracking-wider text-tertiary uppercase">
                Session active &bull; {tRoles(user.role)}
              </span>
            </div>
          </div>

          <div className="flex min-w-0 flex-1 flex-col justify-center text-center md:text-left">
            <div className="mb-1 flex flex-wrap items-center justify-center gap-1 md:justify-start">
              <span className="rounded-full bg-primary/10 px-3 py-1 font-label-caps text-label-caps text-primary uppercase">
                {tRoles(user.role)}
              </span>
              <span className="rounded-full bg-tertiary/10 px-3 py-1 font-label-caps text-label-caps text-tertiary uppercase">
                Acc&egrave;s Total
              </span>
              <span className="flex items-center gap-1 rounded-full bg-surface-container-high px-3 py-1 font-label-caps text-label-caps text-on-surface-variant uppercase">
                <span className="material-symbols-outlined text-xs leading-none">
                  location_on
                </span>
                {establishmentName}
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg mt-1 mb-1 tracking-tight text-on-surface">
              {user.name}
            </h1>
            <p className="mb-6 text-sm text-on-surface-variant">
              {tRoles(user.role)} &mdash;{' '}
              <span className="font-semibold text-on-surface">
                {establishmentName}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Grille détails */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Coordonnées directes */}
        <div className="rounded-xl bg-surface-container-low p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              contact_mail
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              Coordonn&eacute;es Directes
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
              <div className="min-w-0">
                <span className="mb-0.5 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Courriel Professionnel
                </span>
                <span className="block truncate text-sm font-medium text-on-surface">
                  {user.email}
                </span>
              </div>
              <button
                type="button"
                onClick={copyEmail}
                title={copied ? 'Adresse copi\u00e9e' : "Copier l'adresse"}
                className={`shrink-0 rounded-lg p-2 transition-colors ${
                  copied
                    ? 'text-tertiary'
                    : 'text-outline hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-lg leading-none">
                  {copied ? 'check' : 'content_copy'}
                </span>
              </button>
            </div>

            {establishmentPhone && (
              <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
                <div className="min-w-0">
                  <span className="mb-0.5 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                    T&eacute;l&eacute;phone de la station
                  </span>
                  <span className="block font-label-numeric text-label-numeric font-semibold text-on-surface">
                    {establishmentPhone}
                  </span>
                </div>
                <a
                  href={`tel:${establishmentPhone.replace(/\s/g, '')}`}
                  title="Appeler"
                  className="shrink-0 rounded-lg p-2 text-outline transition-colors hover:bg-surface-container hover:text-primary"
                >
                  <span className="material-symbols-outlined text-lg leading-none">
                    call
                  </span>
                </a>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
              <div className="min-w-0">
                <span className="mb-0.5 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Fuseau horaire
                </span>
                <span className="block font-label-numeric text-label-numeric font-semibold text-on-surface">
                  {timezone}
                </span>
              </div>
              <span className="material-symbols-outlined shrink-0 p-2 text-lg leading-none text-outline">
                schedule
              </span>
            </div>
          </div>
        </div>

        {/* Rôle & habilitations */}
        <div className="rounded-xl bg-surface-container-low p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-xl">
              verified_user
            </span>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              R&ocirc;le &amp; Habilitations
            </h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-surface-container-lowest p-3 shadow-sm">
                <span className="mb-0.5 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  Date de cr&eacute;ation
                </span>
                <span className="block font-label-numeric text-label-numeric font-bold text-primary">
                  {memberSince
                    ? formatDateLabel(memberSince.toISOString().slice(0, 10))
                    : '—'}
                </span>
              </div>
              <div className="rounded-lg bg-surface-container-lowest p-3 shadow-sm">
                <span className="mb-0.5 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                  &Eacute;tablissements
                </span>
                <span className="block font-label-numeric text-label-numeric font-semibold text-on-surface">
                  {establishments.length}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-surface-container-lowest p-3 shadow-sm">
              <span className="mb-1 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                Sites Op&eacute;rationnels Rattach&eacute;s
              </span>
              <p className="text-sm leading-snug text-on-surface">
                {establishments.map((establishment, index) => (
                  <span key={establishment.id}>
                    {index > 0 && ', '}
                    {establishment.isCurrent ? (
                      <span className="font-semibold text-primary">
                        {establishment.name}
                      </span>
                    ) : (
                      establishment.name
                    )}
                    {establishment.isCurrent && ' (Principal)'}
                  </span>
                ))}
              </p>
            </div>

            <div className="rounded-lg bg-surface-container-lowest p-3 shadow-sm">
              <span className="mb-1 block font-label-caps text-label-caps tracking-wider text-outline uppercase">
                R&ocirc;le actif
              </span>
              <div className="flex items-center gap-1.5 text-on-surface">
                <span className="material-symbols-outlined text-base leading-none text-tertiary">
                  check_circle
                </span>
                <span className="text-body-sm font-medium">
                  {tRoles(user.role)} &mdash; acc&egrave;s complet aux modules
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Préférences de l'interface */}
      <div className="rounded-xl bg-surface-container-low p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">
            tune
          </span>
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Pr&eacute;f&eacute;rences de l&apos;interface
          </h2>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4 rounded-lg bg-surface-container-lowest p-3 shadow-sm">
            <div className="flex min-w-0 items-center gap-3">
              <span className="material-symbols-outlined shrink-0 text-xl text-outline">
                language
              </span>
              <div className="min-w-0">
                <span className="block text-sm font-medium text-on-surface">
                  Langue de l&apos;interface &amp; Param&egrave;tres
                  r&eacute;gionaux
                </span>
                <span className="block truncate text-body-sm text-outline">
                  Devise de transaction d&eacute;finie sur le{' '}
                  {tCommon('currency')}
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
