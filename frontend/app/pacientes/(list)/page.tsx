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
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import CreateAppointmentsModal  from "@/components/appointments/CreateAppointmentsModal"

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

const RISK_OPTIONS = [
  { name: "Seguro", uid: "safe" },
  { name: "Atenção", uid: "moderate" },
  { name: "Crítico", uid: "critical" },
] as const;

const COLUMNS: Column[] = [
  { name: "Nome", uid: "user", sortable: true, align: "start" },
  { name: "CPF", uid: "cpf", sortable: true, align: "start" },
  { name: "Endereço", uid: "address", sortable: true, align: "start" },
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
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = React.useState(false);
  const [selectedPatientId, setSelectedPatientId] = React.useState<string | null>(null);
  const router = useRouter();
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
        const endereco = r.address
          ? `${r.address.street ?? ""} ${r.address.number ?? ""} ${r.address.district ?? ""} ${r.address.city ?? ""} ${r.address.uf ?? ""}`.toLowerCase()
          : "";

        return nome.includes(q) || cpf.includes(q) || endereco.includes(q);
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

  /* ===== Render ===== */
  const renderCell = React.useCallback(
    (row: PatientRow, colKey: Key) => {
      const k = String(colKey) as keyof PatientRow | "actions";
      switch (k) {
        case "user":
          return `${row.user.first_name} ${row.user.last_name}`;
        case "address": {
          const a = row.address;
          if (!a) return "—";

          const street = a.street ?? "";
          const number = a.number ?? "";
          const district = a.district ?? "";
          const city = a.city ?? "";
          const uf = a.uf ?? "";

          // Se tudo vier vazio, mostra traço
          if (!street && !number && !district && !city && !uf) return "—";

          return `${street || ""}${street && number ? ", " : ""}${number || ""}${
            (street || number) && (district || city || uf) ? " - " : ""
          }${district || ""}${district && city ? ", " : ""}${city || ""}${
            city && uf ? "/" : ""
          }${uf || ""}`;
        }

        case "actions":
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                onPress={() => {
                  setSelectedPatientId(row.id);
                  setIsAppointmentModalOpen(true);
                }}
                className="rounded-lg border border-divider p-2 hover:bg-content2 transition bg-transparent"
                isIconOnly
              >
                <span className="text-green-600 font-bold text-lg">+</span>
              </Button>
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          isClearable
          radius="full"
          variant="flat"
          className="w-full sm:max-w-xl sm:flex-1"
          placeholder="Buscar paciente, CPF ou endereço..."
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

        <Button
          as={Link}
          href="/pacientes/novo"
          color="primary"
          variant="solid"
          radius="lg"
          size="md"
          className="text-white dark:text-orange-600 dark:bg-transparent border dark:border-orange-600 dark:hover:bg-gray-900"
        >
          Novo paciente
        </Button>
      </div>

      <span className="text-small text-default-500">
        Total {filteredItems.length} pacientes
      </span>
    </div>
  ) : null;

  return (
    <>
      <CreateAppointmentsModal
          open={isAppointmentModalOpen}
          onOpenChange={setIsAppointmentModalOpen}
          preSelectedPatientId={selectedPatientId}
        />

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
    </>
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
      const resp = await apiGet<any>("/api/v1/accounts/patients/");

      const list = Array.isArray(resp)
        ? resp
        : resp && Array.isArray((resp as any).results)
          ? (resp as any).results
          : [];

      return list.map((p: any): PatientRow => {
        // Se address for número (id), ignora como objeto
        const addrFromAddress =
          p.address && typeof p.address === "object" ? p.address : null;

        const addrFromObj =
          p.address_obj && typeof p.address_obj === "object"
            ? p.address_obj
            : null;

        const addr = addrFromAddress || addrFromObj;

        return {
          id: String(p.id),
          user: p.user ?? { first_name: "", last_name: "" },
          cpf: p.cpf ?? "",
          address: addr,
        };
      });
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
                router.push(`/pacientes/${row.id}/editar`);
              }
              if (action === "open") {
                router.push(`/pacientes/${row.id}/editar`);
              }
            }}
          />
        )}
      </div>
    </main>
  );
}
