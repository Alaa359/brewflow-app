'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { MenuIcon } from 'lucide-react';
import { logout } from '@/actions/auth';
import { ROLE_HOME } from '@/lib/auth/roles';
import { navForRole } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { LanguageSwitcher } from '@/components/language-switcher';
import { SidebarEstablishment } from '@/components/sidebar/sidebar-establishment';
import type { CurrentUser } from '@/lib/auth/dal';

export function MobileNavTrigger({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');

  const groups = navForRole(user.role);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label={t('menu')}>
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader className="text-left">
          <SheetTitle>
            <Link href={ROLE_HOME[user.role] ?? '/'} className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="BrewFlow"
                src="/logo-brewflow.svg"
                className="h-10 w-10 shrink-0 object-contain drop-shadow-sm"
              />
              <span className="min-w-0">
                <span className="block text-lg font-bold uppercase tracking-tight">
                  {tCommon('appName')}
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
                  {tCommon('brandTagline')}
                </span>
              </span>
            </Link>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-3">
          <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
            {tCommon('station')}
          </p>
          <SidebarEstablishment
            currentId={user.establishmentId}
            establishments={user.establishments}
          />
        </div>

        <nav className="mt-4 space-y-6 px-2">
          {groups.map((group) => (
            <div key={group.sectionKey}>
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
                {t(`sections.${group.sectionKey}`)}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all ${
                      isActive(item.href)
                        ? 'bg-primary font-medium text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:translate-x-0.5 hover:bg-primary/10 hover:text-primary'
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

        <div className="mt-4 flex items-center gap-2 border-t border-border/40 px-2 pt-3">
          <LanguageSwitcher />
        </div>

        <div className="mt-3 space-y-1 border-t border-border/40 px-2 pt-3 text-sm">
          <span className="flex items-center gap-2 text-muted-foreground">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/15 text-[10px] font-bold text-primary text-letters">
                {user.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="min-w-0 truncate">{user.name}</span>
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" className="w-full justify-start">
              {t('logout')}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
