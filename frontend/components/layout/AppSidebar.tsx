"use client";

import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  HeartIcon,
  IdentificationIcon,
  MoonIcon,
  SunIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Tooltip } from "@heroui/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Role } from "@/lib/auth";
import { useAuth } from "@/lib/hooks/useAuth";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: Role[];
  badge?: string;
  section: "main" | "management" | "portal";
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard Clínico",
    href: "/profissional",
    icon: CalendarDaysIcon,
    roles: ["PROFESSIONAL", "MANAGER"],
    section: "main",
  },
  {
    label: "Gestão & APS",
    href: "/gestor",
    icon: ChartBarIcon,
    roles: ["MANAGER"],
    section: "main",
  },
  {
    label: "Pacientes",
    href: "/pacientes",
    icon: UserGroupIcon,
    roles: ["PROFESSIONAL", "MANAGER"],
    section: "main",
  },
  {
    label: "Novo Paciente",
    href: "/pacientes/novo",
    icon: UserPlusIcon,
    roles: ["PROFESSIONAL", "MANAGER"],
    section: "management",
  },
  {
    label: "Novo Profissional",
    href: "/cadastros/novo",
    icon: IdentificationIcon,
    roles: ["MANAGER"],
    section: "management",
  },
  {
    label: "Meu Portal",
    href: "/me",
    icon: HeartIcon,
    roles: ["PATIENT"],
    section: "portal",
  },
];

const ROLE_LABELS: Record<Role, string> = {
  MANAGER: "Gestor",
  PROFESSIONAL: "Profissional",
  PATIENT: "Paciente",
};

export function AppSidebar({ isMobileOpen, setIsMobileOpen }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, roles, logout } = useAuth();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem("rastreia:sidebar-collapsed");

      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {
      // localStorage indisponível
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;

      try {
        localStorage.setItem("rastreia:sidebar-collapsed", String(next));
      } catch {
        // ignora erro em ambiente restrito
      }

      return next;
    });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch {
      // falha silenciosa em caso de erro de rede
    }
  };

  const isItemActive = (href: string) => {
    if (href === "/pacientes") {
      return (
        pathname === "/pacientes" ||
        (pathname.startsWith("/pacientes/") &&
          !pathname.startsWith("/pacientes/novo"))
      );
    }

    return (
      pathname === href || (href !== "/" && pathname.startsWith(href + "/"))
    );
  };

  // Filtra itens de acordo com papéis do usuário
  // Se ainda estiver carregando ou sem papéis detectados, exibe itens profissionais por padrão
  const effectiveRoles: Role[] = roles.length > 0 ? roles : ["PROFESSIONAL"];
  const visibleItems = NAV_ITEMS.filter((item) =>
    item.roles.some((r) => effectiveRoles.includes(r)),
  );

  const mainItems = visibleItems.filter((i) => i.section === "main");
  const managementItems = visibleItems.filter(
    (i) => i.section === "management" || i.section === "portal",
  );

  const userName = user?.first_name || user?.username || "Profissional";
  const userInitials = (
    user?.first_name?.[0] ||
    user?.username?.[0] ||
    "RC"
  ).toUpperCase();
  const primaryRole = roles[0] || "PROFESSIONAL";
  const roleLabel = ROLE_LABELS[primaryRole] || "Profissional";

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside
        aria-label="Navegação principal"
        className={cn(
          "sticky top-0 h-dvh flex-col shrink-0 border-r border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-900/95 transition-all duration-300 ease-in-out z-30 hidden md:flex",
          isCollapsed ? "w-[72px]" : "w-64",
        )}
      >
        {/* Topo / Logo */}
        <div className="flex h-16 items-center justify-between px-3.5 border-b border-slate-100 dark:border-zinc-800/80">
          <Link
            className={cn(
              "flex items-center gap-2.5 rounded-xl py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isCollapsed ? "justify-center w-full" : "px-1.5",
            )}
            href={
              effectiveRoles.includes("MANAGER") ? "/gestor" : "/profissional"
            }
            title="RastreiaCardio"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-white shadow-xs">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.28" />
              </svg>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight truncate leading-tight">
                  Rastreia<span className="text-primary">Cardio</span>
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                  APS Digital
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              aria-label="Recolher menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              type="button"
              onClick={toggleCollapse}
            >
              <ChevronDoubleLeftIcon className="size-4" strokeWidth={2} />
            </button>
          )}
        </div>

        {/* Botão de Expandir quando colapsado */}
        {isCollapsed && (
          <div className="pt-2 px-3 flex justify-center">
            <Tooltip
              content="Expandir menu lateral"
              offset={8}
              placement="right"
            >
              <button
                aria-label="Expandir menu lateral"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                type="button"
                onClick={toggleCollapse}
              >
                <ChevronDoubleRightIcon className="size-4" strokeWidth={2} />
              </button>
            </Tooltip>
          </div>
        )}

        {/* Itens de Navegação */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-none">
          {/* Seção Principal */}
          <div className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                Visão Geral
              </p>
            )}
            {mainItems.map((item) => {
              const active = isItemActive(item.href);

              if (isCollapsed) {
                return (
                  <Tooltip
                    key={item.href}
                    content={item.label}
                    offset={12}
                    placement="right"
                  >
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex size-10 items-center justify-center rounded-xl transition-all duration-150 mx-auto",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                      )}
                      href={item.href}
                    >
                      {active && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                      )}
                      <item.icon
                        className={cn(
                          "size-5 shrink-0 transition-colors",
                          active
                            ? "text-primary dark:text-primary-400"
                            : "text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-200",
                        )}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                    </Link>
                  </Tooltip>
                );
              }

              return (
                <Link
                  key={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                  )}
                  href={item.href}
                >
                  {active && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                  )}
                  <item.icon
                    className={cn(
                      "size-5 shrink-0 transition-colors",
                      active
                        ? "text-primary dark:text-primary-400"
                        : "text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-200",
                    )}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Seção Ações / Gestão */}
          {managementItems.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              {!isCollapsed && (
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Ações & Cadastros
                </p>
              )}
              {managementItems.map((item) => {
                const active = isItemActive(item.href);

                if (isCollapsed) {
                  return (
                    <Tooltip
                      key={item.href}
                      content={item.label}
                      offset={12}
                      placement="right"
                    >
                      <Link
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex size-10 items-center justify-center rounded-xl transition-all duration-150 mx-auto",
                          active
                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                        )}
                        href={item.href}
                      >
                        {active && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                        )}
                        <item.icon
                          className={cn(
                            "size-5 shrink-0 transition-colors",
                            active
                              ? "text-primary dark:text-primary-400"
                              : "text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-200",
                          )}
                          strokeWidth={active ? 2.2 : 1.8}
                        />
                      </Link>
                    </Tooltip>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                    )}
                    href={item.href}
                  >
                    {active && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-primary" />
                    )}
                    <item.icon
                      className={cn(
                        "size-5 shrink-0 transition-colors",
                        active
                          ? "text-primary dark:text-primary-400"
                          : "text-slate-400 group-hover:text-slate-700 dark:text-zinc-500 dark:group-hover:text-zinc-200",
                      )}
                      strokeWidth={active ? 2.2 : 1.8}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé / Perfil do Usuário */}
        <div className="border-t border-slate-200/80 dark:border-zinc-800 p-3 bg-slate-50/50 dark:bg-zinc-900/50">
          {!isCollapsed ? (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative size-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs">
                  {userInitials}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-snug">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <Tooltip
                  content={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                >
                  <button
                    aria-label="Alternar tema"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    type="button"
                    onClick={toggleTheme}
                  >
                    {mounted && theme === "dark" ? (
                      <SunIcon className="size-4" strokeWidth={2} />
                    ) : (
                      <MoonIcon className="size-4" strokeWidth={2} />
                    )}
                  </button>
                </Tooltip>

                <Tooltip content="Sair do sistema">
                  <button
                    aria-label="Sair"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                    type="button"
                    onClick={handleLogout}
                  >
                    <ArrowRightOnRectangleIcon
                      className="size-4"
                      strokeWidth={2}
                    />
                  </button>
                </Tooltip>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Tooltip content={`${userName} (${roleLabel})`} placement="right">
                <div className="relative size-9 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs cursor-default">
                  {userInitials}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>
              </Tooltip>

              <Tooltip content="Alternar tema" placement="right">
                <button
                  aria-label="Alternar tema"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  type="button"
                  onClick={toggleTheme}
                >
                  {mounted && theme === "dark" ? (
                    <SunIcon className="size-4" strokeWidth={2} />
                  ) : (
                    <MoonIcon className="size-4" strokeWidth={2} />
                  )}
                </button>
              </Tooltip>

              <Tooltip content="Sair" placement="right">
                <button
                  aria-label="Sair"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                  type="button"
                  onClick={handleLogout}
                >
                  <ArrowRightOnRectangleIcon
                    className="size-4"
                    strokeWidth={2}
                  />
                </button>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop escuro com blur suave */}
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          {/* Drawer deslizante */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col z-50">
            {/* Topo do drawer */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-600 text-white shadow-xs">
                  <svg
                    className="size-5"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                    <path d="M3.22 12H9.5l1.5-3 2 6 1.5-3h4.28" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    Rastreia<span className="text-primary">Cardio</span>
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                    APS Digital
                  </span>
                </div>
              </div>

              <button
                aria-label="Fechar menu lateral"
                className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                type="button"
                onClick={() => setIsMobileOpen(false)}
              >
                <XMarkIcon className="size-5" />
              </button>
            </div>

            {/* Links móveis */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
              <div className="space-y-1">
                <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                  Visão Geral
                </p>
                {mainItems.map((item) => {
                  const active = isItemActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                      )}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {active && (
                        <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-primary" />
                      )}
                      <item.icon
                        className={cn(
                          "size-5 shrink-0",
                          active
                            ? "text-primary dark:text-primary-400"
                            : "text-slate-400 dark:text-zinc-500",
                        )}
                        strokeWidth={active ? 2.2 : 1.8}
                      />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {managementItems.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-zinc-800">
                  <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
                    Ações & Cadastros
                  </p>
                  {managementItems.map((item) => {
                    const active = isItemActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                        )}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        {active && (
                          <span className="absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r-full bg-primary" />
                        )}
                        <item.icon
                          className={cn(
                            "size-5 shrink-0",
                            active
                              ? "text-primary dark:text-primary-400"
                              : "text-slate-400 dark:text-zinc-500",
                          )}
                          strokeWidth={active ? 2.2 : 1.8}
                        />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Rodapé móvel */}
            <div className="border-t border-slate-200/80 dark:border-zinc-800 p-4 bg-slate-50/70 dark:bg-zinc-900/70">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative size-9 shrink-0 flex items-center justify-center rounded-xl bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 font-bold text-xs">
                    {userInitials}
                    <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                      {userName}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                      {roleLabel}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    aria-label="Alternar tema"
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    type="button"
                    onClick={toggleTheme}
                  >
                    {mounted && theme === "dark" ? (
                      <SunIcon className="size-4.5" strokeWidth={2} />
                    ) : (
                      <MoonIcon className="size-4.5" strokeWidth={2} />
                    )}
                  </button>

                  <button
                    aria-label="Sair"
                    className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-950/30 transition-colors"
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      handleLogout();
                    }}
                  >
                    <ArrowRightOnRectangleIcon
                      className="size-4.5"
                      strokeWidth={2}
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
