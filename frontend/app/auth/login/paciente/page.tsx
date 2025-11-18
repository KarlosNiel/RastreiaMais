// frontend/app/auth/login/paciente/page.tsx
"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { loginAndAssertRole, setRoleCookie } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
      imageSrc="/auth/paciente.jpg"
      heading="Seja Bem-Vindo(a), Paciente!"
      className=""
    >
      <form
        className="stack-6"
        noValidate
        onSubmit={handleSubmit}
        aria-label="Formulário de login do paciente"
      >
        <TextField
          className="pb-6"
          label="CPF ou e-mail"
          type="text"
          name="login"
          value={login}
          onValueChange={setLogin}
          placeholder="Digite seu CPF ou e-mail"
          isRequired
          autoFocus
          autoComplete="username"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="next"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 transition",
          }}
        />

        <TextField
          className="pb-6"
          label="Senha"
          type="password"
          name="password"
          value={password}
          onValueChange={setPassword}
          placeholder="******"
          isRequired
          autoComplete="current-password"
          enterKeyHint="done"
          classNames={{
            input: "",
            inputWrapper: "border border-orange-600 hover:shadow-sm transition",
          }}
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer pb-6">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
          />
          <span>Lembrar-me neste dispositivo</span>
        </label>

        {error && (
          <div role="alert" className="text-danger-500 text-sm">
            {error}
          </div>
        )}

        <SubmitButton isLoading={loading} disabled={loading}>
          Entrar
        </SubmitButton>
      </form>
    </AuthCard>
  );
}
