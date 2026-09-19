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
      <Link
        href="/"
        className="flex items-center gap-3 text-xl font-semibold tracking-tight"
      >
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-[#a3641f] text-lg font-bold text-primary-foreground shadow-sm">
          &#9749;
        </span>
        <span>{t('appName')}</span>
      </Link>
      {children}
    </div>
  );
}
