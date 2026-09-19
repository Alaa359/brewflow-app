'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  ChevronsUpDownIcon,
  LogOutIcon,
  SettingsIcon,
  StoreIcon,
  LanguagesIcon,
} from 'lucide-react';
import { logout } from '@/actions/auth';
import { ROLE_HOME } from '@/lib/auth/roles';
import { NAV_GROUPS, navForRole } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/language-switcher';
import { EstablishmentSwitcher } from '@/components/establishment-switcher';
import type { CurrentUser } from '@/lib/auth/dal';

export function AppSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');
  const tRoles = useTranslations('Roles');

  const sections = navForRole(user.role);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 flex-col border-r border-border/40 bg-background/40 backdrop-blur-xl lg:flex">
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {sections.map((section) => (
          <div key={section.sectionKey}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
              {t(`sections.${section.sectionKey}`)}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${
                    isActive(item.href)
                      ? 'bg-primary font-medium text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
                  }`}
                >
                  <item.icon className="h-[18px] w-[18px] shrink-0" />
                  {t(item.key)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/40 p-3">
        <div className="mb-2 flex items-center gap-2">
          {user.establishments.length > 1 && (
            <EstablishmentSwitcher
              key={user.establishmentId}
              currentId={user.establishmentId}
              establishments={user.establishments}
            />
          )}
          <LanguageSwitcher />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex w-full items-center justify-start gap-2 rounded-xl px-2 py-1.5">
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
          <DropdownMenuContent align="end" side="right" className="w-56">
            <DropdownMenuLabel>
              {tCommon('role')} &middot; {tRoles(user.role)}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <Link href={ROLE_HOME[user.role] ?? '/'}>
                <DropdownMenuItem>Profil</DropdownMenuItem>
              </Link>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 rounded-xl">
              <SettingsIcon className="h-4 w-4" />
              {t('settings')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56">
            <DropdownMenuLabel>{t('settings')}</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <StoreIcon className="h-4 w-4" />
                {t('siteSettings')}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LanguagesIcon className="h-4 w-4" />
                {t('language')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <form action={logout}>
              <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
                <LogOutIcon className="h-4 w-4" />
                {t('logout')}
              </Button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
