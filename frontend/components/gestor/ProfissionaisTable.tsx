// components/gestor/ProfissionaisTable.tsx
"use client";

import { RMButton } from "@/components/ui/RMButton";
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

// mapeia status → tom visual dos chips (mesmo usado no dashboard)
const statusToneMap: Record<Status, "active" | "license" | "away"> = {
  Ativo: "active",
  Licença: "license",
  Afastado: "away",
};

// ordem semântica para sort de status
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
  { name: "Ações", uid: "actions", align: "start" },
];

/** Ícone de ordenação local */
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
  rows: ProfRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
};

export function ProfissionaisTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 6,
}: Props) {
  const [filterValue, setFilterValue] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | Set<Key>>(
    "all"
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
          r.local.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "all" && (statusFilter as Set<Key>).size) {
      const sel = new Set<string>(
        Array.from(statusFilter as Set<Key>).map(String)
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

      if (key === "actions") return 0; // não ordenável

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

  const renderCell = React.useCallback((row: ProfRow, colKey: Key) => {
    const key = String(colKey) as keyof ProfRow | "actions";

    switch (key) {
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
          <div className="flex items-center justify-start gap-2">
            <RMButton look="outline" tone="neutral" size="sm" className="border">
              Editar
            </RMButton>
          </div>
        );
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
                    "h-11 bg-gray-100 dark:bg-gray-900 border border-gray-300 border-orange-600 hover:bg-gray-200 dark:hover:bg-gray-800",
                  input:
                    "text-[0.95rem] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
            }}
            placeholder="Buscar por profissional, cargo ou local…"
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

          <div className="flex gap-3 items-center">
            <Dropdown>
              <DropdownTrigger className="hidden sm:flex bg-transparent border border-orange-600 dark:hover:bg-gray-700">
                <Button variant="flat" radius="full" className="flex justify-center items-center">
                  Status
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de status"
                disallowEmptySelection
                closeOnSelect={false}
                selectionMode="multiple"
                selectedKeys={
                  statusFilter === "all"
                    ? "all"
                    : (statusFilter as Iterable<Key>)
                }
                onSelectionChange={(keys) =>
                  setStatusFilter(keys as "all" | Set<Key>)
                }
              >
                {STATUS_OPTIONS.map((s) => (
                  <DropdownItem key={s.uid}>{s.name}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>

            <label className="hidden sm:flex items-center gap-2 text-small text-default-500">
              Por página:
              <select
                className="bg-transparent outline-0 text-small border rounded"
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
            Total: {filteredItems.length} profissionais
          </span>
        </div>
      </div>
    );
  }, [filterValue, statusFilter, rowsPerPage, filteredItems.length]);

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
      aria-label="Tabela de profissionais"
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
      <TableHeader columns={columns}>
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

      <TableBody emptyContent="Sem profissionais" items={sortedItems} className="overflow-x-auto"> 
        {(item: ProfRow) => (
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
