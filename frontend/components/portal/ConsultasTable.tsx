// components/portal/ConsultasTable.tsx
"use client";

import {
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { EyeIcon } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusChip } from "@/components/ui/StatusChip";

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
  onView?: (row: ConsultaRow) => void;
};

export function ConsultasTable({
  rows,
  initialPage = 1,
  initialRowsPerPage = 4,
  className,
  onView,
}: Props) {
  const [page, setPage] = useState(initialPage);
  const rowsPerPage = initialRowsPerPage;
  const pages = Math.max(1, Math.ceil(rows.length / rowsPerPage));

  const visible = useMemo(
    () => rows.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [page, rows, rowsPerPage],
  );

  return (
    <div className={className}>
      <Table
        removeWrapper
        aria-label="Tabela de consultas do paciente"
        className="overflow-x-auto"
        classNames={{
          th: "px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50 border-b border-slate-200 dark:border-zinc-700/60 first:rounded-l-lg last:rounded-r-lg",
          td: "px-4 py-3.5 text-sm text-slate-700 dark:text-zinc-300 border-b border-slate-100 dark:border-zinc-800/40",
          base: "min-h-[220px]",
          table: "dark:bg-zinc-900",
        }}
        shadow="none"
      >
        <TableHeader>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
            Profissional
          </TableColumn>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
            Cargo
          </TableColumn>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
            Local
          </TableColumn>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
            Horário
          </TableColumn>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
            Data
          </TableColumn>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50">
            Status
          </TableColumn>
          <TableColumn className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-zinc-400 bg-slate-50/80 dark:bg-zinc-800/50 text-right w-[90px]">
            Ações
          </TableColumn>
        </TableHeader>

        <TableBody emptyContent="Nenhuma consulta encontrada">
          {visible.map((r) => (
            <TableRow
              key={r.id}
              className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors"
            >
              <TableCell className="whitespace-nowrap">
                <span className="font-semibold text-slate-900 dark:text-zinc-100">
                  {r.profissional}
                </span>
              </TableCell>

              <TableCell className="text-slate-600 dark:text-zinc-400">
                {r.cargo}
              </TableCell>
              <TableCell className="max-w-[260px] truncate text-slate-600 dark:text-zinc-400">
                {r.local}
              </TableCell>
              <TableCell className="tabular-nums font-medium text-slate-700 dark:text-zinc-300">
                {r.hora}
              </TableCell>
              <TableCell className="tabular-nums text-slate-600 dark:text-zinc-400">
                {r.data}
              </TableCell>

              <TableCell>
                <StatusChip
                  size="sm"
                  tone={
                    r.status === "ativo"
                      ? "safe"
                      : r.status === "cancelado"
                        ? "critical"
                        : "neutral"
                  }
                >
                  {r.status === "ativo"
                    ? "Ativo"
                    : r.status === "cancelado"
                      ? "Cancelado"
                      : "Finalizado"}
                </StatusChip>
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end">
                  <button
                    aria-label={`Ver detalhes da consulta com ${r.profissional}`}
                    className="p-1.5 rounded-md text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors focus:outline-none"
                    onClick={() => onView?.(r)}
                  >
                    <EyeIcon className="size-4.5" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
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
          total={pages}
          onChange={setPage}
        />
      </div>
    </div>
  );
}
