import { Skeleton } from "./Skeleton";

export function AlertsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-lg p-3 border border-slate-100 bg-slate-50/60 dark:border-zinc-800 dark:bg-zinc-800/40"
        >
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="size-9 rounded-full shrink-0" />
            <div className="space-y-1.5 min-w-0">
              <Skeleton className="h-4 w-32 sm:w-44" />
              <Skeleton className="h-3 w-48 sm:w-64" />
            </div>
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default AlertsListSkeleton;
