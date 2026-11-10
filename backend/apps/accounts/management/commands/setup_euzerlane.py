from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.accounts.models import ProfessionalUser, ManagerUser, PatientUser, AccountLockout
from apps.appointments.models import Appointment
from apps.alerts.models import Alert
from apps.conditions.models import HAS, DM, OtherDCNT
from apps.medications.models import Medication
from apps.pendencies.models import Pendency

User = get_user_model()


class Command(BaseCommand):
    help = "Cria a conta da Enfermeira Euzerlane e zera a base de pacientes para produção."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default="Euzerlane@123",
            help="Senha para a conta de Euzerlane (padrão: Euzerlane@123)",
        )
        parser.add_argument(
            "--keep-patients",
            action="store_true",
            help="Não zerar a base de pacientes",
        )

    def handle(self, *args, **options):
        password = options["password"]
        keep_patients = options["keep_patients"]

        if not keep_patients:
            self.stdout.write(self.style.NOTICE("🧹 Zerando registros de pacientes e dados clínicos..."))
            Appointment.all_objects.all().hard_delete()
            Alert.all_objects.all().hard_delete()
            HAS.all_objects.all().hard_delete()
            DM.all_objects.all().hard_delete()
            OtherDCNT.all_objects.all().hard_delete()
            Medication.all_objects.all().hard_delete()
            Pendency.all_objects.all().hard_delete()

            patient_user_ids = list(PatientUser.all_objects.values_list("user_id", flat=True))
            PatientUser.all_objects.all().hard_delete()
            if patient_user_ids:
                User.objects.filter(id__in=patient_user_ids).delete()
            self.stdout.write(self.style.SUCCESS("✔ Base de pacientes zerada com sucesso."))

        AccountLockout.objects.filter(identifier__in=["euzerlane", "gestor", "admin"]).delete()

        # Criar conta Euzerlane
        euzerlane_user, created = User.objects.get_or_create(
            username="euzerlane",
            defaults={
                "first_name": "Euzerlane",
                "last_name": "",
                "email": "euzerlane@rastreiamais.local",
                "is_active": True,
            },
        )
        euzerlane_user.first_name = "Euzerlane"
        euzerlane_user.is_active = True
        euzerlane_user.set_password(password)
        euzerlane_user.save()

        prof, _ = ProfessionalUser.all_objects.get_or_create(
            user=euzerlane_user,
            defaults={
                "role": "Enfermeiro",
            },
        )
        prof.role = "Enfermeiro"
        prof.is_deleted = False
        prof.save()

        self.stdout.write(self.style.SUCCESS(f"✔ Enfermeira Euzerlane configurada: username='euzerlane' | senha='{password}'"))

        # Garantir Gestor
        gestor_user, _ = User.objects.get_or_create(
            username="gestor",
            defaults={
                "first_name": "Gestor",
                "last_name": "SUS",
                "email": "gestor@rastreiamais.local",
                "is_active": True,
            },
        )
        gestor_user.set_password("Senha@123")
        gestor_user.is_active = True
        gestor_user.save()

        ManagerUser.all_objects.get_or_create(
            user=gestor_user,
            defaults={"phone": "(83) 98888-7777"},
        )
        self.stdout.write(self.style.SUCCESS("✔ Gestor garantido: username='gestor' | senha='Senha@123'"))
