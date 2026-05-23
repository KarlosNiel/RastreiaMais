"""
Serviço de geração de relatório SOAP (Subjetivo, Objetivo, Avaliação, Plano)
para integração com o PEC/e-SUS.

Busca dados do paciente (PatientUser), HAS, DM e OtherDCNT e monta
os 4 blocos conforme o modelo RASTREIA_SOAP_Modelo.
"""
from datetime import date
from decimal import Decimal

from apps.accounts.models import PatientUser
from apps.conditions.models import HAS, DM, OtherDCNT


# ── Mapas de labels ──────────────────────────────────────────────────────

_GENDER_MAP = {"M": "Masculino", "F": "Feminino", "O": "Outro"}

_SMOKING_MAP = {
    "NUNCA_FUMOU": "nunca fumou",
    "EX_FUMANTE": "ex-fumante",
    "FUMANTE_ATUAL": "fumante atual",
}

_ALCOHOL_MAP = {
    "NAO_BEBE": "não bebe",
    "SOCIALMENTE": "socialmente",
    "FREQUENTEMENTE": "frequentemente",
}

_FEED_MAP = {
    "SAUDAVEL": "saudável",
    "PARCIALMENTE": "parcialmente saudável",
    "POUCO": "pouco saudável",
}

_SALT_MAP = {
    "ADEQUADO": "adequado",
    "EXAGERADO": "exagerado",
    "NAO_SABE": "não sabe",
}

_BP_CLASSIFICATION_MAP = {
    "NORMAL": "Normal",
    "PRE_HIPERTENSO": "Pré-hipertenso",
    "HIPERTENSO_E1": "Hipertenso Estágio 1",
    "HIPERTENSO_E2": "Hipertenso Estágio 2",
    "HIPERTENSO_E3": "Hipertenso Estágio 3",
}

_FRAMINGHAM_MAP = {
    "BAIXO": "<10% — risco BAIXO",
    "MODERADO": "10–20% — risco MODERADO",
    "ALTO": ">20% — risco ALTO",
}

_TREATMENT_MAP = {
    "SIM": "regular",
    "NAO": "não usa",
    "IRREGULAR": "irregular",
    "NAO_SE_APLICA": "não se aplica",
}

_SCREENING_MAP = {
    "NORMAL": "sem alterações glicêmicas identificadas na triagem",
    "GLICEMIA_ALTERADA": "glicemia alterada — confirmar com jejum",
    "SUSPEITA_DIABETES": "suspeita forte de DM — confirmação laboratorial urgente",
    "DIAGNOSTICO_CONFIRMADO": "diagnóstico confirmado de DM",
}

_CONDUCT_HAS_MAP = {
    "ACOMPANHAMENTO_APS": "acompanhamento na APS",
    "ENCAMINHAMENTO_MEDICO": "encaminhamento médico",
    "ACONSELHAMENTO_GRUPO": "aconselhamento em grupo",
}

_CONDUCT_DM_MAP = {
    "CONFIRMACAO_LABORATORIAL": "encaminhado para confirmação laboratorial",
    "INICIO_TRATAMENTO": "início de tratamento",
    "ORIENTACAO_NUTRICIONAL": "orientação nutricional e educação em saúde",
    "ENCAMINHAMENTO_MEDICO": "encaminhamento médico",
}

_COMPLICATION_MAP = {
    "AVC": "AVC",
    "INFARTO": "Infarto",
    "DOENCA_RENAL": "Doença renal",
    "SEM_COMPLICACOES": "sem complicações",
}

_REFERRAL_MAP = {
    "PSICOLOGO": "Psicólogo",
    "MEDICO_VETERINARIO": "Médico Veterinário",
    "FISIOTERAPEUTA": "Fisioterapeuta",
    "ASSISTENTE_SOCIAL": "Assistente Social",
    "ENFERMEIRA": "Enfermeira",
    "NUTRICIONISTA": "Nutricionista",
    "CIRURGIA_DENTISTA": "Cirurgiã-Dentista",
}

_SCHOLARITY_MAP = {
    "ANALFABETO": "Sem escolaridade",
    "FUND_INCOMPL": "Fundamental Incompleto",
    "FUND_COMPL": "Fundamental Completo",
    "MED_INCOMPL": "Médio Incompleto",
    "MED_COMPL": "Médio Completo",
    "SUP_INCOMPL": "Superior Incompleto",
    "SUP_COMPL": "Superior Completo",
}


# ── Helpers ──────────────────────────────────────────────────────────────

def _age(birth_date):
    if not birth_date:
        return None
    today = date.today()
    return today.year - birth_date.year - (
        (today.month, today.day) < (birth_date.month, birth_date.day)
    )


def _dec(val):
    """Converte Decimal/float para string legível."""
    if val is None:
        return None
    if isinstance(val, Decimal):
        return str(val.normalize())
    return str(val)


def _bool_label(val, true_label="SIM", false_label="NÃO"):
    if val is None:
        return None
    return true_label if val else false_label


def _fmt_date(dt):
    if not dt:
        return None
    if hasattr(dt, "strftime"):
        return dt.strftime("%d/%m/%Y")
    return str(dt)


# ── Montagem dos Blocos SOAP ─────────────────────────────────────────────

def _build_subjetivo(patient, has_obj, dm_obj):
    """Bloco S — o que o paciente relata e a história clínica."""
    user = patient.user
    nome = user.get_full_name() or user.username
    idade = _age(patient.birth_date)
    genero = _GENDER_MAP.get(patient.gender, patient.gender or "—")
    raca = patient.race_ethnicity or "—"
    ocupacao = patient.occupation or "—"

    # Identificação e queixas principais
    id_parts = [f"Paciente {genero}"]
    if idade is not None:
        id_parts.append(f"{idade} anos")
    id_parts.append(raca)
    id_parts.append(ocupacao)

    diag_parts = []
    if has_obj:
        med_label = _TREATMENT_MAP.get(has_obj.uses_medication or "", "—")
        diag_parts.append(
            f"diagnóstico prévio de hipertensão arterial sistêmica — "
            f"uso de medicação: {med_label.upper()}"
        )
    if dm_obj:
        med_label = _TREATMENT_MAP.get(dm_obj.uses_medication or "", "—")
        diag_parts.append(
            f"diagnóstico prévio de diabetes mellitus — "
            f"uso de medicação: {med_label.upper()}"
        )
    if not has_obj and not dm_obj:
        diag_parts.append("sem diagnóstico prévio conhecido para HAS/DM")

    identificacao = ", ".join(id_parts) + ". " + " ".join(diag_parts) + "."

    # Histórico e contexto clínico
    historico_parts = []
    last_consult = patient.last_consultation
    if last_consult:
        historico_parts.append(f"Última consulta para avaliação há {last_consult}")

    fam_has = _bool_label(has_obj.family_history) if has_obj else None
    fam_dm = _bool_label(dm_obj.family_history) if dm_obj else None
    fam_items = []
    if fam_has:
        fam_items.append("HAS" if has_obj and has_obj.family_history else "")
    if fam_dm:
        fam_items.append("DM" if dm_obj and dm_obj.family_history else "")
    fam_items = [f for f in fam_items if f]

    if fam_items:
        historico_parts.append(f"Histórico familiar positivo para {', '.join(fam_items)}")
    else:
        historico_parts.append("Histórico familiar negativo")

    # Complicações
    complicacoes = []
    if has_obj and has_obj.any_complications_HBP:
        c = _COMPLICATION_MAP.get(has_obj.any_complications_HBP, has_obj.any_complications_HBP)
        complicacoes.append(c)

    if complicacoes and complicacoes[0] != "sem complicações":
        historico_parts.append(f"Complicações prévias: {', '.join(complicacoes)}")
    else:
        historico_parts.append("Nenhuma complicação prévia relatada")

    historico = ". ".join(historico_parts) + "."

    # Determinantes sociais e psicossociais
    social_parts = []
    stress = _bool_label(
        patient.everyday_stress_interfere_with_your_BP_BS_control,
        "INTERFERE", "NÃO INTERFERE"
    )
    if stress:
        social_parts.append(f"Estresse do dia a dia {stress} no controle de sua condição")

    econ = _bool_label(
        patient.economic_factors_interfere_with_your_treatment,
        "DIFICULTAM", "NÃO DIFICULTAM"
    )
    if econ:
        social_parts.append(f"Fatores econômicos {econ} a continuidade do tratamento")

    apoio = _bool_label(
        patient.feel_receive_support_from_family_friends_to_maintain_treatment,
        "SIM", "NÃO"
    )
    if apoio:
        social_parts.append(f"Apoio familiar: {apoio}")

    bf = _bool_label(patient.bolsa_familia, "SIM", "NÃO")
    if bf:
        social_parts.append(f"Beneficiário do Bolsa Família: {bf}")

    determinantes = ". ".join(social_parts) + "." if social_parts else ""

    # Estilo de vida
    tabagismo = _SMOKING_MAP.get(patient.smoking or "", "—")
    etilismo = _ALCOHOL_MAP.get(patient.alcohol_consumption or "", "—")
    alimentacao = _FEED_MAP.get(patient.feed or "", "—")
    sal = _SALT_MAP.get(patient.salt_consumption or "", "—")

    atividade_label = "—"
    if patient.performs_physical_activity is True:
        freq = patient.performs_physical_activity_answer or ""
        atividade_label = f"pratica — {freq}x/semana" if freq else "pratica"
    elif patient.performs_physical_activity is False:
        atividade_label = "sedentário"

    estilo = (
        f"Tabagismo: {tabagismo.upper()}. "
        f"Etilismo: {etilismo.upper()}. "
        f"Atividade física: {atividade_label.upper()}. "
        f"Alimentação referida: {alimentacao.upper()}. "
        f"Consumo de sal: {sal.upper()}."
    )

    return {
        "identificacao": identificacao,
        "historico": historico,
        "determinantes": determinantes,
        "estilo_vida": estilo,
        "nome_paciente": nome,
    }


def _build_objetivo(patient, has_obj, dm_obj):
    """Bloco O — dados clínicos mensurados na avaliação."""
    sections = {}

    # Pressão arterial (do HAS)
    if has_obj:
        pa_parts = []
        if has_obj.BP_assessment1_1 and has_obj.BP_assessment1_2:
            pa_parts.append(f"1ª aferição: {has_obj.BP_assessment1_1}/{has_obj.BP_assessment1_2} mmHg")
        if has_obj.BP_assessment2_1 and has_obj.BP_assessment2_2:
            pa_parts.append(f"2ª aferição: {has_obj.BP_assessment2_1}/{has_obj.BP_assessment2_2} mmHg")
        if pa_parts:
            pa_parts.append("Aferição realizada em repouso, posição sentada.")
            sections["pressao_arterial"] = " ".join(pa_parts)

    # Antropometria — pega de HAS ou DM (o que tiver)
    src = has_obj or dm_obj
    if src:
        antro_parts = []
        if src.weight:
            antro_parts.append(f"Peso: {_dec(src.weight)} kg")
        if src.height:
            antro_parts.append(f"Altura: {_dec(src.height)} m")
        if src.IMC:
            imc_val = float(src.IMC)
            if imc_val < 18.5:
                imc_class = "Abaixo do peso"
            elif imc_val < 25:
                imc_class = "Normal"
            elif imc_val < 30:
                imc_class = "Sobrepeso"
            elif imc_val < 35:
                imc_class = "Obesidade grau I"
            elif imc_val < 40:
                imc_class = "Obesidade grau II"
            else:
                imc_class = "Obesidade grau III"
            antro_parts.append(f"IMC: {_dec(src.IMC)} kg/m² — classificação: {imc_class}")
        if src.abdominal_circumference:
            antro_parts.append(f"Circunferência abdominal: {_dec(src.abdominal_circumference)} cm")
        if antro_parts:
            sections["antropometria"] = ". ".join(antro_parts) + "."

    # Glicemia e metabólico
    glicemia_parts = []
    if dm_obj:
        if dm_obj.capillary_blood_glucose_random:
            glicemia_parts.append(
                f"Glicemia capilar aleatória: {dm_obj.capillary_blood_glucose_random} mg/dL"
            )
        if dm_obj.fasting_capillary_blood_glucose:
            glicemia_parts.append(
                f"Glicemia capilar em jejum: {dm_obj.fasting_capillary_blood_glucose} mg/dL"
            )
        if dm_obj.glycated_hemoglobin:
            glicemia_parts.append(
                f"Hemoglobina glicada (HbA1c): {_dec(dm_obj.glycated_hemoglobin)}%"
            )
    if has_obj:
        if has_obj.total_cholesterol:
            parts = [f"Colesterol total: {has_obj.total_cholesterol} mg/dL"]
            if has_obj.cholesterol_data:
                parts.append(f"Data: {_fmt_date(has_obj.cholesterol_data)}")
            glicemia_parts.append(". ".join(parts))
        if has_obj.HDL_cholesterol:
            parts = [f"HDL: {has_obj.HDL_cholesterol} mg/dL"]
            if has_obj.HDL_data:
                parts.append(f"Data: {_fmt_date(has_obj.HDL_data)}")
            glicemia_parts.append(". ".join(parts))

    if glicemia_parts:
        sections["glicemia_metabolico"] = ". ".join(glicemia_parts) + "."

    # Exame físico sumário
    exame_parts = []
    edema = _bool_label(patient.has_edema, "PRESENTE", "AUSENTE")
    if edema:
        exame_parts.append(f"Edemas: {edema}")
    dispneia = _bool_label(patient.has_dyspnea, "PRESENTE", "AUSENTE")
    if dispneia:
        exame_parts.append(f"Dispneia: {dispneia}")
    parestesia = _bool_label(patient.has_paresthesia_or_cramps, "SIM", "NÃO")
    if parestesia:
        exame_parts.append(f"Queixas de formigamento ou câimbras: {parestesia}")
    dif_caminhar = _bool_label(patient.has_difficulty_walking_or_activity, "SIM", "NÃO")
    if dif_caminhar:
        exame_parts.append(f"Dificuldade para caminhar ou realizar atividades: {dif_caminhar}")

    if dm_obj and dm_obj.diabetic_foot:
        membro = dm_obj.diabetic_foot_member or "—"
        exame_parts.append(f"Pé diabético identificado — membro: {membro}")

    if exame_parts:
        sections["exame_fisico"] = ". ".join(exame_parts) + "."

    return sections


def _build_avaliacao(patient, has_obj, dm_obj, other_dcnts):
    """Bloco A — classificação consolidada e estratificação de risco."""
    sections = {}

    # Hipertensão arterial
    if has_obj:
        has_parts = []
        if has_obj.is_diagnosed:
            class_pa = _BP_CLASSIFICATION_MAP.get(
                has_obj.BP_classifications or "", "—"
            )
            has_parts.append(f"HAS — classificação: {class_pa}")

            med = _TREATMENT_MAP.get(has_obj.uses_medication or "", "—")
            has_parts.append(f"Adesão medicamentosa: {med.upper()}")
        else:
            has_parts.append(
                "Sem diagnóstico prévio de HAS — valores aferidos sugestivos, "
                "necessária confirmação."
            )

        sections["hipertensao"] = ". ".join(has_parts) + "."

    # Diabetes mellitus
    if dm_obj:
        dm_parts = []
        if dm_obj.is_diagnosed:
            dm_parts.append("DM CONFIRMADA")
            if dm_obj.treatment_type:
                dm_parts.append(f"tipo de tratamento: {dm_obj.treatment_type}")
        else:
            # Triagem
            screening = _SCREENING_MAP.get(
                dm_obj.screening_result or "", ""
            )
            if screening:
                dm_parts.append(f"Triagem: {screening}")
            else:
                dm_parts.append("Sem alterações glicêmicas identificadas na triagem")

        sections["diabetes"] = ". ".join(dm_parts) + "."

    # Risco cardiovascular
    if has_obj and has_obj.framingham_score:
        framingham_label = _FRAMINGHAM_MAP.get(
            has_obj.framingham_score, has_obj.framingham_score
        )
        risco_cv_parts = [f"Score de Framingham: {framingham_label}"]

        src = has_obj or dm_obj
        if src and src.IMC:
            risco_cv_parts.append("IMC e circunferência abdominal contribuem para risco metabólico")

        sections["risco_cardiovascular"] = ". ".join(risco_cv_parts) + "."

    # Riscos psicossociais e sociais
    riscos_sociais = []
    if patient.everyday_stress_interfere_with_your_BP_BS_control:
        riscos_sociais.append("estresse com impacto no controle")
    if patient.economic_factors_interfere_with_your_treatment:
        riscos_sociais.append("barreira econômica ao tratamento")
    if patient.feel_receive_support_from_family_friends_to_maintain_treatment is False:
        riscos_sociais.append("ausência de apoio familiar")

    if riscos_sociais:
        sections["riscos_psicossociais"] = ", ".join(riscos_sociais) + "."
    else:
        sections["riscos_psicossociais"] = (
            "Sem riscos psicossociais significativos identificados nesta avaliação."
        )

    # Outras DCNTs
    if other_dcnts:
        nomes = [d.name for d in other_dcnts if d.name]
        if nomes:
            sections["outras_dcnts"] = (
                f"Paciente refere diagnóstico de {', '.join(nomes)}."
            )
    else:
        sections["outras_dcnts"] = "Sem outras doenças crônicas não transmissíveis relatadas."

    return sections


def _build_plano(patient, has_obj, dm_obj):
    """Bloco P — condutas, encaminhamentos e agendamentos."""
    sections = {}

    # Conduta clínica imediata
    condutas = []
    if has_obj and has_obj.conduct_adopted:
        c = _CONDUCT_HAS_MAP.get(has_obj.conduct_adopted, has_obj.conduct_adopted)
        condutas.append(c)
    if dm_obj and dm_obj.adopted_conduct:
        c = _CONDUCT_DM_MAP.get(dm_obj.adopted_conduct, dm_obj.adopted_conduct)
        condutas.append(c)

    if has_obj and has_obj.uses_medication == "IRREGULAR":
        meds = has_obj.medications_name or "os medicamentos prescritos"
        condutas.append(f"Reforço de orientação sobre adesão medicamentosa para {meds}")

    if condutas:
        sections["conduta_clinica"] = ". ".join(condutas) + "."
    else:
        sections["conduta_clinica"] = "Nenhuma conduta clínica imediata registrada."

    # Exames solicitados
    exames = []
    if dm_obj:
        exames.append("glicemia em jejum")
        exames.append("HbA1c")
    if has_obj:
        if not has_obj.total_cholesterol:
            exames.append("colesterol total e frações")

    if exames:
        sections["exames_solicitados"] = ", ".join(exames) + "."
    else:
        sections["exames_solicitados"] = "Nenhum exame solicitado nesta avaliação."

    # Encaminhamentos multiprofissionais
    if patient.requires_multidisciplinary_referral:
        ref = patient.requires_multidisciplinary_referral_choose
        prof = _REFERRAL_MAP.get(ref or "", ref or "—")
        sections["encaminhamentos"] = f"Encaminhamento multiprofissional para {prof}."
    else:
        sections["encaminhamentos"] = (
            "Sem necessidade de encaminhamento multiprofissional identificada nesta avaliação."
        )

    return sections


# ── Função principal ─────────────────────────────────────────────────────

def generate_soap_report(patient_id):
    """
    Gera o relatório SOAP completo para um paciente.

    Args:
        patient_id: ID do PatientUser

    Returns:
        dict com as 4 seções SOAP e metadata
    """
    patient = PatientUser.objects.select_related("user", "address").get(id=patient_id)

    # Busca HAS e DM (podem não existir)
    try:
        has_obj = HAS.objects.get(patient=patient)
    except HAS.DoesNotExist:
        has_obj = None

    try:
        dm_obj = DM.objects.get(patient=patient)
    except DM.DoesNotExist:
        dm_obj = None

    other_dcnts = list(OtherDCNT.objects.filter(patient=patient))

    subjetivo = _build_subjetivo(patient, has_obj, dm_obj)
    objetivo = _build_objetivo(patient, has_obj, dm_obj)
    avaliacao = _build_avaliacao(patient, has_obj, dm_obj, other_dcnts)
    plano = _build_plano(patient, has_obj, dm_obj)

    # Indicadores do Previne Brasil
    indicadores = []

    # PA aferida e registrada
    pa_aferida = (
        has_obj is not None
        and has_obj.BP_assessment1_1 is not None
        and has_obj.BP_assessment1_2 is not None
    )
    indicadores.append({
        "indicador": "PA aferida e registrada em hipertenso",
        "status": "ATINGIDO" if pa_aferida else "PENDENTE",
    })

    # Acompanhamento de DCNT
    acomp_dcnt = has_obj is not None or dm_obj is not None
    indicadores.append({
        "indicador": "Acompanhamento de pessoa com DCNT",
        "status": "ATINGIDO" if acomp_dcnt else "PENDENTE",
    })

    # HbA1c solicitada
    hba1c_sol = dm_obj is not None and dm_obj.glycated_hemoglobin is not None
    indicadores.append({
        "indicador": "HbA1c solicitada em diabético ou suspeito",
        "status": "ATINGIDO" if hba1c_sol else ("EM CURSO" if dm_obj else "PENDENTE"),
    })

    # Cadastro individual qualificado
    cadastro_ok = bool(
        patient.birth_date
        and patient.gender
        and patient.cpf
    )
    indicadores.append({
        "indicador": "Cadastro individual qualificado",
        "status": "ATINGIDO" if cadastro_ok else "PENDENTE",
    })

    return {
        "paciente": {
            "id": patient.id,
            "nome": subjetivo.pop("nome_paciente", ""),
            "cpf": patient.cpf,
            "nascimento": _fmt_date(patient.birth_date),
            "idade": _age(patient.birth_date),
        },
        "subjetivo": subjetivo,
        "objetivo": objetivo,
        "avaliacao": avaliacao,
        "plano": plano,
        "indicadores_previne": indicadores,
        "gerado_em": _fmt_date(date.today()),
    }
