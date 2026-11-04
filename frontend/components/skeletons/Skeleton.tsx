// frontend/components/skeletons/Skeleton.tsx
import type { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-slate-200/80 dark:bg-zinc-800/80 rounded-md",
        className,
      )}
      {...props}
    />
  );
}

export default Skeleton;
