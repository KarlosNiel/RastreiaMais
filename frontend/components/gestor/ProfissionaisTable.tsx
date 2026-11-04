// components/gestor/ProfissionaisTable.tsx
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
import { PencilSquareIcon } from "@heroicons/react/24/outline";

import { StatusChip } from "@/components/ui/StatusChip";

type Status = "Ativo" | "Licença" | "Afastado";

export type ProfRow = {
  id: string;
  profissional: string;
  cargo: string;
  local: string;
  status: Status;
};

const STATUS_OPTIONS: { name: Status; uid: Status }[] = [
  { name: "Ativo", uid: "Ativo" },
  { name: "Licença", uid: "Licença" },
  { name: "Afastado", uid: "Afastado" },
];

const statusToneMap: Record<Status, "active" | "license" | "away"> = {
  Ativo: "active",
  Licença: "license",
  Afastado: "away",
};

const statusWeight: Record<Status, number> = {
  Ativo: 0,
  Licença: 1,
  Afastado: 2,
};

type Column = {
  name: string;
  uid: keyof ProfRow | "actions";
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

const columns: Column[] = [
  { name: "Profissional", uid: "profissional", sortable: true, align: "start" },
  { name: "Cargo", uid: "cargo", sortable: true, align: "start" },
  { name: "Local", uid: "local", sortable: true, align: "start" },
  { name: "Status", uid: "status", sortable: true, align: "start" },
  { name: "Ações", uid: "actions", align: "end" },
];

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
  rows: ProfRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  onAction?: (action: "open" | "edit", row: ProfRow) => void;
};

export function ProfissionaisTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 6,
  onAction,
}: Props) {
  const [filterValue, setFilterValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | Set<Key>>(
    "all",
  );
  const [rowsPerPage, setRowsPerPage] = React.useState(initialRowsPerPage);
  const [page, setPage] = React.useState(initialPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "profissional" as Key,
    direction: "ascending",
  });

  const hasSearch = Boolean(filterValue?.trim());

  const filteredItems = React.useMemo(() => {
    let data = [...rows];

    if (hasSearch) {
      const q = filterValue.toLowerCase();

      data = data.filter(
        (r) =>
          r.profissional.toLowerCase().includes(q) ||
          r.cargo.toLowerCase().includes(q) ||
          r.local.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all" && (statusFilter as Set<Key>).size) {
      const sel = new Set<string>(
        Array.from(statusFilter as Set<Key>).map(String),
      );

      data = data.filter((r) => sel.has(r.status));
    }

    return data;
  }, [rows, filterValue, statusFilter, hasSearch]);

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
      const key = String(column) as keyof ProfRow | "status" | "actions";

      if (key === "actions") return 0;

      const firstRaw =
        key === "status" ? statusWeight[a.status] : (a as any)[key];
      const secondRaw =
        key === "status" ? statusWeight[b.status] : (b as any)[key];

      const first =
        typeof firstRaw === "string" ? firstRaw.toLowerCase() : firstRaw;
      const second =
        typeof secondRaw === "string" ? secondRaw.toLowerCase() : secondRaw;

      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return direction === "descending" ? -cmp : cmp;
    });
  }, [pageItems, sortDescriptor]);

  const renderCell = React.useCallback(
    (row: ProfRow, colKey: Key) => {
      const key = String(colKey) as keyof ProfRow | "actions";

      switch (key) {
        case "profissional":
          return (
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {row.profissional}
            </span>
          );
        case "cargo":
          return (
            <span className="text-sm text-slate-600 dark:text-zinc-400">
              {row.cargo}
            </span>
          );
        case "local":
          return (
            <span className="text-sm text-slate-600 dark:text-zinc-400">
              {row.local}
            </span>
          );
        case "status":
          return (
            <div className="flex justify-start">
              <StatusChip tone={statusToneMap[row.status]}>
                {row.status}
              </StatusChip>
            </div>
          );
        case "actions":
          return (
            <div className="flex items-center justify-end">
              <button
                aria-label={`Editar ${row.profissional}`}
                className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors focus:outline-none"
                onClick={() => onAction?.("edit", row)}
              >
                <PencilSquareIcon className="size-4.5" />
              </button>
            </div>
          );
        default:
          return (row as any)[key];
      }
    },
    [onAction],
  );

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
            placeholder="Buscar por profissional, cargo ou local…"
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
                aria-label="Filtro de status"
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
                {STATUS_OPTIONS.map((s) => (
                  <DropdownItem key={s.uid} className="capitalize">
                    {s.name}
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
            {filteredItems.length === 1 ? "profissional" : "profissionais"}
          </span>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, rowsPerPage, filteredItems.length]);

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
      aria-label="Tabela de profissionais"
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
      <TableHeader columns={columns}>
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
        emptyContent="Nenhum profissional encontrado."
        items={sortedItems}
      >
        {(item: ProfRow) => (
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
