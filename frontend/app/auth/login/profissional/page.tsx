// frontend/app/auth/login/profissional/page.tsx
"use client";

import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Checkbox } from "@heroui/checkbox";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

      // Define cookie leve para o middleware (prioridade MANAGER > PROFESSIONAL)
      const role = me.roles.includes("MANAGER") ? "MANAGER" : "PROFESSIONAL";

      setRoleCookie(role);

      // Redireciona para o dashboard adequado
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
      heading="Acesso do Profissional"
      subheading="Entre com seu e-mail institucional ou usuário APS para acessar os prontuários e painéis clínicos."
    >
      <form
        noValidate
        aria-label="Formulário de login do profissional"
        className="space-y-4"
        onSubmit={handleSubmit}
      >
        {/* Banner de Erro Humanizado */}
        {errorMsg && (
          <div
            className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 text-xs animate-in fade-in duration-150"
            role="alert"
          >
            <ExclamationCircleIcon className="size-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-bold block">Falha na autenticação</span>
              {errorMsg}
            </div>
          </div>
        )}

        <TextField
          isRequired
          autoCapitalize="none"
          autoComplete="username"
          enterKeyHint="next"
          label="E-mail ou Usuário APS"
          name="username"
          placeholder="seu.email@saude.gov.br ou usuario"
          spellCheck="false"
          startContent={
            <Mail className="size-4 text-slate-400 dark:text-zinc-500 mr-1.5" />
          }
          type="text"
          value={email}
          onValueChange={setEmail}
        />

        <TextField
          isRequired
          autoComplete="current-password"
          endContent={
            <button
              aria-label={showPwd ? "Ocultar senha" : "Mostrar senha"}
              aria-pressed={showPwd}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 transition-colors p-1"
              tabIndex={-1}
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
          label="Senha de Acesso"
          name="password"
          placeholder="••••••••"
          startContent={
            <Lock className="size-4 text-slate-400 dark:text-zinc-500 mr-1.5" />
          }
          type={showPwd ? "text" : "password"}
          value={pwd}
          onValueChange={setPwd}
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
            Manter conectado
          </Checkbox>

          <Link
            className="text-xs font-semibold text-primary hover:text-primary-600 dark:hover:text-primary-400 hover:underline transition-colors"
            href="/auth/recuperar-senha"
          >
            Esqueceu a senha?
          </Link>
        </div>

        <div className="pt-2">
          <SubmitButton
            disabled={loading || !isValid}
            endContent={<ArrowRight className="size-4" />}
            isLoading={loading}
          >
            {loading ? "Autenticando..." : "Entrar no Sistema"}
          </SubmitButton>
        </div>
      </form>
    </AuthCard>
  );
}
