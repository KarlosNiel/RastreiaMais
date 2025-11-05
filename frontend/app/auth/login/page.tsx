// frontend/app/auth/login/page.tsx
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function LoginIndex() {
  // Em alguns setups o cookies() é async (tipado como Promise) — por isso o await
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  // Já logado? redireciona para o dashboard do papel
  if (role === "MANAGER") redirect("/gestor");
  if (role === "PROFESSIONAL") redirect("/profissional");
  if (role === "PATIENT") redirect("/me");

  // Sem papel → escolhe como entrar
  return (
    <main className="min-h-[60vh] grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6 text-center">
        <h1 className="text-2xl font-semibold">Como deseja entrar?</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/auth/login/paciente"
            className="rounded-2xl border border-foreground/10 bg-orange-600 dark:bg-transparent text-white dark:border-orange-600 dark:text-orange-600 dark:hover:bg-gray-900 hover:shadow-sm px-4 py-3 hover:border-foreground/30 transition"
          >
            Sou Paciente
          </Link>
          <Link
            href="/auth/login/profissional"
            className="rounded-2xl border border-foreground/10 bg-orange-600 dark:bg-transparent text-white dark:border-orange-600 dark:text-orange-600 dark:hover:bg-gray-900 hover:shadow-sm px-4 py-3 hover:border-foreground/30 transition"
          >
            Sou Profissional
          </Link>
        </div>

        <p className="text-foreground/60 text-sm">
          Gestores entram como <strong>profissional</strong>; o sistema
          reconhece o papel após autenticar.
        </p>
      </div>
    </main>
  );
}
