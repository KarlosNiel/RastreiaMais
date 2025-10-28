// frontend/app/auth/login/paciente/page.tsx
"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { loginAndAssertRole, setRoleCookie } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPacientePage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return; // evita duplo submit
    setError(null);

    const username = email.trim().toLowerCase();
    if (!username) return setError("Informe o e-mail.");
    if (!password) return setError("Informe sua senha.");

    setLoading(true);
    try {
      // 1) Login + garantia de papel PACIENTE
      await loginAndAssertRole(username, password, ["PATIENT"]);

      // 2) Cookie leve p/ middleware e redirect
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
    >
      <form
        className="stack-6"
        noValidate
        onSubmit={handleSubmit}
        aria-label="Formulário de login do paciente"
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
        />

        <TextField
          label="Senha"
          type="password"
          name="password"
          value={password}
          onValueChange={setPassword}
          placeholder="******"
          isRequired
          autoComplete="current-password"
          enterKeyHint="done"
        />

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
