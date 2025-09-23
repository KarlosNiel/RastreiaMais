// frontend/app/auth/login/paciente/page.tsx
"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { useRouter } from "next/navigation";
import { useState } from "react";

function formatCpf(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 9);
  const p4 = d.slice(9, 11);
  return [p1, p2 && `.${p2}`, p3 && `.${p3}`, p4 && `-${p4}`]
    .filter(Boolean)
    .join("");
}

export default function LoginPacientePage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");

  function handleDevLogin() {
    document.cookie = [
      "role=PATIENT",
      "path=/",
      "SameSite=Lax",
      "Max-Age=3600",
      // adicionar "; Secure" quando estiver em HTTPS
    ].join("; ");
    router.replace("/me");
  }

  return (
    <AuthCard
      imageSrc="/auth/paciente.jpg"
      heading="Seja Bem-Vindo(a), Paciente!"
    >
      <form
        className="stack-6"
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          handleDevLogin();
        }}
        aria-label="Formulário de login do paciente"
      >
        <TextField
          label="CPF"
          name="cpf"
          value={cpf}
          onValueChange={(v) => setCpf(formatCpf(v))}
          placeholder="000.000.000-00"
          description="Formato: 000.000.000-00"
          isRequired
          autoFocus
          autoComplete="off"
          inputMode="numeric"
          pattern={String.raw`\d{3}\.\d{3}\.\d{3}-\d{2}`}
          title="Informe no formato 000.000.000-00"
          maxLength={14}
          enterKeyHint="next"
        />

        <TextField
          label="E-mail"
          type="email"
          name="email"
          value={email}
          onValueChange={setEmail}
          placeholder="nome@exemplo.com"
          isRequired
          autoComplete="email"
          autoCapitalize="none"
          spellCheck="false"
          enterKeyHint="done"
        />

        <SubmitButton>Entrar</SubmitButton>
      </form>
    </AuthCard>
  );
}
