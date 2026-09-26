import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { CuisineHome } from '@/components/cuisine/cuisine-home';

export default async function CuisinePage() {
  await requireRole(Role.KITCHEN);

  return (
    <main className="bg-surface selection:bg-primary-container selection:text-on-primary flex w-full flex-1 flex-col px-4">
      <CuisineHome />
    </main>
  );
}
