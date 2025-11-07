"use client";

import { Button, Card, CardBody } from "@heroui/react";
import Link from "next/link";
import { HeartIcon, DocumentTextIcon, CalendarIcon, WindowIcon,
} from "@heroicons/react/24/outline";

export const Features = () => {
  const features = [
    {
      icon: HeartIcon,
      title: "Doenças Crônicas",
      description:
        "Gestão especializada para hipertensão, diabetes e outras condições crônicas",
      color: "text-primary",
      bgColor: "bg-orange-100 dark:bg-orange-500/10",
    },
    {
      icon: DocumentTextIcon,
      title: "Prontuário Digital",
      description:
        "Tabelas de consultas, exames e medicações em formato digital",
      color: "text-secondary",
      bgColor: "bg-secondary-100 dark:bg-secondary-500/10",
    },
    {
      icon: CalendarIcon,
      title: "Agendamento",
      description:
        "Sistema integrado para gestão de consultas e acompanhamento",
      color: "text-success",
      bgColor: "bg-success-100 dark:bg-success-500/10",
    },
    {
      icon: WindowIcon,
      title: "Interface Agradável",
      description:
        "Interface moderna e intuitiva para usuários de todas as idades",
      color: "text-danger",
      bgColor: "bg-danger-100 dark:bg-danger-500/10",
    },
  ];

  return (
    <section className="py-20  dark:bg-gray-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground dark:text-white">
            Recursos Completos para Gestão de Saúde
          </h2>
          <p className="text-lg text-default-600 dark:text-gray-400">
            Tudo que você precisa para gerenciar o cuidado de pacientes com
            doenças crônicas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card
                key={i}
                className="hover:scale-105 hover:shadow-lg transition-all duration-300 border border-transparent dark:border-gray-80 dark:bg-gray-900"
              >
                <CardBody className="p-6">
                  <div
                    className={`w-14 h-14 rounded-xl ${feature.bgColor} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="text-default-600 dark:text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};