import type { jsPDF } from "jspdf";
import type { UserOptions } from "jspdf-autotable";
import type {
  AgendaRow,
  RiskTone,
} from "@/components/profissional/AgendaTable";

import {
  type ExportPdfOptions,
  buildExportFileName,
  splitAppointmentDateTime,
  summarizeAppointments,
} from "./appointmentsPdfFilters";

type RgbColor = [number, number, number];

type JsPDFWithAutoTable = jsPDF & {
  lastAutoTable?: {
    finalY?: number;
  };
};

export interface ExportAppointmentsPdfParams {
  rows: AgendaRow[];
  options: ExportPdfOptions;
  scopeLabel: string;
  issuerName?: string;
  unitLabel?: string;
  generatedAt?: Date;
}

export interface ExportAppointmentsPdfResult {
  filename: string;
  count: number;
  pages: number;
}

const COLORS = {
  brand: [234, 88, 12] as RgbColor, // #EA580C
  brandSoftBg: [255, 247, 237] as RgbColor, // #FFF7ED
  brandSoftBorder: [253, 186, 116] as RgbColor, // #FDBA74
  ink: [15, 23, 42] as RgbColor, // #0F172A
  slate700: [51, 65, 85] as RgbColor, // #334155
  slate500: [100, 116, 139] as RgbColor, // #64748B
  slate400: [148, 163, 184] as RgbColor, // #94A3B8
  surface: [248, 250, 252] as RgbColor, // #F8FAFC
  tableHeadBg: [241, 245, 249] as RgbColor, // #F1F5F9
  border: [226, 232, 240] as RgbColor, // #E2E8F0
  white: [255, 255, 255] as RgbColor,
};

const RISK_BADGE_MAP: Record<
  RiskTone,
  { label: string; bg: RgbColor; text: RgbColor; border: RgbColor }
> = {
  safe: {
    label: "Baixo risco",
    bg: [236, 253, 245],
    text: [4, 120, 87],
    border: [167, 243, 208],
  },
  moderate: {
    label: "Risco moderado",
    bg: [255, 251, 235],
    text: [180, 83, 9],
    border: [253, 230, 138],
  },
  critical: {
    label: "Alto risco",
    bg: [255, 241, 242],
    text: [190, 18, 60],
    border: [254, 205, 211],
  },
};

const STATUS_BADGE_MAP: Record<
  string,
  { label: string; bg: RgbColor; text: RgbColor; border: RgbColor }
> = {
  ativo: {
    label: "Ativo",
    bg: [240, 249, 255],
    text: [3, 105, 161],
    border: [186, 230, 253],
  },
  finalizado: {
    label: "Finalizado",
    bg: [236, 253, 245],
    text: [4, 120, 87],
    border: [167, 243, 208],
  },
  cancelado: {
    label: "Cancelado",
    bg: [241, 245, 249],
    text: [71, 85, 105],
    border: [203, 213, 225],
  },
};

function sanitizePdfText(value?: string | null): string {
  if (!value) return "";

  return value
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, "...")
    .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2022\n\r\t]/g, "")
    .trim();
}

function drawBrandMark(doc: jsPDF, x: number, y: number, size: number) {
  doc.setFillColor(...COLORS.brandSoftBg);
  doc.setDrawColor(...COLORS.brandSoftBorder);
  doc.setLineWidth(0.35);
  doc.roundedRect(x, y, size, size, 2, 2, "FD");

  // Pulso ECG limpo dentro da marca vetorial
  const padX = size * 0.16;
  const midY = y + size * 0.56;
  const w = size - padX * 2;
  const startX = x + padX;

  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.55);
  doc.setLineCap("round");
  doc.setLineJoin("round");

  const pts: Array<[number, number]> = [
    [startX, midY],
    [startX + w * 0.24, midY],
    [startX + w * 0.35, midY - size * 0.16],
    [startX + w * 0.47, midY + size * 0.22],
    [startX + w * 0.6, midY - size * 0.28],
    [startX + w * 0.72, midY + size * 0.1],
    [startX + w * 0.8, midY],
    [startX + w, midY],
  ];

  for (let i = 0; i < pts.length - 1; i += 1) {
    doc.line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]);
  }
}

function drawPillBadge(
  doc: jsPDF,
  x: number,
  y: number,
  cellWidth: number,
  cellHeight: number,
  badge: { label: string; bg: RgbColor; text: RgbColor; border: RgbColor },
  maxPillWidth: number,
) {
  const pillW = Math.min(cellWidth - 3, maxPillWidth);
  const pillH = 5.6;
  const pillX = x + (cellWidth - pillW) / 2;
  const pillY = y + (cellHeight - pillH) / 2;

  doc.setFillColor(...badge.bg);
  doc.setDrawColor(...badge.border);
  doc.setLineWidth(0.25);
  doc.roundedRect(pillX, pillY, pillW, pillH, 2.2, 2.2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.setTextColor(...badge.text);
  doc.text(badge.label, pillX + pillW / 2, pillY + pillH / 2 + 0.2, {
    align: "center",
    baseline: "middle",
  });
}

function resolveUnitLabel(rows: AgendaRow[], explicitUnit?: string): string {
  if (explicitUnit?.trim()) return sanitizePdfText(explicitUnit);

  const locals = Array.from(
    new Set(rows.map((r) => r.local?.trim()).filter(Boolean)),
  );

  if (locals.length === 1) {
    return sanitizePdfText(locals[0]);
  }

  return "Microárea: Jardim Magnólia";
}

function formatPatientCell(row: AgendaRow, includeContact: boolean): string {
  const lines = [sanitizePdfText(row.paciente) || "Desconhecido"];

  if (includeContact) {
    const contactParts: string[] = [];

    if (row.docMasked) {
      contactParts.push(`CPF: ${sanitizePdfText(row.docMasked)}`);
    }
    if (row.patientPhone) {
      contactParts.push(`Tel: ${sanitizePdfText(row.patientPhone)}`);
    }
    if (row.susMasked) {
      contactParts.push(`CNS: ${sanitizePdfText(row.susMasked)}`);
    }

    if (contactParts.length > 0) {
      lines.push(contactParts.join("  •  "));
    }
  }

  return lines.join("\n");
}

function formatTypeConditionCell(row: AgendaRow, inlineNotes: boolean): string {
  const lines: string[] = [];
  const typeText = sanitizePdfText(row.type) || "Consulta";
  const condText =
    row.condicao && row.condicao !== "—" ? sanitizePdfText(row.condicao) : "";

  if (condText) {
    lines.push(`${typeText} • ${condText}`);
  } else {
    lines.push(typeText);
  }

  if (inlineNotes && row.description?.trim()) {
    lines.push(`Obs: ${sanitizePdfText(row.description)}`);
  }

  return lines.join("\n");
}

function formatLocalCell(row: AgendaRow, inlineProfessional: boolean): string {
  const lines = [sanitizePdfText(row.local) || "UBS Jardim Magnólia"];

  if (inlineProfessional && row.professionalName) {
    const roleSuffix = row.professionalRole
      ? ` (${sanitizePdfText(row.professionalRole)})`
      : "";

    lines.push(`Prof: ${sanitizePdfText(row.professionalName)}${roleSuffix}`);
  }

  return lines.join("\n");
}

export async function buildAppointmentsPdfDocument({
  rows,
  options,
  scopeLabel,
  issuerName = "Profissional APS",
  unitLabel,
  generatedAt = new Date(),
}: ExportAppointmentsPdfParams): Promise<{
  doc: jsPDF;
  filename: string;
  pages: number;
}> {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import("jspdf"),
    import("jspdf-autotable"),
  ]);

  const isLandscape = options.orientation === "landscape";
  const doc = new jsPDF({
    orientation: options.orientation,
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2;
  const summary = summarizeAppointments(rows);
  const resolvedUnit = resolveUnitLabel(rows, unitLabel);
  const safeIssuer = sanitizePdfText(issuerName) || "Profissional APS";

  const emissionDate = generatedAt.toLocaleDateString("pt-BR");
  const emissionTime = generatedAt.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const emissionFull = `${emissionDate} às ${emissionTime}`;

  // ===== CABEÇALHO PRINCIPAL (PÁGINA 1) =====
  drawBrandMark(doc, marginX, 12, 10);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.brand);
  doc.text("Rastreia", marginX + 13, 16.5);
  const brandWordWidth = doc.getTextWidth("Rastreia");

  doc.setTextColor(...COLORS.ink);
  doc.text("+", marginX + 13 + brandWordWidth + 0.1, 16.5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.slate500);
  doc.text(
    "Atenção Primária à Saúde  •  Agenda de Atendimentos",
    marginX + 13,
    21,
  );

  // Metadados à direita
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...COLORS.ink);
  doc.text(resolvedUnit, pageWidth - marginX, 15.5, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.slate500);
  doc.text(`Emitido por: ${safeIssuer}`, pageWidth - marginX, 19.5, {
    align: "right",
  });
  doc.text(`Emissão: ${emissionFull}`, pageWidth - marginX, 23.2, {
    align: "right",
  });

  // Linha divisória com destaque laranja à esquerda
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.35);
  doc.line(marginX, 27, pageWidth - marginX, 27);
  doc.setDrawColor(...COLORS.brand);
  doc.setLineWidth(0.9);
  doc.line(marginX, 27, marginX + 34, 27);

  // Título do relatório
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...COLORS.ink);
  doc.text("Relatório de Agendamentos Clínicos", marginX, 34);

  // ===== CAIXA DE RESUMO EXECUTIVO & FILTROS =====
  const safeScope = sanitizePdfText(scopeLabel) || "Todos os agendamentos";
  const scopeTextLines = doc.splitTextToSize(
    `Escopo: ${safeScope}`,
    contentWidth - 8,
  ) as string[];
  const boxTop = 37.5;
  const scopeHeight = Math.max(1, scopeTextLines.length) * 4.2;
  const boxHeight = 11 + scopeHeight;

  doc.setFillColor(...COLORS.surface);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(marginX, boxTop, contentWidth, boxHeight, 2, 2, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.3);
  doc.setTextColor(...COLORS.slate700);
  doc.text(scopeTextLines, marginX + 4, boxTop + 5.2);

  // Contadores de resumo na linha inferior da caixa
  const statItems: Array<{ label: string; color: RgbColor }> = [
    { label: `Total: ${summary.total}`, color: COLORS.ink },
    { label: `Ativos: ${summary.active}`, color: [3, 105, 161] },
    { label: `Finalizados: ${summary.finalized}`, color: [4, 120, 87] },
    { label: `Alto risco: ${summary.critical}`, color: [190, 18, 60] },
  ];

  if (summary.canceled > 0) {
    statItems.push({
      label: `Cancelados: ${summary.canceled}`,
      color: COLORS.slate500,
    });
  }

  let statX = marginX + 4;
  const statY = boxTop + scopeHeight + 7.2;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  statItems.forEach((item, idx) => {
    doc.setTextColor(...item.color);
    doc.text(item.label, statX, statY);
    statX += doc.getTextWidth(item.label);

    if (idx < statItems.length - 1) {
      doc.setTextColor(...COLORS.slate400);
      doc.text("   |   ", statX, statY);
      statX += doc.getTextWidth("   |   ");
    }
  });

  // ===== DEFINIÇÃO DE COLUNAS E DADOS DA TABELA =====
  const showSeparateProf = isLandscape && options.includeProfessional;
  const showSeparateNotes = isLandscape && options.includeNotes;
  const inlineProfInLocal = !isLandscape && options.includeProfessional;
  const inlineNotesInType = !isLandscape && options.includeNotes;

  type ColSpec = {
    key: string;
    header: string;
    width: number;
    halign?: "left" | "center" | "right";
  };

  let columns: ColSpec[];

  if (isLandscape) {
    if (showSeparateProf && showSeparateNotes) {
      columns = [
        { key: "idx", header: "#", width: 9, halign: "center" },
        { key: "datetime", header: "Data / Horário", width: 24 },
        { key: "patient", header: "Paciente", width: 56 },
        { key: "typeCondition", header: "Tipo / Condição", width: 32 },
        { key: "local", header: "Local", width: 34 },
        { key: "professional", header: "Profissional", width: 32 },
        { key: "risk", header: "Risco", width: 25, halign: "center" },
        { key: "status", header: "Status", width: 22, halign: "center" },
        { key: "notes", header: "Observações", width: 35 },
      ];
    } else if (showSeparateProf) {
      columns = [
        { key: "idx", header: "#", width: 9, halign: "center" },
        { key: "datetime", header: "Data / Horário", width: 26 },
        { key: "patient", header: "Paciente", width: 74 },
        { key: "typeCondition", header: "Tipo / Condição", width: 38 },
        { key: "local", header: "Local", width: 40 },
        { key: "professional", header: "Profissional", width: 35 },
        { key: "risk", header: "Risco", width: 25, halign: "center" },
        { key: "status", header: "Status", width: 22, halign: "center" },
      ];
    } else if (showSeparateNotes) {
      columns = [
        { key: "idx", header: "#", width: 9, halign: "center" },
        { key: "datetime", header: "Data / Horário", width: 25 },
        { key: "patient", header: "Paciente", width: 66 },
        { key: "typeCondition", header: "Tipo / Condição", width: 36 },
        { key: "local", header: "Local", width: 38 },
        { key: "risk", header: "Risco", width: 25, halign: "center" },
        { key: "status", header: "Status", width: 22, halign: "center" },
        { key: "notes", header: "Observações", width: 48 },
      ];
    } else {
      columns = [
        { key: "idx", header: "#", width: 10, halign: "center" },
        { key: "datetime", header: "Data / Horário", width: 28 },
        { key: "patient", header: "Paciente", width: 86 },
        { key: "typeCondition", header: "Tipo / Condição", width: 46 },
        { key: "local", header: "Local", width: 48 },
        { key: "risk", header: "Risco", width: 27, halign: "center" },
        { key: "status", header: "Status", width: 24, halign: "center" },
      ];
    }
  } else {
    columns = [
      { key: "idx", header: "#", width: 8, halign: "center" },
      { key: "datetime", header: "Data / Hora", width: 23 },
      { key: "patient", header: "Paciente", width: 56 },
      { key: "typeCondition", header: "Tipo / Condição", width: 28 },
      { key: "local", header: "Local", width: 26 },
      { key: "risk", header: "Risco", width: 22, halign: "center" },
      { key: "status", header: "Status", width: 19, halign: "center" },
    ];
  }

  const riskColIndex = columns.findIndex((c) => c.key === "risk");
  const statusColIndex = columns.findIndex((c) => c.key === "status");

  const tableBody = rows.map((row, index) => {
    const dt = splitAppointmentDateTime(row);
    const dateTimeLabel = dt.time ? `${dt.date}\n${dt.time}` : dt.date;
    const riskInfo = RISK_BADGE_MAP[row.risco] ?? RISK_BADGE_MAP.safe;
    const statusInfo =
      STATUS_BADGE_MAP[row.status || "ativo"] ?? STATUS_BADGE_MAP.ativo;
    const profText = row.professionalName
      ? row.professionalRole
        ? `${sanitizePdfText(row.professionalName)}\n${sanitizePdfText(row.professionalRole)}`
        : sanitizePdfText(row.professionalName)
      : "—";

    const cellsByKey: Record<string, string> = {
      idx: String(index + 1),
      datetime: dateTimeLabel,
      patient: formatPatientCell(row, options.includeContact),
      typeCondition: formatTypeConditionCell(row, inlineNotesInType),
      local: formatLocalCell(row, inlineProfInLocal),
      professional: profText,
      risk: riskInfo.label,
      status: statusInfo.label,
      notes: row.description?.trim() ? sanitizePdfText(row.description) : "—",
    };

    return columns.map((col) => cellsByKey[col.key] ?? "");
  });

  const columnStyles: UserOptions["columnStyles"] = {};

  columns.forEach((col, i) => {
    columnStyles[i] = {
      cellWidth: col.width,
      halign: col.halign ?? "left",
      valign: "middle",
    };
  });

  const tableStartY = boxTop + boxHeight + 5;

  autoTable(doc, {
    startY: tableStartY,
    margin: { top: 22, right: marginX, bottom: 18, left: marginX },
    head: [columns.map((c) => c.header)],
    body: tableBody,
    theme: "grid",
    showHead: "everyPage",
    rowPageBreak: "avoid",
    styles: {
      font: "helvetica",
      fontSize: 8.2,
      cellPadding: { top: 3, right: 2.8, bottom: 3, left: 2.8 },
      textColor: COLORS.slate700,
      lineColor: COLORS.border,
      lineWidth: 0.2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: COLORS.tableHeadBg,
      textColor: COLORS.slate700,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
      valign: "middle",
      cellPadding: { top: 3.2, right: 2.8, bottom: 3.2, left: 2.8 },
    },
    alternateRowStyles: {
      fillColor: [252, 253, 255],
    },
    columnStyles,
    didParseCell(data) {
      if (data.section === "head") {
        const col = columns[data.column.index];

        if (col?.halign) {
          data.cell.styles.halign = col.halign;
        }
      }

      if (
        data.section === "body" &&
        columns[data.column.index]?.key === "patient"
      ) {
        data.cell.styles.textColor = COLORS.ink;
      }
    },
    willDrawCell(data) {
      if (
        data.section === "body" &&
        (data.column.index === riskColIndex ||
          data.column.index === statusColIndex)
      ) {
        data.cell.text = [];
      }
    },
    didDrawCell(data) {
      if (data.section !== "body") return;

      const row = rows[data.row.index];

      if (!row) return;

      if (data.column.index === riskColIndex) {
        const badge = RISK_BADGE_MAP[row.risco] ?? RISK_BADGE_MAP.safe;

        drawPillBadge(
          doc,
          data.cell.x,
          data.cell.y,
          data.cell.width,
          data.cell.height,
          badge,
          23,
        );
      }

      if (data.column.index === statusColIndex) {
        const badge =
          STATUS_BADGE_MAP[row.status || "ativo"] ?? STATUS_BADGE_MAP.ativo;

        drawPillBadge(
          doc,
          data.cell.x,
          data.cell.y,
          data.cell.width,
          data.cell.height,
          badge,
          19,
        );
      }
    },
  });

  // ===== ÁREA OPCIONAL DE ASSINATURA E CARIMBO =====
  if (options.includeSignatureArea) {
    let cursorY =
      ((doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? tableStartY) + 14;

    if (cursorY + 22 > pageHeight - 16) {
      doc.addPage();
      cursorY = 34;
    }

    const sigWidth = (contentWidth - 20) / 2;
    const leftSigX = marginX;
    const rightSigX = marginX + sigWidth + 20;

    doc.setDrawColor(...COLORS.slate400);
    doc.setLineWidth(0.35);
    doc.line(leftSigX, cursorY, leftSigX + sigWidth, cursorY);
    doc.line(rightSigX, cursorY, rightSigX + sigWidth, cursorY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate700);
    doc.text(safeIssuer, leftSigX + sigWidth / 2, cursorY + 4.5, {
      align: "center",
    });
    doc.setFontSize(7.2);
    doc.setTextColor(...COLORS.slate500);
    doc.text(
      "Assinatura / Carimbo do Profissional",
      leftSigX + sigWidth / 2,
      cursorY + 8.5,
      { align: "center" },
    );

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.slate700);
    doc.text(resolvedUnit, rightSigX + sigWidth / 2, cursorY + 4.5, {
      align: "center",
    });
    doc.setFontSize(7.2);
    doc.setTextColor(...COLORS.slate500);
    doc.text(
      "Conferência da Unidade / Recepção",
      rightSigX + sigWidth / 2,
      cursorY + 8.5,
      { align: "center" },
    );
  }

  // ===== CABEÇALHO DE CONTINUAÇÃO E RODAPÉ EM TODAS AS PÁGINAS =====
  const totalPages = doc.getNumberOfPages();

  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page);

    if (page > 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.brand);
      doc.text("Rastreia+", marginX, 13.5);
      const contBrandWidth = doc.getTextWidth("Rastreia+");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...COLORS.slate500);
      doc.text(
        "•  Relatório de Agendamentos Clínicos (continuação)",
        marginX + contBrandWidth + 2.5,
        13.5,
      );

      doc.text(emissionFull, pageWidth - marginX, 13.5, { align: "right" });

      doc.setDrawColor(...COLORS.border);
      doc.setLineWidth(0.3);
      doc.line(marginX, 16.5, pageWidth - marginX, 16.5);
    }

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(marginX, pageHeight - 13, pageWidth - marginX, pageHeight - 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...COLORS.slate500);
    doc.text(
      "Sistema Rastreia+  •  Atenção Primária à Saúde (e-SUS APS)",
      marginX,
      pageHeight - 8.2,
    );
    doc.text(
      `Página ${page} de ${totalPages}`,
      pageWidth - marginX,
      pageHeight - 8.2,
      { align: "right" },
    );
  }

  return {
    doc,
    filename: buildExportFileName(options, generatedAt),
    pages: totalPages,
  };
}

export async function downloadAppointmentsPdf(
  params: ExportAppointmentsPdfParams,
): Promise<ExportAppointmentsPdfResult> {
  const { doc, filename, pages } = await buildAppointmentsPdfDocument(params);

  doc.save(filename);

  return {
    filename,
    count: params.rows.length,
    pages,
  };
}
