"use client";

import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import {
  ChartBarIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from "@heroicons/react/24/outline";

export const Presentation = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center ">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center w-full justify-center py-8">
            <h1 className="text-5xl md:text-6xl font-black text-primary tracking-tighter">
              RastreiaCardio
            </h1>
          </div>

          <p className="text-xl sm:text-2xl text-default-600 dark:text-gray-300 mb-8 leading-relaxed">
            Plataforma completa para auxiliar equipes no gerenciamento de dados
            de pacientes com doenças crônicas não transmissíveis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              className="text-base font-semibold"
              color="primary"
              size="lg"
            >
              <Link href="/auth/login/profissional">
                Acessar como Profissional
              </Link>
            </Button>
            <Button
              className="text-base font-semibold"
              color="secondary"
              size="lg"
              variant="flat"
            >
              <Link href="/auth/login/paciente">Acessar como Paciente</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: UserGroupIcon,
                bg: "bg-orange-100 dark:bg-orange-500/10",
                text: "Gestão de Pacientes",
                color: "text-primary",
                desc: "Acompanhe todos os dados dos pacientes em um só lugar",
              },
              {
                icon: ChartBarIcon,
                bg: "bg-secondary-100 dark:bg-secondary-500/10",
                text: "Monitoramento Contínuo",
                color: "text-secondary",
                desc: "Registre e acompanhe dados vitais, consultas e exames",
              },
              {
                icon: ClipboardDocumentCheckIcon,
                bg: "bg-success-100 dark:bg-success-500/10",
                text: "Dashboards e Formulários",
                color: "text-success",
                desc: "Visualize e registre informações de forma eficiente",
              },
            ].map((card, i) => {
              const Icon = card.icon;

              return (
                <Card
                  key={i}
                  className="hover:scale-105 transition-transform duration-300 border border-transparent dark:border-gray-800 bg-white dark:bg-gray-900"
                >
                  <CardBody className="text-center p-6">
                    <div
                      className={`w-12 h-12 rounded-lg ${card.bg} flex items-center justify-center mb-4 mx-auto`}
                    >
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                    <h3 className="font-semibold mb-2 text-foreground dark:text-gray-100">
                      {card.text}
                    </h3>
                    <p className="text-sm text-default-600 dark:text-gray-400">
                      {card.desc}
                    </p>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
