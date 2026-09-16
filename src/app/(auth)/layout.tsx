import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 p-4">
      <Link href="/" className="text-xl font-semibold tracking-tight">
        BrewFlow
      </Link>
      {children}
    </div>
  );
}
