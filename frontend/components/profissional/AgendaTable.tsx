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
  Tooltip,
} from "@heroui/react";
import {
  CalendarDaysIcon,
  CheckIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import * as React from "react";

import { StatusChip } from "@/components/ui/StatusChip";

/* ===== Tipos ===== */
export type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";

const mapRiskToChip = (t: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : t;

export type AgendaRow = {
  id: string;
  paciente: string;
  docMasked: string;
  condicao: string;
  hora: string;
  local: string;
  risco: RiskTone;
  type: string;
  status: string;
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
          r.docMasked.toLowerCase().includes(q) ||
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
        const A = toMinutes(a.hora);
        const B = toMinutes(b.hora);

        if (!Number.isNaN(A) && !Number.isNaN(B)) {
          first = A;
          second = B;
        } else {
          first = a.hora;
          second = b.hora;
        }
      } else {
        first = (a as any)[key] ?? "";
        second = (b as any)[key] ?? "";
      }

      const cmp =
        typeof first === "number" && typeof second === "number"
          ? first - second
          : collator.compare(String(first), String(second));

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });

    return arr;
  }, [pageItems, sortDescriptor]);

  const renderCell = React.useCallback(
    (row: AgendaRow, colKey: Key) => {
      const k = String(colKey) as keyof AgendaRow | "actions";

      // Verifica se já foi finalizado ou cancelado
      const isFinalized = row.status === "finalizado";
      const isCanceled = row.status === "cancelado";
      const isDisabled = isFinalized || isCanceled;

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
              <div className="size-8.5 shrink-0 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 border border-slate-200/80 dark:border-zinc-700/80 flex items-center justify-center text-xs font-semibold shadow-2xs">
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
                <span className="text-xs text-slate-500 dark:text-zinc-400 block truncate">
                  {row.type && row.type !== "-" ? `${row.type} · ` : ""}
                  {row.condicao && row.condicao !== "—"
                    ? row.condicao
                    : row.local}
                </span>
              </div>
            </div>
          );
        }
        case "hora":
          return (
            <span className="tabular-nums text-sm font-medium text-slate-700 dark:text-zinc-300">
              {row.hora}
            </span>
          );
        case "local":
          return (
            <span className="text-sm text-slate-600 dark:text-zinc-400">
              {row.local}
            </span>
          );
        case "risco":
          return (
            <div className="flex justify-center">
              <StatusChip size="sm" tone={mapRiskToChip(row.risco)}>
                {row.risco === "critical"
                  ? "Alto risco"
                  : row.risco === "moderate"
                    ? "Risco moderado"
                    : "Baixo risco"}
              </StatusChip>
            </div>
          );
        case "status":
          return (
            <div className="flex justify-center">
              <StatusChip
                size="sm"
                tone={
                  row.status === "finalizado"
                    ? "safe"
                    : row.status === "cancelado"
                      ? "critical"
                      : "attention"
                }
              >
                {row.status === "finalizado"
                  ? "Finalizado"
                  : row.status === "cancelado"
                    ? "Cancelado"
                    : "Ativo"}
              </StatusChip>
            </div>
          );
        case "actions":
          return (
            <div className="flex items-center justify-end gap-1">
              <Tooltip content="Finalizar agendamento" delay={300}>
                <button
                  aria-label={`Finalizar agendamento de ${row.paciente}`}
                  className={`p-1.5 rounded-md transition-colors focus:outline-none ${
                    isDisabled
                      ? "opacity-25 cursor-not-allowed text-slate-400"
                      : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  }`}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onAction?.("done", row)}
                >
                  <CheckIcon className="size-4.5" strokeWidth={2} />
                </button>
              </Tooltip>

              <Tooltip content="Cancelar agendamento" delay={300}>
                <button
                  aria-label={`Cancelar agendamento de ${row.paciente}`}
                  className={`p-1.5 rounded-md transition-colors focus:outline-none ${
                    isDisabled
                      ? "opacity-25 cursor-not-allowed text-slate-400"
                      : "text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  }`}
                  disabled={isDisabled}
                  onClick={() => !isDisabled && onAction?.("delete", row)}
                >
                  <XMarkIcon className="size-4.5" strokeWidth={2} />
                </button>
              </Tooltip>

              <Tooltip content="Ver detalhes" delay={300}>
                <button
                  aria-label={`Ver detalhes de ${row.paciente}`}
                  className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors focus:outline-none"
                  onClick={() => onAction?.("open", row)}
                >
                  <EyeIcon className="size-4.5" strokeWidth={2} />
                </button>
              </Tooltip>
            </div>
          );
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
        id: "active",
        label: "Ativos",
        count: rows.filter((r) => r.status === "ativo").length,
      },
      {
        id: "finalized",
        label: "Finalizados",
        count: rows.filter((r) => r.status === "finalizado").length,
      },
    ] as const;

    return (
      <div className="flex flex-col gap-3.5 px-1">
        {/* Quick Filter Segmented Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pb-0.5">
          {quickTabs.map((tab) => {
            const isActive = quickFilter === tab.id;

            return (
              <button
                key={tab.id}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-2xs font-semibold"
                    : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 dark:text-zinc-300"
                }`}
                type="button"
                onClick={() => {
                  setQuickFilter(tab.id);
                  setPage(1);
                }}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isActive
                      ? "bg-white/25 text-white"
                      : "bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 border border-slate-200/60 dark:border-zinc-700/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-md"
            classNames={{
              inputWrapper:
                "h-10 bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 focus-within:!border-primary focus-within:bg-white dark:focus-within:bg-zinc-900 shadow-2xs transition-colors",
              input:
                "text-sm text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
            }}
            placeholder="Buscar por paciente, condição ou local…"
            radius="md"
            startContent={
              <svg
                aria-hidden
                className="size-4 text-slate-400 dark:text-zinc-500"
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

          <div className="flex items-center gap-2.5">
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className="hidden sm:inline-flex h-10 font-medium text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
                  radius="md"
                  variant="bordered"
                >
                  Risco
                  {riskFilter !== "all" && riskFilter.size > 0 && (
                    <span className="ml-1 rounded-full bg-slate-100 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-zinc-200">
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
                  className="hidden sm:inline-flex h-10 font-medium text-xs text-slate-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 shadow-2xs"
                  radius="md"
                  variant="bordered"
                >
                  Status
                  {statusFilter !== "all" && statusFilter.size > 0 && (
                    <span className="ml-1 rounded-full bg-slate-100 dark:bg-zinc-700 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-zinc-200">
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

            <label className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 ml-1">
              Por página:
              <select
                aria-label="Linhas por página"
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-xs text-slate-700 dark:text-zinc-200 outline-none focus:border-primary shadow-2xs"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="8">8</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Total de {totalFiltered}{" "}
            {totalFiltered === 1 ? "registro" : "registros"}
          </span>
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
            className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50"
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
            className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
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
