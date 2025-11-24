// frontend/components/pacientes/sections/Step5Plano.tsx
"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useFormContext } from "react-hook-form";

import { RHFDate } from "@/components/form/RHFDate";
import { RHFInput } from "@/components/form/RHFInput";
import { RHFSelect } from "@/components/form/RHFSelect";
import { notifySuccess } from "@/components/ui/notify";
import { listInstitutions } from "@/lib/api/locations";

/** Util: abrevia "João Silva Santos" -> "João S." */
function shortName(full?: string) {
  if (!full) return "-";
  const parts = full.trim().split(/\s+/);

  if (parts.length === 1) return parts[0];
  const lastInitial = parts[parts.length - 1]?.[0];

  return `${parts[0]}${lastInitial ? ` ${lastInitial}.` : ""}`;
}

/** atalhos de data relativos ao “hoje” */
function addDays(d: Date, days: number) {
  const nd = new Date(d);

  nd.setDate(nd.getDate() + days);
  nd.setHours(0, 0, 0, 0);

  return nd;
}

const TIPO_LABEL_MAP: Record<string, string> = {
  consulta: "consulta",
  retorno: "retorno",
  avaliacao: "avaliação",
  outro: "atendimento",
};

export default function Step5Plano() {
  const { getValues, getFieldState, setValue, watch } = useFormContext();

  /* ========= DADOS PARA RESUMO AUTOMÁTICO ========= */
  const nome = watch("socio.nome");
  const has = watch("condicoes.has");
  const dm = watch("condicoes.dm");
  const classPA = watch("clinica.has.classificacao_pa");
  const hba1c = watch("clinica.dm.hba1c");

  /* ========= DADOS ESPECÍFICOS DO AGENDAMENTO ========= */
  const tipoConsulta = watch("plano.tipo_consulta");
  const dataConsulta = watch("plano.data_consulta") as Date | null | undefined;
  const dataRetorno = watch("plano.data_retorno") as Date | null | undefined;

  const condicoesTxt = useMemo(() => {
    const arr: string[] = [];

    if (has) arr.push("HAS");
    if (dm) arr.push("DM");

    return arr.length ? arr.join(" e ") : "-";
  }, [has, dm]);

  const resumoHAS = useMemo(() => {
    if (!has || !classPA) return null;
    const map: Record<string, string> = {
      normal: "PA normal",
      pre_hipertenso: "PA pré-hipertensa",
      estagio1: "HAS estágio 1",
      estagio2: "HAS estágio 2",
      estagio3: "HAS estágio 3",
    };

    return map[classPA] ?? `classificação PA: ${classPA}`;
  }, [has, classPA]);

  const resumoDM = useMemo(() => {
    if (!dm) return null;

    return typeof hba1c !== "undefined" && hba1c !== null
      ? `HbA1c ${String(hba1c)}%`
      : null;
  }, [dm, hba1c]);

  const { data: institutionOptions, isLoading: institutionsLoading } = useQuery(
    {
      queryKey: ["locations", "institutions"],
      queryFn: async () => {
        const items = await listInstitutions();

        return items.map((inst) => ({
          key: String(inst.id),
          label: inst.name,
        }));
      },
    },
  );

  // Compose automático (valor “sugerido”)
  const resumoAuto = useMemo(() => {
    const nomeTxt = shortName(nome);

    return [
      `Paciente: ${nomeTxt}`,
      `Condições: ${condicoesTxt}`,
      resumoHAS ?? undefined,
      resumoDM ?? undefined,
    ]
      .filter(Boolean)
      .join(" · ");
  }, [nome, condicoesTxt, resumoHAS, resumoDM]);

  // Evita sobrescrever se o usuário já editou
  const lastAutoRef = useRef<string>("");

  useEffect(() => {
    const state = getFieldState("plano.resumo");
    const current = getValues("plano.resumo") as string | undefined;

    const userEditou = state.isDirty && current !== lastAutoRef.current;

    // Só escreve quando o usuário ainda não personalizou
    if (!userEditou) {
      setValue("plano.resumo", resumoAuto, { shouldDirty: false });
      lastAutoRef.current = resumoAuto;
    }
  }, [resumoAuto, getValues, getFieldState, setValue]);

  const salvarRascunho = useCallback(() => {
    try {
      const data = getValues();

      localStorage.setItem("rastreia:paciente:draft", JSON.stringify(data));
      notifySuccess("Rascunho salvo no navegador.");
    } catch {
      // falha silenciosa: não trava o usuário se o localStorage falhar
    }
  }, [getValues]);

  // Ouve o evento global disparado pelo layout (botão de salvar rascunho no header)
  useEffect(() => {
    const handler = () => salvarRascunho();

    if (typeof window !== "undefined") {
      window.addEventListener("paciente:salvar-rascunho", handler);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("paciente:salvar-rascunho", handler);
      }
    };
  }, [salvarRascunho]);

  /** Atalhos de datas (define um dos campos de data conforme botão) */
  const quickSetDate = useCallback(
    (target: "plano.data_consulta" | "plano.data_retorno", days: number) => {
      const base = new Date();

      base.setHours(0, 0, 0, 0);
      setValue(target, addDays(base, days), { shouldDirty: true });
    },
    [setValue],
  );

  const resumoAgendamento = useMemo(() => {
    const hasConsulta = !!dataConsulta;
    const hasRetorno = !!dataRetorno;

    // tipo bruto vindo do form (consulta | retorno | avaliacao | outro)
    const tipo = (tipoConsulta as string | undefined) ?? "consulta";
    const tipoLabel = TIPO_LABEL_MAP[tipo] ?? "consulta";

    if (hasConsulta && hasRetorno) {
      return `Será criada uma ${tipoLabel} na data indicada em “Agendar consulta” e um segundo agendamento de retorno na data escolhida em “Agendar retorno”.`;
    }

    if (hasConsulta && !hasRetorno) {
      return `Será criada apenas uma ${tipoLabel} na data indicada em “Agendar consulta”.`;
    }

    if (!hasConsulta && hasRetorno) {
      if (tipo === "retorno") {
        return "Será criado um único agendamento de retorno na data informada em “Agendar retorno”.";
      }

      return `Sem data de consulta: será criado um único agendamento do tipo ${tipoLabel} usando a data informada em “Agendar retorno”.`;
    }

    // Nenhuma data
    return "Preencha ao menos a data de consulta ou de retorno para gerar agendamento.";
  }, [dataConsulta, dataRetorno, tipoConsulta]);

  return (
    <div className="space-y-6">
      <Card
        className="border-none bg-gray-50 dark:bg-gray-900 rounded-sm py-5 px-2"
        shadow="none"
      >
        <CardBody className="space-y-8">
          <h2 className="text-xl font-semibold">5. Plano & Agendamentos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo (auto) */}
            <section className="rounded-2xl border border-default-200 p-4">
              <h3 className="text-sm font-medium text-foreground/80 mb-4">
                Resumo (automático)
              </h3>

              <RHFInput
                label=""
                labelPlacement="outside"
                name="plano.resumo"
                placeholder="Resumo do plano (edite, se necessário)"
              />

              <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-4 text-sm">
                <div className="space-y-1">
                  <p className="text-foreground-500">Paciente</p>
                  <p className="font-medium">{shortName(nome)}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground-500">Condições</p>
                  <p className="font-medium">{condicoesTxt}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground-500">HAS</p>
                  <p className="font-medium">{resumoHAS ?? "-"}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-foreground-500">DM</p>
                  <p className="font-medium">{resumoDM ?? "-"}</p>
                </div>
              </div>
            </section>

            {/* Agendar */}
            <section className="rounded-2xl border border-default-200 p-4">
              <h3 className="text-sm font-medium text-foreground/80 mb-1">
                Agendar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <RHFSelect
                  className="md:col-span-4"
                  label="Tipo"
                  labelPlacement="outside"
                  name="plano.tipo_consulta"
                  options={[
                    { key: "consulta", label: "Consulta" },
                    { key: "retorno", label: "Retorno" },
                    { key: "avaliacao", label: "Avaliação" },
                    { key: "outro", label: "Outro" },
                  ]}
                  placeholder="Selecione…"
                />

                <RHFInput
                  className="md:col-span-4"
                  inputMode="numeric"
                  label="Horário"
                  labelPlacement="outside"
                  name="plano.hora_consulta"
                  placeholder="08:00"
                />

                <RHFSelect
                  className="md:col-span-4"
                  label="Local"
                  labelPlacement="outside"
                  name="plano.local_id"
                  options={institutionOptions ?? []}
                  placeholder={
                    institutionsLoading
                      ? "Carregando unidades..."
                      : "Selecione a unidade"
                  }
                />

                <div className="md:col-span-4">
                  <RHFDate
                    label="Agendar consulta"
                    labelPlacement="outside"
                    name="plano.data_consulta"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => quickSetDate("plano.data_consulta", 0)}
                    >
                      hoje
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => quickSetDate("plano.data_consulta", 15)}
                    >
                      +15d
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => quickSetDate("plano.data_consulta", 30)}
                    >
                      +30d
                    </Button>
                  </div>
                </div>

                <div className="md:col-span-4">
                  <RHFDate
                    label="Agendar retorno"
                    labelPlacement="outside"
                    name="plano.data_retorno"
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => quickSetDate("plano.data_retorno", 30)}
                    >
                      +30d
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => quickSetDate("plano.data_retorno", 60)}
                    >
                      +60d
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => quickSetDate("plano.data_retorno", 90)}
                    >
                      +90d
                    </Button>
                  </div>
                </div>

                <RHFInput
                  className="md:col-span-12"
                  label="Assinatura"
                  labelPlacement="outside"
                  name="plano.assinatura"
                  placeholder="Assinatura simples (opcional)"
                />
              </div>

              {/* Resumo textual do que será agendado, baseado nas datas preenchidas */}
              <p className="mt-4 text-xs text-foreground/60">
                {resumoAgendamento}
              </p>
            </section>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button variant="flat" onPress={salvarRascunho}>
              Salvar rascunho
            </Button>
            {/* O botão principal de submit fica no footer do Wizard */}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
