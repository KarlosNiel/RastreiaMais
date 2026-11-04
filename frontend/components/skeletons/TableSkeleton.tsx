// frontend/components/skeletons/TableSkeleton.tsx
import { Skeleton } from "./Skeleton";

import { cn } from "@/lib/utils";

export function TableSkeleton({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      {/* header toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-52 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg hidden sm:block" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* body */}
      <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 px-5 py-3.5"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Skeleton className="size-9 rounded-full shrink-0" />
              <div className="space-y-1.5 min-w-0">
                <Skeleton className="h-4 w-36 sm:w-48" />
                <Skeleton className="h-3 w-24 sm:w-32" />
              </div>
            </div>
            <Skeleton className="h-4 w-24 hidden md:block" />
            <Skeleton className="h-4 w-28 hidden lg:block" />
            <Skeleton className="h-6 w-20 rounded-full shrink-0" />
            <Skeleton className="size-8 rounded-lg shrink-0" />
          </div>
        ))}
      </div>

      {/* footer / paginação */}
      <div className="flex items-center justify-between border-t border-slate-200/80 px-5 py-3 dark:border-zinc-800">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
    </div>
  );
}

export default TableSkeleton;
