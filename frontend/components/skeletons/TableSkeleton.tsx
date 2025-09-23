// frontend/components/skeletons/TableSkeleton.tsx
import Skeleton from "./Skeleton";

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-divider bg-content1 shadow-soft">
      {/* header */}
      <div className="border-b border-divider px-4 py-3">
        <Skeleton className="h-5 w-40" />
      </div>

      {/* body */}
      <div className="divide-y divide-divider">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid grid-cols-5 gap-3 px-4 py-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20 justify-self-end" />
          </div>
        ))}
      </div>

      {/* footer / paginação */}
      <div className="border-t border-divider px-4 py-3">
        <Skeleton className="mx-auto h-9 w-40 rounded-xl" />
      </div>
    </div>
  );
}

export default TableSkeleton;
