"use client";

import { apiGet } from "@/lib/api";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
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
} from "@heroui/react";
import type { Key, SortDescriptor } from "@react-types/shared";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import * as React from "react";

/* ===== Tipos ===== */
export type RiskTone = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical" | "neutral";

const mapRiskToChip = (t: RiskTone): ChipTone =>
  t === "moderate" ? "attention" : t;

export type PatientRow = {
  id: string;
  user: {
    first_name: string;
    last_name: string;
  };
  cpf: string;
  microarea: string;
};

type Column = {
  name: string;
  uid: keyof PatientRow | "actions";
  sortable?: boolean;
  align?: "start" | "center" | "end";
};

const RISK_OPTIONS = [
  { name: "Seguro", uid: "safe" },
  { name: "Atenção", uid: "moderate" },
  { name: "Crítico", uid: "critical" },
] as const;

const COLUMNS: Column[] = [
  { name: "Nome", uid: "user", sortable: true, align: "start" },
  { name: "CPF", uid: "cpf", sortable: true, align: "start" },
  { name: "Micro-área", uid: "microarea", sortable: true, align: "start" },
  { name: "Ações", uid: "actions", align: "end" },
];

const riskWeight: Record<RiskTone, number> = {
  safe: 0,
  moderate: 1,
  critical: 2,
};

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
  const [filterValue, setFilterValue] = React.useState("");
  const [riskFilter, setRiskFilter] = React.useState<Set<Key>>(new Set());
  const [page, setPage] = React.useState(initialPage);
  const [pageSize, setPageSize] = React.useState(initialRowsPerPage);
  const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
    column: "user",
    direction: "ascending",
  });

  const filteredItems = React.useMemo(() => {
    let data = rows;

    const q = filterValue.toLowerCase().trim();
    if (q) {
      data = data.filter((r) => {
        const nome =
          `${r.user?.first_name ?? ""} ${r.user?.last_name ?? ""}`.toLowerCase();
        const cpf = r.cpf ?? "";
        const micro = r.microarea?.toLowerCase() ?? "";

        return nome.includes(q) || cpf.includes(q) || micro.includes(q);
      });
    }

    return data;
  }, [rows, filterValue]);

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

  /* ===== Render ===== */
  const renderCell = React.useCallback(
    (row: PatientRow, colKey: Key) => {
      const k = String(colKey) as keyof PatientRow | "actions";
      switch (k) {
        case "user":
          return `${row.user.first_name} ${row.user.last_name}`;
        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                onPress={() => onAction?.("open", row)}
                className="rounded-lg border border-divider p-2 hover:bg-content2 transition bg-transparent"
                isIconOnly
              >
                <EyeIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </Button>
              <Button
                onPress={() => onAction?.("edit", row)}
                className="rounded-lg border border-divider p-2 hover:bg-content2 transition bg-transparent"
                isIconOnly
              >
                <PencilSquareIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </Button>
              <Button
                onPress={() => onAction?.("delete", row)}
                className="rounded-lg border border-divider p-2 hover:bg-content2 transition bg-transparent"
                isIconOnly
              >
                <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
              </Button>
            </div>
          );
        default:
          return (row as any)[k];
      }
    },
    [onAction]
  );

  const topContent = enableToolbar ? (
    <div className="flex flex-col gap-4 px-4 sm:px-1">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <Input
          isClearable
          radius="full"
          variant="flat"
          className="w-full sm:max-w-[44%]"
          placeholder="Buscar paciente, CPF ou micro-área..."
          value={filterValue}
          onClear={() => setFilterValue("")}
          onValueChange={(v) => setFilterValue(v)}
          classNames={{
            inputWrapper:
              "h-11 bg-transparent dark:bg-gray-900 border border-orange-600 hover:bg-gray-50 dark:hover:bg-gray-800",
            input:
              "text-[0.95rem] text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500",
          }}
        />
      </div>

      <span className="text-small text-default-500">
        Total {filteredItems.length} pacientes
      </span>
    </div>
  ) : null;

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm p-4 shadow-md border border-gray-200 dark:border-gray-800 transition-all">
      <Table
        aria-label="Lista de pacientes"
        isHeaderSticky
        shadow="none"
        topContent={topContent}
        topContentPlacement="outside"
        bottomContentPlacement="outside"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        classNames={{
          th: "px-6 py-3 text-foreground/70 font-semibold",
          td: "px-6 py-3",
          wrapper: "bg-transparent border-none shadow-none",
          table: "dark:bg-gray-900",
        }}
      >
        <TableHeader columns={COLUMNS}>
          {(column: Column) => (
            <TableColumn
              key={column.uid}
              align={column.align}
              allowsSorting={!!column.sortable}
              className="text-sm dark:bg-gray-800"
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
              className="even:bg-gray-50 dark:even:bg-gray-800/60 dark:odd:bg-gray-900/60 transition"
            >
              {(columnKey: Key) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="py-3 flex justify-center">
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
    </div>
  );
}

/* ===== Página (/pacientes) ===== */
export default function Page() {
  const router = useRouter();

  const {
    data: patients = [],
    isLoading,
    isError,
  } = useQuery<PatientRow[]>({
    queryKey: ["patients"],
    queryFn: async () => {
      const resp = await apiGet<PatientRow[]>("/api/v1/accounts/patients/");
      if (Array.isArray(resp)) return resp;
      if (resp && "results" in resp && Array.isArray((resp as any).results)) {
        return (resp as any).results;
      }
      return [];
    },
  });

  return (
    <main className="min-h-screen bg-content1 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="text-gray-500 dark:text-gray-400">
            Carregando pacientes...
          </div>
        ) : isError ? (
          <div className="text-red-600 dark:text-red-400">
            Erro ao carregar pacientes.
          </div>
        ) : (
          <PacientesTable
            rows={patients}
            onAction={(action, row) => {
              if (action === "edit") {
                // redireciona para a página de edição do paciente
                router.push(`/pacientes/${row.id}/editar`);
              }
              // se quiser, pode reaproveitar "open" para a mesma página:
              if (action === "open") {
                router.push(`/pacientes/${row.id}/editar`);
              }
              // "delete" fica pra implementar depois
            }}
          />
        )}
      </div>
    </main>
  );
}
