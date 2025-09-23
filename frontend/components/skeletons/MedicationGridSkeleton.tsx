// frontend/components/skeletons/MedicationGridSkeleton.tsx
import Skeleton from "./Skeleton";

export function MedicationGridSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="rounded-2xl border border-divider bg-content1 p-4 shadow-soft">
      {/* título/toolbar do bloco */}
      <div className="mb-4">
        <Skeleton className="h-5 w-44" />
      </div>

      {/* grid de cards */}
      <div className="grid-12 gap-y-6">
        {Array.from({ length: items }).map((_, i) => (
          <div key={i} className="col-span-12 sm:col-span-6 lg:col-span-4">
            <div className="rounded-2xl border border-divider bg-content1 p-4 shadow-soft stack-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
              <div className="pt-1">
                <Skeleton className="h-9 w-24 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
