// components/gestor/PendenciasTable.tsx
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
import * as React from "react";

import { StatusChip } from "@/components/ui/StatusChip";

export type RiskTone = "safe" | "moderate" | "critical";

export type PendenciasRow = {
  id: string;
  paciente: string;
  pendencias: string;
  dias: number;
  microarea: string;
  risco: RiskTone;
};

const RISK_OPTIONS = [
  { name: "Baixo risco", uid: "safe" },
  { name: "Risco moderado", uid: "moderate" },
  { name: "Alto risco", uid: "critical" },
] as const;

type Column = {
  name: string;
  uid: keyof PendenciasRow | "risco";
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

const columns: readonly Column[] = [
  { name: "Paciente", uid: "paciente", sortable: true, align: "start" },
  { name: "Pendências", uid: "pendencias", align: "start" },
  { name: "Dias", uid: "dias", sortable: true, align: "start" },
  { name: "Microárea", uid: "microarea", sortable: true, align: "start" },
  { name: "Status", uid: "risco", sortable: true, align: "start" },
] as const;

const riskWeight: Record<RiskTone, number> = {
  safe: 0,
  moderate: 1,
  critical: 2,
};

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

type Props = {
  rows: PendenciasRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
};

export function PendenciasTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 6,
}: Props) {
  const [filterValue, setFilterValue] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState<"all" | Set<Key>>("all");
  const [visibleColumns] = React.useState<Set<string>>(
    () => new Set(columns.map((c) => String(c.uid))),
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [page, setPage] = React.useState(initialPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "dias" as Key,
    direction: "descending",
  });

  const hasSearch = Boolean(filterValue?.trim());

  const headerColumns = React.useMemo(() => {
    return columns.filter((col) => visibleColumns.has(String(col.uid)));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let data = [...rows];

    if (hasSearch) {
      const q = filterValue.toLowerCase();

      data = data.filter(
        (r) =>
          r.paciente.toLowerCase().includes(q) ||
          r.pendencias.toLowerCase().includes(q) ||
          r.microarea.toLowerCase().includes(q),
      );
    }

    if (riskFilter !== "all" && (riskFilter as Set<Key>).size) {
      const sel = new Set<string>(
        Array.from(riskFilter as Set<Key>).map(String),
      );

      data = data.filter((r) => sel.has(r.risco));
    }

    return data;
  }, [rows, filterValue, riskFilter, hasSearch]);

  const pages = Math.max(1, Math.ceil(filteredItems.length / rowsPerPage));

  React.useEffect(() => {
    if (page > pages) setPage(1);
  }, [pages, page]);

  const pageItems = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return filteredItems.slice(start, end);
  }, [filteredItems, page, rowsPerPage]);

  const sortedItems = React.useMemo(() => {
    const arr = [...pageItems];
    const { column, direction } = sortDescriptor;

    return arr.sort((a, b) => {
      const key = String(column) as keyof PendenciasRow | "risco";
      let cmp = 0;

      if (key === "risco") {
        const wA = riskWeight[a.risco];
        const wB = riskWeight[b.risco];

        cmp = wA < wB ? -1 : wA > wB ? 1 : 0;
      } else if (key === "dias") {
        cmp = a.dias < b.dias ? -1 : a.dias > b.dias ? 1 : 0;
      } else {
        const valA = (a[key] ?? "").toString().toLowerCase();
        const valB = (b[key] ?? "").toString().toLowerCase();

        cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      }

      return direction === "descending" ? -cmp : cmp;
    });
  }, [pageItems, sortDescriptor]);

  const renderCell = React.useCallback((row: PendenciasRow, colKey: Key) => {
    const key = String(colKey) as keyof PendenciasRow;

    switch (key) {
      case "paciente":
        return (
          <span className="font-semibold text-slate-900 dark:text-zinc-100">
            {row.paciente}
          </span>
        );
      case "pendencias":
        return (
          <span className="text-sm text-slate-600 dark:text-zinc-400">
            {row.pendencias}
          </span>
        );
      case "dias":
        return (
          <span className="tabular-nums font-medium text-slate-700 dark:text-zinc-300">
            {row.dias} dias
          </span>
        );
      case "microarea":
        return (
          <span className="text-sm text-slate-600 dark:text-zinc-400">
            {row.microarea}
          </span>
        );
      case "risco":
        return (
          <div className="flex justify-start">
            <StatusChip
              size="sm"
              tone={
                row.risco === "critical"
                  ? "critical"
                  : row.risco === "moderate"
                    ? "attention"
                    : "safe"
              }
            >
              {row.risco === "critical"
                ? "Alto risco"
                : row.risco === "moderate"
                  ? "Risco moderado"
                  : "Baixo risco"}
            </StatusChip>
          </div>
        );
      default:
        return (row as any)[key];
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-3 px-1">
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
            placeholder="Buscar por paciente, pendência ou microárea…"
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

          <div className="flex gap-2.5 items-center">
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

            <label className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 ml-1">
              Por página:
              <select
                aria-label="Linhas por página"
                className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-md px-2 py-1.5 text-xs text-slate-700 dark:text-zinc-200 outline-none focus:border-primary shadow-2xs"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
              >
                <option value="6">6</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-500 dark:text-zinc-400">
            Total: {filteredItems.length}{" "}
            {filteredItems.length === 1 ? "registro" : "registros"}
          </span>
        </div>
      </div>
    );
  }, [filterValue, riskFilter, rowsPerPage, filteredItems.length]);

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
          total={pages}
          onChange={setPage}
        />
      </div>
    );
  }, [page, pages]);

  return (
    <Table
      isHeaderSticky
      aria-label="Tabela de pendências"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      classNames={{
        th: "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700/60 first:rounded-l-lg last:rounded-r-lg",
        td: "px-4 py-3.5 text-sm text-slate-700 dark:text-zinc-300 border-b border-slate-100 dark:border-zinc-800/40",
        base: "min-h-[300px]",
        table: "dark:bg-zinc-900",
        wrapper: "bg-transparent border-none shadow-none px-0",
      }}
      selectionMode="none"
      shadow="none"
      sortDescriptor={sortDescriptor}
      sortIcon={SortGlyph}
      topContent={topContent}
      topContentPlacement="outside"
      onSortChange={setSortDescriptor}
    >
      <TableHeader columns={headerColumns}>
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
        emptyContent="Nenhuma pendência encontrada."
        items={sortedItems}
      >
        {(item: PendenciasRow) => (
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
