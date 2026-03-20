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
  { name: "Seguro", uid: "safe" },
  { name: "Atenção", uid: "moderate" },
  { name: "Crítico", uid: "critical" },
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

// ordem semântica para risco (↑ ascendente: Seguro < Atenção < Crítico)
const riskWeight: Record<RiskTone, number> = {
  safe: 0,
  moderate: 1,
  critical: 2,
};

/** Ícone de sort local (evita depender de @heroui/shared-icons) */
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

  const headerColumns = React.useMemo<Column[]>(() => {
    return columns.filter((c) => visibleColumns.has(String(c.uid)));
  }, [visibleColumns]);

  const filteredItems = React.useMemo(() => {
    let data = [...rows];

    if (hasSearch) {
      const q = filterValue.toLowerCase();

      data = data.filter(
        (r) =>
          r.paciente.toLowerCase().includes(q) ||
          r.microarea.toLowerCase().includes(q) ||
          r.pendencias.toLowerCase().includes(q),
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

      const firstRaw = key === "risco" ? riskWeight[a.risco] : (a as any)[key];
      const secondRaw = key === "risco" ? riskWeight[b.risco] : (b as any)[key];

      const first =
        typeof firstRaw === "string" ? firstRaw.toLowerCase() : firstRaw;
      const second =
        typeof secondRaw === "string" ? secondRaw.toLowerCase() : secondRaw;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return direction === "descending" ? -cmp : cmp;
    });
  }, [pageItems, sortDescriptor]);

  const renderCell = React.useCallback((row: PendenciasRow, colKey: Key) => {
    const key = String(colKey) as keyof PendenciasRow | "risco";

    switch (key) {
      case "risco":
        return (
          <div className="flex justify-start">
            <StatusChip
              size="sm"
              tone={row.risco === "moderate" ? "attention" : row.risco}
            >
              {row.risco === "critical"
                ? "Crítico"
                : row.risco === "moderate"
                  ? "Atenção"
                  : "Seguro"}
            </StatusChip>
          </div>
        );
      case "dias":
        return <span className="tabular-nums">{row.dias}</span>;
      default:
        return (row as any)[key];
    }
  }, []);

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-col gap-4 px-4 sm:px-1">
        <div className="flex items-end justify-between gap-3">
          <Input
            isClearable
            className="w-full sm:max-w-[44%]"
            classNames={{
              inputWrapper:
                "h-11 bg-transparent dark:bg-gray-900 border border-orange-600 hover:bg-gray-200 dark:hover:bg-gray-800",
              input:
                "text-[0.95rem] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
            }}
            placeholder="Buscar por paciente, pendência ou microárea…"
            radius="full"
            startContent={
              <svg
                aria-hidden
                className="size-4 text-foreground/50"
                viewBox="0 0 24 24"
              >
                <path
                  d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zM9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  fill="currentColor"
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

          <div className="flex items-center gap-3">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex bg-transparent border border-orange-600 dark:hover:bg-gray-700">
                <Button
                  className="flex justify-center items-center"
                  radius="full"
                  variant="flat"
                >
                  Risco
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

            <label className="hidden sm:flex items-center gap-2 text-small text-default-500">
              Por página:
              <select
                aria-label="Linhas por página"
                className="bg-transparent outline-none text-small border rounded"
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

        <div className="flex items-center justify-between">
          <span className="text-small text-default-500">
            Total {filteredItems.length} registros
          </span>
        </div>
      </div>
    );
  }, [filterValue, riskFilter, rowsPerPage, filteredItems.length]);

  const bottomContent = React.useMemo(() => {
    return (
      <div className="py-2 flex justify-center">
        <Pagination
          isCompact
          showControls
          classNames={{
            next: "dark:bg-gray-800",
            prev: "dark:bg-gray-800",
            item: "dark:bg-gray-800",
          }}
          color="primary"
          page={page}
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
        th: "px-6 py-3 text-foreground/70 font-semibold",
        td: "px-6 py-3",
        base: "min-h-[320px]",
        table: "dark:bg-gray-900",
        wrapper: "bg-transparent border-none shadow-none px-2",
      }}
      selectionMode="none"
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
            className="text-sm dark:bg-gray-800 w-[20%]"
          >
            {column.name}
          </TableColumn>
        )}
      </TableHeader>

      <TableBody
        className="overflow-x-auto"
        emptyContent="Sem registros"
        items={sortedItems}
      >
        {(item: PendenciasRow) => (
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
