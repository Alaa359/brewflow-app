'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';
import {
  ChevronsUpDownIcon,
  LanguagesIcon,
  LogOutIcon,
  UserIcon,
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { ROLE_HOME } from '@/lib/auth/roles';
import { locales, type Locale } from '@/i18n/config';
import { setUserLocale } from '@/i18n/locale';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CurrentUser } from '@/lib/auth/dal';

export function UserMenu({ user }: { user: CurrentUser }) {
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const tRoles = useTranslations('Roles');
  const tLanguages = useTranslations('Common');
  const activeLocale = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSelectLocale(locale: Locale) {
    if (locale === activeLocale) return;
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
          className="flex h-auto items-center gap-2 rounded-xl px-2 py-1.5"
        >
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary/15 text-xs font-bold text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1 text-left">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">
              {tRoles(user.role)}
            </span>
          </span>
          <ChevronsUpDownIcon className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          {tCommon('role')} &middot; {tRoles(user.role)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href={ROLE_HOME[user.role] ?? '/'}>
            <DropdownMenuItem>
              <UserIcon className="h-4 w-4" />
              {t('profile')}
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LanguagesIcon className="h-4 w-4" />
              {t('language')}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={activeLocale}
                onValueChange={(value) => handleSelectLocale(value as Locale)}
              >
                {locales.map((locale) => (
                  <DropdownMenuRadioItem
                    key={locale}
                    value={locale}
                    disabled={pending}
                  >
                    {tLanguages(`locale.${locale}`)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <form action={logout}>
          <Button
            variant="ghost"
            size="sm"
            type="submit"
            className="w-full justify-start"
          >
            <LogOutIcon className="h-4 w-4" />
            {t('logout')}
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
