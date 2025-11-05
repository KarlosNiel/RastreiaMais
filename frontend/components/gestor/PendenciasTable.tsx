// components/gestor/PendenciasTable.tsx
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
import type { Key, SortDescriptor } from "@react-types/shared";
import * as React from "react";

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
  // Usar Key de @react-types/shared
  const [riskFilter, setRiskFilter] = React.useState<"all" | Set<Key>>("all");
  const [visibleColumns] = React.useState<Set<string>>(
    () => new Set(columns.map((c) => String(c.uid)))
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [page, setPage] = React.useState(initialPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "dias" as Key,
    direction: "descending",
  });

  const hasSearch = Boolean(filterValue?.trim());

  const headerColumns = React.useMemo<Column[]>(() => {
    // (não usamos "all" aqui; sempre um Set de strings)
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
          r.pendencias.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== "all" && (riskFilter as Set<Key>).size) {
      // normaliza o Set<Key> para Set<string>
      const sel = new Set<string>(
        Array.from(riskFilter as Set<Key>).map(String)
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
            radius="full"
            variant="flat"
            className="w-full sm:max-w-[44%]"
            classNames={{
              inputWrapper:
                    "h-11 bg-transparent dark:bg-gray-900 border border-orange-600 hover:bg-gray-200 dark:hover:bg-gray-800",
                  input:
                    "text-[0.95rem] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
            }}
            placeholder="Buscar por paciente, pendência ou microárea…"
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
                <Button variant="flat" radius="full" className="flex justify-center items-center">
                  Risco
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de Risco"
                disallowEmptySelection
                closeOnSelect={false}
                selectionMode="multiple"
                // selectedKeys precisa ser "all" | Iterable<Key>
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

            <label className="hidden sm:flex items-center gap-2 text-small text-default-500">
              Por página:
              <select
                className="bg-transparent outline-none text-small border rounded"
                aria-label="Linhas por página"
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
          color="primary"
          page={page}
          total={pages}
          onChange={setPage}
          classNames={{
              next: "dark:bg-gray-800",
              prev: "dark:bg-gray-800",
              item: "dark:bg-gray-800",
            }
          }
        />
      </div>
    );
  }, [page, pages]);

  return (
    <Table
      aria-label="Tabela de pendências"
      isHeaderSticky
      topContent={topContent}
      topContentPlacement="outside"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      selectionMode="none"
      sortDescriptor={sortDescriptor}
      sortIcon={SortGlyph}
      onSortChange={setSortDescriptor}
      classNames={{
        th: "px-6 py-3 text-foreground/70 font-semibold",
        td: "px-6 py-3",
        base: "min-h-[320px]",
        table: "dark:bg-gray-900",
        wrapper: "bg-transparent border-none shadow-none px-2"
      }}
    >
      <TableHeader columns={headerColumns}>
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

      <TableBody emptyContent="Sem registros" items={sortedItems} className="overflow-x-auto">
        {(item: PendenciasRow) => (
          <TableRow key={item.id} className="even:bg-gray-100 dark:even:bg-gray-800 dark:odd:bg-gray-900">
            {(columnKey: Key) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
