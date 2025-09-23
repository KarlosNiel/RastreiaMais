"use client";
import { StatCardSkeleton } from "@/components/skeletons/StatCardSkeleton";
import { ChartSkeleton } from "@/components/skeletons/ChartSkeleton";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Card } from "@heroui/react";
import { Skeleton } from "@/components/skeletons/Skeleton";

export default function LoadingProfissional() {
  return (
    <main className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-72" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <ChartSkeleton />
        <Card className="p-4">
          <Skeleton className="h-5 w-40 mb-3" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </Card>
      </div>
      <TableSkeleton rows={5} /> {/* Agenda */}
      <TableSkeleton rows={5} /> {/* Pacientes Recentes */}
    </main>
  );
}
