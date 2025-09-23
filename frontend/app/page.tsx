import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role === "MANAGER") redirect("/dashboard");
  if (role === "PROFESSIONAL") redirect("/profissional");
  if (role === "PATIENT") redirect("/me");

  // sem login → vai pro /auth/login
  redirect("/auth/login");
}
