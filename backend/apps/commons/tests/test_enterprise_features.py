import os
import gzip
import tempfile
import hashlib
from datetime import timedelta
from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status

from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.accounts.models_security import AccountLockout
from apps.appointments.models import Appointment
from apps.alerts.models import Alert
from apps.reports.signals import get_kpis_cache_version, invalidate_dashboard_kpis_cache
from django.core.management import call_command


class EnterpriseFeaturesTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="lockout_user", password="CorrectPassword123!", email="lockout@teste.com"
        )
        self.manager = ManagerUser.objects.create(user=self.user, phone="83999999999")

    def test_account_lockout_after_consecutive_failures(self):
        # 1. 4 tentativas incorretas não bloqueiam ainda
        for _ in range(4):
            resp = self.client.post("/api/token/", {"username": "lockout_user", "password": "WrongPassword!"})
            self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

        self.assertFalse(AccountLockout.objects.get(identifier="lockout_user").is_locked())

        # 2. 5ª tentativa incorreta bloqueia a conta
        resp = self.client.post("/api/token/", {"username": "lockout_user", "password": "WrongPassword!"})
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bloqueada", str(resp.data.get("detail", "")).lower())

        lockout = AccountLockout.objects.get(identifier="lockout_user")
        self.assertTrue(lockout.is_locked())

        # 3. Tentativas adicionais (mesmo com a senha certa) são rejeitadas durante o bloqueio
        resp_blocked = self.client.post("/api/token/", {"username": "lockout_user", "password": "CorrectPassword123!"})
        self.assertEqual(resp_blocked.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("bloqueada", str(resp_blocked.data.get("detail", "")).lower())

        # 4. Reset manual ou expiração restaura o acesso
        AccountLockout.reset_attempts("lockout_user")
        resp_success = self.client.post("/api/token/", {"username": "lockout_user", "password": "CorrectPassword123!"})
        self.assertEqual(resp_success.status_code, status.HTTP_200_OK)
        self.assertIn("access", resp_success.data)

    def test_dashboard_kpis_caching_and_signal_invalidation(self):
        self.client.force_authenticate(user=self.user)

        # 1. Primeira consulta gera cache
        resp1 = self.client.get("/api/v1/reports/kpis/")
        self.assertEqual(resp1.status_code, status.HTTP_200_OK)
        initial_version = get_kpis_cache_version()

        # 2. Segunda consulta utiliza a mesma versão de cache
        resp2 = self.client.get("/api/v1/reports/kpis/")
        self.assertEqual(resp2.status_code, status.HTTP_200_OK)
        self.assertEqual(get_kpis_cache_version(), initial_version)

        # 3. Criação de um novo alerta dispara sinal e incrementa a versão do cache
        patient_user = User.objects.create_user(username="patient_kpi", password="Pwd")
        patient = PatientUser.objects.create(user=patient_user, cpf="11122233344")
        Alert.objects.create(
            patient=patient,
            title="Alerta Teste",
            description="Descrição",
            risk_level="critical",
            status="pending"
        )

        new_version = get_kpis_cache_version()
        self.assertGreater(new_version, initial_version)

        # 4. Próxima consulta já retorna os dados atualizados com o novo alerta crítico
        resp3 = self.client.get("/api/v1/reports/kpis/")
        self.assertEqual(resp3.status_code, status.HTTP_200_OK)
        self.assertEqual(resp3.data["critical_alerts"], 1)

    def test_backup_and_restore_database_command(self):
        with tempfile.TemporaryDirectory() as tmpdir:
            # 1. Executa backup
            call_command("backup_database", output_dir=tmpdir, keep_last=3)

            backups = [f for f in os.listdir(tmpdir) if f.endswith(".json.gz")]
            self.assertEqual(len(backups), 1)
            backup_file = os.path.join(tmpdir, backups[0])
            checksum_file = f"{backup_file}.sha256"
            self.assertTrue(os.path.exists(checksum_file))

            # 2. Testa restauração válida
            call_command("restore_database", file=backup_file)

            # 3. Testa detecção de corrupção (hash adulterado)
            with open(backup_file, "ab") as f:
                f.write(b"tampering_data")

            with self.assertRaises(Exception):
                call_command("restore_database", file=backup_file)

    def test_anonymize_patient_data_command(self):
        patient_user = User.objects.create_user(
            username="real_patient",
            first_name="NomeReal",
            last_name="SobrenomeReal",
            email="real@saude.gov.br"
        )
        patient = PatientUser.objects.create(
            user=patient_user,
            cpf="12345678909",
            sus="123456789012345",
            phone="83988887777"
        )

        # 1. Dry run não altera dados
        call_command("anonymize_patient_data", dry_run=True)
        patient.refresh_from_db()
        patient_user.refresh_from_db()
        self.assertEqual(patient_user.first_name, "NomeReal")
        self.assertEqual(patient.cpf, "12345678909")

        # 2. Execução com --confirm anonimiza PII
        call_command("anonymize_patient_data", confirm=True)
        patient.refresh_from_db()
        patient_user.refresh_from_db()

        self.assertEqual(patient_user.first_name, "Paciente")
        self.assertIn("Anonimizado", patient_user.last_name)
        self.assertIn("@anonimizado.local", patient_user.email)
        self.assertNotEqual(patient.cpf, "12345678909")
        self.assertEqual(patient.phone, "83999990000")
        self.assertFalse(patient.whatsapp)
