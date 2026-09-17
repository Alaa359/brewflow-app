'use client';

import { useTransition } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { CheckIcon, LanguagesIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';

export function LanguageSwitcher() {
  const active = useLocale();
  const router = useRouter();
  const t = useTranslations('Common');
  const [pending, startTransition] = useTransition();

  function handleSelect(locale: Locale) {
    if (locale === active) return;
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5"
          disabled={pending}
          aria-label={t('language')}
        >
          <LanguagesIcon />
          <span className="hidden sm:inline">{t('language')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            disabled={locale === active || pending}
            onClick={() => handleSelect(locale)}
          >
            {locale === active && <CheckIcon />}
            {t(`locale.${locale}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
