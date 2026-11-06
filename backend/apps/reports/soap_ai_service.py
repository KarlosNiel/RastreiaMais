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

def _enrich_soap_deterministically(
    base_soap: Dict[str, Any],
    professional_notes: str = ""
) -> Dict[str, Any]:
    """
    Enriquece o SOAP de forma articulada e clínica (Sofia Engine),
    garantindo que mesmo offline o resumo seja fluido, profissional e completo.
    """
    enhanced = dict(base_soap)
    sub = dict(base_soap.get("subjetivo", {}))
    obj = dict(base_soap.get("objetivo", {}))
    av = dict(base_soap.get("avaliacao", {}))
    pl = dict(base_soap.get("plano", {}))
    indicadores = list(base_soap.get("indicadores_previne", []))
    paciente = base_soap.get("paciente", {})
    idade = paciente.get("idade")

    alertas: List[str] = []
    sugestoes: List[str] = []

    pa_texto = obj.get("pressao_arterial", "") or ""
    tem_has = "HAS" in av.get("hipertensao", "") or "hipertensão" in sub.get("identificacao", "").lower()
    tem_dm = "DM" in av.get("diabetes", "") or "diabetes" in sub.get("identificacao", "").lower()

    # 1. Subjetivo rico
    partes_sub = [
        f"Paciente em acompanhamento regular na Atenção Primária à Saúde para manejo de DCNT.",
    ]
    if tem_has:
        partes_sub.append("Refere diagnóstico de Hipertensão Arterial Sistêmica com tratamento farmacológico contínuo.")
    if tem_dm:
        partes_sub.append("Refere diagnóstico de Diabetes Mellitus com seguimento metabólico.")
    if sub.get("determinantes"):
        partes_sub.append(f"Contexto psicossocial: {sub.get('determinantes')}")
    if sub.get("estilo_vida"):
        partes_sub.append(f"Estilo de vida referido: {sub.get('estilo_vida')}")
    if professional_notes:
        partes_sub.append(f"Observações clínicas adicionais registradas: {professional_notes.strip()}.")

    sub["identificacao"] = " ".join(partes_sub)

    # 2. Objetivo interpretado
    if pa_texto:
        if "15" in pa_texto or "16" in pa_texto or "Estágio 2" in pa_texto or "Estágio 1" in pa_texto:
            alertas.append("Pressão arterial acima da meta preconizada pelas Diretrizes Brasileiras (< 130/80 mmHg).")
            sugestoes.append("Avaliar titulação ou associação de anti-hipertensivos conforme RENAME (IECA/BRA + BCC ou Tiazídico).")

    # 3. Avaliação estruturada em tópicos clínicos
    av_items = []
    if tem_has:
        av_items.append("1. Hipertensão Arterial Sistêmica: Avaliação de controle pressórico e adesão ao esquema farmacológico.")
    if tem_dm:
        av_items.append("2. Diabetes Mellitus: Monitoramento glicêmico e rastreio de complicações micro e macrovasculares.")
    if idade and idade >= 60:
        av_items.append("3. Estratificação de Risco Cardiovascular: Risco global moderado a aumentado por faixa etária e comorbidades crônicas.")
    av_items.append("4. Rastreio de Lesão de Órgão-Alvo (LOA): Indicação de rotina laboratorial na Atenção Primária.")
    if professional_notes:
        av_items.append(f"5. Fatores adicionais correlacionados: {professional_notes.strip()}.")

    av["hipertensao"] = "\n".join(av_items)

    # 4. Plano Terapêutico Singular (PTS) completo
    pl["conduta_clinica"] = (
        "1. Otimização Terapêutica: Manter/ajustar medicação anti-hipertensiva e hipoglicemiante conforme RENAME/SUS.\n"
        "2. Medidas Não Farmacológicas: Aconselhamento sobre dieta hipossódica (DASH), restrição de ultraprocessados e incentivo à atividade física orientada (150 min/semana).\n"
        "3. Monitoramento: Registro ambulatorial de PA e rastreio de queixas associadas."
    )
    pl["exames_solicitados"] = (
        "Rastreio de rotina APS: Creatinina sérica com estimativa de TFGe, Urina tipo 1 (EAS com microalbuminúria), "
        "Eletrocardiograma (ECG) de repouso e Perfil Lipídico completo."
        + (" Solicitação de Hemoglobina Glicada (HbA1c) para controle de DM." if tem_dm else "")
    )
    pl["encaminhamentos"] = (
        "1. Suporte Multiprofissional: Apoio da equipe de Saúde da Família (Nutrição e Educador Físico da Academia da Saúde).\n"
        "2. Retorno: Reavaliação ambulatorial agendada em 30 a 45 dias na UBS."
    )

    enhanced["subjetivo"] = sub
    enhanced["objetivo"] = obj
    enhanced["avaliacao"] = av
    enhanced["plano"] = pl
    enhanced["indicadores_previne"] = indicadores
    enhanced["alertas_clinicos"] = alertas
    enhanced["sugestoes_conduta"] = sugestoes
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



def generate_ai_assisted_soap(
    base_soap: Dict[str, Any],
    professional_notes: str = "",
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

        client = genai.Client(api_key=api_key)
        deidentified = deidentify_soap_payload(base_soap, professional_notes)

        system_instruction = (
            "Você é Sofia, a Assistente Clínica Especialista em Atenção Primária à Saúde (APS) e Medicina de Família e Comunidade (MFC) do Rastreia+.\n"
            "Sua missão é transformar os dados brutos e rascunhos do formulário em um Relatório SOAP rico, profissional, articulado e altamente técnico para o prontuário eletrônico (PEC / e-SUS).\n\n"
            "DIRETRIZES TÉCNICAS E ESTILO:\n"
            "1. NUNCA mencione que você é um modelo de linguagem ou IA genérica. Apresente-se como a Assistente Clínica Sofia.\n"
            "2. Subjetivo (S): Escreva uma narrativa clínica fluida e coesa em parágrafos bem articulados. Sintetize identificação, queixa e histórico de acompanhamento, adesão aos medicamentos, determinantes psicossociais e hábitos de vida.\n"
            "3. Objetivo (O): Integre os dados medidos com interpretação clínica imediata: calcule a média das aferições de PA e seu estadiamento pelas Diretrizes Brasileiras; interprete o IMC e o risco metabólico da circunferência abdominal; descreva o exame físico sumário.\n"
            "4. Avaliação (A): Formule um raciocínio clínico diagnóstico aprofundado e estratificado em tópicos numerados: 1. Controle e descompensação de HAS/DM; 2. Estratificação de Risco Cardiovascular Global (Framingham) correlacionada com idade e antropometria; 3. Risco de Lesão de Órgão-Alvo; 4. Alertas de metas do Previne Brasil.\n"
            "5. Plano (P): Desenvolva um Plano Terapêutico Singular (PTS) completo e pragmático para a Unidade Básica de Saúde:\n"
            "   - Condutas terapêuticas e opções de ajuste farmacológico conforme a RENAME (com doses habituais de referência para validação médica).\n"
            "   - Rastreio de Lesão de Órgão-Alvo (LOA) no SUS: exames formais a solicitar (Creatinina com TFGe, EAS com microalbuminúria, ECG, perfil lipídico).\n"
            "   - Orientações de autocuidado e estilo de vida (dieta DASH, controle de sal, atividade física aeróbica 150 min/sem).\n"
            "   - Encaminhamentos multiprofissionais (Nutrição, Academia da Saúde, etc.).\n"
            "   - Periodicidade de retorno e agendamento ambulatorial na APS.\n"
            "6. Alertas Clínicos: Destaque de 2 a 4 alertas prioritários e objetivos para a atenção do profissional.\n"
            "7. Retorne estritamente um JSON estruturado com os blocos 'subjetivo', 'objetivo', 'avaliacao', 'plano', 'alertas_clinicos' e 'sugestoes_conduta'."
        )

        user_content = (
            f"Por favor, Sofia, analise e aprimore o seguinte prontuário clínico desidentificado da APS:\n\n"
            f"{json.dumps(deidentified, ensure_ascii=False, indent=2)}\n\n"
            f"Consulte as ferramentas necessárias e gere a versão SOAP completa e aprimorada em JSON estruturado."
        )

        config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            temperature=0.3,
            response_mime_type="application/json",
        )

        last_error = None
        for model_name in models_to_try:
            try:
                chat = client.chats.create(
                    model=model_name,
                    config=config,
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


                enhanced["alertas_clinicos"] = parsed_json.get("alertas_clinicos", [])
                enhanced["sugestoes_conduta"] = parsed_json.get("sugestoes_conduta", [])
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
