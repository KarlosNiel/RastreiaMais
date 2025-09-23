"use client";
import { Card } from "@heroui/react";
import { Skeleton } from "@/components/skeletons/Skeleton";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { MedicationGridSkeleton } from "@/components/skeletons/MedicationGridSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

export default function LoadingMe() {
  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-80" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <div className="grid gap-3 lg:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <MedicationGridSkeleton />

      <Card className="p-4">
        <Skeleton className="h-5 w-48 mb-3" />
        <TableSkeleton rows={4} />
      </Card>

      <Card className="p-4">
        <Skeleton className="h-5 w-40 mb-3" />
        <TableSkeleton rows={4} />
      </Card>
    </main>
  );
}
