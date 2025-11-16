// components/profissional/AgendaTable.tsx
"use client";

import { StatusChip } from "@/components/ui/StatusChip";
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
import type { Key, SortDescriptor } from "@react-types/shared";
import * as React from "react";

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
  { name: "Seguro", uid: "safe" },
  { name: "Atenção", uid: "moderate" },
  { name: "Crítico", uid: "critical" },
] as const;

const STATUS_OPTIONS = [
  { name: "Ativo", uid: "ativo" },
  { name: "Finalizado", uid: "finalizado" },
  { name: "Cancelado", uid: "cancelado" }
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
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden {...props}>
    <path
      d="M7 14l5 5 5-5M7 10l5-5 5 5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
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
  const [riskFilter, setRiskFilter] = React.useState<"all" | Set<Key>>("all");
  const [statusFilter, setStatusFilter] = React.useState<"all" | Set<Key>>("all");
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialRowsPerPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "hora" as Key,
    direction: "ascending",
  });

  const riskSetFromProps = React.useMemo<"all" | Set<RiskTone>>(
    () => (risks === "all" ? "all" : new Set(risks)),
    [risks]
  );

  const statusSetFromProps = React.useMemo<"all" | Set<string>>(
    () => (statuses === "all" ? "all" : new Set(statuses)),
    [statuses]
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
  }, [effectiveQuery, effectiveRiskSet, effectiveStatusSet, enableToolbar]);

  const filteredItems = React.useMemo(() => {
    let data = rows;

    const q = (effectiveQuery || "").toLowerCase().trim();
    if (q) {
      data = data.filter(
        (r) =>
          r.paciente.toLowerCase().includes(q) ||
          r.docMasked.toLowerCase().includes(q) ||
          r.condicao.toLowerCase().includes(q) ||
          r.local.toLowerCase().includes(q)
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
  }, [rows, effectiveQuery, effectiveRiskSet, effectiveStatusSet]);

  const totalPages = React.useMemo(
    () =>
      totalPagesOverride ??
      Math.max(1, Math.ceil(filteredItems.length / pageSize)),
    [filteredItems.length, pageSize, totalPagesOverride]
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
        case "paciente":
          return (
            <>
              <span className="font-medium">{row.paciente}</span>{" "}
              <span className="text-foreground/60">{row.docMasked}</span> ·{" "}
              {row.condicao}
            </>
          );
        case "hora":
          return <span className="tabular-nums">{row.hora}</span>;
        case "local":
          return row.local;
        case "risco":
          return (
            <div className="flex justify-center">
              <StatusChip size="sm" tone={mapRiskToChip(row.risco)}>
                {row.risco === "critical"
                  ? "Crítico"
                  : row.risco === "moderate"
                    ? "Atenção"
                    : "Seguro"}
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
            <div className="flex items-center justify-end gap-2">
              <Tooltip content="Finalizar agendamento">
                <button
                  className={`rounded-lg border border-divider p-2 focus:outline-none focus:ring-2 focus:ring-focus ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-content2 hover:border-emerald-500"
                  }`}
                  aria-label={`Concluir ${row.paciente}`}
                  onClick={() => !isDisabled && onAction?.("done", row)}
                  disabled={isDisabled}
                >
                  <svg viewBox="0 0 24 24" className="size-5 text-emerald-600" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                    />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip content="Cancelar agendamento">
                <button
                  className={`rounded-lg border border-divider p-2 focus:outline-none focus:ring-2 focus:ring-focus ${
                    isDisabled
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:bg-content2 hover:border-rose-500"
                  }`}
                  aria-label={`Excluir ${row.paciente}`}
                  onClick={() => !isDisabled && onAction?.("delete", row)}
                  disabled={isDisabled}
                >
                  <svg viewBox="0 0 24 24" className="size-5 text-rose-600" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm3-3h6l1 1h4v2H4V5h4l1-1Z"
                    />
                  </svg>
                </button>
              </Tooltip>

              <Tooltip content="Ver detalhes">
                <button
                  className="rounded-lg border border-divider p-2 hover:bg-content2 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-focus"
                  aria-label={`Abrir ${row.paciente}`}
                  onClick={() => onAction?.("open", row)}
                >
                  <svg viewBox="0 0 24 24" className="size-5 text-blue-600" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M14 3v2H5v14h14v-9h2v11H3V3h11Zm7 0h-6v2h2.59l-9.83 9.83 1.41 1.41L19 6.41V9h2V3Z"
                    />
                  </svg>
                </button>
              </Tooltip>
            </div>
          );
        default:
          return (row as any)[k];
      }
    },
    [onAction]
  );

  const topContent = React.useMemo(() => {
    if (!enableToolbar) return null;
    const totalFiltered = filteredItems.length;

    return (
      <div className="flex flex-col gap-4 px-4 sm:px-1">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            radius="full"
            variant="flat"
            className="w-full sm:max-w-[44%]"
            classNames={{
              inputWrapper:
                "h-11 bg-transparent dark:bg-gray-900 border border-gray-300 border-orange-600 hover:bg-gray-50 dark:hover:bg-gray-800",
              input:
                "text-[0.95rem] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
            }}
            placeholder="Buscar por paciente, condição ou local…"
            startContent={
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                className="size-4 text-foreground/50"
              >
                <path
                  fill="currentColor"
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                />
              </svg>
            }
            value={filterValue}
            onClear={() => {
              setFilterValue("");
              setPage(1);
            }}
            onValueChange={(v) => {
              setFilterValue(v);
              setPage(1);
            }}
          />

          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex bg-transparent border border-orange-600 dark:hover:bg-gray-700">
                <Button variant="flat" radius="full">
                  Risco
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de Risco"
                disallowEmptySelection
                closeOnSelect={false}
                selectionMode="multiple"
                selectedKeys={
                  riskFilter === "all" ? "all" : (riskFilter as Iterable<Key>)
                }
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
              <DropdownTrigger className="hidden sm:flex bg-transparent border border-orange-600 dark:hover:bg-gray-700">
                <Button variant="flat" radius="full">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de Status"
                disallowEmptySelection
                closeOnSelect={false}
                selectionMode="multiple"
                selectedKeys={
                  statusFilter === "all" ? "all" : (statusFilter as Iterable<Key>)
                }
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

            <label className="hidden sm:flex items-center gap-2 text-small text-default-500">
              Por página:
              <select
                className="bg-transparent outline-0 text-small border rounded"
                aria-label="Linhas por página"
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

        <div className="flex items-center justify-between">
          <span className="text-small text-default-500">
            Total {totalFiltered} registros
          </span>
        </div>
      </div>
    );
  }, [enableToolbar, filteredItems.length, filterValue, riskFilter, statusFilter, pageSize]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 flex justify-center">
        <Pagination
          isCompact
          showControls
          size="sm"
          color="primary"
          page={page}
          total={totalPages}
          onChange={setPage}
          classNames={{
            next: "dark:bg-gray-800",
            prev: "dark:bg-gray-800",
            item: "dark:bg-gray-800",
          }}
        />
      </div>
    );
  }, [page, totalPages]);

  return (
    <Table
      aria-label="Agenda de atendimentos"
      isHeaderSticky
      removeWrapper={false}
      shadow="none"
      selectionMode="none"
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      sortDescriptor={sortDescriptor}
      sortIcon={SortGlyph}
      onSortChange={setSortDescriptor}
      classNames={{
        th: "px-6 py-3 text-foreground/70 font-semibold",
        td: "px-6 py-3",
        base: "min-h-[320px]",
        table: "dark:bg-gray-900",
        wrapper: "bg-transparent border-none shadow-none px-2",
      }}
    >
      <TableHeader columns={[...COLUMNS]}>
        {(column: Column) => (
          <TableColumn
            className="text-sm dark:bg-gray-800 w-[20%]"
            key={column.uid}
            align={column.align}
            allowsSorting={!!column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        emptyContent="Nenhum agendamento encontrado."
        items={sortedItems}
      >
        {(item: AgendaRow) => (
          <TableRow
            key={item.id}
            className="even:bg-gray-100 dark:even:bg-gray-800 dark:odd:bg-gray-900"
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