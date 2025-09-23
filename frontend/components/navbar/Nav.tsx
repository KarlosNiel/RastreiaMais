// frontend/components/navbar/Nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Role = "PATIENT" | "PROFESSIONAL" | "MANAGER" | null;

const NAV: { label: string; href: string; roles: Exclude<Role, null>[] }[] = [
  { label: "Dashboard Gestor", href: "/dashboard", roles: ["MANAGER"] },
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
        readRoleFromCookie() ?? (localStorage.getItem("role") as Role) ?? null
      );
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  if (!role) return null; // sem papel → não exibe navegação

  const items = NAV.filter((i) =>
    i.roles.includes(role as Exclude<Role, null>)
  );

  return (
    <nav aria-label="Navegação principal" className="flex items-center gap-4">
      {items.map((i) => {
        const active =
          pathname === i.href || (pathname?.startsWith(i.href + "/") ?? false);

        return (
          <Link
            key={i.href}
            href={i.href}
            aria-current={active ? "page" : undefined}
            data-active={active ? "true" : "false"}
            className={[
              "rounded-2xl px-3 py-2 text-sm transition",
              // estados visuais padronizados
              "hover:bg-content2 hover:text-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50",
              // ativo
              "data-[active=true]:bg-content2 data-[active=true]:text-foreground data-[active=true]:font-medium",
              // inativo
              "data-[active=false]:text-foreground/80",
            ].join(" ")}
          >
            {i.label}
          </Link>
        );
      })}
    </nav>
  );
}
