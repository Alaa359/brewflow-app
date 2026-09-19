import { EstablishmentSwitcher } from '@/components/establishment-switcher';
import { LanguageSwitcher } from '@/components/language-switcher';
import { UserMenu } from '@/components/user-menu';
import type { CurrentUser } from '@/lib/auth/dal';

export async function AppHeader({ user }: { user: CurrentUser }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-end gap-3 px-4 text-sm">
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
        <UserMenu user={user} />
      </div>
    </header>
  );
}