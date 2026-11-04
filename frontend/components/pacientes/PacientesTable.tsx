// frontend/components/pacientes/PacientesTable.tsx
"use client";

import type { Key, SortDescriptor } from "@react-types/shared";

import {
  CalendarDaysIcon,
  PencilSquareIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
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
import Link from "next/link";
import * as React from "react";

import CreateAppointmentsModal from "@/components/appointments/CreateAppointmentsModal";

/* ===== Tipos ===== */
export type RiskTone = "safe" | "moderate" | "critical";

export type PatientRow = {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  cpf: string;
  address?: {
    uf?: string;
    city?: string;
    district?: string;
    street?: string;
    number?: number;
    complement?: string;
    zipcode?: string;
  } | null;
};

type Column = {
  name: string;
  uid: keyof PatientRow | "actions";
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

const COLUMNS: Column[] = [
  { name: "Nome", uid: "user", sortable: true, align: "start" },
  { name: "CPF", uid: "cpf", sortable: true, align: "start" },
  { name: "Endereço", uid: "address", sortable: true, align: "start" },
  { name: "Ações", uid: "actions", align: "end" },
];

/* ===== Props ===== */
export type PacienteTableProps = {
  rows: PatientRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  enableToolbar?: boolean;
  onAction?: (action: "open" | "edit" | "delete", row: PatientRow) => void;
};

/* ======================================================= */
export function PacientesTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 8,
  enableToolbar = true,
  onAction,
}: PacienteTableProps) {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] =
    React.useState(false);
  const [selectedPatientId, setSelectedPatientId] = React.useState<
    string | null
  >(null);
  const [filterValue, setFilterValue] = React.useState("");
  const [debouncedFilter, setDebouncedFilter] = React.useState("");
  const [page, setPage] = React.useState(initialPage);
  const pageSize = initialRowsPerPage;
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "user",
    direction: "ascending",
  });

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilter(filterValue);
    }, 250);

    return () => clearTimeout(timer);
  }, [filterValue]);

  const filteredItems = React.useMemo(() => {
    let data = rows;

    const q = debouncedFilter.toLowerCase().trim();

    if (q) {
      data = data.filter((r) => {
        const nome =
          `${r.user?.first_name ?? ""} ${r.user?.last_name ?? ""}`.toLowerCase();
        const cpf = r.cpf ?? "";
        const endereco = r.address
          ? `${r.address.street ?? ""} ${r.address.number ?? ""} ${r.address.district ?? ""} ${r.address.city ?? ""} ${r.address.uf ?? ""}`.toLowerCase()
          : "";

        return nome.includes(q) || cpf.includes(q) || endereco.includes(q);
      });
    }

    return data;
  }, [rows, debouncedFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  React.useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page]);

  const sortedItems = React.useMemo(() => {
    const arr = [...filteredItems];
    const { column, direction } = sortDescriptor;
    const key = String(column) as keyof PatientRow;

    arr.sort((a, b) => {
      let first: number | string = "";
      let second: number | string = "";

      if (key === "user") {
        first = `${a.user.first_name} ${a.user.last_name}`;
        second = `${b.user.first_name} ${b.user.last_name}`;
      } else if (key === "address") {
        first = a.address
          ? `${a.address.street}, ${a.address.number} - ${a.address.district}, ${a.address.city}/${a.address.uf}`
          : "";
        second = b.address
          ? `${b.address.street}, ${b.address.number} - ${b.address.district}, ${b.address.city}/${b.address.uf}`
          : "";
      } else {
        first = (a as any)[key] ?? "";
        second = (b as any)[key] ?? "";
      }

      const cmp =
        typeof first === "number" && typeof second === "number"
          ? first - second
          : first.toString().localeCompare(second.toString(), "pt", {
              sensitivity: "base",
            });

      return direction === "descending" ? -cmp : cmp;
    });

    const start = (page - 1) * pageSize;

    return arr.slice(start, start + pageSize);
  }, [filteredItems, sortDescriptor, page, pageSize]);

  const formatCpf = (cpf?: string) => {
    if (!cpf) return "—";
    const digits = cpf.replace(/\D/g, "");

    if (digits.length !== 11) return cpf;

    return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  /* ===== Render ===== */
  const renderCell = React.useCallback(
    (row: PatientRow, colKey: Key) => {
      const k = String(colKey) as keyof PatientRow | "actions";

      switch (k) {
        case "user":
          return (
            <span className="font-semibold text-slate-900 dark:text-zinc-100">
              {row.user.first_name} {row.user.last_name}
            </span>
          );
        case "cpf":
          return (
            <span className="tabular-nums text-slate-600 dark:text-zinc-400 font-mono text-xs">
              {formatCpf(row.cpf)}
            </span>
          );
        case "address": {
          const a = row.address;

          if (!a) return <span className="text-slate-400">—</span>;

          const street = a.street ?? "";
          const number = a.number ?? "";
          const district = a.district ?? "";
          const city = a.city ?? "";
          const uf = a.uf ?? "";

          if (!street && !number && !district && !city && !uf)
            return <span className="text-slate-400">—</span>;

          return (
            <span className="text-slate-600 dark:text-zinc-400 text-sm">
              {`${street || ""}${street && number ? ", " : ""}${number || ""}${
                (street || number) && (district || city || uf) ? " - " : ""
              }${district || ""}${district && city ? ", " : ""}${city || ""}${
                city && uf ? "/" : ""
              }${uf || ""}`}
            </span>
          );
        }

        case "actions":
          return (
            <div className="flex items-center justify-end gap-1">
              <Tooltip content="Novo Agendamento" delay={300}>
                <button
                  aria-label={`Novo agendamento para ${row.user.first_name}`}
                  className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors focus:outline-none"
                  onClick={() => {
                    setSelectedPatientId(row.id);
                    setIsAppointmentModalOpen(true);
                  }}
                >
                  <CalendarDaysIcon className="size-4.5" />
                </button>
              </Tooltip>

              <Tooltip content="Editar Paciente" delay={300}>
                <button
                  aria-label={`Editar ${row.user.first_name}`}
                  className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors focus:outline-none"
                  onClick={() => onAction?.("edit", row)}
                >
                  <PencilSquareIcon className="size-4.5" />
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

  const topContent = enableToolbar ? (
    <div className="flex flex-col gap-3 px-1 mb-2">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          isClearable
          className="w-full sm:max-w-md"
          classNames={{
            inputWrapper:
              "h-10 bg-slate-50/80 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/80 hover:border-slate-300 dark:hover:border-zinc-600 focus-within:!border-primary focus-within:bg-white dark:focus-within:bg-zinc-900 shadow-2xs transition-colors",
            input:
              "text-sm text-slate-800 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500",
          }}
          placeholder="Buscar por paciente, CPF ou endereço..."
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
          onClear={() => setFilterValue("")}
          onValueChange={(v) => setFilterValue(v)}
        />

        <Button
          as={Link}
          className="font-medium text-white bg-primary hover:bg-primary/90 shadow-2xs"
          color="primary"
          href="/pacientes/novo"
          radius="md"
          size="md"
          startContent={<PlusIcon className="size-4" strokeWidth={2.5} />}
          variant="solid"
        >
          Novo Paciente
        </Button>
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-500 dark:text-zinc-400">
          Total: {filteredItems.length}{" "}
          {filteredItems.length === 1 ? "paciente" : "pacientes"}
        </span>
      </div>
    </div>
  ) : null;

  return (
    <>
      <CreateAppointmentsModal
        open={isAppointmentModalOpen}
        preSelectedPatientId={selectedPatientId}
        onOpenChange={setIsAppointmentModalOpen}
      />

      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 transition-all">
        <Table
          isHeaderSticky
          aria-label="Lista de pacientes"
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
          topContent={topContent}
          topContentPlacement="outside"
          onSortChange={setSortDescriptor}
        >
          <TableHeader columns={COLUMNS}>
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
            emptyContent="Nenhum paciente encontrado."
            items={sortedItems}
          >
            {(item: PatientRow) => (
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

        <div className="py-3 flex justify-center border-t border-slate-100 dark:border-zinc-800/80 mt-2">
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
      </div>
    </>
  );
}
