import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import ManagerUser, ProfessionalUser, PatientUser
from apps.locations.models import Address, Institution
from apps.conditions.models import HAS, DM
from apps.appointments.models import Appointment
from apps.alerts.models import Alert

User = get_user_model()

DEFAULT_PASSWORD = "Senha@123"


class Command(BaseCommand):
    help = "Popula o banco de dados com usuários e dados de teste para desenvolvimento local."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default=DEFAULT_PASSWORD,
            help=f"Senha padrão para os usuários de desenvolvimento (padrão: {DEFAULT_PASSWORD})",
        )

    def handle(self, *args, **options):
        password = options["password"]
        self.stdout.write(self.style.NOTICE("🌱 Iniciando criação/atualização de dados para ambiente DEV/LOCAL..."))

        # 1. Superuser / Admin
        admin_user, _ = User.objects.get_or_create(
            username="admin",
            defaults={
                "email": "admin@rastreiamais.local",
                "first_name": "Administrador",
                "last_name": "Sistema",
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            },
        )
        admin_user.set_password(password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.save()
        self.stdout.write(self.style.SUCCESS(f"✔ Superuser: admin | Senha: {password}"))

        # 2. Gestor (Manager)
        gestor_user, _ = User.objects.get_or_create(
            username="gestor",
            defaults={
                "email": "gestor@rastreiamais.local",
                "first_name": "Gestor",
                "last_name": "SUS",
                "is_active": True,
            },
        )
        gestor_user.set_password(password)
        gestor_user.save()

        gestor_profile, _ = ManagerUser.objects.get_or_create(
            user=gestor_user,
            defaults={"phone": "(83) 98888-7777"},
        )
        self.stdout.write(self.style.SUCCESS(f"✔ Gestor: gestor | Senha: {password}"))

        # 3. Profissional de Saúde (Médico)
        prof_user, _ = User.objects.get_or_create(
            username="profissional",
            defaults={
                "email": "profissional@rastreiamais.local",
                "first_name": "Carlos",
                "last_name": "Silva",
                "is_active": True,
            },
        )
        prof_user.set_password(password)
        prof_user.save()

        prof_profile, _ = ProfessionalUser.objects.get_or_create(
            user=prof_user,
            defaults={
                "role": "Médico",
                "professional_registry": "CRM/PB 12345",
            },
        )
        self.stdout.write(self.style.SUCCESS(f"✔ Profissional: profissional | Senha: {password}"))

        # 4. Paciente
        paciente_user, _ = User.objects.get_or_create(
            username="paciente",
            defaults={
                "email": "paciente@rastreiamais.local",
                "first_name": "Maria",
                "last_name": "Oliveira",
                "is_active": True,
            },
        )
        paciente_user.set_password(password)
        paciente_user.save()

        paciente_profile, _ = PatientUser.objects.get_or_create(
            user=paciente_user,
            defaults={
                "cpf": "11144477735",
                "sus": "700000000000000",
                "birth_date": datetime.date(1980, 5, 15),
                "gender": "Feminino",
                "phone": "(83) 99999-1111",
            },
        )
        if not paciente_profile.cpf:
            paciente_profile.cpf = "11144477735"
            paciente_profile.save()

        # Condição HAS e DM
        HAS.objects.get_or_create(
            patient=paciente_profile,
            defaults={
                "is_diagnosed": True,
                "uses_medication": "Sim",
                "medications_name": "Losartana 50mg",
                "family_history": True,
            },
        )
        DM.objects.get_or_create(
            patient=paciente_profile,
            defaults={
                "is_diagnosed": False,
                "family_history": True,
            },
        )
        self.stdout.write(self.style.SUCCESS(f"✔ Paciente: paciente (CPF: 111.444.777-35) | Senha: {password}"))

        # Atualiza usuários legados se existirem
        for legacy_username in ["test_pr", "test_p"]:
            try:
                lu = User.objects.get(username=legacy_username)
                lu.set_password(password)
                lu.save()
                self.stdout.write(self.style.SUCCESS(f"✔ Usuário de teste legado: {legacy_username} | Senha: {password}"))
            except User.DoesNotExist:
                pass

        # 5. Local / UBS
        address, _ = Address.objects.get_or_create(
            street="Rua das Flores",
            number="120",
            district="Jardim Magnólia",
            city="Campina Grande",
            uf="PB",
            defaults={"zipcode": "58400-000"},
        )
        ubs, _ = Institution.objects.get_or_create(
            name="UBS Jardim Magnólia",
            defaults={"address": address},
        )

        # 6. Agendamentos de Demonstração
        now = timezone.now()
        app1, created1 = Appointment.objects.get_or_create(
            patient=paciente_profile,
            professional=prof_profile,
            scheduled_datetime=now + datetime.timedelta(hours=2),
            defaults={
                "local": ubs,
                "risk_level": "Crítico",
                "type": "Consulta",
                "status": "ativo",
                "description": "Consulta de emergência para controle pressórico (PA > 180 mmHg).",
            },
        )
        app2, created2 = Appointment.objects.get_or_create(
            patient=paciente_profile,
            professional=prof_profile,
            scheduled_datetime=now + datetime.timedelta(days=2, hours=4),
            defaults={
                "local": ubs,
                "risk_level": "Moderado",
                "type": "Retorno",
                "status": "ativo",
                "description": "Retorno para avaliação de ajuste posológico de Losartana.",
            },
        )
        self.stdout.write(self.style.SUCCESS("✔ 2 Agendamentos clínicos criados para Dr. Carlos e Maria Oliveira"))

        # 7. Alertas de Demonstração
        Alert.objects.get_or_create(
            patient=paciente_profile,
            title="Pressão Arterial Crítica (180/110 mmHg)",
            defaults={
                "description": "Aferição residencial acusou pico hipertensivo. Paciente relata cefaleia occiptal.",
                "risk_level": "critical",
                "status": "pending",
            },
        )
        Alert.objects.get_or_create(
            patient=paciente_profile,
            title="Glicemia de Jejum Elevada (145 mg/dL)",
            defaults={
                "description": "Exame laboratorial recente aponta pré-diabetes com necessidade de avaliação nutricional.",
                "risk_level": "moderate",
                "status": "pending",
            },
        )
        self.stdout.write(self.style.SUCCESS("✔ 2 Alertas clínicos criados (1 Crítico, 1 Moderado)"))

        self.stdout.write(self.style.SUCCESS("\n🎉 Base de dados local configurada com sucesso para desenvolvimento!"))
