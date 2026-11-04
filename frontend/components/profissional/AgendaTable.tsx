// components/profissional/AgendaTable.tsx
"use client";

import type { Key, SortDescriptor } from "@react-types/shared";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import {
  CalendarDaysIcon,
  CheckIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import * as React from "react";

import { cn } from "@/lib/utils";

/* ===== Tipos ===== */
export type RiskTone = "safe" | "moderate" | "critical";

export type AgendaRow = {
  id: string;
  patientId?: string;
  paciente: string;
  docMasked?: string;
  condicao: string;
  hora: string;
  rawDate?: string;
  local: string;
  risco: RiskTone;
  type: string;
  status: string;
  description?: string;
};

type Column = {
  name: string;
  uid: keyof AgendaRow | "actions";
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

/* ===== Config ===== */
const RISK_OPTIONS = [
  { name: "Baixo risco", uid: "safe" },
  { name: "Risco moderado", uid: "moderate" },
  { name: "Alto risco", uid: "critical" },
] as const;

const STATUS_OPTIONS = [
  { name: "Ativo", uid: "ativo" },
  { name: "Finalizado", uid: "finalizado" },
  { name: "Cancelado", uid: "cancelado" },
] as const;

const COLUMNS: readonly Column[] = [
  { name: "Paciente", uid: "paciente", sortable: true, align: "start" },
  { name: "Horário", uid: "hora", sortable: true, align: "start" },
  { name: "Local", uid: "local", sortable: true, align: "start" },
  { name: "Risco", uid: "risco", sortable: true, align: "center" },
  { name: "Status", uid: "status", sortable: false, align: "center" },
  { name: "Ações", uid: "actions", sortable: false, align: "end" },
] as const;

const riskWeight: Record<RiskTone, number> = {
  safe: 0,
  moderate: 1,
  critical: 2,
};

/** Ícone de sort local */
const SortGlyph = (props: React.SVGProps<SVGSVGElement>) => (
  <svg aria-hidden height="1em" viewBox="0 0 24 24" width="1em" {...props}>
    <path
      d="M7 14l5 5 5-5M7 10l5-5 5 5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

/* ===== Props ===== */
export type AgendaTableProps = {
  rows: AgendaRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  totalPagesOverride?: number;
  enableToolbar?: boolean;
  query?: string;
  risks?: "all" | RiskTone[];
  statuses?: "all" | string[];
  onAction?: (action: "done" | "delete" | "open", row: AgendaRow) => void;
};

/* ===== Utils ===== */
const toMinutes = (hhmm: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());

  if (!m) return Number.NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);

  return h * 60 + mm;
};

const collator = new Intl.Collator("pt", {
  sensitivity: "base",
  numeric: true,
});

/* ======================================================= */
export function AgendaTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 8,
  totalPagesOverride,
  enableToolbar = false,
  query,
  risks = "all",
  statuses = "all",
  onAction,
}: AgendaTableProps) {
  const [filterValue, setFilterValue] = React.useState("");
  const [quickFilter, setQuickFilter] = React.useState<
    "all" | "today" | "critical" | "active" | "finalized"
  >("all");
  const [riskFilter, setRiskFilter] = React.useState<"all" | Set<Key>>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | Set<Key>>(
    "all",
  );
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialRowsPerPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "hora" as Key,
    direction: "ascending",
  });

  const riskSetFromProps = React.useMemo<"all" | Set<RiskTone>>(
    () => (risks === "all" ? "all" : new Set(risks)),
    [risks],
  );

  const statusSetFromProps = React.useMemo<"all" | Set<string>>(
    () => (statuses === "all" ? "all" : new Set(statuses)),
    [statuses],
  );

  const effectiveQuery = enableToolbar ? filterValue : (query ?? "");
  const effectiveRiskSet: "all" | Set<RiskTone> = enableToolbar
    ? riskFilter === "all"
      ? "all"
      : new Set(Array.from(riskFilter).map(String) as RiskTone[])
    : riskSetFromProps;

  const effectiveStatusSet: "all" | Set<string> = enableToolbar
    ? statusFilter === "all"
      ? "all"
      : new Set(Array.from(statusFilter).map(String))
    : statusSetFromProps;

  React.useEffect(() => {
    if (!enableToolbar) setPage(1);
  }, [
    effectiveQuery,
    effectiveRiskSet,
    effectiveStatusSet,
    enableToolbar,
    quickFilter,
  ]);

  const filteredItems = React.useMemo(() => {
    let data = rows;

    if (quickFilter === "critical") {
      data = data.filter((r) => r.risco === "critical");
    } else if (quickFilter === "active") {
      data = data.filter((r) => r.status === "ativo");
    } else if (quickFilter === "finalized") {
      data = data.filter((r) => r.status === "finalizado");
    } else if (quickFilter === "today") {
      const todayStr = new Date().toLocaleDateString("pt-BR");

      data = data.filter((r) => r.hora.includes(todayStr));
    }

    const q = (effectiveQuery || "").toLowerCase().trim();

    if (q) {
      data = data.filter(
        (r) =>
          r.paciente.toLowerCase().includes(q) ||
          (r.docMasked && r.docMasked.toLowerCase().includes(q)) ||
          r.condicao.toLowerCase().includes(q) ||
          r.local.toLowerCase().includes(q),
      );
    }

    if (effectiveRiskSet !== "all") {
      const sel = effectiveRiskSet as Set<RiskTone>;

      data = data.filter((r) => sel.has(r.risco));
    }

    if (effectiveStatusSet !== "all") {
      const sel = effectiveStatusSet as Set<string>;

      data = data.filter((r) => sel.has(r.status));
    }

    return data;
  }, [rows, effectiveQuery, effectiveRiskSet, effectiveStatusSet, quickFilter]);

  const totalPages = React.useMemo(
    () =>
      totalPagesOverride ??
      Math.max(1, Math.ceil(filteredItems.length / pageSize)),
    [filteredItems.length, pageSize, totalPagesOverride],
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const pageItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;

    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  const sortedItems = React.useMemo<AgendaRow[]>(() => {
    const arr = [...pageItems];
    const { column, direction } = sortDescriptor;
    const key = String(column) as keyof AgendaRow | "risco";

    arr.sort((a, b) => {
      let first: number | string;
      let second: number | string;

      if (key === "risco") {
        first = riskWeight[a.risco];
        second = riskWeight[b.risco];
      } else if (key === "hora") {
        const timeA = a.rawDate
          ? new Date(a.rawDate).getTime()
          : toMinutes(a.hora);
        const timeB = b.rawDate
          ? new Date(b.rawDate).getTime()
          : toMinutes(b.hora);

        first = Number.isNaN(timeA) ? 0 : timeA;
        second = Number.isNaN(timeB) ? 0 : timeB;
      } else {
        first = (a as any)[key] ?? "";
        second = (b as any)[key] ?? "";
      }

      const cmp =
        typeof first === "number" && typeof second === "number"
          ? first - second
          : collator.compare(String(first), String(second));

      return direction === "descending" ? -cmp : cmp;
    });

    return arr;
  }, [pageItems, sortDescriptor]);

  const renderCell = React.useCallback(
    (row: AgendaRow, colKey: Key) => {
      const k = String(colKey) as keyof AgendaRow | "actions";
      const isFinalized = row.status === "finalizado";
      const isActive = row.status === "ativo";

      switch (k) {
        case "paciente": {
          const initials =
            row.paciente
              .split(" ")
              .filter(Boolean)
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase() || "P";

          return (
            <div className="flex items-center gap-3">
              <div className="size-9 shrink-0 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center text-xs font-semibold shadow-2xs">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-900 dark:text-zinc-100 text-sm truncate">
                    {row.paciente}
                  </span>
                  {row.docMasked && (
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                      ({row.docMasked})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 truncate">
                  <span className="font-medium text-slate-600 dark:text-zinc-300">
                    {row.type || "Consulta"}
                  </span>
                  {row.condicao && row.condicao !== "—" && (
                    <>
                      <span>•</span>
                      <span className="text-primary-600 dark:text-primary-400 font-medium">
                        {row.condicao}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        }

        case "hora": {
          const parts = row.hora.split(", ");
          const datePart = parts[0] || row.hora;
          const timePart = parts[1] || "";

          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-900 dark:text-zinc-100 tabular-nums">
                {timePart || datePart}
              </span>
              {timePart && (
                <span className="text-xs text-slate-400 dark:text-zinc-500 tabular-nums">
                  {datePart}
                </span>
              )}
            </div>
          );
        }

        case "local":
          return (
            <span className="text-sm text-slate-600 dark:text-zinc-300">
              {row.local}
            </span>
          );

        case "risco": {
          const isCritical = row.risco === "critical";
          const isModerate = row.risco === "moderate";

          return (
            <div className="flex items-center justify-center">
              <span
                className={cn(
                  "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-semibold border whitespace-nowrap shadow-2xs",
                  isCritical
                    ? "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/50"
                    : isModerate
                      ? "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50",
                )}
              >
                {isCritical
                  ? "Alto risco"
                  : isModerate
                    ? "Risco moderado"
                    : "Baixo risco"}
              </span>
            </div>
          );
        }

        case "status":
          return (
            <div className="flex justify-center">
              {row.status === "finalizado" ? (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckIcon className="size-3" strokeWidth={2.5} />
                  Finalizado
                </span>
              ) : row.status === "cancelado" ? (
                <span className="inline-flex items-center text-xs font-medium text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                  Cancelado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 px-2.5 py-0.5 rounded-full border border-sky-200/60 dark:border-sky-800/40">
                  <span className="size-1.5 rounded-full bg-sky-500" />
                  Ativo
                </span>
              )}
            </div>
          );

        case "actions": {
          return (
            <div className="w-[144px] ml-auto flex items-center justify-end gap-1.5">
              {isActive ? (
                <Button
                  className="h-8 w-24 text-xs font-semibold bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-400 rounded-lg shadow-2xs"
                  color="primary"
                  size="sm"
                  variant="flat"
                  onPress={() => onAction?.("open", row)}
                >
                  Atender
                </Button>
              ) : isFinalized ? (
                <Button
                  className="h-8 w-24 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200/70 dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg shadow-2xs"
                  size="sm"
                  variant="flat"
                  onPress={() => onAction?.("open", row)}
                >
                  Ver resumo
                </Button>
              ) : (
                <Button
                  className="h-8 w-24 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 bg-slate-100/60 hover:bg-slate-200/60 dark:bg-zinc-800/60 dark:hover:bg-zinc-700/60 rounded-lg shadow-2xs"
                  size="sm"
                  variant="flat"
                  onPress={() => onAction?.("open", row)}
                >
                  Detalhes
                </Button>
              )}

              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    isIconOnly
                    aria-label="Mais opções"
                    className="size-8 min-w-8 text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 rounded-lg"
                    size="sm"
                    variant="light"
                  >
                    <EllipsisVerticalIcon className="size-4" />
                  </Button>
                </DropdownTrigger>
                <DropdownMenu aria-label="Ações do agendamento">
                  {isActive ? (
                    <>
                      <DropdownItem
                        key="open"
                        startContent={
                          <EyeIcon className="size-4 text-slate-500" />
                        }
                        onPress={() => onAction?.("open", row)}
                      >
                        Ver prontuário
                      </DropdownItem>
                      <DropdownItem
                        key="done"
                        startContent={
                          <CheckIcon className="size-4 text-emerald-600" />
                        }
                        onPress={() => onAction?.("done", row)}
                      >
                        Finalizar atendimento
                      </DropdownItem>
                      <DropdownItem
                        key="cancel"
                        className="text-danger"
                        color="danger"
                        startContent={<XMarkIcon className="size-4" />}
                        onPress={() => onAction?.("delete", row)}
                      >
                        Cancelar agendamento
                      </DropdownItem>
                    </>
                  ) : isFinalized ? (
                    <DropdownItem
                      key="open"
                      startContent={
                        <EyeIcon className="size-4 text-slate-500" />
                      }
                      onPress={() => onAction?.("open", row)}
                    >
                      Ver prontuário completo
                    </DropdownItem>
                  ) : (
                    <DropdownItem
                      key="open"
                      startContent={
                        <EyeIcon className="size-4 text-slate-500" />
                      }
                      onPress={() => onAction?.("open", row)}
                    >
                      Ver detalhes do agendamento
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
            </div>
          );
        }
        default:
          return (row as any)[k];
      }
    },
    [onAction],
  );

  const topContent = React.useMemo(() => {
    if (!enableToolbar) return null;
    const totalFiltered = filteredItems.length;
    const todayStr = new Date().toLocaleDateString("pt-BR");

    const quickTabs = [
      { id: "all", label: "Todos", count: rows.length },
      {
        id: "active",
        label: "Fila de Atendimento",
        count: rows.filter((r) => r.status === "ativo").length,
      },
      {
        id: "today",
        label: "Hoje",
        count: rows.filter((r) => r.hora.includes(todayStr)).length,
      },
      {
        id: "critical",
        label: "Alto risco",
        count: rows.filter((r) => r.risco === "critical").length,
      },
      {
        id: "finalized",
        label: "Finalizados",
        count: rows.filter((r) => r.status === "finalizado").length,
      },
    ] as const;

    return (
      <div className="flex flex-col gap-3">
        {/* Linha superior: Tabs de filtro rápido + Contador total de registros */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-zinc-800/80 rounded-xl w-fit border border-slate-200/80 dark:border-zinc-700/80 max-w-full overflow-x-auto shadow-2xs">
            {quickTabs.map((tab) => {
              const isActive = quickFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer whitespace-nowrap",
                    isActive
                      ? "bg-white dark:bg-zinc-900 text-slate-900 dark:text-white shadow-xs font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 font-medium",
                  )}
                  type="button"
                  onClick={() => {
                    setQuickFilter(tab.id);
                    setPage(1);
                  }}
                >
                  <span>{tab.label}</span>
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded-md text-[10px] font-bold tabular-nums",
                      isActive
                        ? "bg-primary/10 text-primary dark:text-primary-400"
                        : "bg-slate-200/70 dark:bg-zinc-700/60 text-slate-600 dark:text-zinc-400",
                    )}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          <span className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
            Total de{" "}
            <strong className="font-semibold text-slate-700 dark:text-zinc-200">
              {totalFiltered}
            </strong>{" "}
            {totalFiltered === 1 ? "registro" : "registros"}
          </span>
        </div>

        {/* Linha de busca e filtros: alinhada de ponta a ponta com altura h-10 uniforme */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
          <Input
            isClearable
            className="w-full sm:flex-1"
            classNames={{
              base: "h-10",
              mainWrapper: "h-full",
              inputWrapper:
                "h-10 min-h-[40px] bg-white dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 focus-within:!border-primary shadow-2xs rounded-xl",
              input:
                "text-xs sm:text-sm text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
            }}
            placeholder="Buscar por paciente, condição ou local…"
            radius="md"
            startContent={
              <svg
                aria-hidden
                className="size-4 text-slate-400 dark:text-zinc-500 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
            value={filterValue}
            variant="flat"
            onClear={() => {
              setFilterValue("");
              setPage(1);
            }}
            onValueChange={(v) => {
              setFilterValue(v);
              setPage(1);
            }}
          />

          <div className="flex items-center gap-2 shrink-0">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="h-10 font-medium text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs rounded-xl"
                  radius="md"
                  variant="bordered"
                >
                  Risco
                  {riskFilter !== "all" && riskFilter.size > 0 && (
                    <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                      {riskFilter.size}
                    </span>
                  )}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtro de Risco"
                closeOnSelect={false}
                selectedKeys={
                  riskFilter === "all" ? "all" : (riskFilter as Iterable<Key>)
                }
                selectionMode="multiple"
                onSelectionChange={(keys) =>
                  setRiskFilter(keys as "all" | Set<Key>)
                }
              >
                {RISK_OPTIONS.map((opt) => (
                  <DropdownItem key={opt.uid} className="capitalize">
                    {opt.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="h-10 font-medium text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200/80 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs rounded-xl"
                  radius="md"
                  variant="bordered"
                >
                  Status
                  {statusFilter !== "all" && statusFilter.size > 0 && (
                    <span className="ml-1 rounded-full bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-bold">
                      {statusFilter.size}
                    </span>
                  )}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                disallowEmptySelection
                aria-label="Filtro de Status"
                closeOnSelect={false}
                selectedKeys={
                  statusFilter === "all"
                    ? "all"
                    : (statusFilter as Iterable<Key>)
                }
                selectionMode="multiple"
                onSelectionChange={(keys) =>
                  setStatusFilter(keys as "all" | Set<Key>)
                }
              >
                {STATUS_OPTIONS.map((opt) => (
                  <DropdownItem key={opt.uid} className="capitalize">
                    {opt.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <div className="flex items-center gap-1.5 h-10 px-3 rounded-xl border border-slate-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-slate-600 dark:text-zinc-400 shadow-2xs">
              <span className="whitespace-nowrap">Exibir:</span>
              <select
                aria-label="Linhas por página"
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-100 outline-none cursor-pointer"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option className="dark:bg-zinc-800" value="8">
                  8
                </option>
                <option className="dark:bg-zinc-800" value="12">
                  12
                </option>
                <option className="dark:bg-zinc-800" value="20">
                  20
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }, [
    enableToolbar,
    filteredItems.length,
    filterValue,
    riskFilter,
    statusFilter,
    pageSize,
    quickFilter,
    rows,
  ]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-3 flex justify-center border-t border-slate-100 dark:border-zinc-800/80">
        <Pagination
          isCompact
          showControls
          classNames={{
            next: "dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-2xs",
            prev: "dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 shadow-2xs",
            item: "dark:bg-zinc-800 shadow-2xs",
          }}
          color="primary"
          page={page}
          size="sm"
          total={totalPages}
          onChange={setPage}
        />
      </div>
    );
  }, [page, totalPages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Agenda de atendimentos"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        th: "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700/60 first:rounded-l-lg last:rounded-r-lg",
        td: "px-4 py-3.5 text-sm text-slate-700 dark:text-zinc-300 border-b border-slate-100 dark:border-zinc-800/40",
        base: "min-h-[300px]",
        table: "dark:bg-zinc-900",
        wrapper: "bg-transparent border-none shadow-none px-0",
      }}
      removeWrapper={false}
      selectionMode="none"
      shadow="none"
      sortDescriptor={sortDescriptor}
      sortIcon={SortGlyph}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={[...COLUMNS]}>
        {(column: Column) => (
          <TableColumn
            key={column.uid}
            align={column.align}
            allowsSorting={!!column.sortable}
            className={cn(
              "text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50",
              column.uid === "actions" && "w-[160px]",
            )}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        emptyContent={
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-12 rounded-full bg-slate-100 dark:bg-zinc-800 grid place-items-center text-slate-400 dark:text-zinc-500 mb-3 shadow-2xs">
              <CalendarDaysIcon className="size-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
              Nenhum agendamento encontrado
            </p>
            <p className="text-xs text-slate-500 dark:text-zinc-500 mt-1 max-w-xs">
              {filterValue || quickFilter !== "all"
                ? "Tente ajustar os filtros rápidos ou a busca para visualizar outros registros."
                : "Não há agendamentos cadastrados nesta unidade no momento."}
            </p>
            {(filterValue || quickFilter !== "all") && (
              <Button
                className="mt-3 font-medium text-xs text-primary"
                radius="md"
                size="sm"
                variant="flat"
                onPress={() => {
                  setFilterValue("");
                  setQuickFilter("all");
                  setRiskFilter("all");
                  setStatusFilter("all");
                  setPage(1);
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>
        }
        items={sortedItems}
      >
        {(item: AgendaRow) => (
          <TableRow
            key={item.id}
            className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
            onClick={() => onAction?.("open", item)}
          >
            {(columnKey: Key) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
