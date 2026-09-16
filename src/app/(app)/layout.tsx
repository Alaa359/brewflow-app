import { getCurrentUser } from '@/lib/auth/dal';
import { AppHeader } from '@/components/app-header';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-1 flex-col">
      {user && <AppHeader user={user} />}
      {children}
    </div>
  );
}
