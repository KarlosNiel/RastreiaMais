"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { useRouter } from "next/navigation";
import {UserCircleIcon, CogIcon} from "@heroicons/react/24/outline";

export const RoleCards = () => {
  const router = useRouter();

  return (
    <section className="py-20  dark:bg-gray-950 transition-colors duration-300" id="entrar">
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
          <Card className="relative group hover:scale-105 transition-transform duration-300 border border-transparent dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 dark:from-primary/10 dark:to-primary/0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <CardBody className="relative p-8">
              <div className="w-16 h-16 rounded-2xl bg-orange-50/25 dark:bg-orange-500/10 flex items-center justify-center mb-6">
                <CogIcon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-gray-100">
                Profissional de Saúde
              </h3>
              <p className="text-default-600 dark:text-gray-400 mb-6 leading-relaxed">
                Acesse prontuários, gerencie consultas e visualize exames
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Gestão completa de pacientes",
                  "Relatórios e indicadores",
                  "Histórico de consultas e exames",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />
                    <span className="text-sm text-default-600 dark:text-gray-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                onPress={() => router.push("/auth/login/profissional")}
                color="primary" 
                size="lg" 
                className="w-full font-semibold"
              >
                Entrar como Profissional
              </Button>
            </CardBody>
          </Card>

          {/* Paciente */}
          <Card className="relative group hover:scale-105 transition-transform duration-300 border border-transparent dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-secondary/5 dark:from-secondary/10 dark:to-secondary/0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300" />
            <CardBody className="relative p-8">
              <div className="w-16 h-16 rounded-2xl bg-secondary-100 dark:bg-secondary-500/10 flex items-center justify-center mb-6">
                <UserCircleIcon className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground dark:text-gray-100">
                Paciente
              </h3>
              <p className="text-default-600 dark:text-gray-400 mb-6 leading-relaxed">
                Acompanhe seus dados de saúde, consultas e resultados de exames
              </p>

              <ul className="space-y-3 mb-8">
                {[
                  "Histórico de saúde completo",
                  "Visualizar consultas e exames",
                  "Acompanhar medicações",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-secondary mt-2" />
                    <span className="text-sm text-default-600 dark:text-gray-400">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>

              <Button 
                onPress={() => router.push("/auth/login/paciente")}
                color="secondary" 
                size="lg" 
                className="w-full font-semibold"
              >
                Entrar como Paciente
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
};