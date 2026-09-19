import { Skeleton } from '@/components/ui/skeleton';

export default function MenuPageLoading() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-7 w-56" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}