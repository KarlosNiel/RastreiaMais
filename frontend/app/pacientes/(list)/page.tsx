"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import {
  Link,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useMemo, useState } from "react";

/* ===== Tipos ===== */
export type PacienteRow = {
  id: string;
  nome: string;
  cpf: string;
  microArea: string;
  telefone: string;
  status: string;
};

type TableProps = {
  rows: PacienteRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  className?: string;
};

/* ===== Componente de tabela de Pacientes ===== */
export function PacientesTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 10,
  className,
}: TableProps) {
  const [page, setPage] = useState(initialPage);
  const rowsPerPage = initialRowsPerPage;
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  const visible = useMemo(
    () => rows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [page, rows, rowsPerPage]
  );

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 ${
        className ?? ""
      }`}
    >
      <Table
        aria-label="Tabela de pacientes"
        removeWrapper
        classNames={{
          th: "bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-foreground",
          td: "align-middle",
        }}
      >
        <TableHeader>
          <TableColumn>Paciente</TableColumn>
          <TableColumn>CPF</TableColumn>
          <TableColumn>Telefone</TableColumn>
          <TableColumn>Micro-área</TableColumn>
          <TableColumn className="text-right">Status</TableColumn>
          <TableColumn className="text-right">Ações</TableColumn>
        </TableHeader>

        <TableBody emptyContent="Nenhum paciente encontrado">
          {visible.map((r, idx) => (
            <TableRow
              key={r.id}
              className={`${
                idx % 2 === 1
                  ? "bg-gray-50 dark:bg-gray-800/40"
                  : "bg-transparent"
              } transition-colors`}
            >
              {/* Paciente (nome) + avatarzinho */}
              <TableCell className="whitespace-nowrap">
                <div className="inline-flex items-center gap-2">
                  <div className="size-7 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-700">
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                      />
                    </svg>
                  </div>
                  <span>{r.nome}</span>
                </div>
              </TableCell>

              {/* CPF */}
              <TableCell className="font-mono text-sm">{r.cpf}</TableCell>

              {/* Telefone */}
              <TableCell className="whitespace-nowrap">{r.telefone}</TableCell>

              {/* Micro-área */}
              <TableCell className="max-w-[200px] truncate">
                {r.microArea}
              </TableCell>

              {/* Status */}
              <TableCell className="text-right">
                <StatusChip size="sm">{r.status}</StatusChip>
              </TableCell>

              {/* Ações: ir para edição do paciente */}
              <TableCell className="text-right">
                <Link
                  href={`/pacientes/${r.id}/editar`}
                  className="text-sm font-medium text-blue-600 hover:underline dark:text-blue-400"
                >
                  Editar
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* paginação */}
      <div className="mt-4 flex justify-center">
        <Pagination
          isCompact
          showControls
          page={page}
          total={pages}
          onChange={setPage}
        />
      </div>
    </div>
  );
}

/* ===== Página (/pacientes) ===== */
export default function Page() {
  // TODO: substituir pelo fetch real da lista de pacientes a partir do backend
  const rows: PacienteRow[] = [];

  return <PacientesTable rows={rows} />;
}
