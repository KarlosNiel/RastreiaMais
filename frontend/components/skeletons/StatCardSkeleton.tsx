// frontend/components/skeletons/StatCardSkeleton.tsx
import Skeleton from "./Skeleton";

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-divider bg-content1 p-4 shadow-soft">
      <div className="stack-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  );
}

export default StatCardSkeleton;
