// components/paciente/ConsultasTable.tsx
"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import {
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

export type ConsultaRow = {
  id: string;
  profissional: string;
  cargo: string;
  local: string;
  hora: string; // "16:00"
  data: string; // "11/09/25"
  status: string;
};

type Props = {
  rows: ConsultaRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  className?: string;
};

/* ===== Helpers ===== */


/* ===== Componente ===== */
export function ConsultasTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 4,
  className
}: Props) {
  const [page, setPage] = useState(initialPage);
  const rowsPerPage = initialRowsPerPage;
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  const visible = useMemo(
    () => rows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [page, rows, rowsPerPage]
  );

  return (
    <div className={className}>
      <Table aria-label="Tabela de consultas do paciente" removeWrapper className="overflow-x-auto">
        <TableHeader className="">
          <TableColumn className="text-sm dark:text-white dark:bg-gray-800 ">Profissional</TableColumn>
          <TableColumn className="text-sm dark:text-white dark:bg-gray-800">Cargo</TableColumn>
          <TableColumn className="text-sm dark:text-white dark:bg-gray-800">Local</TableColumn>
          <TableColumn className="text-sm dark:text-white dark:bg-gray-800">Horário</TableColumn>
          <TableColumn className="text-sm dark:text-white dark:bg-gray-800">Data</TableColumn>
          <TableColumn className="text-sm text-right dark:text-white dark:bg-gray-800">Status</TableColumn>
        </TableHeader>

        <TableBody emptyContent="Nenhuma consulta encontrada">
          {visible.map((r, idx) => (
            <TableRow
              key={r.id}
              // zebra (como no Figma): linhas ímpares com leve fundo
              className={idx % 2 === 1 ? "bg-content2/60 dark:bg-gray-800 dark:text-white" : "dark:bg-gray-900 dark:text-white"}
            >
              <TableCell className="whitespace-nowrap">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-flex size-7 items-center justify-center rounded-full border border-divider">
                    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
                      <path
                        fill="currentColor"
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
                      />
                    </svg>
                  </span>
                  {r.profissional}
                </span>
              </TableCell>

              <TableCell>{r.cargo}</TableCell>
              <TableCell className="max-w-[260px] truncate">
                {r.local}
              </TableCell>
              <TableCell>{r.hora}</TableCell>
              <TableCell>{r.data}</TableCell>

              <TableCell className="text-right">
                <StatusChip size="sm"     
                  className={`
                    ${r.status === "ativo" ? "bg-green-500/15 text-green-700 dark:text-green-300" : ""}
                    ${r.status === "finalizado" ? "bg-gray-500/15 text-gray-600 dark:text-gray-400" : ""}
                    ${r.status === "cancelado" ? "bg-red-500/15 text-red-600 dark:text-red-400" : ""}
                  `}>
                  {r.status}
                </StatusChip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* paginação centralizada, compacta */}
      <div className="mt-4 flex justify-center ">
        <Pagination 
          classNames={{
            next: "dark:bg-gray-800",
            prev: "dark:bg-gray-800",
            item: "dark:bg-gray-800",
          }}
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
