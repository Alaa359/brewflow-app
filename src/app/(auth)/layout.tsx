import { LanguageSwitcher } from '@/components/language-switcher';
import { ShaderBackground } from '@/components/shader-background';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center gap-6 p-4 min-h-screen bg-warmCream overflow-x-hidden">
      <ShaderBackground />
      <div className="absolute end-4 top-4 z-40">
        <LanguageSwitcher />
      </div>
      {children}
    </div>
  );
}
