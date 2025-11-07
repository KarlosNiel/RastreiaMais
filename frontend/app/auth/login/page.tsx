import { RoleCards } from "@/components/home/RoleCards";
import { Features } from "@/components/home/Features";
import { Presentation } from "@/components/home/Presentation";

export default function RastreiaLanding() {
  return (
    <div className="min-h-screen bg-background dark:bg-gray-950 transition-colors duration-300">
      <Presentation />
      <Features />
      <RoleCards />
    </div>
  );
}
