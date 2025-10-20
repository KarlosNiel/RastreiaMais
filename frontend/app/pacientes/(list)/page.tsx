// app/pacientes/page.tsx
"use client";

import { AccentSection } from "@/components/ui/AccentSection";
import { StatusChip } from "@/components/ui/StatusChip";
import {
  Button,
  Input,
  Pagination,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { useMemo, useState } from "react";

/* ================== Tipos & Helpers ================== */
type Risk = "safe" | "moderate" | "critical";
type ChipTone = "safe" | "attention" | "critical";

const riskToChip = (r: Risk): ChipTone => (r === "moderate" ? "attention" : r);
const riskToLabel = (r: Risk) =>
  r === "critical" ? "Crítico" : r === "moderate" ? "Atenção" : "Seguro";

type DCNT = "HAS" | "DM" | "HAS/DM";
type Row = {
  id: string;
  nomeMasked: string; // "José M. ****1597"
  dcnt: DCNT;
  ultimaEvolucao: string; // "Há 30min — Você"
  risco: Risk;
  proximo: string; // "08/09/25, 10:30"
};

/* ================== Mock (trocar por API) ================== */
const ALL_ROWS: Row[] = [
  {
    id: "p1",
    nomeMasked: "José M. ****1597",
    dcnt: "HAS/DM",
    ultimaEvolucao: "Há 30min — Você",
    risco: "moderate",
    proximo: "08/09/25, 10:30",
  },
  {
    id: "p2",
    nomeMasked: "Maria J. ****1797",
    dcnt: "HAS",
    ultimaEvolucao: "Há 2hr — Você",
    risco: "safe",
    proximo: "25/12/25, 07:30",
  },
  {
    id: "p3",
    nomeMasked: "Fulano T. ****1197",
    dcnt: "DM",
    ultimaEvolucao: "Há 4hr — Enf. Paula",
    risco: "critical",
    proximo: "07/10/25, 14:00",
  },
  {
    id: "p4",
    nomeMasked: "Fulano T. ****1197",
    dcnt: "DM",
    ultimaEvolucao: "Há 4hr — Enf. Paula",
    risco: "safe",
    proximo: "07/10/25, 14:00",
  },
  // adicione mais mocks para testar a paginação
  ...Array.from({ length: 28 }).map((_, i) => ({
    id: `p${i + 5}`,
    nomeMasked: `Paciente ${i + 5} ****${1000 + i}`,
    dcnt: (["HAS", "DM", "HAS/DM"] as DCNT[])[i % 3],
    ultimaEvolucao: ["Há 1d — Você", "Há 6h — Enf. Paula", "Há 15min — Você"][
      i % 3
    ],
    risco: (["safe", "moderate", "critical"] as Risk[])[i % 3],
    proximo: ["02/11/25, 08:00", "10/11/25, 13:30", "15/11/25, 09:45"][i % 3],
  })),
];

/* ================== Página ================== */
export default function PacientesListPage() {
  // filtros
  const [q, setQ] = useState("");
  const [dcnt, setDcnt] = useState<"todas" | DCNT>("todas");
  const [risk, setRisk] = useState<"todos" | Risk>("todos");

  // paginação
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // aplica filtros
  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL_ROWS.filter((r) => {
      const matchesSearch = s ? r.nomeMasked.toLowerCase().includes(s) : true;
      const matchesDcnt = dcnt === "todas" ? true : r.dcnt === dcnt;
      const matchesRisk = risk === "todos" ? true : r.risco === risk;
      return matchesSearch && matchesDcnt && matchesRisk;
    });
  }, [q, dcnt, risk]);

  const pages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const visible = useMemo(
    () => filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage),
    [filtered, page]
  );

  // resetar página quando filtros/busca mudarem
  // (evita cair em página vazia)
  useMemo(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, dcnt, risk]);

  return (
    <>
      {/* Header simples */}
      <div className="flex flex-col gap-4 pb-4 md:flex-row md:items-end md:justify-between md:pb-5">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Pacientes</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Lista e ações rápidas sobre pacientes da APS
          </p>
        </div>
      </div>

      <AccentSection
        className="mt-2"
        accent="brand"
        title={
          <span className="inline-flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
              <path
                fill="currentColor"
                d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"
              />
            </svg>
            Pacientes Recentes
          </span>
        }
        right={
          <div className="flex items-center gap-2">
            {/* Busca */}
            <Input
              aria-label="Pesquisar paciente"
              placeholder="Nome do Paciente"
              value={q}
              onValueChange={setQ}
              startContent={
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="size-5 text-foreground/45 pointer-events-none"
                >
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79L20 21.49 21.49 20 15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
              }
              classNames={{
                inputWrapper:
                  "h-10 bg-content1 border-divider shadow-none focus-within:ring-2 focus-within:ring-focus/40",
                input: "text-sm placeholder:text-foreground/40",
              }}
              className="w-56"
            />

            {/* Filtro DCNT */}
            <Select
              aria-label="Filtrar por DCNT"
              selectedKeys={new Set([dcnt])}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as "todas" | DCNT | undefined;
                setDcnt(v ?? "todas");
              }}
              className="w-36"
              size="sm"
            >
              <SelectItem key="todas">DCNTs: Todas</SelectItem>
              <SelectItem key="HAS">HAS</SelectItem>
              <SelectItem key="DM">DM</SelectItem>
              <SelectItem key="HAS/DM">HAS/DM</SelectItem>
            </Select>

            {/* Filtro Risco */}
            <Select
              aria-label="Filtrar por risco"
              selectedKeys={new Set([risk])}
              onSelectionChange={(keys) => {
                const v = Array.from(keys)[0] as "todos" | Risk | undefined;
                setRisk(v ?? "todos");
              }}
              className="w-36"
              size="sm"
            >
              <SelectItem key="todos">Risco: Todos</SelectItem>
              <SelectItem key="safe">Seguro</SelectItem>
              <SelectItem key="moderate">Atenção</SelectItem>
              <SelectItem key="critical">Crítico</SelectItem>
            </Select>
          </div>
        }
      >
        <Table
          aria-label="Tabela de pacientes"
          removeWrapper
          classNames={{ td: "align-middle" }}
          isHeaderSticky
        >
          <TableHeader>
            <TableColumn>Paciente</TableColumn>
            <TableColumn>DCNT</TableColumn>
            <TableColumn>Última evolução</TableColumn>
            <TableColumn>Risco</TableColumn>
            <TableColumn>Próx. compromisso</TableColumn>
            <TableColumn className="text-right">Ações</TableColumn>
          </TableHeader>

          <TableBody emptyContent="Nenhum paciente encontrado">
            {visible.map((r, i) => (
              <TableRow
                key={r.id}
                className={i % 2 === 1 ? "bg-content2/60" : undefined}
              >
                {/* Paciente */}
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
                    {r.nomeMasked}
                  </span>
                </TableCell>

                {/* DCNT */}
                <TableCell>{r.dcnt}</TableCell>

                {/* Última evolução */}
                <TableCell className="max-w-[280px] truncate">
                  {r.ultimaEvolucao}
                </TableCell>

                {/* Risco */}
                <TableCell>
                  <StatusChip size="sm" tone={riskToChip(r.risco)}>
                    {riskToLabel(r.risco)}
                  </StatusChip>
                </TableCell>

                {/* Próximo compromisso */}
                <TableCell>{r.proximo}</TableCell>

                {/* Ações */}
                <TableCell className="text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <Tooltip content="Abrir registro do paciente">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="Abrir registro"
                      >
                        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                          <path
                            fill="currentColor"
                            d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42L17.59 5H14V3ZM5 5h6v2H7v10h10v-4h2v6H5V5Z"
                          />
                        </svg>
                      </Button>
                    </Tooltip>
                    <Tooltip content="Agenda do paciente">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        aria-label="Agenda do paciente"
                      >
                        <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
                          <path
                            fill="currentColor"
                            d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z"
                          />
                        </svg>
                      </Button>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* paginação ampla */}
        <div className="mt-4 flex justify-center">
          <Pagination
            isCompact
            showControls
            page={page}
            total={pages}
            onChange={setPage}
          />
        </div>
      </AccentSection>
    </>
  );
}
