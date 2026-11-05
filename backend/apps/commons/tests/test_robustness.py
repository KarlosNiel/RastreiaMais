import uuid
import logging
from datetime import timedelta
from django.test import TestCase, override_settings
from django.contrib.auth.models import User
from django.utils import timezone
from django.db import IntegrityError
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.appointments.models import Appointment
from apps.commons.middleware.correlation_id import CorrelationIdFilter
from apps.commons.utils.validators import validate_brazilian_cpf, validate_cns


class RobustnessTestSuite(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Manager user for auth
        self.manager_user = User.objects.create_user(
            username="manager_robust",
            password="Password123!",
            is_staff=True,
            first_name="Admin",
            last_name="Gestor",
        )
        self.manager = ManagerUser.objects.create(
            user=self.manager_user, phone="83999998888"
        )

        # Professional user
        self.prof_user = User.objects.create_user(
            username="medico_robust",
            password="Password123!",
            first_name="Dr",
            last_name="Carlos",
        )
        self.prof = ProfessionalUser.objects.create(
            user=self.prof_user, role="Médico", professional_registry="CRM/PB 12345"
        )

        # Patient user
        self.patient_user = User.objects.create_user(
            username="52998224725",
            password="Password123!",
            first_name="Maria",
            last_name="Silva",
        )
        self.patient = PatientUser.objects.create(
            user=self.patient_user,
            cpf="52998224725",
            sus="123456789012345",
        )

        self.scheduled_time = timezone.now() + timedelta(days=2)

    # -------------------------------------------------------------
    # 1. Observability: Correlation ID Tracing
    # -------------------------------------------------------------
    def test_correlation_id_generated_when_missing(self):
        """Verifica se uma requisição sem X-Request-ID gera um UUID no cabeçalho de resposta."""
        response = self.client.get("/api/health/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("X-Request-ID", response.headers)
        req_id = response.headers["X-Request-ID"]
        # Verifica se é um UUID válido
        self.assertTrue(uuid.UUID(req_id))

    def test_correlation_id_propagated_when_provided(self):
        """Verifica se o X-Request-ID fornecido pelo cliente é preservado."""
        custom_id = "trace-healthcare-req-12345"
        response = self.client.get("/api/health/", HTTP_X_REQUEST_ID=custom_id)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.headers.get("X-Request-ID"), custom_id)
        self.assertEqual(response.data.get("request_id"), custom_id)

    def test_correlation_id_logging_filter(self):
        """Verifica se o filtro de log CorrelationIdFilter injeta o request_id no registro."""
        log_filter = CorrelationIdFilter()
        record = logging.LogRecord(
            name="test", level=logging.INFO, pathname=__file__, lineno=10,
            msg="Teste de log com correlation ID", args=(), exc_info=None
        )
        result = log_filter.filter(record)
        self.assertTrue(result)
        self.assertTrue(hasattr(record, "request_id"))

    # -------------------------------------------------------------
    # 2. Database Concurrency Constraint (Double-Booking Prevention)
    # -------------------------------------------------------------
    def test_db_level_unique_constraint_prevents_double_booking(self):
        """
        Garante que a restrição de banco (UniqueConstraint) impede agendamento
        concorrente no mesmo slot de horário para o mesmo profissional.
        """
        # Primeiro agendamento ativo
        Appointment.objects.create(
            patient=self.patient,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time,
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )

        # Tentativa de criar segundo agendamento direto no banco com mesmo slot
        user2 = User.objects.create_user(username="patient2_rob", password="Password123!")
        patient2 = PatientUser.objects.create(user=user2)

        with self.assertRaises(IntegrityError):
            Appointment.objects.create(
                patient=patient2,
                professional=self.prof,
                scheduled_datetime=self.scheduled_time,
                type="Consulta",
                risk_level="Seguro",
                status="ativo",
            )

    def test_cancelled_appointment_frees_slot_in_db(self):
        """Verifica se o cancelamento libera o horário para novo agendamento."""
        app1 = Appointment.objects.create(
            patient=self.patient,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time,
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )

        # Cancela o primeiro
        app1.status = "cancelado"
        app1.save(update_fields=["status"])

        # Novo agendamento deve ser aceito sem IntegrityError
        user2 = User.objects.create_user(username="patient2_slot", password="Password123!")
        patient2 = PatientUser.objects.create(user=user2)

        app2 = Appointment.objects.create(
            patient=patient2,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time,
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )
        self.assertIsNotNone(app2.id)

    # -------------------------------------------------------------
    # 3. Brazilian CPF & CNS Validation
    # -------------------------------------------------------------
    @override_settings(STRICT_CPF_VALIDATION=True)
    def test_cpf_validator_modulo11(self):
        """Testa o cálculo do Módulo 11 de CPFs brasileiros reais."""
        # CPF válido conhecido (exemplo de teste com DV correto)
        valid_cpf = "52998224725"
        self.assertEqual(validate_brazilian_cpf(valid_cpf), valid_cpf)

        # CPF com DV incorreto
        invalid_cpf = "52998224728"
        with self.assertRaises(ValidationError):
            validate_brazilian_cpf(invalid_cpf)

        # CPF repetido
        repeated_cpf = "11111111111"
        with self.assertRaises(ValidationError):
            validate_brazilian_cpf(repeated_cpf)

        # CPF com tamanho incorreto
        short_cpf = "12345"
        with self.assertRaises(ValidationError):
            validate_brazilian_cpf(short_cpf)

    @override_settings(STRICT_CNS_VALIDATION=True)
    def test_cns_validator_rules(self):
        """Testa regras do Cartão Nacional de Saúde (CNS)."""
        # CNS definitivo válido (inicia com 1 ou 2)
        # Exemplo canônico calculado: 1 00 0003 5555 0004
        valid_cns_def = "100000355550004"
        self.assertEqual(validate_cns(valid_cns_def), valid_cns_def)

        # CNS provisório com soma múltipla de 11 (inicia com 7, 8 ou 9)
        # 700000000000000: soma = 7*15 = 105 -> 105 % 11 = 6 -> soma=110 => 700000000000005: 7*15 + 5*1 = 110 % 11 == 0
        valid_cns_prov = "700000000000005"
        self.assertEqual(validate_cns(valid_cns_prov), valid_cns_prov)

        # CNS inválido de tamanho errado
        with self.assertRaises(ValidationError):
            validate_cns("12345")

        # CNS com início inválido (ex: 3)
        with self.assertRaises(ValidationError):
            validate_cns("300000000000000")

    # -------------------------------------------------------------
    # 4. Lifecycle: Soft Delete Cascade to Appointments
    # -------------------------------------------------------------
    def test_soft_deleting_patient_cancels_future_appointments(self):
        """
        Ao deletar logicamente um paciente, seus agendamentos futuros ativos
        são automaticamente cancelados para liberar a agenda do profissional.
        """
        app = Appointment.objects.create(
            patient=self.patient,
            professional=self.prof,
            scheduled_datetime=self.scheduled_time,
            type="Consulta",
            risk_level="Seguro",
            status="ativo",
        )
        self.assertEqual(app.status, "ativo")

        # Deleta logicamente o paciente
        self.patient.delete()
        self.assertTrue(self.patient.is_deleted)

        # O agendamento deve ter sido cancelado automaticamente
        app.refresh_from_db()
        self.assertEqual(app.status, "cancelado")

    # -------------------------------------------------------------
    # 5. Search Filter on Patients Viewset
    # -------------------------------------------------------------
    def test_patient_search_includes_sus_without_field_error(self):
        """
        Verifica que a busca de pacientes por texto livre (?search=...) funciona
        perfeitamente e busca por nome, CPF e Cartão SUS sem lançar FieldError.
        """
        self.client.force_authenticate(user=self.manager_user)

        # Busca por nome
        res1 = self.client.get("/api/v1/accounts/patients/?search=Maria")
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        data1 = res1.data.get("results", res1.data)
        self.assertTrue(len(data1) >= 1)

        # Busca por Cartão SUS
        res2 = self.client.get("/api/v1/accounts/patients/?search=123456789012345")
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        data2 = res2.data.get("results", res2.data)
        self.assertTrue(len(data2) >= 1)
