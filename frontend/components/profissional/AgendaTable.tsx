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
} from "@heroui/react";
import * as React from "react";

/* ===== Tipos ===== */
export type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";

const mapRiskToChip = (t: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : t;

export type AgendaRow = {
  id: string;
  paciente: string; // "João S."
  docMasked: string; // "****1234"
  condicao: string; // "HAS", "DM", "HAS/DM"
  hora: string; // "08:30"
  local: string; // "UBS" | "Visita" | ...
  risco: RiskTone;
};

/* ===== Config ===== */
const RISK_OPTIONS = [
  { name: "Seguro", uid: "safe" },
  { name: "Atenção", uid: "moderate" },
  { name: "Crítico", uid: "critical" },
] as const;

const COLUMNS = [
  {
    name: "Paciente",
    uid: "paciente",
    sortable: true,
    align: "start" as const,
  },
  { name: "Horário", uid: "hora", sortable: true, align: "start" as const },
  { name: "Local", uid: "local", sortable: true, align: "start" as const },
  { name: "Risco", uid: "risco", sortable: true, align: "center" as const },
  { name: "Ações", uid: "actions", sortable: false, align: "end" as const },
] as const;

// ordenação semântica de risco
const riskWeight: Record<RiskTone, number> = {
  safe: 0,
  moderate: 1,
  critical: 2,
};

/** Ícone de sort local (sem dependências extras) */
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

  /** paginação */
  initialPage?: number;
  /** padronizado com PendenciasTable */
  initialRowsPerPage?: number;

  /** se quiser simular backend com mais páginas */
  totalPagesOverride?: number;

  /** toolbar interna (search + filtro + page size). Default: false */
  enableToolbar?: boolean;

  /** controle externo (quando enableToolbar = false) */
  query?: string; // termo de busca externo
  risks?: "all" | RiskTone[]; // filtro de risco externo

  /** callback para ações da linha */
  onAction?: (action: "done" | "delete" | "open", row: AgendaRow) => void;
};

/* ===== Utils ===== */
const toMinutes = (hhmm: string) => {
  // "08:30" -> 510; fallback para comparador lexical
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return Number.NaN;
  const h = Number(m[1]);
  const mm = Number(m[2]);
  return h * 60 + mm;
};

// collator pt-BR para ordenar strings de forma natural (ignora acentos)
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
  onAction,
}: AgendaTableProps) {
  // estados (usados quando enableToolbar = true)
  const [filterValue, setFilterValue] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState<"all" | Set<React.Key>>(
    "all"
  );
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialRowsPerPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<{
    column: React.Key;
    direction: "ascending" | "descending";
  }>({ column: "hora", direction: "ascending" });

  // memo do filtro de riscos vindo de props (evita Set novo a cada render)
  const riskSetFromProps = React.useMemo<"all" | Set<RiskTone>>(
    () => (risks === "all" ? "all" : new Set(risks)),
    [risks]
  );

  // fontes de verdade para filtro/busca
  const effectiveQuery = enableToolbar ? filterValue : (query ?? "");
  const effectiveRiskSet: "all" | Set<RiskTone> = enableToolbar
    ? riskFilter === "all"
      ? "all"
      : (new Set(Array.from(riskFilter) as RiskTone[]) as Set<RiskTone>)
    : riskSetFromProps;

  // reset de página quando filtros (externos) mudam
  React.useEffect(() => {
    if (!enableToolbar) setPage(1);
  }, [effectiveQuery, effectiveRiskSet, enableToolbar]);

  // filtra
  const filteredItems = React.useMemo(() => {
    let data = rows;

    // busca
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

    // risco
    if (effectiveRiskSet !== "all") {
      const sel = effectiveRiskSet as Set<RiskTone>;
      data = data.filter((r) => sel.has(r.risco));
    }

    return data;
  }, [rows, effectiveQuery, effectiveRiskSet]);

  // paginação
  const totalPages = React.useMemo(
    () =>
      totalPagesOverride ??
      Math.max(1, Math.ceil(filteredItems.length / pageSize)),
    [filteredItems.length, pageSize, totalPagesOverride]
  );

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  // fatia a página
  const pageItems = React.useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, page, pageSize]);

  // ordena (por página) — paciente, hora, local, risco
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

      return direction === "descending" ? -cmp : cmp;
    });

    return arr;
  }, [pageItems, sortDescriptor]);

  // render célula
  const renderCell = React.useCallback(
    (row: AgendaRow, colKey: React.Key) => {
      switch (colKey) {
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
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <button
                className="rounded-lg border border-divider p-2 hover:bg-content2 focus:outline-none focus:ring-2 focus:ring-focus"
                aria-label={`Concluir ${row.paciente}`}
                onClick={() => onAction?.("done", row)}
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                  />
                </svg>
              </button>
              <button
                className="rounded-lg border border-divider p-2 hover:bg-content2 focus:outline-none focus:ring-2 focus:ring-focus"
                aria-label={`Excluir ${row.paciente}`}
                onClick={() => onAction?.("delete", row)}
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M6 7h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V7Zm3-3h6l1 1h4v2H4V5h4l1-1Z"
                  />
                </svg>
              </button>
              <button
                className="rounded-lg border border-divider p-2 hover:bg-content2 focus:outline-none focus:ring-2 focus:ring-focus"
                aria-label={`Abrir ${row.paciente}`}
                onClick={() => onAction?.("open", row)}
              >
                <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                  <path
                    fill="currentColor"
                    d="M14 3v2H5v14h14v-9h2v11H3V3h11Zm7 0h-6v2h2.59l-9.83 9.83 1.41 1.41L19 6.41V9h2V3Z"
                  />
                </svg>
              </button>
            </div>
          );
        default:
          return (row as any)[colKey];
      }
    },
    [onAction]
  );

  // toolbar (opcional, quando enableToolbar = true)
  const topContent = React.useMemo(() => {
    if (!enableToolbar) return null;
    const totalFiltered = filteredItems.length;

    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            radius="full"
            variant="flat"
            className="w-full sm:max-w-[44%]"
            classNames={{
              inputWrapper: "h-11 bg-content2",
              input: "text-[0.95rem]",
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
              <DropdownTrigger className="hidden sm:flex">
                <Button variant="flat" radius="full">
                  Risco
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de Risco"
                disallowEmptySelection
                closeOnSelect={false}
                selectedKeys={riskFilter}
                selectionMode="multiple"
                onSelectionChange={setRiskFilter as any}
              >
                {RISK_OPTIONS.map((opt) => (
                  <DropdownItem key={opt.uid} className="capitalize">
                    {opt.name}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <label className="hidden sm:flex items-center gap-2 text-small text-default-500">
              Por página:
              <select
                className="bg-transparent outline outline-0 text-small"
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
  }, [enableToolbar, filteredItems.length, filterValue, riskFilter, pageSize]);

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
          classNames={{ cursor: "bg-[var(--brand)] text-white" }}
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
        wrapper:
          "rounded-2xl border border-divider bg-content1 p-1 shadow-soft",
        thead: "bg-content2",
        th: "px-6 py-3 text-foreground/70 font-semibold",
        td: "px-6 py-4",
        base: "min-h-[320px]",
      }}
    >
      <TableHeader columns={COLUMNS}>
        {(column) => (
          <TableColumn
            key={column.uid}
            align={column.align}
            allowsSorting={column.sortable}
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        emptyContent="Nenhum agendamento encontrado."
        items={sortedItems}
      >
        {(item) => (
          <TableRow key={item.id} className="even:bg-content2/60">
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
