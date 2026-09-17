import { getTranslations } from 'next-intl/server';
import { LoginForm } from './login-form';

export default async function LoginPage() {
  const t = await getTranslations('Auth.login');

  return (
    <>
      <LoginForm />
      <div className="text-muted-foreground w-full max-w-sm rounded-lg border p-3 text-center text-xs">
        <p className="font-medium">{t('demoTitle')}</p>
        <p dir="ltr">
          admin@brewflow.tn · serveur@brewflow.tn · cuisinier@brewflow.tn
        </p>
        <p>{t('demoPassword')}</p>
      </div>
    </>
  );
}
