# backend/apps/conditions/signals.py
"""
Signals para atualizar automaticamente o risco dos agendamentos
quando dados clínicos (HAS/DM) do paciente são salvos/atualizados.
"""

import logging

from django.db.models.signals import post_save
from django.dispatch import receiver

from apps.appointments.models import Appointment
from apps.appointments.utils import calculate_risk_from_patient
from apps.conditions.models import HAS, DM

logger = logging.getLogger(__name__)


@receiver(post_save, sender=HAS)
@receiver(post_save, sender=DM)
def update_appointment_risk_on_clinical_change(sender, instance, **kwargs):
    """
    Quando HAS ou DM são criados/atualizados, recalcula o risk_level
    de todos os agendamentos ATIVOS do mesmo paciente.
    """
    patient = getattr(instance, "patient", None)

    if not patient:
        return

    new_risk = calculate_risk_from_patient(patient)

    # Atualiza apenas agendamentos ativos (não mexe em finalizados/cancelados)
    updated = Appointment.objects.filter(
        patient=patient,
        status="ativo",
    ).exclude(
        risk_level=new_risk,
    ).update(
        risk_level=new_risk,
    )

    if updated:
        logger.info(
            "Risco de %d agendamento(s) atualizado(s) para '%s' "
            "(paciente=%s, trigger=%s)",
            updated,
            new_risk,
            patient,
            sender.__name__,
        )

    # Disparo automático de alerta clínico quando o paciente atinge risco crítico
    if new_risk == "Crítico":
        try:
            from apps.alerts.models import Alert
            existing_alert = Alert.objects.filter(
                patient=patient,
                risk_level="critical",
                status="pending",
                is_deleted=False
            ).exists()

            if not existing_alert:
                condition_type = "Hipertensão Arterial" if isinstance(instance, HAS) else "Diabetes Mellitus"
                Alert.objects.create(
                    patient=patient,
                    title=f"Risco Crítico Identificado: {condition_type}",
                    description=(
                        f"Parâmetros clínicos críticos detectados para {patient.user.get_full_name() or 'o paciente'}. "
                        "Requer avaliação e conduta prioritária pela equipe da UBS."
                    ),
                    risk_level="critical",
                    status="pending",
                )
                logger.info("Alerta clínico automático gerado para paciente %s", patient)
        except Exception as e:
            logger.error("Falha ao gerar alerta clínico automático: %s", e)
