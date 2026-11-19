from io import StringIO

from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import (
    AccountLockout,
    ManagerUser,
    PatientUser,
    ProfessionalUser,
)
from apps.accounts.utils.provisioning import (
    DEFAULT_PROFESSIONAL_ACCOUNTS,
    ensure_professional_account,
)

User = get_user_model()


class SetupProfessionalsTest(APITestCase):
    def test_migration_provisioned_carolina_and_jessica(self):
        for spec in DEFAULT_PROFESSIONAL_ACCOUNTS:
            user = User.objects.get(username=spec["username"])
            self.assertTrue(user.is_active)
            self.assertFalse(user.is_staff)
            self.assertEqual(user.first_name, spec["first_name"])
            self.assertEqual(user.email, spec["email"])
            self.assertTrue(user.check_password(spec["password"]))

            prof = ProfessionalUser.objects.get(user=user)
            self.assertEqual(prof.role, spec["role"])
            self.assertFalse(prof.is_deleted)

    def test_carolina_and_jessica_can_login_with_email_and_username(self):
        for spec in DEFAULT_PROFESSIONAL_ACCOUNTS:
            for identifier in (spec["email"], spec["username"]):
                token_resp = self.client.post(
                    "/api/token/",
                    {"username": identifier, "password": spec["password"]},
                    format="json",
                )
                self.assertEqual(token_resp.status_code, status.HTTP_200_OK)
                access = token_resp.data["access"]

                self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access}")
                me_resp = self.client.get("/api/auth/me")
                self.assertEqual(me_resp.status_code, status.HTTP_200_OK)
                self.assertEqual(me_resp.data["user"]["username"], spec["username"])
                self.assertEqual(me_resp.data["roles"], ["PROFESSIONAL"])
                self.client.credentials()

    def test_setup_professionals_command_preserves_custom_password_by_default(self):
        carolina = User.objects.get(username="carolina")
        carolina.set_password("NovaSenhaSegura@2026")
        carolina.save()

        out = StringIO()
        call_command("setup_professionals", stdout=out)

        carolina.refresh_from_db()
        self.assertTrue(carolina.check_password("NovaSenhaSegura@2026"))
        self.assertIn("carolina@rastreiamais.com", out.getvalue())

    def test_setup_professionals_unlock_restores_soft_deleted_and_clears_lockout(self):
        jessica_prof = ProfessionalUser.objects.get(user__username="jessica")
        jessica_prof.delete()
        AccountLockout.objects.create(
            identifier="jessica@rastreiamais.com",
            failed_attempts=5,
        )

        call_command("setup_professionals", unlock=True, stdout=StringIO())

        jessica_prof.refresh_from_db()
        self.assertFalse(jessica_prof.is_deleted)
        self.assertIsNone(jessica_prof.deleted_at)
        self.assertFalse(
            AccountLockout.objects.filter(identifier="jessica@rastreiamais.com").exists()
        )

    def test_setup_professionals_reset_passwords_restores_defaults(self):
        carolina = User.objects.get(username="carolina")
        carolina.set_password("SenhaTemporaria@999")
        carolina.save()

        call_command("setup_professionals", reset_passwords=True, stdout=StringIO())

        carolina.refresh_from_db()
        self.assertTrue(carolina.check_password("Carolina@123"))

    def test_provisioning_rejects_user_with_conflicting_patient_profile(self):
        patient_user = User.objects.create_user(
            username="conflito_prof",
            email="conflito@rastreiamais.com",
            password="Password@123",
        )
        PatientUser.objects.create(user=patient_user, cpf="55544433322")

        with self.assertRaises(ValueError):
            ensure_professional_account(
                user_model=User,
                professional_model=ProfessionalUser,
                lockout_model=AccountLockout,
                patient_model=PatientUser,
                manager_model=ManagerUser,
                username="conflito_prof",
                first_name="Conflito",
                last_name="",
                email="conflito@rastreiamais.com",
                password="Password@123",
                role="Enfermeiro",
            )
