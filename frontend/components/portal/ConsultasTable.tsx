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
export type ConsultaStatus = "ativo" | "cancelado" | "finalizado";

export type ConsultaRow = {
  id: string;
  profissional: string;
  cargo: string;
  local: string;
  hora: string; // "16:00"
  data: string; // "11/09/25"
  status: ConsultaStatus;
};

type Props = {
  rows: ConsultaRow[];
  initialPage?: number;
  initialRowsPerPage?: number;
  className?: string;
};

/* ===== Helpers ===== */
const statusToTone = (s: ConsultaStatus) =>
  s === "ativo"
    ? ("safe" as const)
    : s === "cancelado"
      ? ("critical" as const)
      : ("neutral" as const);

const statusToLabel = (s: ConsultaStatus) =>
  s === "ativo" ? "Ativo" : s === "cancelado" ? "Cancelado" : "Finalizado";

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
    <div className={className}>
      <Table aria-label="Tabela de consultas do paciente" removeWrapper>
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
              // zebra (como no Figma): linhas ímpares com leve fundo
              className={idx % 2 === 1 ? "bg-content2/60" : undefined}
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
                <StatusChip size="sm" tone={statusToTone(r.status)}>
                  {statusToLabel(r.status)}
                </StatusChip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* paginação centralizada, compacta */}
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
