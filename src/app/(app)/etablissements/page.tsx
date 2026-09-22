import { Role } from '@/generated/client';
import { requireRole } from '@/lib/auth/dal';
import { EtablissementsDashboard } from '@/components/etablissements/etablissements-dashboard';

export default async function EstablishmentsPage() {
  await requireRole(Role.ADMIN);

  return (
    <main className="flex flex-1 flex-col p-6">
      <EtablissementsDashboard />
    </main>
  );
}
