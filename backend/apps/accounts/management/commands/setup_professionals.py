from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from apps.accounts.models import (
    AccountLockout,
    ManagerUser,
    PatientUser,
    ProfessionalUser,
)
from apps.accounts.utils.provisioning import ensure_default_professionals

User = get_user_model()


class Command(BaseCommand):
    help = "Garante as contas das profissionais Carolina e Jessica (Enfermeiras) no banco de dados."

    def add_arguments(self, parser):
        parser.add_argument(
            "--reset-passwords",
            action="store_true",
            help="Redefine as senhas para os valores iniciais e limpa bloqueios de login.",
        )
        parser.add_argument(
            "--unlock",
            action="store_true",
            help="Remove bloqueios de login (AccountLockout) dessas contas.",
        )

    def handle(self, *args, **options):
        reset_passwords = options["reset_passwords"]
        unlock = options["unlock"] or reset_passwords

        results = ensure_default_professionals(
            user_model=User,
            professional_model=ProfessionalUser,
            lockout_model=AccountLockout,
            patient_model=PatientUser,
            manager_model=ManagerUser,
            reset_password=reset_passwords,
            unlock=unlock,
        )

        for user, prof, created in results:
            status_label = "criada" if created else "verificada"
            self.stdout.write(
                self.style.SUCCESS(
                    f"✔ Profissional {status_label}: "
                    f"nome='{user.first_name}' | username='{user.username}' | "
                    f"email='{user.email}' | cargo='{prof.role}'"
                )
            )
