"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import { requestPasswordReset } from "@/services/accounts/password-reset";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useState, useMemo } from "react";
import { Mail, CheckCircle2, ArrowLeft } from "lucide-react";

export default function RecuperarSenhaPage() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidIdentifier = useMemo(() => {
    const trimmed = identifier.trim();
    return trimmed.length > 0;
  }, [identifier]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !isValidIdentifier) return;

    setError(null);
    setSuccess(false);

    const trimmedIdentifier = identifier.trim();

    setLoading(true);
    try {
      await requestPasswordReset({ identifier: trimmedIdentifier });
      setSuccess(true);
      setIdentifier("");
    } catch (err: any) {
      const msg =
        err?.message ||
        "Erro ao solicitar recuperação de senha. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard
      imageSrc="/auth/paciente.jpg"
      heading="Recuperar Senha"
      className=""
    >
      {success ? (
        <div className="flex flex-col gap-6 text-center">
          {/* Ícone de sucesso */}
          <div className="flex justify-center pt-2">
            <div className="rounded-full bg-success-100 dark:bg-success-900/30 p-4">
              <CheckCircle2 className="size-12 text-success-600 dark:text-success-500" />
            </div>
          </div>

          {/* Mensagem de sucesso */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">
              Email Enviado!
            </h3>
            <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
              <p className="text-success-800 dark:text-success-200 text-sm leading-relaxed">
                Se o email informado estiver cadastrado, você receberá
                instruções para recuperação de senha em alguns instantes.
              </p>
            </div>
          </div>

          {/* Instruções adicionais */}
          <div className="bg-default-100 dark:bg-default-50/10 rounded-lg p-4">
            <div className="flex items-start gap-3 text-sm text-foreground/70">
              <Mail className="size-5 mt-0.5 flex-shrink-0 text-foreground/50" />
              <p className="text-left leading-relaxed">
                Verifique sua caixa de entrada e também a pasta de spam.
              </p>
            </div>
          </div>

          {/* Botão voltar */}
          <div className="mt-2">
            <Link
              href="/auth/login"
              className={cn(
                "inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg",
                "text-sm font-medium transition-colors",
                "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300",
                "hover:bg-orange-50 dark:hover:bg-orange-900/10"
              )}
            >
              <ArrowLeft className="size-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      ) : (
        <form
          className="flex flex-col gap-5"
          noValidate
          onSubmit={handleSubmit}
          aria-label="Formulário de recuperação de senha"
        >
          {/* Descrição */}
          <div className="bg-default-100 dark:bg-default-50/10 rounded-lg p-4 mb-1">
            <p className="text-sm text-foreground/70 leading-relaxed">
              Informe seu <strong>email</strong>, <strong>CPF</strong> ou{" "}
              <strong>nome de usuário</strong> para receber instruções de
              recuperação de senha.
            </p>
          </div>

          {/* Campo de identificação */}
          <div className="space-y-2">
            <TextField
              label="Email, CPF ou Usuário"
              type="text"
              name="identifier"
              value={identifier}
              onValueChange={setIdentifier}
              placeholder="Digite seu email, CPF ou usuário"
              isRequired
              autoFocus
              autoComplete="username"
              autoCapitalize="none"
              spellCheck="false"
              classNames={{
                input: "",
                inputWrapper: cn(
                  "border transition-colors",
                  isValidIdentifier ? "border-orange-600" : "border-default-200"
                ),
              }}
              startContent={
                <Mail className="size-4 text-foreground/40 flex-shrink-0" />
              }
            />
          </div>

          {/* Erro */}
          {error && (
            <div
              role="alert"
              className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4"
            >
              <p className="text-danger-800 dark:text-danger-200 text-sm">
                {error}
              </p>
            </div>
          )}

          {/* Botão submit */}
          <div className="mt-2">
            <SubmitButton
              isLoading={loading}
              disabled={loading || !isValidIdentifier}
            >
              {loading ? "Enviando..." : "Enviar instruções"}
            </SubmitButton>
          </div>

          {/* Link voltar */}
          <div className="mt-1">
            <Link
              href="/auth/login"
              className={cn(
                "flex items-center justify-center gap-2 text-sm font-medium transition-colors py-2",
                "text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300"
              )}
            >
              <ArrowLeft className="size-4" />
              Voltar para o login
            </Link>
          </div>
        </form>
      )}
    </AuthCard>
  );
}
