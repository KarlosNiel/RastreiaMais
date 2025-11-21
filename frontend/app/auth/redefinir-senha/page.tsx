"use client";

import { AuthCard, SubmitButton, TextField } from "@/components/auth/AuthCard";
import {
  validateResetToken,
  confirmPasswordReset,
} from "@/services/accounts/password-reset";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useMemo } from "react";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  {
    label: "Mínimo de 8 caracteres",
    test: (pwd) => pwd.length >= 8,
  },
  {
    label: "Não pode ser muito similar aos seus dados pessoais",
    test: (pwd) => pwd.length > 0, // Validado no backend
  },
  {
    label: "Não pode ser uma senha muito comum",
    test: (pwd) => pwd.length > 0, // Validado no backend
  },
];

function RedefinirSenhaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [touched, setTouched] = useState({
    password: false,
    passwordConfirm: false,
  });

  // Validação em tempo real
  const passwordValidation = useMemo(() => {
    return passwordRequirements.map((req) => ({
      ...req,
      valid: req.test(password),
    }));
  }, [password]);

  const passwordsMatch = useMemo(() => {
    if (!passwordConfirm) return null;
    return password === passwordConfirm;
  }, [password, passwordConfirm]);

  const isFormValid = useMemo(() => {
    return (
      password.length >= 8 &&
      passwordConfirm.length >= 8 &&
      password === passwordConfirm
    );
  }, [password, passwordConfirm]);

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setValidating(false);
        setTokenValid(false);
        return;
      }

      try {
        const response = await validateResetToken({ token });
        if (response && response.valid) {
          setTokenValid(true);
          setUserEmail(response.email || "");
        } else {
          setTokenValid(false);
          setError(response?.message || "Token inválido ou expirado.");
        }
      } catch (err: any) {
        setTokenValid(false);
        setError(err?.message || "Token inválido ou expirado.");
      } finally {
        setValidating(false);
      }
    }

    checkToken();
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading || !token || !isFormValid) return;

    setError(null);

    setLoading(true);
    try {
      await confirmPasswordReset({
        token,
        password,
        password_confirm: passwordConfirm,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 3000);
    } catch (err: any) {
      const msg = err?.message || "Erro ao redefinir senha. Tente novamente.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (validating) {
    return (
      <AuthCard imageSrc="/auth/paciente.jpg" heading="Validando..." className="">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      </AuthCard>
    );
  }

  if (!token || !tokenValid) {
    return (
      <AuthCard
        imageSrc="/auth/paciente.jpg"
        heading="Link Inválido"
        className=""
      >
        <div className="space-y-6">
          <div className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
            <p className="text-danger-800 dark:text-danger-200 text-sm">
              {error ||
                "Este link de recuperação é inválido ou expirou. Por favor, solicite um novo link."}
            </p>
          </div>
          <Link
            href="/auth/recuperar-senha"
            className="block text-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium transition"
          >
            Solicitar novo link
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (success) {
    return (
      <AuthCard
        imageSrc="/auth/paciente.jpg"
        heading="Senha Alterada!"
        className=""
      >
        <div className="space-y-6">
          <div className="bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800 rounded-lg p-4">
            <p className="text-success-800 dark:text-success-200 text-sm">
              Sua senha foi alterada com sucesso! Você será redirecionado para
              a página de login em instantes.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="block text-center text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 text-sm font-medium transition"
          >
            Ir para o login agora
          </Link>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      imageSrc="/auth/paciente.jpg"
      heading="Redefinir Senha"
      className=""
    >
      <form
        className="flex flex-col gap-5"
        noValidate
        onSubmit={handleSubmit}
        aria-label="Formulário de redefinição de senha"
      >
        {/* Email do usuário */}
        {userEmail && (
          <div className="bg-default-100 dark:bg-default-50/10 rounded-lg p-4 text-sm mb-2">
            <p className="text-foreground/70">
              Redefinindo senha para:{" "}
              <strong className="text-foreground">{userEmail}</strong>
            </p>
          </div>
        )}

        {/* Campo Nova Senha */}
        <div className="space-y-2">
          <TextField
            label="Nova Senha"
            type={showPassword ? "text" : "password"}
            name="password"
            value={password}
            onValueChange={setPassword}
            onBlur={() => setTouched({ ...touched, password: true })}
            placeholder="Mínimo 8 caracteres"
            isRequired
            autoFocus
            autoComplete="new-password"
            classNames={{
              input: "",
              inputWrapper: cn(
                "border transition-colors",
                touched.password && password.length >= 8
                  ? "border-success-500"
                  : "border-orange-600"
              ),
            }}
            endContent={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="text-foreground/60 hover:text-foreground focus-visible:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            }
          />

          {/* Requisitos da senha */}
          {password && (
            <div className="space-y-3 pt-2 pb-1">
              <p className="text-xs font-medium text-foreground/70">
                A senha deve conter:
              </p>
              <ul className="space-y-2">
                {passwordValidation.map((req, idx) => (
                  <li
                    key={idx}
                    className={cn(
                      "flex items-center gap-2.5 text-xs transition-colors",
                      req.valid
                        ? "text-success-600 dark:text-success-500"
                        : "text-foreground/50"
                    )}
                  >
                    {req.valid ? (
                      <CheckCircle2 className="size-4 flex-shrink-0" />
                    ) : (
                      <XCircle className="size-4 flex-shrink-0" />
                    )}
                    <span>{req.label}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Campo Confirmar Senha */}
        <div className="space-y-2 mt-2">
          <TextField
            label="Confirmar Nova Senha"
            type={showPasswordConfirm ? "text" : "password"}
            name="password_confirm"
            value={passwordConfirm}
            onValueChange={setPasswordConfirm}
            onBlur={() => setTouched({ ...touched, passwordConfirm: true })}
            placeholder="Digite a senha novamente"
            isRequired
            autoComplete="new-password"
            classNames={{
              input: "",
              inputWrapper: cn(
                "border transition-colors",
                touched.passwordConfirm && passwordsMatch === true
                  ? "border-success-500"
                  : touched.passwordConfirm && passwordsMatch === false
                    ? "border-danger-500"
                    : "border-orange-600"
              ),
            }}
            endContent={
              <button
                type="button"
                onClick={() => setShowPasswordConfirm((v) => !v)}
                aria-label={
                  showPasswordConfirm ? "Ocultar senha" : "Mostrar senha"
                }
                className="text-foreground/60 hover:text-foreground focus-visible:outline-none"
              >
                {showPasswordConfirm ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            }
          />

          {/* Feedback de confirmação */}
          {touched.passwordConfirm && passwordConfirm && (
            <div
              className={cn(
                "flex items-center gap-2.5 text-xs pt-1",
                passwordsMatch
                  ? "text-success-600 dark:text-success-500"
                  : "text-danger-600 dark:text-danger-500"
              )}
            >
              {passwordsMatch ? (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>As senhas coincidem</span>
                </>
              ) : (
                <>
                  <XCircle className="size-4" />
                  <span>As senhas não coincidem</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div
            role="alert"
            className="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4 mt-2"
          >
            <p className="text-danger-800 dark:text-danger-200 text-sm">
              {error}
            </p>
          </div>
        )}

        {/* Botão submit */}
        <div className="mt-4">
          <SubmitButton isLoading={loading} disabled={loading || !isFormValid}>
            Redefinir senha
          </SubmitButton>
        </div>
      </form>
    </AuthCard>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense
      fallback={
        <AuthCard imageSrc="/auth/paciente.jpg" heading="Carregando..." className="">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        </AuthCard>
      }
    >
      <RedefinirSenhaContent />
    </Suspense>
  );
}
