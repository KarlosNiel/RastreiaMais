import { RoleCards } from "@/components/home/RoleCards";
import { Features } from "@/components/home/Features";
import { Presentation } from "@/components/home/Presentation";

export default function RastreiaLanding() {
  return (
    <div className="min-h-screen bg-white transition-colors duration-300 dark:bg-zinc-950">
      <Presentation />
      <Features />
      <RoleCards />
    </div>
  );
}
