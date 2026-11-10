from typing import Any, Dict
from django.core.cache import cache
from apps.accounts.models import PatientUser
from apps.accounts.utils.utils import get_user_profile
from apps.appointments.models import Appointment
from apps.alerts.models import Alert
from apps.conditions.models import HAS, DM, OtherDCNT
from apps.reports.signals import get_kpis_cache_version


def get_clinical_analytics_data(user, scope: str = "all") -> Dict[str, Any]:
    """
    Agrega indicadores clínicos e epidemiológicos de DCNTs (HAS e DM),
    controle pressórico/glicêmico, estratificação de Framingham e agenda.
    Utiliza versionamento por cache e suporte a escopo ('my' ou 'all').
    """
    role, profile = get_user_profile(user)
    version = get_kpis_cache_version()
    profile_key = getattr(profile, "id", "global")
    cache_key = f"clinical_analytics_v{version}_{role}_{profile_key}_{scope}"

    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    # Base de pacientes ativos
    patients_qs = PatientUser.objects.filter(is_deleted=False)
    appointments_qs = Appointment.objects.filter(is_deleted=False)
    alerts_qs = Alert.objects.filter(is_deleted=False)

    if role == "patient" and profile:
        patients_qs = patients_qs.filter(id=profile.id)
        appointments_qs = appointments_qs.filter(patient=profile)
        alerts_qs = alerts_qs.filter(patient=profile)
    elif role == "professional" and profile:
        if scope == "my":
            my_patient_ids = (
                appointments_qs.filter(professional=profile)
                .values_list("patient_id", flat=True)
                .distinct()
            )
            if my_patient_ids.exists():
                patients_qs = patients_qs.filter(id__in=my_patient_ids)
                alerts_qs = alerts_qs.filter(patient_id__in=my_patient_ids)
            else:
                # Se ainda não possui agendamentos, mantém visão global da unidade para não exibir tela em branco
                pass
        appointments_qs = appointments_qs.filter(professional=profile)
    elif role in ("manager", "superuser"):
        pass
    else:
        patients_qs = patients_qs.none()
        appointments_qs = appointments_qs.none()
        alerts_qs = alerts_qs.none()

    total_patients = patients_qs.count()
    patient_ids = list(patients_qs.values_list("id", flat=True))

    # --- 1. DCNTs: HAS e DM ---
    has_qs = HAS.objects.filter(patient_id__in=patient_ids, is_deleted=False)
    dm_qs = DM.objects.filter(patient_id__in=patient_ids, is_deleted=False)
    other_qs = OtherDCNT.objects.filter(patient_id__in=patient_ids, is_deleted=False)

    has_diag_ids = set(
        has_qs.filter(is_diagnosed=True).values_list("patient_id", flat=True)
    )
    dm_diag_ids = set(
        dm_qs.filter(is_diagnosed=True).values_list("patient_id", flat=True)
    )
    other_diag_ids = set(
        other_qs.values_list("patient_id", flat=True)
    )

    both_ids = has_diag_ids.intersection(dm_diag_ids)
    has_only_ids = has_diag_ids - dm_diag_ids
    dm_only_ids = dm_diag_ids - has_diag_ids
    other_only_ids = other_diag_ids - has_diag_ids - dm_diag_ids

    # Adesão terapêutica (HAS e DM com uses_medication == 'SIM')
    med_taking_has = has_qs.filter(
        patient_id__in=has_diag_ids, uses_medication__iexact="SIM"
    ).count()
    med_taking_dm = dm_qs.filter(
        patient_id__in=dm_diag_ids, uses_medication__iexact="SIM"
    ).count()
    total_diag_dcnt = len(has_diag_ids.union(dm_diag_ids))

    adherence_rate = 0.0
    if total_diag_dcnt > 0:
        total_adherent = len(
            set(
                has_qs.filter(uses_medication__iexact="SIM").values_list("patient_id", flat=True)
            ).union(
                set(
                    dm_qs.filter(uses_medication__iexact="SIM").values_list("patient_id", flat=True)
                )
            )
        )
        adherence_rate = round((total_adherent / total_diag_dcnt) * 100, 1)

    # --- 2. Controle Pressórico (PA) ---
    bp_normal = has_qs.filter(BP_classifications="NORMAL").count()
    bp_pre = has_qs.filter(BP_classifications="PRE_HIPERTENSO").count()
    bp_e1 = has_qs.filter(BP_classifications="HIPERTENSO_E1").count()
    bp_e2 = has_qs.filter(BP_classifications="HIPERTENSO_E2").count()
    bp_e3 = has_qs.filter(BP_classifications="HIPERTENSO_E3").count()

    bp_evaluated = bp_normal + bp_pre + bp_e1 + bp_e2 + bp_e3
    bp_unrecorded = max(0, total_patients - bp_evaluated)

    # Agrupamento Clínico
    # Controlada: Normal ou Pré-hipertenso sob acompanhamento
    # Alterada/Estágios 1 e 2
    # Crítica: Estágio 3 (PA >= 180/110 mmHg)
    bp_controlled = bp_normal + bp_pre
    bp_stage_1_2 = bp_e1 + bp_e2
    bp_stage_3_critical = bp_e3

    # --- 3. Controle Glicêmico (DM) ---
    # Classificação por resultado de rastreamento e tratamento
    dm_controlled = dm_qs.filter(
        screening_result="NORMAL"
    ).count()
    dm_altered = dm_qs.filter(
        screening_result__in=["GLICEMIA_ALTERADA", "SUSPEITA_DIABETES", "DIAGNOSTICO_CONFIRMADO"]
    ).count()

    # Tipos de tratamento de Diabetes
    dm_insulin = dm_qs.filter(treatment_type="INSULINA").count()
    dm_oral = dm_qs.filter(treatment_type="MEDICAMENTOSO").count()
    dm_lifestyle = dm_qs.filter(treatment_type="ALIMENTAR_ESTILO_VIDA").count()

    dm_evaluated = dm_controlled + dm_altered
    dm_unrecorded = max(0, total_patients - dm_evaluated)

    # --- 4. Estratificação de Risco Cardiovascular (Framingham) ---
    framingham_baixo = has_qs.filter(framingham_score="BAIXO").count()
    framingham_moderado = has_qs.filter(framingham_score="MODERADO").count()
    framingham_alto = has_qs.filter(framingham_score="ALTO").count()
    framingham_total_eval = framingham_baixo + framingham_moderado + framingham_alto
    framingham_unrecorded = max(0, total_patients - framingham_total_eval)

    # --- 5. Visão Operacional da Agenda ---
    total_appts = appointments_qs.count()
    scheduled_appts = appointments_qs.filter(status="ativo").count()
    completed_appts = appointments_qs.filter(status="finalizado").count()
    cancelled_appts = appointments_qs.filter(status="cancelado").count()

    appts_critical = appointments_qs.filter(risk_level="Crítico").count()
    appts_moderate = appointments_qs.filter(risk_level="Moderado").count()
    appts_safe = appointments_qs.filter(risk_level="Seguro").count()

    # --- 6. Alertas Clínicos ---
    alerts_pending = alerts_qs.filter(status="pending")
    total_pending_alerts = alerts_pending.count()
    critical_alerts = alerts_pending.filter(risk_level="critical").count()
    moderate_alerts = alerts_pending.filter(risk_level="moderate").count()
    safe_alerts = alerts_pending.filter(risk_level="safe").count()

    # --- 7. Lista Estruturada de Pacientes para Navegação Clínica Interativa ---
    has_by_patient = {h.patient_id: h for h in has_qs}
    dm_by_patient = {d.patient_id: d for d in dm_qs}

    patient_records = []
    for p in patients_qs.select_related("user"):
        h = has_by_patient.get(p.id)
        d = dm_by_patient.get(p.id)

        bp_sys = getattr(h, "BP_assessment1_1", None)
        bp_dia = getattr(h, "BP_assessment1_2", None)
        bp_val = f"{bp_sys}/{bp_dia}" if (bp_sys and bp_dia) else None

        has_diag = bool(getattr(h, "is_diagnosed", False))
        dm_diag = bool(getattr(d, "is_diagnosed", False))
        bp_class = getattr(h, "BP_classifications", "NAO_AVALIADO") or "NAO_AVALIADO"
        framingham = getattr(h, "framingham_score", "NAO_AVALIADO") or "NAO_AVALIADO"
        dm_scr = getattr(d, "screening_result", "NAO_AVALIADO") or "NAO_AVALIADO"
        dm_treat = getattr(d, "treatment_type", "NAO_INFORMADO") or "NAO_INFORMADO"
        fasting_glyc = getattr(d, "fasting_capillary_blood_glucose", None)

        patient_records.append({
            "id": p.id,
            "name": p.user.get_full_name() or p.user.username,
            "cpf": p.cpf or "",
            "birth_date": str(p.birth_date) if getattr(p, "birth_date", None) else None,
            "has_diagnosed": has_diag,
            "bp_classification": bp_class,
            "bp_value": bp_val,
            "framingham_score": framingham,
            "dm_diagnosed": dm_diag,
            "dm_screening": dm_scr,
            "fasting_glycemia": fasting_glyc,
            "dm_treatment": dm_treat,
            "is_critical_bp": bp_class == "HIPERTENSO_E3",
            "is_high_framingham": framingham == "ALTO",
            "is_altered_dm": dm_scr in ("GLICEMIA_ALTERADA", "SUSPEITA_DIABETES", "DIAGNOSTICO_CONFIRMADO"),
            "has_comorbidity": has_diag and dm_diag,
        })

    data: Dict[str, Any] = {
        "total_monitored_patients": total_patients,
        "scope": scope,
        "conditions": {
            "has_count": len(has_diag_ids),
            "dm_count": len(dm_diag_ids),
            "both_count": len(both_ids),
            "has_only": len(has_only_ids),
            "dm_only": len(dm_only_ids),
            "other_count": len(other_only_ids),
            "total_with_dcnt": total_diag_dcnt,
            "adherence_rate": adherence_rate,
        },
        "blood_pressure": {
            "controlled": bp_controlled,
            "stage_1_2": bp_stage_1_2,
            "stage_3_critical": bp_stage_3_critical,
            "unrecorded": bp_unrecorded,
            "distribution": {
                "NORMAL": bp_normal,
                "PRE_HIPERTENSO": bp_pre,
                "HIPERTENSO_E1": bp_e1,
                "HIPERTENSO_E2": bp_e2,
                "HIPERTENSO_E3": bp_e3,
                "NAO_AVALIADO": bp_unrecorded,
            },
        },
        "glycemia": {
            "controlled": dm_controlled,
            "altered": dm_altered,
            "unrecorded": dm_unrecorded,
            "treatment_distribution": {
                "oral": dm_oral,
                "insulin": dm_insulin,
                "lifestyle": dm_lifestyle,
            },
        },
        "framingham_risk": {
            "baixo": framingham_baixo,
            "moderado": framingham_moderado,
            "alto": framingham_alto,
            "nao_avaliado": framingham_unrecorded,
        },
        "appointments_overview": {
            "total": total_appts,
            "scheduled": scheduled_appts,
            "completed": completed_appts,
            "cancelled": cancelled_appts,
            "critical_risk": appts_critical,
            "moderate_risk": appts_moderate,
            "safe_risk": appts_safe,
        },
        "alerts_overview": {
            "total_pending": total_pending_alerts,
            "critical_pending": critical_alerts,
            "moderate_pending": moderate_alerts,
            "safe_pending": safe_alerts,
        },
        "patients": patient_records,
    }

    cache.set(cache_key, data, timeout=300)
    return data

