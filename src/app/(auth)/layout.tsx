import Link from 'next/link';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <div className="absolute end-4 top-4">
        <LanguageSwitcher />
      </div>
      <Link href="/" className="text-xl font-semibold tracking-tight">
        BrewFlow
      </Link>
      {children}
    </div>
  );
}
