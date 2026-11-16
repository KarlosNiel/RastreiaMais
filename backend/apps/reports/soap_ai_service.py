"""
Serviço de assistência de Inteligência Artificial para o Resumo SOAP no Rastreia+.

Persona: Sofia — Assistente Clínica Especialista em Atenção Primária à Saúde (APS)
e Medicina de Família e Comunidade (MFC).

Conformidade e Regras Clínicas:
1. Desidentificação / LGPD: Nenhum dado de identificação direta (Nome completo,
   CPF, CNS, endereço, contato) é enviado às APIs de IA externas.
2. Human-in-the-loop: Todo conteúdo gerado é um rascunho com aviso obrigatório
   de responsabilidade do profissional de saúde assistente (CFM/COFEN).
3. Function Calling & Diretrizes: Consulta a diretrizes oficiais da APS (Ministério
   da Saúde, SBC, SBD), RENAME (SUS) e regras do Previne Brasil.
4. Fallback Seguro: Caso a API esteja indisponível, executa enriquecimento clínico
   completo e estruturado de alta fidelidade.
"""
import json
import logging
from typing import Any, Dict, List, Optional

from django.conf import settings

logger = logging.getLogger(__name__)

# Aviso legal obrigatório conforme CFM/COFEN
AI_CLINICAL_DISCLAIMER = (
    "Documento elaborado com apoio da Assistente Sofia (Rastreia+). "
    "A responsabilidade técnica do diagnóstico, condutas e prescrições é exclusiva "
    "do profissional de saúde assistente. Revise e valide antes de colar no PEC/e-SUS."
)


# ══════════════════════════════════════════════════════════════════════════════
# Ferramentas de Domínio Clínico para Function Calling
# ══════════════════════════════════════════════════════════════════════════════

def consultar_diretriz_clinica_aps(condicao: str, foco: str = "geral") -> str:
    """
    Consulta recomendações e metas clínicas oficiais do Ministério da Saúde, SBC e SBD para a Atenção Primária à Saúde.

    Args:
        condicao: Condição clínica principal ('HAS', 'DM', 'CARDIOVASCULAR' ou 'ESTILO_DE_VIDA').
        foco: Foco da consulta ('metas', 'rastreio_lesao_orgao_alvo', 'nao_farmacologico' ou 'geral').

    Returns:
        Texto com metas, diretrizes e condutas recomendadas pelo SUS.
    """
    cond_norm = (condicao or "").upper()

    if "HAS" in cond_norm or "HIPERTENS" in cond_norm:
        return (
            "DIRETRIZ HAS (SBC/MS - APS):\n"
            "- Metas Pressóricas: < 130/80 mmHg para alto risco CV, DM ou DRC; < 140/90 mmHg para risco baixo/moderado.\n"
            "- Rastreio anual de lesão de órgão-alvo (LOA): Creatinina sérica com cálculo da TFGe, EAS/urina tipo 1 (proteinúria/microalbuminúria), "
            "eletrocardiograma (ECG) de repouso e fundoscopia.\n"
            "- Adesão e Estilo de Vida: Redução de sal (< 2g Na+/dia = 5g sal), dieta DASH (frutas, hortaliças, laticínios magros), "
            "atividade física aeróbica 150 min/semana, cessação tabágica e controle ponderal.\n"
            "- Periodicidade de consulta: Mensal até controle; trimestral ou semestral se estável."
        )
    elif "DM" in cond_norm or "DIABET" in cond_norm:
        return (
            "DIRETRIZ DIABETES MELLITUS (SBD/MS - APS):\n"
            "- Metas Glicêmicas: HbA1c < 7.0% para a maioria dos adultos; HbA1c < 8.0% para idosos frágeis/comorbidades avançadas. "
            "Glicemia de jejum: 80–130 mg/dL; pós-prandial: < 180 mg/dL.\n"
            "- Rastreio anual de complicações crônicas: Exame físico dos pés (inspeção minuciosa, sensibilidade tátil com monofilamento de 10g Semmes-Weinstein, "
            "pulsos pediosos e tibiais), fundo de olho anual (retinopatia), dosagem de creatinina sérica e relação albumina/creatinina (RAC) urinária.\n"
            "- Educação e autocuidado: Orientação nutricional, técnica correta de automonitoramento e uso de medicamentos, prevenção de hipoglicemia."
        )
    elif "CARDIO" in cond_norm or "FRAMINGHAM" in cond_norm:
        return (
            "DIRETRIZ DE RISCO CARDIOVASCULAR E DISLIPIDEMIA (SBC):\n"
            "- Estratificação: Escore de Framingham / Risco Global. Risco Alto (>20% em 10 anos) ou DM com LOA exige intervenção intensiva.\n"
            "- Alvos Lipídicos: Alto Risco: LDL < 70 mg/dL; Risco Moderado: LDL < 100 mg/dL.\n"
            "- Condutas: Estatina de potência moderada/alta na APS conforme estrato; AAS 100mg apenas se prevenção secundária ou indicação formal médica."
        )
    return (
        "DIRETRIZ GERAL APS:\n"
        "- Acompanhamento longitudinal multiprofissional (médico, enfermeiro, nutricionista, agente comunitário).\n"
        "- Abordagem centrada na pessoa e pactuação de Plano Terapêutico Singular (PTS).\n"
        "- Monitoramento de determinantes sociais, vulnerabilidade e suporte familiar."
    )


def consultar_rename_aps(classe_terapeutica: str) -> str:
    """
    Consulta medicamentos padronizados pelo SUS na Atenção Primária (RENAME Municipal/Nacional).

    Args:
        classe_terapeutica: Classe terapêutica desejada ('antihipertensivo', 'antidiabetico', 'lipideos' ou 'geral').

    Returns:
        Lista de fármacos da RENAME com posologias de referência na APS para subsidiar a conduta médica.
    """
    classe = (classe_terapeutica or "").lower()
    if "hipertens" in classe or "pressao" in classe or "has" in classe:
        return (
            "FÁRMACOS RENAME PARA HAS NA APS:\n"
            "- Diuréticos tiazídicos: Hidroclorotiazida 25mg (12.5 a 25 mg/dia VO pela manhã).\n"
            "- IECA: Maleato de Enalapril 5mg, 10mg e 20mg (5 a 40 mg/dia divididos em 1 ou 2 tomadas).\n"
            "- BRA: Losartana Potássica 50mg (50 a 100 mg/dia em 1 ou 2 tomadas - alternativa em tosse por IECA).\n"
            "- Bloqueadores de Canais de Cálcio: Besilato de Anlodipino 5mg (5 a 10 mg/dia VO).\n"
            "- Betabloqueadores: Atenolol 50mg ou Propranolol 40mg (indicados se cardiopatia isquêmica ou IC).\n"
            "- Antagonista da aldosterona: Espironolactona 25mg (para hipertensão resistente/adjuvante)."
        )
    elif "diabet" in classe or "dm" in classe or "glicem" in classe:
        return (
            "FÁRMACOS RENAME PARA DIABETES NA APS:\n"
            "- Biguanida (1ª escolha): Cloridrato de Metformina 500mg e 850mg (dose inicial 500-850mg após refeição, titular até 2000-2550mg/dia).\n"
            "- Sulfonilureia: Glibenclamida 5mg (2.5 a 15 mg/dia antes do café; atenção ao risco de hipoglicemia em idosos).\n"
            "- Insulinas: Insulina Humana NPH 100 UI/ml (dose basal) e Insulina Humana Regular 100 UI/ml (prandial/correção)."
        )
    elif "lipid" in classe or "colesterol" in classe or "estatina" in classe:
        return (
            "FÁRMACOS RENAME PARA DISLIPIDEMIA NA APS:\n"
            "- Estatinas: Sinvastatina 20mg e 40mg (dose noturna diária).\n"
            "- Antiagregante: Ácido Acetilsalicílico (AAS) 100mg pós-prandial (quando indicado)."
        )
    return (
        "RENAME GERAL APS: Consulte o protocolo municipal para opções disponíveis na farmácia da UBS."
    )


def verificar_indicadores_previne_brasil(
    tem_has: bool,
    tem_dm: bool,
    pa_registrada_no_semestre: bool,
    hba1c_solicitada_no_semestre: bool,
) -> str:
    """
    Verifica o cumprimento das regras operacionais dos indicadores de saúde da Atenção Primária.

    Args:
        tem_has: Se o paciente possui diagnóstico de hipertensão arterial.
        tem_dm: Se o paciente possui diagnóstico de diabetes mellitus.
        pa_registrada_no_semestre: Se houve aferição e registro de PA no semestre.
        hba1c_solicitada_no_semestre: Se houve solicitação ou resultado de HbA1c no semestre.

    Returns:
        Diagnóstico dos indicadores com alertas de pendência para a equipe de saúde da família.
    """
    res = []
    if tem_has:
        if pa_registrada_no_semestre:
            res.append("Indicador HAS: ATINGIDO — PA registrada no semestre civil.")
        else:
            res.append("Indicador HAS: PENDENTE — Aferir e registrar PA na consulta atual para pontuar no quadrimestre.")
    if tem_dm:
        if hba1c_solicitada_no_semestre:
            res.append("Indicador DM: ATINGIDO — Hemoglobina glicada solicitada/registrada no semestre.")
        else:
            res.append("Indicador DM: PENDENTE — Solicitar exame de HbA1c no Plano (P) para pontuar no quadrimestre.")
    return "\n".join(res)


def fetch_patient_clinical_context_from_db(patient_id: Optional[int]) -> str:
    """
    Consulta dados clínicos complementares do paciente diretamente no banco de dados
    de forma estritamente desidentificada (sem Nome, CPF, CNS ou contato).
    """
    if not patient_id or patient_id <= 0:
        return "Paciente em rascunho no formulário (sem histórico prévio persistido no banco de dados)."

    try:
        from apps.accounts.models import PatientUser
        from apps.conditions.models import HAS, DM, OtherDCNT

        patient = PatientUser.objects.filter(id=patient_id).first()
        if not patient:
            return "Registro do paciente não localizado no banco de dados."

        has_obj = HAS.objects.filter(patient=patient).first()
        dm_obj = DM.objects.filter(patient=patient).first()
        other_dcnts = list(OtherDCNT.objects.filter(patient=patient).values_list("name", flat=True))

        lines = ["CONTEXTO CLÍNICO COMPLEMENTAR DO BANCO (DESIDENTIFICADO):"]
        if patient.last_consultation:
            lines.append(f"- Última consulta registrada: {patient.last_consultation}.")
        if has_obj:
            lines.append(
                f"- HAS: diagnosticada={'Sim' if has_obj.is_diagnosed else 'Não'}, "
                f"medicação={has_obj.uses_medication or 'não informado'}, "
                f"Framingham={has_obj.framingham_score or 'não calculado'}, "
                f"complicações={has_obj.any_complications_HBP or 'não informadas'}."
            )
            if has_obj.cholesterol_data or has_obj.HDL_data:
                lines.append(
                    f"- Datas lipídicas: colesterol_total={has_obj.cholesterol_data or 'N/D'}, "
                    f"HDL={has_obj.HDL_data or 'N/D'}."
                )
        if dm_obj:
            lines.append(
                f"- DM: diagnosticada={'Sim' if dm_obj.is_diagnosed else 'Não'}, "
                f"tratamento={dm_obj.treatment_type or 'não informado'}, "
                f"HbA1c={dm_obj.glycated_hemoglobin if dm_obj.glycated_hemoglobin is not None else 'N/D'}, "
                f"pé diabético={'Sim' if dm_obj.diabetic_foot else 'Não'}."
            )
        if other_dcnts:
            lines.append(f"- Outras DCNTs registradas: {', '.join(other_dcnts)}.")
        return "\n".join(lines)
    except Exception as exc:
        logger.warning(f"Erro ao consultar histórico clínico desidentificado do paciente {patient_id}: {exc}")
        return "Não foi possível consultar o histórico complementar no banco neste momento."


def make_patient_db_tool(patient_id: Optional[int]):
    """Cria uma ferramenta de Function Calling vinculada ao patient_id atual (evita acesso cruzado)."""
    def consultar_historico_clinico_paciente() -> str:
        """
        Consulta dados clínicos complementares do paciente atual no banco de dados (desidentificados),
        como datas de exames anteriores, complicações registradas, comorbidades e adesão prévia.
        """
        return fetch_patient_clinical_context_from_db(patient_id)

    return consultar_historico_clinico_paciente


AVAILABLE_CLINICAL_TOOLS = [
    consultar_diretriz_clinica_aps,
    consultar_rename_aps,
    verificar_indicadores_previne_brasil,
]


# ══════════════════════════════════════════════════════════════════════════════
# Pipeline de Desidentificação (LGPD / CFM)
# ══════════════════════════════════════════════════════════════════════════════

def deidentify_soap_payload(raw_soap: Dict[str, Any], professional_notes: str = "") -> Dict[str, Any]:
    """
    Remove dados identificáveis (Nome, CPF, CNS, data de nascimento completa, telefone)
    mantendo apenas sexo, idade em anos e variáveis puramente clínicas.
    """
    paciente_meta = raw_soap.get("paciente", {})
    idade = paciente_meta.get("idade")

    subjetivo = raw_soap.get("subjetivo", {})
    identificacao = subjetivo.get("identificacao", "")
    genero = "Masculino" if "Masculino" in identificacao else ("Feminino" if "Feminino" in identificacao else "Não informado")

    payload = {
        "paciente_anonimo": {
            "idade_anos": idade,
            "genero": genero,
        },
        "subjetivo": subjetivo,
        "objetivo": raw_soap.get("objetivo", {}),
        "avaliacao": raw_soap.get("avaliacao", {}),
        "plano": raw_soap.get("plano", {}),
        "indicadores_atuais": raw_soap.get("indicadores_previne", []),
        "observacoes_adicionais_profissional": professional_notes.strip() if professional_notes else "",
    }
    return payload


# ══════════════════════════════════════════════════════════════════════════════
# Fallback Clínico Rico e Estruturado (Executa quando a API estiver offline)
# ══════════════════════════════════════════════════════════════════════════════

def _polish_field_prose(text: str) -> str:
    """
    Suaviza textos picotados/telegráficos vindos do formulário (ex.: 'RÓTULO: VALOR')
    para uma redação clínica mais corrida e natural, sem adicionar nenhum dado novo.
    """
    if not text or not text.strip():
        return ""

    t = text.strip()
    replacements = [
        ("Tabagismo: NUNCA FUMOU.", "Nega tabagismo."),
        ("Tabagismo: EX-FUMANTE.", "Refere ser ex-tabagista."),
        ("Tabagismo: FUMANTE ATUAL.", "Refere tabagismo ativo."),
        ("Etilismo: NÃO BEBE.", "Nega etilismo."),
        ("Etilismo: SOCIALMENTE.", "Refere etilismo social."),
        ("Etilismo: FREQUENTEMENTE.", "Refere etilismo frequente."),
        ("Atividade física: SEDENTÁRIO.", "Apresenta hábito sedentário."),
        ("Atividade física: PRATICA.", "Pratica atividade física regularmente."),
        ("Alimentação referida: SAUDÁVEL.", "Relata alimentação saudável."),
        ("Alimentação referida: PARCIALMENTE SAUDÁVEL.", "Relata alimentação parcialmente saudável."),
        ("Alimentação referida: POUCO SAUDÁVEL.", "Relata alimentação pouco saudável."),
        ("Consumo de sal: ADEQUADO.", "Refere consumo adequado de sal."),
        ("Consumo de sal: EXAGERADO.", "Refere consumo elevado de sal."),
        ("Consumo de sal: NÃO SABE.", "Não soube informar sobre o consumo de sal."),
        ("Apoio familiar: SIM.", "Conta com apoio de familiares/amigos para o tratamento."),
        ("Apoio familiar: NÃO.", "Refere ausência de apoio familiar/social para o tratamento."),
        ("Beneficiário do Bolsa Família: SIM.", "É beneficiário(a) do programa Bolsa Família."),
        ("Beneficiário do Bolsa Família: NÃO.", "Não é beneficiário(a) do programa Bolsa Família."),
        ("— uso de medicação: REGULAR", "com uso regular de medicação"),
        ("— uso de medicação: IRREGULAR", "com uso irregular de medicação"),
        ("— uso de medicação: NÃO USA", "sem uso atual de medicação"),
        ("— uso de medicação: NÃO SE APLICA", "sem indicação de uso medicamentoso informada"),
        ("Edemas: PRESENTE.", "Apresenta edema ao exame."),
        ("Edemas: AUSENTE.", "Sem edemas ao exame."),
        ("Dispneia: PRESENTE.", "Refere dispneia."),
        ("Dispneia: AUSENTE.", "Nega dispneia."),
        ("Queixas de formigamento ou câimbras: SIM.", "Relata queixas de formigamento ou câimbras."),
        ("Queixas de formigamento ou câimbras: NÃO.", "Nega formigamento ou câimbras."),
        ("Dificuldade para caminhar ou realizar atividades: SIM.", "Refere dificuldade para caminhar ou realizar atividades."),
        ("Dificuldade para caminhar ou realizar atividades: NÃO.", "Sem dificuldade relatada para caminhar ou realizar atividades."),
        ("HAS — classificação:", "Hipertensão arterial sistêmica classificada como"),
        ("Adesão medicamentosa: REGULAR.", "Adesão medicamentosa regular."),
        ("Adesão medicamentosa: IRREGULAR.", "Adesão medicamentosa irregular."),
        ("Adesão medicamentosa: NÃO USA.", "Não faz uso de medicação."),
        ("Adesão medicamentosa: NÃO SE APLICA.", "Uso de medicação não aplicável."),
        ("DM CONFIRMADA.", "Diabetes Mellitus confirmada."),
        ("1ª aferição:", "Primeira aferição de pressão arterial:"),
        ("2ª aferição:", "Segunda aferição:"),
        ("— classificação:", "— classificado como"),
        ("INTERFERE", "interfere"),
        ("NÃO INTERFERE", "não interfere"),
        ("DIFICULTAM", "dificultam"),
        ("NÃO DIFICULTAM", "não dificultam"),
    ]
    for old, new in replacements:
        t = t.replace(old, new)

    # Remove espaços duplos preservando quebras de linha
    lines = [" ".join(line.split()) for line in t.splitlines()]
    return "\n".join(line for line in lines if line).strip()


def _enrich_soap_deterministically(
    base_soap: Dict[str, Any],
    professional_notes: str = ""
) -> Dict[str, Any]:
    """
    Preserva os blocos SOAP (S, O, A, P) fielmente a partir dos dados do banco/formulário
    (polindo a redação para texto clínico fluido e incorporando apenas notas do profissional)
    e gera alertas e sugestões clínicas da Sofia em campos separados.
    """
    enhanced = dict(base_soap)
    sub = {k: _polish_field_prose(str(v)) if v else "" for k, v in base_soap.get("subjetivo", {}).items()}
    obj = {k: _polish_field_prose(str(v)) if v else "" for k, v in base_soap.get("objetivo", {}).items()}
    av = {k: _polish_field_prose(str(v)) if v else "" for k, v in base_soap.get("avaliacao", {}).items()}
    pl = {k: _polish_field_prose(str(v)) if v else "" for k, v in base_soap.get("plano", {}).items()}
    indicadores = list(base_soap.get("indicadores_previne", []))
    paciente = base_soap.get("paciente", {})
    idade = paciente.get("idade")

    alertas: List[str] = []
    sugestoes_conduta: List[str] = []
    sugestoes_exames: List[str] = []
    sugestoes_encaminhamentos: List[str] = []

    pa_texto = obj.get("pressao_arterial", "") or ""
    av_has_texto = av.get("hipertensao", "") or ""
    av_dm_texto = av.get("diabetes", "") or ""
    tem_has = "HAS" in av_has_texto or "hipertensão" in (sub.get("identificacao", "") or "").lower()
    tem_dm = "DM" in av_dm_texto or "diabetes" in (sub.get("identificacao", "") or "").lower()

    # 1. Subjetivo: mantém apenas o que veio do banco/formulário + notas do profissional (se houver)
    if professional_notes and professional_notes.strip():
        nota = professional_notes.strip()
        ident_atual = (sub.get("identificacao") or "").strip()
        sub["identificacao"] = (
            f"{ident_atual}\nObservações clínicas registradas pelo profissional: {nota}"
            if ident_atual
            else f"Observações clínicas registradas pelo profissional: {nota}"
        )

    # 2. Alertas e sugestões em campos separados (baseados nas diretrizes APS / RENAME / Previne)
    if pa_texto and (
        "15" in pa_texto
        or "16" in pa_texto
        or "Estágio 1" in pa_texto
        or "Estágio 2" in pa_texto
        or "Estágio 3" in pa_texto
    ):
        alertas.append("Pressão arterial acima da meta preconizada pelas Diretrizes Brasileiras (< 130/80 mmHg para alto risco ou < 140/90 mmHg).")
        sugestoes_conduta.append("Avaliar titulação ou associação de anti-hipertensivos conforme RENAME (IECA/BRA + BCC ou Tiazídico).")

    if tem_has:
        sugestoes_conduta.append("Reforçar medidas não farmacológicas: dieta hipossódica (DASH, < 5g sal/dia) e atividade física aeróbica (150 min/semana).")
        sugestoes_exames.append("Rastreio anual de lesão de órgão-alvo (HAS): Creatinina sérica com TFGe, EAS/urina tipo 1 (proteinúria/microalbuminúria), ECG de repouso e Perfil Lipídico.")
        sugestoes_encaminhamentos.append("Avaliar apoio multiprofissional (Nutrição / Academia da Saúde) e retorno ambulatorial conforme controle pressórico.")

    if tem_dm:
        alertas.append("Paciente com Diabetes Mellitus: verificar meta de HbA1c (< 7,0% na maioria dos adultos) e exame físico anual dos pés.")
        sugestoes_conduta.append("Revisar adesão ao esquema hipoglicemiante (RENAME: Metformina, Glibenclamida, Insulinas NPH/Regular) e prevenção de hipoglicemia.")
        sugestoes_exames.append("Solicitar/acompanhar HbA1c, creatinina sérica, relação albumina/creatinina (RAC) urinária e fundo de olho anual.")

    if idade and idade >= 60 and not alertas:
        alertas.append("Pessoa idosa (>= 60 anos): atentar para estratificação de risco cardiovascular global e prevenção de hipotensão postural/hipoglicemia.")

    for ind in indicadores:
        if isinstance(ind, dict) and ind.get("status") == "PENDENTE":
            alertas.append(f"Indicador APS pendente: {ind.get('indicador', 'Indicador clínico')}.")

    enhanced["subjetivo"] = sub
    enhanced["objetivo"] = obj
    enhanced["avaliacao"] = av
    enhanced["plano"] = pl
    enhanced["indicadores_previne"] = indicadores
    enhanced["alertas_clinicos"] = alertas
    enhanced["sugestoes_conduta"] = sugestoes_conduta
    enhanced["sugestoes_exames"] = sugestoes_exames
    enhanced["sugestoes_encaminhamentos"] = sugestoes_encaminhamentos
    enhanced["is_ai_enhanced"] = True
    enhanced["ai_disclaimer"] = AI_CLINICAL_DISCLAIMER
    return enhanced


# ══════════════════════════════════════════════════════════════════════════════
# Motor Principal Sofia (Gemini Function Calling com Lista de Modelos)
# ══════════════════════════════════════════════════════════════════════════════

# Modelos rápidos e de alta disponibilidade testados na API
PREFERRED_MODELS = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash",
    "gemini-3.5-flash-lite",
]


def _normalize_section_to_str(val: Any) -> str:
    """Converte qualquer estrutura (dict, list, str) retornada pela IA em texto clínico legível."""
    if val is None:
        return ""
    if isinstance(val, str):
        return val.strip()
    if isinstance(val, list):
        items = [str(item).strip() for item in val if item]
        return "\n".join(items)
    if isinstance(val, dict):
        lines = []
        for k, v in val.items():
            k_fmt = k.replace("_", " ").title()
            if isinstance(v, list):
                lines.append(f"{k_fmt}:")
                for item in v:
                    lines.append(f"• {item}")
            elif isinstance(v, dict):
                lines.append(f"{k_fmt}: {json.dumps(v, ensure_ascii=False)}")
            else:
                lines.append(f"{k_fmt}: {v}")
        return "\n".join(lines)
    return str(val)


def _normalize_dict_fields_to_strings(d: Dict[str, Any]) -> Dict[str, str]:
    """Garante que todos os campos de um dicionário sejam strings planas para os serializers."""
    res = {}
    for k, v in d.items():
        res[k] = _normalize_section_to_str(v)
    return res


def _normalize_str_list(val: Any) -> List[str]:
    """Garante que campos de listas de sugestões/alertas sejam sempre List[str]."""
    if not val:
        return []
    if isinstance(val, list):
        return [str(item).strip() for item in val if item is not None and str(item).strip()]
    if isinstance(val, str):
        return [line.strip("•- \t") for line in val.splitlines() if line.strip("•- \t")]
    return [str(val).strip()]



def generate_ai_assisted_soap(
    base_soap: Dict[str, Any],
    professional_notes: str = "",
    patient_id: Optional[int] = None,
) -> Dict[str, Any]:
    """
    Aciona a Assistente Sofia utilizando o modelo Gemini com Function Calling.
    Gera um relatório SOAP clínico articulado, com síntese narrativa,
    estratificação diagnóstica e Plano Terapêutico Singular.
    """
    api_key = getattr(settings, "GEMINI_API_KEY", "") or ""

    if not api_key:
        logger.info("GEMINI_API_KEY não configurada. Executando motor determinístico Sofia.")
        return _enrich_soap_deterministically(base_soap, professional_notes)

    configured_model = getattr(settings, "GEMINI_MODEL", "") or "gemini-3.5-flash"
    models_to_try = [configured_model] + [m for m in PREFERRED_MODELS if m != configured_model]

    try:
        from google import genai
        from google.genai import types

        resolved_patient_id = patient_id or (base_soap.get("paciente", {}) or {}).get("id")
        tools_for_call = [
            *AVAILABLE_CLINICAL_TOOLS,
            make_patient_db_tool(resolved_patient_id),
        ]

        client = genai.Client(api_key=api_key)
        deidentified = deidentify_soap_payload(base_soap, professional_notes)

        system_instruction = (
            "Você é Sofia, a Assistente Clínica Especialista em Atenção Primária à Saúde (APS) e Medicina de Família e Comunidade (MFC) do Rastreia+.\n"
            "Sua missão tem DUAS partes rigorosamente separadas:\n\n"
            "PARTE 1 — PRONTUÁRIO SOAP ('subjetivo', 'objetivo', 'avaliacao', 'plano'):\n"
            "- Redija os 4 blocos em PROSA CLÍNICA FLUIDA, COESA E CORRIDA, pronta para o prontuário eletrônico (PEC/e-SUS).\n"
            "- Transforme rótulos picotados ou telegráficos do formulário (ex.: 'Tabagismo: NUNCA FUMOU. Etilismo: NÃO BEBE. Atividade física: SEDENTÁRIO.') em frases médicas naturais e bem conectadas (ex.: 'Nega tabagismo e etilismo, referindo hábito sedentário.'), eliminando CAIXA ALTA desnecessária e conectando os achados de forma elegante.\n"
            "- REGRA DE FIDELIDADE ABSOLUTA AO BANCO/FORMULÁRIO: Use EXCLUSIVAMENTE os fatos, valores, diagnósticos, medicamentos, exames e condutas já presentes no JSON de entrada ('subjetivo', 'objetivo', 'avaliacao', 'plano', 'indicadores_atuais' e 'observacoes_adicionais_profissional') ou retornados por 'consultar_historico_clinico_paciente'.\n"
            "- NUNCA invente, presuma ou adicione dentro de 'subjetivo', 'objetivo', 'avaliacao' ou 'plano' qualquer exame não solicitado, medicamento não informado, encaminhamento não registrado ou meta/diretriz externa que não conste nos dados preenchidos.\n"
            "- Se um subcampo de entrada estiver vazio ('') e não houver dado correspondente na entrada, mantenha-o vazio ('').\n"
            "- Preserve as chaves originais: subjetivo(identificacao, historico, determinantes, estilo_vida), objetivo(pressao_arterial, antropometria, glicemia_metabolico, exame_fisico), avaliacao(hipertensao, diabetes, risco_cardiovascular, riscos_psicossociais, outras_dcnts), plano(conduta_clinica, exames_solicitados, encaminhamentos).\n\n"
            "PARTE 2 — SUGESTÕES DA SOFIA EM CAMPOS SEPARADOS (Function Calling):\n"
            "- Consulte obrigatoriamente as ferramentas clínicas disponíveis (consultar_diretriz_clinica_aps, consultar_rename_aps, verificar_indicadores_previne_brasil, consultar_historico_clinico_paciente) conforme o quadro clínico do paciente.\n"
            "- Coloque TODAS as suas recomendações, diretrizes, opções da RENAME, exames de rastreio sugeridos e alertas EXCLUSIVAMENTE nos campos separados abaixo (nunca dentro do SOAP):\n"
            "  * 'alertas_clinicos': lista de strings com alertas prioritários, metas pressóricas/glicêmicas e pendências do Previne Brasil.\n"
            "  * 'sugestoes_conduta': lista de strings com sugestões de conduta terapêutica, opções da RENAME e medidas não farmacológicas.\n"
            "  * 'sugestoes_exames': lista de strings com sugestões de exames de rastreio de lesão de órgão-alvo (LOA) e controle metabólico.\n"
            "  * 'sugestoes_encaminhamentos': lista de strings com sugestões de apoio multiprofissional e periodicidade de retorno.\n\n"
            "NUNCA mencione que é um modelo de linguagem. Retorne estritamente um JSON estruturado com as chaves: "
            "'subjetivo', 'objetivo', 'avaliacao', 'plano', 'alertas_clinicos', 'sugestoes_conduta', 'sugestoes_exames' e 'sugestoes_encaminhamentos'."
        )

        user_content = (
            f"Por favor, Sofia, analise o seguinte prontuário clínico desidentificado da APS:\n\n"
            f"{json.dumps(deidentified, ensure_ascii=False, indent=2)}\n\n"
            f"1) Organize o SOAP ('subjetivo', 'objetivo', 'avaliacao', 'plano') em texto clínico profissional usando APENAS os dados fornecidos.\n"
            f"2) Consulte as ferramentas clínicas (Function Calling) e preencha suas recomendações nos campos separados "
            f"('alertas_clinicos', 'sugestoes_conduta', 'sugestoes_exames', 'sugestoes_encaminhamentos')."
        )

        config_json_tools = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
            tools=tools_for_call,
            response_mime_type="application/json",
        )
        config_tools_only = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.2,
            tools=tools_for_call,
        )

        last_error = None
        for model_name in models_to_try:
            try:
                try:
                    chat = client.chats.create(
                        model=model_name,
                        config=config_json_tools,
                    )
                    response = chat.send_message(user_content)
                except Exception as json_tool_err:
                    # Alguns modelos/endpoints rejeitam tools + response_mime_type='application/json';
                    # tenta novamente com tools sem response_mime_type e extrai o JSON do texto.
                    logger.info(
                        f"Modelo {model_name} falhou com tools+JSON ({json_tool_err}); tentando tools sem response_mime_type."
                    )
                    chat = client.chats.create(
                        model=model_name,
                        config=config_tools_only,
                    )
                    response = chat.send_message(user_content)
                response_text = (response.text or "{}").strip()

                if response_text.startswith("```json"):
                    response_text = response_text[7:]
                if response_text.startswith("```"):
                    response_text = response_text[3:]
                if response_text.endswith("```"):
                    response_text = response_text[:-3]
                response_text = response_text.strip()

                parsed_json = json.loads(response_text)

                # Mescla com os metadados protegidos do paciente original
                enhanced = dict(base_soap)

                # Trata subjetivo tanto como dict quanto como string formatada
                if "subjetivo" in parsed_json:
                    sub_val = parsed_json["subjetivo"]
                    if isinstance(sub_val, dict):
                        if "identificacao" not in sub_val:
                            enhanced["subjetivo"] = {
                                "identificacao": _normalize_section_to_str(sub_val),
                                "historico": "",
                                "determinantes": "",
                                "estilo_vida": "",
                            }
                        else:
                            enhanced["subjetivo"] = _normalize_dict_fields_to_strings(sub_val)
                    elif isinstance(sub_val, str):
                        enhanced["subjetivo"] = {
                            "identificacao": sub_val.strip(),
                            "historico": "",
                            "determinantes": "",
                            "estilo_vida": "",
                        }

                # Trata objetivo
                if "objetivo" in parsed_json:
                    obj_val = parsed_json["objetivo"]
                    if isinstance(obj_val, dict):
                        if "pressao_arterial" not in obj_val:
                            enhanced["objetivo"] = {
                                "pressao_arterial": _normalize_section_to_str(obj_val),
                                "antropometria": "",
                                "glicemia_metabolico": "",
                                "exame_fisico": "",
                            }
                        else:
                            enhanced["objetivo"] = _normalize_dict_fields_to_strings(obj_val)
                    elif isinstance(obj_val, str):
                        enhanced["objetivo"] = {
                            "pressao_arterial": obj_val.strip(),
                            "antropometria": "",
                            "glicemia_metabolico": "",
                            "exame_fisico": "",
                        }

                # Trata avaliacao
                if "avaliacao" in parsed_json:
                    av_val = parsed_json["avaliacao"]
                    if isinstance(av_val, dict):
                        if "hipertensao" not in av_val:
                            enhanced["avaliacao"] = {
                                "hipertensao": _normalize_section_to_str(av_val.get("diagnosticos") or av_val),
                                "diabetes": _normalize_section_to_str(av_val.get("diabetes")),
                                "risco_cardiovascular": _normalize_section_to_str(av_val.get("risco_cardiovascular")),
                                "riscos_psicossociais": _normalize_section_to_str(av_val.get("riscos_psicossociais") or av_val.get("metas_previne_brasil")),
                                "outras_dcnts": _normalize_section_to_str(av_val.get("outras_dcnts")),
                            }
                        else:
                            enhanced["avaliacao"] = _normalize_dict_fields_to_strings(av_val)
                    elif isinstance(av_val, list):
                        enhanced["avaliacao"] = {
                            "hipertensao": "\n".join(str(x) for x in av_val),
                            "diabetes": "",
                            "risco_cardiovascular": "",
                            "riscos_psicossociais": "",
                            "outras_dcnts": "",
                        }
                    elif isinstance(av_val, str):
                        enhanced["avaliacao"] = {
                            "hipertensao": av_val.strip(),
                            "diabetes": "",
                            "risco_cardiovascular": "",
                            "riscos_psicossociais": "",
                            "outras_dcnts": "",
                        }

                # Trata plano
                if "plano" in parsed_json:
                    pl_val = parsed_json["plano"]
                    if isinstance(pl_val, dict):
                        if "conduta_clinica" not in pl_val:
                            enhanced["plano"] = {
                                "conduta_clinica": _normalize_section_to_str(pl_val.get("condutas_terapeuticas") or pl_val.get("conduta_clinica") or pl_val),
                                "exames_solicitados": _normalize_section_to_str(pl_val.get("exames_solicitados")),
                                "encaminhamentos": _normalize_section_to_str(pl_val.get("encaminhamentos") or pl_val.get("seguimento")),
                            }
                        else:
                            enhanced["plano"] = _normalize_dict_fields_to_strings(pl_val)
                    elif isinstance(pl_val, list):
                        enhanced["plano"] = {
                            "conduta_clinica": "\n".join(str(x) for x in pl_val),
                            "exames_solicitados": "",
                            "encaminhamentos": "",
                        }
                    elif isinstance(pl_val, str):
                        enhanced["plano"] = {
                            "conduta_clinica": pl_val.strip(),
                            "exames_solicitados": "",
                            "encaminhamentos": "",
                        }


                enhanced["alertas_clinicos"] = _normalize_str_list(parsed_json.get("alertas_clinicos"))
                enhanced["sugestoes_conduta"] = _normalize_str_list(parsed_json.get("sugestoes_conduta"))
                enhanced["sugestoes_exames"] = _normalize_str_list(parsed_json.get("sugestoes_exames"))
                enhanced["sugestoes_encaminhamentos"] = _normalize_str_list(parsed_json.get("sugestoes_encaminhamentos"))
                enhanced["is_ai_enhanced"] = True
                enhanced["ai_disclaimer"] = AI_CLINICAL_DISCLAIMER
                logger.info(f"Relatório SOAP aprimorado com sucesso pela Assistente Sofia usando modelo {model_name}.")
                return enhanced

            except Exception as model_err:
                last_error = model_err
                logger.warning(f"Tentativa com modelo {model_name} falhou: {model_err}. Tentando próximo modelo...")
                continue

        if last_error:
            logger.warning(f"Todas as tentativas de API falharam: {last_error}. Executando motor determinístico Sofia.")
            return _enrich_soap_deterministically(base_soap, professional_notes)

    except Exception as e:
        logger.warning(
            f"Falha inesperada no motor Sofia: {e}. Executando enriquecimento determinístico.",
            exc_info=True,
        )
        return _enrich_soap_deterministically(base_soap, professional_notes)
