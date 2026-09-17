import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LanguageSwitcher } from '@/components/language-switcher';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations('Common');

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <Link href="/" className="text-xl font-semibold tracking-tight">
        {t('appName')}
      </Link>
      {children}
    </div>
  );
}
