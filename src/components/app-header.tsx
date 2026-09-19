import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { logout } from '@/actions/auth';
import { Role } from '@/generated/client';
import { ROLE_HOME } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { EstablishmentSwitcher } from '@/components/establishment-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import type { CurrentUser } from '@/lib/auth/dal';

const NAV_ITEMS: { href: string; key: string; roles: Role[] }[] = [
  { href: '/dashboard', key: 'dashboard', roles: [Role.ADMIN] },
  { href: '/rapports', key: 'reports', roles: [Role.ADMIN] },
  { href: '/caisse', key: 'pos', roles: [Role.ADMIN, Role.SERVER] },
  { href: '/ingredients', key: 'ingredients', roles: [Role.ADMIN] },
  { href: '/plats', key: 'dishes', roles: [Role.ADMIN] },
  { href: '/tables', key: 'tables', roles: [Role.ADMIN] },
  { href: '/cuisine', key: 'kitchen', roles: [Role.KITCHEN, Role.ADMIN] },
  { href: '/planning', key: 'planning', roles: [Role.ADMIN] },
  { href: '/employes', key: 'employees', roles: [Role.ADMIN] },
  { href: '/etablissements', key: 'establishments', roles: [Role.ADMIN] },
];

export async function AppHeader({ user }: { user: CurrentUser }) {
  const t = await getTranslations('Nav');
  const tCommon = await getTranslations('Common');
  const tRoles = await getTranslations('Roles');

  return (
    <header className="sticky top-0 z-20 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link
            href={ROLE_HOME[user.role] ?? '/'}
            className="flex items-center gap-2"
          >
            <span className="grid h-8 w-8 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#a3641f] text-sm font-bold text-primary-foreground shadow-sm">
              &#9749;
            </span>
            <span className="text-lg font-bold tracking-tight">
              {tCommon('appName')}
            </span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {NAV_ITEMS.filter((item) => item.roles.includes(user.role)).map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {t(item.key)}
                </Link>
              )
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <LanguageSwitcher />
          {user.establishments.length > 1 && (
            <EstablishmentSwitcher
              currentId={user.establishmentId}
              establishments={user.establishments}
            />
          )}
          <span className="hidden text-muted-foreground sm:inline">
            {user.establishmentName}
          </span>
          <span className="hidden text-muted-foreground md:inline">
            {user.name} &middot; {tRoles(user.role)}
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              {t('logout')}
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
