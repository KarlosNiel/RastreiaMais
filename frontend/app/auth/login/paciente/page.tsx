// frontend/app/auth/login/paciente/page.tsx
"use client";

import { ArrowRight, Eye, EyeOff, Lock, User } from "lucide-react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "@heroui/checkbox";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { loginAndAssertRole, setRoleCookie } from "@/lib/auth";

export default function LoginPacientePage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // evita duplo submit
    setError(null);

    const rawLogin = login.trim();

    if (!rawLogin) {
      setError("Por favor, informe seu CPF ou e-mail cadastrado.");
      return;
    }
    if (!password) {
      setError("Por favor, digite sua senha de acesso.");
      return;
    }

    // Normalização leve:
    // - se tiver "@", assume e-mail e deixa minúsculo
    // - caso contrário, envia como veio (CPF com/sem máscara ou username)
    const identifier = rawLogin.includes("@")
      ? rawLogin.toLowerCase()
      : rawLogin;

    setLoading(true);
    try {
      await loginAndAssertRole(identifier, password, ["PATIENT"], rememberMe);

      // Cookie leve p/ middleware e redirect
      setRoleCookie("PATIENT");
      router.replace("/me");
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Falha no login. Verifique seus dados e tente novamente.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      heading="Acesso do Paciente"
      subheading="Entre com seu CPF ou e-mail cadastrado."
    >
      <form
        noValidate
        aria-label="Formulário de login do paciente"
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {/* Banner de Erro Direto */}
        {error && (
          <div
            className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs animate-in fade-in duration-150"
            role="alert"
          >
            <ExclamationCircleIcon className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <TextField
          isRequired
          autoCapitalize="none"
          autoComplete="username"
          enterKeyHint="next"
          label="CPF ou E-mail"
          name="login"
          placeholder="000.000.000-00 ou email"
          spellCheck="false"
          startContent={
            <User className="size-4 text-slate-400 dark:text-zinc-500 mr-1.5" />
          }
          type="text"
          value={login}
          onValueChange={setLogin}
        />

        <TextField
          isRequired
          autoComplete="current-password"
          endContent={
            <button
              aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPassword}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-1"
              tabIndex={-1}
              type="button"
              onClick={() => setShowPassword((v) => !v)}
            >
              {showPassword ? (
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
          startContent={
            <Lock className="size-4 text-slate-400 dark:text-zinc-500 mr-1.5" />
          }
          type={showPassword ? "text" : "password"}
          value={password}
          onValueChange={setPassword}
        />

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            color="primary"
            isSelected={rememberMe}
            size="sm"
            classNames={{
              label:
                "text-xs text-slate-600 dark:text-zinc-400 select-none font-medium",
            }}
            onValueChange={setRememberMe}
          >
            Lembrar-me
          </Checkbox>

          <Link
            className="text-xs font-medium text-primary hover:underline transition-colors"
            href="/auth/recuperar-senha"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <div className="pt-2">
          <SubmitButton
            disabled={loading}
            isLoading={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </SubmitButton>
        </div>
      </form>
    </AuthCard>
  );
}
