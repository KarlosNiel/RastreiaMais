"use client";

import {
  ArrowRightOnRectangleIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChevronDoubleLeftIcon,
  Cog6ToothIcon,
  EllipsisVerticalIcon,
  HeartIcon,
  IdentificationIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Tooltip,
} from "@heroui/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SystemSettingsModal } from "@/components/user/SystemSettingsModal";
import { UserProfileModal } from "@/components/user/UserProfileModal";
import { BrandLogo, BrandIconMark } from "@/components/ui/BrandLogo";
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
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
        // ignora
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
      // fallback
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
        <div
          className={cn(
            "flex h-16 items-center px-3.5 border-b border-slate-100 dark:border-zinc-800/80",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {isCollapsed ? (
            /* No modo colapsado, clicar no ícone expande a sidebar */
            <Tooltip
              content="Expandir menu lateral"
              offset={12}
              placement="right"
            >
              <button
                aria-label="Expandir menu lateral"
                className="flex size-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 mx-auto group"
                type="button"
                onClick={toggleCollapse}
              >
                <BrandIconMark
                  className="group-hover:scale-105 transition-transform"
                  size={36}
                />
              </button>
            </Tooltip>
          ) : (
            /* No modo aberto, exibe logo completo + botão para recolher */
            <>
              <BrandLogo
                href={
                  effectiveRoles.includes("MANAGER")
                    ? "/gestor"
                    : "/profissional"
                }
                size="sm"
                subtitle="APS Digital"
                variant="full"
              />

              <button
                aria-label="Recolher menu"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                type="button"
                onClick={toggleCollapse}
              >
                <ChevronDoubleLeftIcon className="size-4" strokeWidth={2} />
              </button>
            </>
          )}
        </div>

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
                        "group flex size-10 items-center justify-center rounded-xl transition-all duration-150 mx-auto",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                      )}
                      href={item.href}
                    >
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
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                  )}
                  href={item.href}
                >
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
                          "group flex size-10 items-center justify-center rounded-xl transition-all duration-150 mx-auto",
                          active
                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                        )}
                        href={item.href}
                      >
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
                      "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                      active
                        ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold shadow-2xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                    )}
                    href={item.href}
                  >
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

        {/* Rodapé / Perfil Unificado com Menu do Usuário */}
        <div className="border-t border-slate-200/80 dark:border-zinc-800 p-2.5 bg-slate-50/50 dark:bg-zinc-900/50">
          {!isCollapsed ? (
            /* Modo Expandido */
            <div className="flex items-center justify-between gap-1.5 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-800/40">
              <button
                className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-zinc-800 text-left transition-colors"
                title="Abrir Meu Perfil"
                type="button"
                onClick={() => setIsProfileOpen(true)}
              >
                <div className="relative size-8 shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-bold text-xs">
                  {userInitials}
                  <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate leading-snug">
                    {userName}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    {roleLabel}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-0.5 shrink-0">
                <Tooltip content="Configurações do Sistema">
                  <button
                    aria-label="Configurações do Sistema"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
                    type="button"
                    onClick={() => setIsSettingsOpen(true)}
                  >
                    <Cog6ToothIcon className="size-4" strokeWidth={2} />
                  </button>
                </Tooltip>

                <Dropdown offset={10} placement="top-end">
                  <DropdownTrigger>
                    <button
                      aria-label="Mais opções"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-700/60 transition-colors"
                      type="button"
                    >
                      <EllipsisVerticalIcon
                        className="size-4"
                        strokeWidth={2}
                      />
                    </button>
                  </DropdownTrigger>
                  <DropdownMenu aria-label="Ações do usuário" variant="flat">
                    <DropdownItem
                      key="profile"
                      startContent={
                        <UserCircleIcon className="size-4 text-slate-500 dark:text-zinc-400" />
                      }
                      onPress={() => setIsProfileOpen(true)}
                    >
                      Meu Perfil
                    </DropdownItem>
                    <DropdownItem
                      key="settings"
                      startContent={
                        <Cog6ToothIcon className="size-4 text-slate-500 dark:text-zinc-400" />
                      }
                      onPress={() => setIsSettingsOpen(true)}
                    >
                      Configurações do Sistema
                    </DropdownItem>
                    <DropdownItem
                      key="theme"
                      startContent={
                        mounted && theme === "dark" ? (
                          <SunIcon
                            className="size-4 text-amber-500"
                            strokeWidth={2}
                          />
                        ) : (
                          <MoonIcon
                            className="size-4 text-indigo-500"
                            strokeWidth={2}
                          />
                        )
                      }
                      onPress={toggleTheme}
                    >
                      {mounted && theme === "dark"
                        ? "Modo Claro"
                        : "Modo Escuro"}
                    </DropdownItem>
                    <DropdownItem
                      key="logout"
                      className="text-danger"
                      color="danger"
                      startContent={
                        <ArrowRightOnRectangleIcon
                          className="size-4"
                          strokeWidth={2}
                        />
                      }
                      onPress={handleLogout}
                    >
                      Sair do Sistema
                    </DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            </div>
          ) : (
            /* Modo Compacto / Colapsado */
            <div className="flex flex-col items-center gap-1.5 p-1 rounded-xl border border-slate-200/60 dark:border-zinc-800 bg-white dark:bg-zinc-800/40">
              <Tooltip
                content="Configurações do Sistema"
                offset={12}
                placement="right"
              >
                <button
                  aria-label="Configurações do Sistema"
                  className="flex size-9 items-center justify-center rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/80 transition-colors mx-auto"
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Cog6ToothIcon className="size-4.5" strokeWidth={1.8} />
                </button>
              </Tooltip>

              <Dropdown offset={14} placement="right-end">
                <DropdownTrigger>
                  <button
                    aria-label="Menu do usuário"
                    className="relative flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 mx-auto"
                    type="button"
                  >
                    <span>{userInitials}</span>
                    <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-900" />
                  </button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Ações do usuário" variant="flat">
                  <DropdownItem
                    key="header"
                    isReadOnly
                    className="h-14 gap-2 opacity-100 cursor-default"
                  >
                    <div className="flex flex-col">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                        {userName}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-zinc-400">
                        {roleLabel}
                      </p>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="profile"
                    startContent={
                      <UserCircleIcon className="size-4 text-slate-500 dark:text-zinc-400" />
                    }
                    onPress={() => setIsProfileOpen(true)}
                  >
                    Meu Perfil
                  </DropdownItem>
                  <DropdownItem
                    key="settings"
                    startContent={
                      <Cog6ToothIcon className="size-4 text-slate-500 dark:text-zinc-400" />
                    }
                    onPress={() => setIsSettingsOpen(true)}
                  >
                    Configurações do Sistema
                  </DropdownItem>
                  <DropdownItem
                    key="theme"
                    startContent={
                      mounted && theme === "dark" ? (
                        <SunIcon
                          className="size-4 text-amber-500"
                          strokeWidth={2}
                        />
                      ) : (
                        <MoonIcon
                          className="size-4 text-indigo-500"
                          strokeWidth={2}
                        />
                      )
                    }
                    onPress={toggleTheme}
                  >
                    {mounted && theme === "dark" ? "Modo Claro" : "Modo Escuro"}
                  </DropdownItem>
                  <DropdownItem
                    key="logout"
                    className="text-danger"
                    color="danger"
                    startContent={
                      <ArrowRightOnRectangleIcon
                        className="size-4"
                        strokeWidth={2}
                      />
                    }
                    onPress={handleLogout}
                  >
                    Sair do Sistema
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </div>
      </aside>

      {/* ─── MOBILE DRAWER OVERLAY ─── */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            aria-hidden="true"
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          />

          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col z-50">
            {/* Topo do drawer */}
            <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-zinc-800">
              <BrandLogo size="sm" subtitle="APS Digital" variant="full" />

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
                        "group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                        active
                          ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                      )}
                      href={item.href}
                      onClick={() => setIsMobileOpen(false)}
                    >
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
                          "group flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-400 font-semibold"
                            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800/60",
                        )}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                      >
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
                <button
                  className="flex items-center gap-2.5 min-w-0 text-left"
                  type="button"
                  onClick={() => {
                    setIsMobileOpen(false);
                    setIsProfileOpen(true);
                  }}
                >
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
                </button>

                <div className="flex items-center gap-1">
                  <button
                    aria-label="Configurações"
                    className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                  >
                    <Cog6ToothIcon className="size-4.5" strokeWidth={2} />
                  </button>

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

      {/* Modais de Perfil do Usuário e Configurações do Sistema */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
      <SystemSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
}
