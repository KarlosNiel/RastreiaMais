"use client";

import { Button } from "@heroui/react";
import { useRouter } from "next/navigation";
import { UserCircleIcon, CogIcon } from "@heroicons/react/24/outline";

export const RoleCards = () => {
  const router = useRouter();

  return (
    <section
      className="py-20  dark:bg-gray-950 transition-colors duration-300"
      id="entrar"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground dark:text-white">
            Escolha seu Perfil de Acesso
          </h2>
          <p className="text-lg text-default-600 dark:text-gray-400">
            Acesse a plataforma conforme seu perfil
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Profissional */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-8 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="size-14 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/30 flex items-center justify-center mb-6">
                <CogIcon className="size-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">
                Profissional de Saúde
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
                Acesse prontuários, gerencie consultas e visualize exames com
                agilidade
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Gestão completa de pacientes",
                  "Relatórios e indicadores de APS",
                  "Histórico de consultas e exames",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="size-1.5 rounded-full bg-primary" />
                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full font-semibold text-white bg-primary hover:bg-primary/90 shadow-2xs"
              color="primary"
              radius="md"
              size="lg"
              onPress={() => router.push("/auth/login/profissional")}
            >
              Entrar como Profissional
            </Button>
          </div>

          {/* Paciente */}
          <div className="rounded-2xl border border-slate-200/80 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-8 shadow-xs hover:border-slate-300 dark:hover:border-zinc-700 hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="size-14 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/30 flex items-center justify-center mb-6">
                <UserCircleIcon className="size-7 text-sky-600 dark:text-sky-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-slate-900 dark:text-zinc-100">
                Portal do Paciente
              </h3>
              <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
                Acompanhe seus dados vitais, consultas e orientações médicas de
                forma simples
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Histórico de saúde completo",
                  "Visualizar consultas e exames",
                  "Acompanhar medicações prescritas",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="size-1.5 rounded-full bg-sky-500" />
                    <span className="text-sm text-slate-600 dark:text-zinc-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              className="w-full font-semibold border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
              radius="md"
              size="lg"
              variant="bordered"
              onPress={() => router.push("/auth/login/paciente")}
            >
              Entrar como Paciente
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};
