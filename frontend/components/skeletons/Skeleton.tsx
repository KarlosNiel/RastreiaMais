// frontend/components/skeletons/Skeleton.tsx
import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("skeleton rounded-md", className)}
      {...props}
    />
  );
}

export default Skeleton;
