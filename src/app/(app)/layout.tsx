import { getCurrentUser } from '@/lib/auth/dal';
import { AppHeader } from '@/components/app-header';
import { AppSidebar } from '@/components/app-sidebar';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 items-stretch">
      {user && <AppSidebar user={user} />}
      <div className="flex min-w-0 flex-1 flex-col">
        {user && <AppHeader user={user} />}
        {children}
      </div>
    </div>
  );
}
