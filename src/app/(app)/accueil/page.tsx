import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { AccueilHome } from '@/components/accueil/accueil-home';

export default async function AccueilPage() {
  await requireRole(Role.ADMIN);

  return (
    <main className="bg-surface selection:bg-primary-container selection:text-on-primary flex w-full flex-1 flex-col px-4">
      <AccueilHome />
    </main>
  );
}
