// frontend/components/skeletons/StatCardSkeleton.tsx
import { Skeleton } from "./Skeleton";

import { cn } from "@/lib/utils";

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs",
        "dark:border-zinc-800 dark:bg-zinc-900",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="size-9 rounded-lg shrink-0" />
      </div>
      <div className="mt-3 flex items-baseline gap-2">
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export default StatCardSkeleton;
