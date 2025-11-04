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
  hora: string;
  data: string;
  status: string;
};

type Props = {
  rows: ConsultaRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  className?: string;
};

/* ===== Componente ===== */
export function ConsultasTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 4,
  className,
}: Props) {
  const [page, setPage] = useState(initialPage);
  const rowsPerPage = initialRowsPerPage;
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  const visible = useMemo(
    () => rows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [page, rows, rowsPerPage]
  );

  return (
    <div
      className={`rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-4 ${className ?? ""}`}
    >
      <Table
        aria-label="Tabela de consultas do paciente"
        removeWrapper
        classNames={{
          th: "bg-gray-100 dark:bg-gray-800 text-sm font-semibold text-foreground",
          td: "align-middle",
        }}
      >
        <TableHeader>
          <TableColumn>Profissional</TableColumn>
          <TableColumn>Cargo</TableColumn>
          <TableColumn>Local</TableColumn>
          <TableColumn>Horário</TableColumn>
          <TableColumn>Data</TableColumn>
          <TableColumn className="text-right">Status</TableColumn>
        </TableHeader>

        <TableBody emptyContent="Nenhuma consulta encontrada">
          {visible.map((r, idx) => (
            <TableRow
              key={r.id}
              className={`${
                idx % 2 === 1
                  ? "bg-gray-50 dark:bg-gray-800/40"
                  : "bg-transparent"
              } transition-colors`}
            >
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
                  <span>{r.profissional}</span>
                </div>
              </TableCell>

              <TableCell>{r.cargo}</TableCell>
              <TableCell className="max-w-[260px] truncate">{r.local}</TableCell>
              <TableCell>{r.hora}</TableCell>
              <TableCell>{r.data}</TableCell>

              <TableCell className="text-right">
                <StatusChip size="sm">{r.status}</StatusChip>
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
