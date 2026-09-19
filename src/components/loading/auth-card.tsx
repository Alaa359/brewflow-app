import { Skeleton } from '@/components/ui/skeleton';

export default function AuthCardLoading() {
  return (
    <div className="flex w-full max-w-sm flex-col items-center gap-6">
      <Skeleton className="h-9 w-56" />
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}