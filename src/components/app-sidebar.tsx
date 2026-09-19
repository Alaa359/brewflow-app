'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { navForRole } from '@/lib/nav';
import { ROLE_HOME } from '@/lib/auth/roles';
import type { CurrentUser } from '@/lib/auth/dal';

export function AppSidebar({ user }: { user: CurrentUser }) {
  const pathname = usePathname();
  const t = useTranslations('Nav');
  const tCommon = useTranslations('Common');

  const sections = navForRole(user.role);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/40 bg-background/40 backdrop-blur-xl lg:flex">
      <div className="flex items-center gap-3 border-b border-border/40 px-5 py-4">
        <Link
          href={ROLE_HOME[user.role] ?? '/'}
          className="flex items-center gap-3"
        >
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#a3641f] text-lg font-bold text-primary-foreground shadow-sm">
            &#9749;
          </span>
          <span className="text-lg font-bold tracking-tight">
            {tCommon('appName')}
          </span>
        </Link>
      </div>

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
    </aside>
  );
}