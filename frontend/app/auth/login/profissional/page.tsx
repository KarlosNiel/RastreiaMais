// frontend/app/auth/login/profissional/page.tsx
"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginProfissionalPage() {
  const router = useRouter();
  const [account, setAccount] = useState("");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  function handleDevLogin() {
    document.cookie = [
      "role=PROFESSIONAL",
      "path=/",
      "SameSite=Lax",
      "Max-Age=3600",
      // adicionar "; Secure" quando estiver servindo em HTTPS
    ].join("; ");
    router.replace("/profissional");
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
        onSubmit={(e) => {
          e.preventDefault();
          handleDevLogin();
        }}
      >
        <TextField
          label="Nome da conta"
          name="account"
          value={account}
          onValueChange={setAccount}
          placeholder="ex.: USF Maria Madalena"
          isRequired
          autoFocus
          autoComplete="organization"
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
          enterKeyHint="next"
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

        <SubmitButton>Entrar</SubmitButton>
      </form>
    </AuthCard>
  );
}
