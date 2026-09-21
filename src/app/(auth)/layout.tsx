import { ShaderCanvas } from '@/components/shader-canvas';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-stone-200/50 text-on-surface antialiased min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      <main className="flex-1 w-full flex items-center justify-center relative px-4 sm:px-6 lg:px-8 p-4">
        <ShaderCanvas />
        {children}
      </main>
    </div>
  );
}
