import Link from 'next/link';
import { logout } from '@/actions/auth';
import { Role } from '@/generated/client';
import { ROLE_HOME, ROLE_LABEL } from '@/lib/auth/roles';
import { Button } from '@/components/ui/button';
import { EstablishmentSwitcher } from '@/components/establishment-switcher';
import type { CurrentUser } from '@/lib/auth/dal';

export function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="bg-background/80 border-b backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-4 px-4">
        <div className="flex items-center gap-6">
          <Link
            href={ROLE_HOME[user.role] ?? '/'}
            className="font-semibold tracking-tight"
          >
            BrewFlow
          </Link>
          <nav className="text-muted-foreground flex items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="hover:text-foreground rounded px-2 py-1"
            >
              Tableau de bord
            </Link>
            {(user.role === Role.ADMIN || user.role === Role.SERVER) && (
              <Link
                href="/caisse"
                className="hover:text-foreground rounded px-2 py-1"
              >
                Caisse
              </Link>
            )}
            <Link
              href="/ingredients"
              className="hover:text-foreground rounded px-2 py-1"
            >
              Ingrédients
            </Link>
            <Link
              href="/plats"
              className="hover:text-foreground rounded px-2 py-1"
            >
              Plats
            </Link>
            {user.role === Role.ADMIN && (
              <Link
                href="/tables"
                className="hover:text-foreground rounded px-2 py-1"
              >
                Tables
              </Link>
            )}
            {(user.role === Role.KITCHEN || user.role === Role.ADMIN) && (
              <Link
                href="/cuisine"
                className="hover:text-foreground rounded px-2 py-1"
              >
                Cuisine
              </Link>
            )}
            {user.role === Role.ADMIN && (
              <Link
                href="/etablissements"
                className="hover:text-foreground rounded px-2 py-1"
              >
                Établissements
              </Link>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user.establishments.length > 1 && (
            <EstablishmentSwitcher
              currentId={user.establishmentId}
              establishments={user.establishments}
            />
          )}
          <span className="text-muted-foreground hidden sm:inline">
            {user.establishmentName}
          </span>
          <span className="text-muted-foreground">
            {user.name} · {ROLE_LABEL[user.role] ?? user.role}
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit">
              Se déconnecter
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
