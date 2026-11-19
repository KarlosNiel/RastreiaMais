import type {
  AgendaRow,
  RiskTone,
} from "@/components/profissional/AgendaTable";

export type PdfPeriodPreset =
  | "current"
  | "all"
  | "today"
  | "next7days"
  | "thisMonth"
  | "custom";

export type PdfSortOption =
  | "date-asc"
  | "date-desc"
  | "patient-asc"
  | "risk-desc";

export type PdfOrientation = "landscape" | "portrait";

export interface ExportPdfOptions {
  period: PdfPeriodPreset;
  startDate: string;
  endDate: string;
  statuses: string[];
  risks: RiskTone[];
  sortBy: PdfSortOption;
  orientation: PdfOrientation;
  includeContact: boolean;
  includeProfessional: boolean;
  includeNotes: boolean;
  includeSignatureArea: boolean;
}

export interface AppointmentsSummary {
  total: number;
  active: number;
  finalized: number;
  canceled: number;
  critical: number;
  moderate: number;
  safe: number;
}

export const DEFAULT_EXPORT_PDF_OPTIONS: ExportPdfOptions = {
  period: "current",
  startDate: "",
  endDate: "",
  statuses: ["ativo", "finalizado", "cancelado"],
  risks: ["safe", "moderate", "critical"],
  sortBy: "date-asc",
  orientation: "landscape",
  includeContact: true,
  includeProfessional: true,
  includeNotes: true,
  includeSignatureArea: false,
};

const RISK_PRIORITY: Record<RiskTone, number> = {
  critical: 2,
  moderate: 1,
  safe: 0,
};

const ptCollator = new Intl.Collator("pt-BR", {
  sensitivity: "base",
  numeric: true,
});

export function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");

  return `${y}-${m}-${d}`;
}

export function formatDateKeyPtBr(dateKey: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey.trim());

  if (!m) return dateKey;

  return `${m[3]}/${m[2]}/${m[1]}`;
}

export function parseAppointmentDate(
  row: Pick<AgendaRow, "rawDate" | "hora">,
): Date | null {
  if (row.rawDate) {
    const parsed = new Date(row.rawDate);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  const brMatch = /(\d{2})\/(\d{2})\/(\d{4})(?:[,\s]+(\d{1,2}):(\d{2}))?/.exec(
    row.hora || "",
  );

  if (brMatch) {
    const day = Number(brMatch[1]);
    const month = Number(brMatch[2]) - 1;
    const year = Number(brMatch[3]);
    const hours = brMatch[4] ? Number(brMatch[4]) : 0;
    const mins = brMatch[5] ? Number(brMatch[5]) : 0;
    const d = new Date(year, month, day, hours, mins, 0, 0);

    if (!Number.isNaN(d.getTime())) {
      return d;
    }
  }

  return null;
}

export function splitAppointmentDateTime(
  row: Pick<AgendaRow, "rawDate" | "hora">,
): { date: string; time: string } {
  const parsed = parseAppointmentDate(row);

  if (parsed) {
    const dd = String(parsed.getDate()).padStart(2, "0");
    const mm = String(parsed.getMonth() + 1).padStart(2, "0");
    const yyyy = parsed.getFullYear();
    const hh = String(parsed.getHours()).padStart(2, "0");
    const min = String(parsed.getMinutes()).padStart(2, "0");

    return {
      date: `${dd}/${mm}/${yyyy}`,
      time: `${hh}:${min}`,
    };
  }

  const parts = (row.hora || "").split(/[,\s]+/).filter(Boolean);

  if (parts.length >= 2) {
    return { date: parts[0], time: parts[1] };
  }

  return { date: row.hora || "—", time: "" };
}

export function sortAgendaRows(
  rows: AgendaRow[],
  sortBy: PdfSortOption,
): AgendaRow[] {
  const copy = [...rows];

  const getTimestamp = (row: AgendaRow, fallback: number): number => {
    const d = parseAppointmentDate(row);

    return d ? d.getTime() : fallback;
  };

  copy.sort((a, b) => {
    if (sortBy === "patient-asc") {
      return ptCollator.compare(a.paciente || "", b.paciente || "");
    }

    if (sortBy === "risk-desc") {
      const diff = RISK_PRIORITY[b.risco] - RISK_PRIORITY[a.risco];

      if (diff !== 0) return diff;

      return (
        getTimestamp(a, Number.MAX_SAFE_INTEGER) -
        getTimestamp(b, Number.MAX_SAFE_INTEGER)
      );
    }

    if (sortBy === "date-desc") {
      return (
        getTimestamp(b, Number.MIN_SAFE_INTEGER) -
        getTimestamp(a, Number.MIN_SAFE_INTEGER)
      );
    }

    return (
      getTimestamp(a, Number.MAX_SAFE_INTEGER) -
      getTimestamp(b, Number.MAX_SAFE_INTEGER)
    );
  });

  return copy;
}

export function filterAndSortAppointmentsForExport(
  allRows: AgendaRow[],
  currentViewRows: AgendaRow[],
  options: ExportPdfOptions,
  referenceDate: Date = new Date(),
): AgendaRow[] {
  if (options.period === "current") {
    return [...currentViewRows];
  }

  const today = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
  );
  const todayKey = toLocalDateKey(today);
  const nextWeekEnd = new Date(today);

  nextWeekEnd.setDate(nextWeekEnd.getDate() + 6);
  const nextWeekEndKey = toLocalDateKey(nextWeekEnd);
  const currentMonthPrefix = todayKey.slice(0, 7);

  const statusSet = new Set(options.statuses);
  const riskSet = new Set(options.risks);

  const startKey = options.startDate.trim();
  const endKey = options.endDate.trim();
  const normalizedStart =
    startKey && endKey && startKey > endKey ? endKey : startKey;
  const normalizedEnd =
    startKey && endKey && startKey > endKey ? startKey : endKey;

  const filtered = allRows.filter((row) => {
    const status = row.status || "ativo";

    if (!statusSet.has(status)) return false;
    if (!riskSet.has(row.risco)) return false;

    if (options.period === "all") return true;

    const parsed = parseAppointmentDate(row);

    if (!parsed) return false;

    const rowKey = toLocalDateKey(parsed);

    if (options.period === "today") {
      return rowKey === todayKey;
    }

    if (options.period === "next7days") {
      return rowKey >= todayKey && rowKey <= nextWeekEndKey;
    }

    if (options.period === "thisMonth") {
      return rowKey.slice(0, 7) === currentMonthPrefix;
    }

    if (options.period === "custom") {
      if (normalizedStart && rowKey < normalizedStart) return false;
      if (normalizedEnd && rowKey > normalizedEnd) return false;

      return true;
    }

    return true;
  });

  return sortAgendaRows(filtered, options.sortBy);
}

export function summarizeAppointments(rows: AgendaRow[]): AppointmentsSummary {
  let active = 0;
  let finalized = 0;
  let canceled = 0;
  let critical = 0;
  let moderate = 0;
  let safe = 0;

  for (const row of rows) {
    if (row.status === "finalizado") finalized += 1;
    else if (row.status === "cancelado") canceled += 1;
    else active += 1;

    if (row.risco === "critical") critical += 1;
    else if (row.risco === "moderate") moderate += 1;
    else safe += 1;
  }

  return {
    total: rows.length,
    active,
    finalized,
    canceled,
    critical,
    moderate,
    safe,
  };
}

export function buildExportScopeLabel(
  options: ExportPdfOptions,
  currentViewSummary?: string,
): string {
  if (options.period === "current") {
    const summary = currentViewSummary?.trim();

    if (!summary || summary === "Todos os agendamentos") {
      return "Visualização atual da agenda (Todos os agendamentos)";
    }

    return `Visualização atual (${summary})`;
  }

  const parts: string[] = [];

  switch (options.period) {
    case "today":
      parts.push("Período: Hoje");
      break;
    case "next7days":
      parts.push("Período: Próximos 7 dias");
      break;
    case "thisMonth":
      parts.push("Período: Este mês");
      break;
    case "custom": {
      if (options.startDate && options.endDate) {
        const [from, to] =
          options.startDate <= options.endDate
            ? [options.startDate, options.endDate]
            : [options.endDate, options.startDate];

        parts.push(
          `Período: ${formatDateKeyPtBr(from)} a ${formatDateKeyPtBr(to)}`,
        );
      } else if (options.startDate) {
        parts.push(`A partir de ${formatDateKeyPtBr(options.startDate)}`);
      } else if (options.endDate) {
        parts.push(`Até ${formatDateKeyPtBr(options.endDate)}`);
      } else {
        parts.push("Período: Personalizado");
      }
      break;
    }
    default:
      parts.push("Todos os agendamentos");
  }

  if (options.statuses.length > 0 && options.statuses.length < 3) {
    const statusMap: Record<string, string> = {
      ativo: "Ativo",
      finalizado: "Finalizado",
      cancelado: "Cancelado",
    };

    parts.push(
      `Status: ${options.statuses.map((s) => statusMap[s] ?? s).join(", ")}`,
    );
  }

  if (options.risks.length > 0 && options.risks.length < 3) {
    const riskMap: Record<RiskTone, string> = {
      safe: "Baixo risco",
      moderate: "Risco moderado",
      critical: "Alto risco",
    };

    parts.push(`Risco: ${options.risks.map((r) => riskMap[r]).join(", ")}`);
  }

  return parts.join(" • ");
}

export function buildExportFileName(
  options: ExportPdfOptions,
  referenceDate: Date = new Date(),
): string {
  const dateKey = toLocalDateKey(referenceDate);

  const slugMap: Record<PdfPeriodPreset, string> = {
    current: "agenda",
    all: "todos",
    today: "hoje",
    next7days: "proximos-7-dias",
    thisMonth: "mes-atual",
    custom: "periodo",
  };

  const suffix = slugMap[options.period] ?? "agenda";

  if (options.period === "custom" && options.startDate && options.endDate) {
    return `rastreia-agendamentos-${options.startDate}-a-${options.endDate}.pdf`;
  }

  return `rastreia-agendamentos-${suffix}-${dateKey}.pdf`;
}
