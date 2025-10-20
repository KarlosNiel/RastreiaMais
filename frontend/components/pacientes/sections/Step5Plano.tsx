// frontend/components/pacientes/sections/Step5Plano.tsx
"use client";

import { Button, Card, CardBody } from "@heroui/react";
import { useCallback, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";

import { RHFDate } from "@/components/form/RHFDate";
import { RHFInput } from "@/components/form/RHFInput";
import { RHFSelect } from "@/components/form/RHFSelect";

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

export default function Step5Plano() {
  const { getValues, watch, setValue } = useFormContext();

  // Observa campos necessários para o resumo
  const nome = watch("socio.nome");
  const has = watch("condicoes.has");
  const dm = watch("condicoes.dm");
  const classPA = watch("clinica.has.classificacao_pa");
  const hba1c = watch("clinica.dm.hba1c");

  const condicoesTxt = useMemo(() => {
    const arr: string[] = [];
    if (has) arr.push("HAS");
    if (dm) arr.push("DM");
    return arr.length ? arr.join(" e ") : "-";
  }, [has, dm]);

  const resumoHAS = useMemo(() => {
    if (!has) return null;
    if (!classPA) return null;
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

  /** Compose de resumo automático → persiste em plano.resumo sem obrigar edição */
  useEffect(() => {
    const nomeTxt = shortName(nome);
    const partes = [
      `Paciente: ${nomeTxt}`,
      `Condições: ${condicoesTxt}`,
      resumoHAS ?? undefined,
      resumoDM ?? undefined,
    ].filter(Boolean);
    const resumo = partes.join(" · ");
    setValue("plano.resumo", resumo, { shouldDirty: true });
  }, [nome, condicoesTxt, resumoHAS, resumoDM, setValue]);

  const salvarRascunho = useCallback(() => {
    try {
      const data = getValues();
      localStorage.setItem("rastreia:paciente:draft", JSON.stringify(data));
    } catch (e) {
      console.error("Falha ao salvar rascunho", e);
    }
  }, [getValues]);

  /** Atalhos de datas (define um dos campos de data conforme botão) */
  const quickSetDate = useCallback(
    (target: "plano.data_consulta" | "plano.data_retorno", days: number) => {
      const base = new Date();
      base.setHours(0, 0, 0, 0);
      setValue(target, addDays(base, days), { shouldDirty: true });
    },
    [setValue]
  );

  return (
    <div className="space-y-6">
      <Card shadow="none" className="border border-default-200">
        <CardBody className="space-y-8">
          <h2 className="text-xl font-semibold">5. Plano & Agendamentos</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resumo (auto) */}
            <section className="rounded-2xl border border-default-200 p-4">
              <h3 className="text-sm font-medium text-foreground/80 mb-4">
                Resumo (automático)
              </h3>

              <RHFInput
                name="plano.resumo"
                label=""
                placeholder="Resumo do plano (edite, se necessário)"
                labelPlacement="outside"
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
              <h3 className="text-sm font-medium text-foreground/80 mb-4">
                Agendar
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <RHFSelect
                  className="md:col-span-4"
                  name="plano.tipo_consulta"
                  label="Tipo"
                  labelPlacement="outside"
                  placeholder="Selecione…"
                  options={[
                    { key: "consulta", label: "Consulta" },
                    { key: "retorno", label: "Retorno" },
                    { key: "avaliacao", label: "Avaliação" },
                    { key: "outro", label: "Outro" },
                  ]}
                />

                <div className="md:col-span-4">
                  <RHFDate
                    name="plano.data_consulta"
                    label="Agendar consulta"
                    labelPlacement="outside"
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
                    name="plano.data_retorno"
                    label="Agendar retorno"
                    labelPlacement="outside"
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
                  name="plano.assinatura"
                  label="Assinatura"
                  labelPlacement="outside"
                  placeholder="Assinatura simples (opcional)"
                />
              </div>
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
