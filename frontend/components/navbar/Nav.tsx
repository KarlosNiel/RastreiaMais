// frontend/components/navbar/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER" | null;

const NAV: { label: string; href: string; roles: Exclude<Role, null>[] }[] = [
  { label: "Dashboard Gestor", href: "/gestor", roles: ["MANAGER"] },
  {
    label: "Profissional",
    href: "/profissional",
    roles: ["PROFESSIONAL", "MANAGER"],
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    roles: ["PROFESSIONAL", "MANAGER"],
  },
  { label: "Meu Portal", href: "/me", roles: ["PATIENT"] },
];

function readRoleFromCookie(): Role {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/(?:^|;\s*)role=([^;]+)/);

  return (m ? decodeURIComponent(m[1]) : null) as Role;
}

export default function Nav() {
  const pathname = usePathname();
  const [role, setRole] = useState<Role>(null);

  useEffect(() => {
    // 1) tenta cookie (como no login), 2) fallback para localStorage (dev)
    const fromCookie = readRoleFromCookie();
    const fromStorage = (
      typeof window !== "undefined"
        ? (localStorage.getItem("role") as Role)
        : null
    ) as Role;

    setRole(fromCookie ?? fromStorage ?? null);

    // atualiza se outro tab mudar localStorage (ex.: logout/login)
    const onStorage = (e: StorageEvent) => {
      if (e.key === "role") setRole((e.newValue as Role) ?? null);
    };

    window.addEventListener("storage", onStorage);

    // tenta re-ler cookie quando a aba volta a ficar visível
    const onVis = () =>
      setRole(
        readRoleFromCookie() ?? (localStorage.getItem("role") as Role) ?? null,
      );

    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!role) return null; // sem papel → não exibe navegação

  const items = NAV.filter((i) =>
    i.roles.includes(role as Exclude<Role, null>),
  );

  return (
    <nav aria-label="Navegação principal" className="flex items-center gap-4">
      {items.map((i) => {
        const active =
          pathname === i.href || (pathname?.startsWith(i.href + "/") ?? false);

        return (
          <Link
            key={i.href}
            aria-current={active ? "page" : undefined}
            className={[
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              // estados visuais padronizados
              "hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              // ativo
              "data-[active=true]:bg-slate-100 data-[active=true]:text-slate-900 data-[active=true]:font-semibold dark:data-[active=true]:bg-zinc-800 dark:data-[active=true]:text-zinc-100",
              // inativo
              "data-[active=false]:text-slate-600 dark:data-[active=false]:text-zinc-400",
            ].join(" ")}
            data-active={active ? "true" : "false"}
            href={i.href}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
