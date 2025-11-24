// frontend/app/auth/login/profissional/page.tsx
"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { loginAndAssertRole, pickDashboard, setRoleCookie } from "@/lib/auth";
import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";

export default function LoginProfissionalPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isValid = useMemo(() => {
    const e = email.trim();

    return e.length > 0 && pwd.length > 0;
  }, [email, pwd]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;

    setErrorMsg(null);
    setLoading(true);

    try {
      const username = email.trim().toLowerCase();

      const me = await loginAndAssertRole(
        username,
        pwd,
        ["MANAGER", "PROFESSIONAL"],
        rememberMe,
      );

      // 2) Define cookie leve para o middleware (prioridade MANAGER > PROFESSIONAL)
      const role = me.roles.includes("MANAGER") ? "MANAGER" : "PROFESSIONAL";

      setRoleCookie(role);

      // 3) Redireciona para o dashboard adequado
      router.replace(pickDashboard(me.roles));
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Erro inesperado ao entrar. Verifique suas credenciais e tente novamente.";

      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      heading="Seja Bem Vindo Profissional!"
      imageSrc="/auth/profissional.jpg"
    >
      <form
        noValidate
        aria-label="Formulário de login do profissional"
        className="stack-6"
        onSubmit={handleSubmit}
      >
        <TextField
          isRequired
          autoCapitalize="none"
          autoComplete="email"
          className="pb-6"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 transition",
          }}
          enterKeyHint="next"
          label="E-mail"
          name="email"
          placeholder="nome@exemplo.com"
          spellCheck="false"
          type="email"
          value={email}
          onValueChange={setEmail}
        />

        <TextField
          isRequired
          autoComplete="current-password"
          className="pb-6"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 transition",
          }}
          endContent={
            <button
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPwd}
              className="text-foreground/60 hover:text-foreground focus-visible:outline-none"
              type="button"
              onClick={() => setShowPwd((v) => !v)}
            >
              {showPwd ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
          enterKeyHint="done"
          label="Senha"
          name="password"
          placeholder="••••••••"
          type={showPwd ? "text" : "password"}
          value={pwd}
          onValueChange={setPwd}
        />

        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              checked={rememberMe}
              className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
              type="checkbox"
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Lembrar-me</span>
          </label>
          <a
            className="text-sm text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition"
            href="/auth/recuperar-senha"
          >
            Esqueceu a senha?
          </a>
        </div>

        {errorMsg && (
          <div className="text-danger-500 text-sm" role="alert">
            {errorMsg}
          </div>
        )}

        <SubmitButton disabled={loading || !isValid} isLoading={loading}>
          Entrar
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
