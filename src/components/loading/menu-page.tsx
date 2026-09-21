import { Skeleton } from '@/components/ui/skeleton';

export default function MenuPageLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff8f1]">
      {/* Header skeleton */}
      <div className="sticky top-0 z-30 border-b border-[#eedecf] bg-[#fff8f1]/95 px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        <Skeleton className="mt-2.5 h-9 w-full rounded-xl" />
      </div>

      {/* Hero skeleton */}
      <section className="px-4 pt-4 pb-2">
        <div className="menu-editorial-hero relative overflow-hidden rounded-2xl border border-[#e8d5c3] p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
          <Skeleton className="mt-2 h-6 w-48" />
          <Skeleton className="mt-1 h-3 w-full" />
          <Skeleton className="mt-3 h-9 w-full rounded-xl" />
        </div>
      </section>

      {/* Pills skeleton */}
      <div className="flex gap-2 overflow-hidden px-4 py-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-24 shrink-0 rounded-full" />
        ))}
      </div>

      {/* Cards skeleton */}
      <section className="space-y-4 px-4 py-3.5">
        <Skeleton className="h-3 w-36" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 w-full rounded-2xl" />
        ))}
      </section>
    </div>
  );
}
