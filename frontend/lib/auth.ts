import { cookies } from "next/headers";

export type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER";

export async function getRole(): Promise<Role | null> {
  const cookieStore = await cookies();
  const r = cookieStore.get("role")?.value as Role | undefined;
  return r ?? null;
}
