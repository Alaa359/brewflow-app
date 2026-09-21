import { ShaderCanvas } from '@/components/shader-canvas';
import { AuthHeader, AuthFooter } from '@/components/auth-header-footer';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface text-on-surface antialiased min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      <AuthHeader />

      <main className="flex-1 w-full flex items-center justify-center relative pt-16 pb-12 px-4 sm:px-6">
        <ShaderCanvas />

        {/* Dot pattern overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply bg-[radial-gradient(#c88242_1px,transparent_1px)] [background-size:24px_24px] z-0" />

        {/* Ambient glows */}
        <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none mix-blend-multiply z-0" />
        <div className="absolute bottom-1/4 -right-24 w-[28rem] h-[28rem] rounded-full bg-primary-container/25 blur-3xl pointer-events-none mix-blend-multiply z-0" />

        <div className="relative z-10 w-full max-w-[540px]">
          {children}
        </div>
      </main>

      <AuthFooter />
    </div>
  );
}
