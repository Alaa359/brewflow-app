'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { navForRole } from '@/lib/nav';
import { ROLE_HOME } from '@/lib/auth/roles';
import { SidebarEstablishment } from '@/components/sidebar/sidebar-establishment';
import type { CurrentUser } from '@/lib/auth/dal';

export function AppSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');

  const sections = navForRole(user.role);

  const activeHref = sections
    .flatMap((section) => section.items)
    .filter(
      (item) =>
        pathname === item.href || pathname.startsWith(`${item.href}/`),
    )
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  function isActive(href: string) {
    return activeHref === href;
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/40 bg-background/40 backdrop-blur-xl lg:flex">
      <div className="border-b border-border/40 px-4 pb-4 pt-5 animate-in fade-in slide-in-from-left-2 duration-300">
        <Link
          href={ROLE_HOME[user.role] ?? '/'}
          className="group flex items-center gap-3"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="BrewFlow"
            src="/logo-brewflow.svg"
            className="h-10 w-10 shrink-0 object-contain drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
          />
          <span className="min-w-0">
            <span className="block text-lg font-bold uppercase tracking-tight text-foreground">
              {tCommon('appName')}
            </span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/70">
              {tCommon('brandTagline')}
            </span>
          </span>
        </Link>
      </div>

      <div className="pt-3 animate-in fade-in slide-in-from-left-2 duration-300 delay-75">
        <p className="px-5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
          {tCommon('station')}
        </p>
        <SidebarEstablishment
          currentId={user.establishmentId}
          establishments={user.establishments}
        />
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {sections.map((section, sectionIndex) => (
          <div
            key={section.sectionKey}
            className="animate-in fade-in slide-in-from-left-3 duration-300"
            style={{ animationDelay: `${120 + sectionIndex * 60}ms` }}
          >
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground/60">
              {t(`sections.${section.sectionKey}`)}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item, itemIndex) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    style={{
                      animationDelay: `${160 + sectionIndex * 60 + itemIndex * 30}ms`,
                    }}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2 text-sm transition-all duration-200 animate-in fade-in slide-in-from-left-2 ${
                      active
                        ? 'bg-primary font-medium text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:translate-x-0.5 hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <item.icon className="h-[18px] w-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
                    <span className="min-w-0 truncate">{t(item.key)}</span>
                    {active && (
                      <span className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-primary-foreground/80 animate-in zoom-in-50 duration-300" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
