# backend/apps/appointments/utils.py
"""
Utilitário para cálculo automático do nível de risco do agendamento
com base nos dados clínicos do paciente (HAS/DM).
"""

from apps.conditions.constants.has_choices import (
    FraminghamScoreChoices,
    BloodPressureClassificationChoices,
)


# Níveis numéricos de risco para comparação
_RISK_SEGURO = 1
_RISK_MODERADO = 2
_RISK_CRITICO = 3

_RISK_MAP = {
    _RISK_SEGURO: "Seguro",
    _RISK_MODERADO: "Moderado",
    _RISK_CRITICO: "Crítico",
}


def calculate_risk_from_patient(patient) -> str:
    """
    Calcula o nível de risco baseado nos dados clínicos do paciente.

    Prioridade:
      1. Escore de Framingham (se HAS diagnosticada)
      2. Classificação da PA (fallback para HAS)
      3. HbA1c (se DM diagnosticada)

    Quando ambas condições existem, prevalece o maior risco.
    Sem dados clínicos → fallback "Moderado".

    Args:
        patient: instância de PatientUser com dados clínicos

    Returns:
        str: "Seguro", "Moderado" ou "Crítico"
    """
    max_risk = 0

    # Tenta buscar registros HAS e DM vinculados ao paciente
    has_record = _get_has_record(patient)
    dm_record = _get_dm_record(patient)

    # ── HAS: Framingham (prioridade) ou classificação PA ──
    if has_record:
        framingham = getattr(has_record, "framingham_score", None)

        if framingham:
            framingham_risk = _framingham_to_risk(framingham)
            max_risk = max(max_risk, framingham_risk)
        else:
            bp_class = getattr(has_record, "BP_classifications", None)
            if bp_class:
                bp_risk = _bp_classification_to_risk(bp_class)
                max_risk = max(max_risk, bp_risk)

    # ── DM: HbA1c ──
    if dm_record:
        hba1c = getattr(dm_record, "glycated_hemoglobin", None)
        if hba1c is not None:
            try:
                hba1c_val = float(hba1c)
                if hba1c_val > 0:
                    hba1c_risk = _hba1c_to_risk(hba1c_val)
                    max_risk = max(max_risk, hba1c_risk)
            except (ValueError, TypeError):
                pass

    return _RISK_MAP.get(max_risk, "Moderado")


def _framingham_to_risk(score: str) -> int:
    """Converte enum FraminghamScoreChoices para nível de risco."""
    mapping = {
        FraminghamScoreChoices.BAIXO: _RISK_SEGURO,
        "BAIXO": _RISK_SEGURO,
        FraminghamScoreChoices.MODERADO: _RISK_MODERADO,
        "MODERADO": _RISK_MODERADO,
        FraminghamScoreChoices.ALTO: _RISK_CRITICO,
        "ALTO": _RISK_CRITICO,
    }
    return mapping.get(score, 0)


def _bp_classification_to_risk(classification: str) -> int:
    """Converte classificação da PA para nível de risco."""
    mapping = {
        BloodPressureClassificationChoices.NORMAL: _RISK_SEGURO,
        "NORMAL": _RISK_SEGURO,
        BloodPressureClassificationChoices.PRE_HIPERTENSO: _RISK_MODERADO,
        "PRE_HIPERTENSO": _RISK_MODERADO,
        BloodPressureClassificationChoices.HIPERTENSO_E1: _RISK_MODERADO,
        "HIPERTENSO_E1": _RISK_MODERADO,
        BloodPressureClassificationChoices.HIPERTENSO_E2: _RISK_CRITICO,
        "HIPERTENSO_E2": _RISK_CRITICO,
        BloodPressureClassificationChoices.HIPERTENSO_E3: _RISK_CRITICO,
        "HIPERTENSO_E3": _RISK_CRITICO,
    }
    return mapping.get(classification, 0)


def _hba1c_to_risk(value: float) -> int:
    """Converte valor de HbA1c para nível de risco."""
    if value < 7:
        return _RISK_SEGURO  # Controlada
    elif value <= 9:
        return _RISK_MODERADO  # Parcial
    else:
        return _RISK_CRITICO  # Descontrolada


def _get_has_record(patient):
    """Busca o registro HAS mais recente do paciente."""
    try:
        from apps.conditions.models import HAS
        return HAS.objects.filter(patient=patient).order_by("-created_at").first()
    except Exception:
        return None


def _get_dm_record(patient):
    """Busca o registro DM mais recente do paciente."""
    try:
        from apps.conditions.models import DM
        return DM.objects.filter(patient=patient).order_by("-created_at").first()
    except Exception:
        return None
