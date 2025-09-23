// frontend/components/skeletons/ChartSkeleton.tsx
import Skeleton from "./Skeleton";

/** Skeleton para cards de gráfico (server-safe) */
export function ChartSkeleton({ header = true }: { header?: boolean }) {
  return (
    <div className="rounded-2xl border border-divider bg-content1 p-4 shadow-soft">
      {header && (
        <div className="mb-4 flex items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      )}

      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}
