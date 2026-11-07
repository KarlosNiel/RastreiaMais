// frontend/components/layout/Footer.tsx
import Link from "next/link";

import { LandingLogo } from "@/components/home/LandingLogo";

const LINK_GROUPS = [
  {
    title: "Plataforma",
    links: [
      { label: "Recursos", href: "/auth/login#recursos" },
      { label: "Perfis de acesso", href: "/auth/login#entrar" },
    ],
  },
  {
    title: "Acesso",
    links: [
      { label: "Profissional", href: "/auth/login/profissional" },
      { label: "Paciente", href: "/auth/login/paciente" },
      { label: "Recuperar senha", href: "/auth/recuperar-senha" },
    ],
  },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="border-t border-slate-100 bg-white dark:border-zinc-800/80 dark:bg-zinc-950"
      id="sobre"
    >
      <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="max-w-xs">
            <LandingLogo href="/" />
            <p className="mt-4 text-sm leading-relaxed text-slate-500 dark:text-zinc-400">
              Gestão inteligente e rastreamento de risco cardiovascular para UBS
              e APS.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12 sm:gap-20">
            {LINK_GROUPS.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                  {group.title}
                </h3>
                <ul className="mt-3 space-y-2">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        className="text-sm text-slate-500 transition-colors hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                        href={link.href}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-10 border-t border-slate-100 pt-6 text-xs text-slate-500 dark:border-zinc-800 dark:text-zinc-500">
          © {currentYear} RastreiaCardio. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};
