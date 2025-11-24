// frontend/app/auth/login/paciente/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { loginAndAssertRole, setRoleCookie } from "@/lib/auth";

export default function LoginPacientePage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // evita duplo submit
    setError(null);

    const rawLogin = login.trim();

    if (!rawLogin) {
      setError("Informe CPF, e-mail ou usuário.");

      return;
    }
    if (!password) {
      setError("Informe sua senha.");

      return;
    }

    /// Normalização leve:
    // - se tiver "@", assume e-mail e deixa minúsculo
    // - caso contrário, envia como veio (CPF com/sem máscara ou username)
    const identifier = rawLogin.includes("@")
      ? rawLogin.toLowerCase()
      : rawLogin;

    setLoading(true);
    try {
      // O backend (EmailOrUsernameOrCpfTokenObtainPairSerializer)
      // decide se é e-mail / CPF / username.
      await loginAndAssertRole(identifier, password, ["PATIENT"], rememberMe);

      // Cookie leve p/ middleware e redirect
      setRoleCookie("PATIENT");
      router.replace("/me");
    } catch (err: any) {
      const msg =
        typeof err?.message === "string" && err.message.trim()
          ? err.message
          : "Falha no login. Verifique suas credenciais e tente novamente.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      className=""
      heading="Seja Bem-Vindo(a), Paciente!"
      imageSrc="/auth/paciente.jpg"
    >
      <form
        noValidate
        aria-label="Formulário de login do paciente"
        className="stack-6"
        onSubmit={handleSubmit}
      >
        <TextField
          isRequired
          autoCapitalize="none"
          autoComplete="username"
          className="pb-6"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 transition",
          }}
          enterKeyHint="next"
          label="CPF ou e-mail"
          name="login"
          placeholder="Digite seu CPF ou e-mail"
          spellCheck="false"
          type="text"
          value={login}
          onValueChange={setLogin}
        />

        <TextField
          isRequired
          autoComplete="current-password"
          className="pb-6"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 hover:shadow-sm transition",
          }}
          enterKeyHint="done"
          label="Senha"
          name="password"
          placeholder="******"
          type="password"
          value={password}
          onValueChange={setPassword}
        />

        <div className="flex items-center justify-between pb-6">
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

        {error && (
          <div className="text-danger-500 text-sm" role="alert">
            {error}
          </div>
        )}

        <SubmitButton disabled={loading} isLoading={loading}>
          Entrar
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
