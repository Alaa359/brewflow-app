import type { CurrentUser } from '@/lib/auth/dal';
import { getHeaderNotifications } from '@/lib/notifications';
import { HeaderClock } from '@/components/header/header-clock';
import { NotificationBell } from '@/components/header/notification-bell';
import { StationStatus } from '@/components/header/station-status';
import { HeaderSearch } from '@/components/header/header-search';
import { MobileNavTrigger } from '@/components/mobile-nav';
import { UserMenu } from '@/components/user-menu';

export async function AppHeader({ user }: { user: CurrentUser }) {
  const notifications = await getHeaderNotifications(
    user.role,
    user.establishmentId
  );

  return (
    <header className="sticky top-0 z-20 border-b border-border/40 bg-background/60 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3 text-sm sm:gap-3 sm:px-4">
        <div className="md:hidden">
          <MobileNavTrigger user={user} />
        </div>

        <StationStatus name={user.establishmentName} />

        <HeaderSearch user={user} />

        <div className="ms-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <HeaderClock timeZone={user.establishmentTimezone} />
          <NotificationBell notifications={notifications} />
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
