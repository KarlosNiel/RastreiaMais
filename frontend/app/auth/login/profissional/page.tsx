// frontend/app/auth/login/profissional/page.tsx
"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { loginAndAssertRole, pickDashboard, setRoleCookie } from "@/lib/auth";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

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
        rememberMe
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
      imageSrc="/auth/profissional.jpg"
      heading="Seja Bem Vindo Profissional!"
    >
      <form
        className="stack-6"
        noValidate
        aria-label="Formulário de login do profissional"
        onSubmit={handleSubmit}
      >
        <TextField
          label="E-mail"
          type="email"
          name="email"
          value={email}
          onValueChange={setEmail}
          placeholder="nome@exemplo.com"
          isRequired
          autoFocus
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="next"
          className="pb-6"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 transition",
          }}
        />

        <TextField
          label="Senha"
          name="password"
          type={showPwd ? "text" : "password"}
          value={pwd}
          onValueChange={setPwd}
          placeholder="••••••••"
          isRequired
          autoComplete="current-password"
          enterKeyHint="done"
          className="pb-6"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 transition",
          }}
          endContent={
            <button
              type="button"
              onClick={() => setShowPwd((v) => !v)}
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPwd}
              className="text-foreground/60 hover:text-foreground focus-visible:outline-none"
            >
              {showPwd ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          }
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer mb-6">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <span>Lembrar-me neste dispositivo</span>
        </label>

        {errorMsg && (
          <div role="alert" className="text-danger-500 text-sm">
            {errorMsg}
          </div>
        )}

        <SubmitButton isLoading={loading} disabled={loading || !isValid}>
          Entrar
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
