"use client";

import { FileText, HeartPulse, Sparkles, Stethoscope } from "lucide-react";

const FEATURES = [
  {
    Icon: HeartPulse,
    title: "Doenças Crônicas",
    desc: "Gestão especializada para hipertensão, diabetes e outras condições crônicas.",
    tone: "bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:text-rose-400",
  },
  {
    Icon: FileText,
    title: "Prontuário Digital",
    desc: "Consultas, exames e medicações organizados em formato digital.",
    tone: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400",
  },
  {
    Icon: Stethoscope,
    title: "Avaliação Multiprofissional",
    desc: "Avaliação integrada considerando os determinantes sociais de saúde.",
    tone: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  },
  {
    Icon: Sparkles,
    title: "Interface Agradável",
    desc: "Moderna e intuitiva para usuários de todas as idades.",
    tone: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
  },
];

export const Features = () => {
  return (
    <section className="scroll-mt-20 py-24" id="recursos">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="mx-auto mb-16 max-w-xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-brand">
            Recursos
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight tracking-[-0.02em] text-slate-900 sm:text-[2.5rem] dark:text-zinc-50">
            Recursos Completos para Gestão de Saúde
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ Icon, title, desc, tone }) => (
            <div key={title}>
              <div
                className={`mb-5 flex size-10 items-center justify-center rounded-full ${tone}`}
              >
                <Icon className="size-[18px]" strokeWidth={2} />
              </div>
              <h3 className="font-display text-base font-semibold text-slate-900 dark:text-zinc-100">
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
