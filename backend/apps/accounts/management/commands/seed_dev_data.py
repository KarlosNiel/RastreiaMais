import datetime
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.accounts.models import ManagerUser, ProfessionalUser, PatientUser
from apps.locations.models import Address, Institution, MicroArea
from apps.conditions.models import HAS, DM, OtherDCNT
from apps.appointments.models import Appointment
from apps.alerts.models import Alert
from apps.medications.models import Medication

User = get_user_model()

DEFAULT_PASSWORD = "Senha@123"


class Command(BaseCommand):
    help = "Popula o banco de dados com usuários e dados clínicos realistas para desenvolvimento e testes analíticos."

    def add_arguments(self, parser):
        parser.add_argument(
            "--password",
            type=str,
            default=DEFAULT_PASSWORD,
            help=f"Senha padrão para os usuários de desenvolvimento (padrão: {DEFAULT_PASSWORD})",
        )

    def handle(self, *args, **options):
        password = options["password"]
        self.stdout.write(self.style.NOTICE("🌱 Iniciando criação/atualização de dados clínicos para ambiente DEV/LOCAL..."))

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

        # 3. Profissionais de Saúde (Dr. Carlos - Médico & Euzerlane - Enfermeira)
        prof_carlos_user, _ = User.objects.get_or_create(
            username="profissional",
            defaults={
                "email": "profissional@rastreiamais.local",
                "first_name": "Carlos",
                "last_name": "Silva",
                "is_active": True,
            },
        )
        prof_carlos_user.set_password(password)
        prof_carlos_user.save()

        prof_carlos, _ = ProfessionalUser.objects.get_or_create(
            user=prof_carlos_user,
            defaults={
                "role": "Médico",
                "professional_registry": "CRM/PB 12345",
            },
        )
        prof_carlos.is_deleted = False
        prof_carlos.save()

        prof_euzerlane_user, _ = User.objects.get_or_create(
            username="euzerlane",
            defaults={
                "email": "euzerlane@rastreiamais.com",
                "first_name": "Euzerlane",
                "last_name": "Medeiros",
                "is_active": True,
            },
        )
        prof_euzerlane_user.set_password(password)
        prof_euzerlane_user.save()

        prof_euzerlane, _ = ProfessionalUser.objects.get_or_create(
            user=prof_euzerlane_user,
            defaults={
                "role": "Enfermeiro",
                "professional_registry": "COREN/PB 654321",
            },
        )
        prof_euzerlane.is_deleted = False
        prof_euzerlane.save()

        self.stdout.write(self.style.SUCCESS(f"✔ Profissionais configurados: Carlos (Médico) e Euzerlane (Enfermeira)"))

        # 4. Localização (UBS & Microárea)
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
        microarea, _ = MicroArea.objects.get_or_create(
            name="Microárea 01 - Jardim Magnólia",
        )

        # 5. Cohort de Pacientes com DCNTs (HAS, DM, Framingham e Controle)
        patient_definitions = [
            {
                "username": "paciente",
                "first_name": "Maria",
                "last_name": "Oliveira",
                "cpf": "11144477735",
                "sus": "700000000000001",
                "birth_date": datetime.date(1962, 5, 15),
                "gender": "Feminino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "NORMAL",
                    "systolic": 120,
                    "diastolic": 78,
                    "framingham": "BAIXO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
            {
                "username": "joao_batista",
                "first_name": "João",
                "last_name": "Batista dos Santos",
                "cpf": "22255588846",
                "sus": "700000000000002",
                "birth_date": datetime.date(1956, 3, 20),
                "gender": "Masculino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "HIPERTENSO_E2",
                    "systolic": 165,
                    "diastolic": 102,
                    "framingham": "ALTO",
                    "conduct": "ENCAMINHAMENTO_MEDICO",
                },
                "dm": {
                    "diagnosed": True,
                    "med": "SIM",
                    "result": "DIAGNOSTICO_CONFIRMADO",
                    "treatment": "INSULINA",
                    "glucose": "178",
                    "hba1c": 8.5,
                },
            },
            {
                "username": "ana_lucia",
                "first_name": "Ana Lúcia",
                "last_name": "Ferreira",
                "cpf": "33366699957",
                "sus": "700000000000003",
                "birth_date": datetime.date(1953, 8, 10),
                "gender": "Feminino",
                "has": {
                    "diagnosed": True,
                    "med": "IRREGULAR",
                    "bp_class": "HIPERTENSO_E3",
                    "systolic": 188,
                    "diastolic": 114,
                    "framingham": "ALTO",
                    "conduct": "ENCAMINHAMENTO_MEDICO",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
            {
                "username": "marcos_lima",
                "first_name": "Marcos Vinícius",
                "last_name": "Lima",
                "cpf": "44477700068",
                "sus": "700000000000004",
                "birth_date": datetime.date(1970, 11, 4),
                "gender": "Masculino",
                "has": {
                    "diagnosed": False,
                    "med": "NAO",
                    "bp_class": "PRE_HIPERTENSO",
                    "systolic": 134,
                    "diastolic": 86,
                    "framingham": "BAIXO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": True,
                    "med": "SIM",
                    "result": "DIAGNOSTICO_CONFIRMADO",
                    "treatment": "MEDICAMENTOSO",
                    "glucose": "142",
                    "hba1c": 7.4,
                },
            },
            {
                "username": "francisca_pereira",
                "first_name": "Francisca",
                "last_name": "Pereira",
                "cpf": "55588811179",
                "sus": "700000000000005",
                "birth_date": datetime.date(1965, 1, 28),
                "gender": "Feminino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "HIPERTENSO_E1",
                    "systolic": 146,
                    "diastolic": 92,
                    "framingham": "MODERADO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": True,
                    "med": "SIM",
                    "result": "DIAGNOSTICO_CONFIRMADO",
                    "treatment": "MEDICAMENTOSO",
                    "glucose": "128",
                    "hba1c": 6.9,
                },
            },
            {
                "username": "raimundo_nonato",
                "first_name": "Raimundo",
                "last_name": "Nonato Costa",
                "cpf": "66699922280",
                "sus": "700000000000006",
                "birth_date": datetime.date(1976, 7, 19),
                "gender": "Masculino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "NORMAL",
                    "systolic": 122,
                    "diastolic": 76,
                    "framingham": "BAIXO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
            {
                "username": "tereza_cristina",
                "first_name": "Tereza Cristina",
                "last_name": "Silva",
                "cpf": "77700033391",
                "sus": "700000000000007",
                "birth_date": datetime.date(1979, 9, 12),
                "gender": "Feminino",
                "has": {
                    "diagnosed": False,
                    "med": "NAO",
                    "bp_class": "NORMAL",
                    "systolic": 118,
                    "diastolic": 74,
                    "framingham": "BAIXO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": True,
                    "med": "SIM",
                    "result": "GLICEMIA_ALTERADA",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                    "glucose": "112",
                    "hba1c": 6.2,
                },
            },
            {
                "username": "sebastiao_costa",
                "first_name": "Sebastião",
                "last_name": "Costa",
                "cpf": "88811144402",
                "sus": "700000000000008",
                "birth_date": datetime.date(1961, 12, 5),
                "gender": "Masculino",
                "has": {
                    "diagnosed": True,
                    "med": "IRREGULAR",
                    "bp_class": "HIPERTENSO_E1",
                    "systolic": 152,
                    "diastolic": 96,
                    "framingham": "MODERADO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
            {
                "username": "gracas_alves",
                "first_name": "Maria das Graças",
                "last_name": "Alves",
                "cpf": "99922255513",
                "sus": "700000000000009",
                "birth_date": datetime.date(1958, 4, 22),
                "gender": "Feminino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "HIPERTENSO_E2",
                    "systolic": 168,
                    "diastolic": 100,
                    "framingham": "ALTO",
                    "conduct": "ENCAMINHAMENTO_MEDICO",
                },
                "dm": {
                    "diagnosed": True,
                    "med": "SIM",
                    "result": "DIAGNOSTICO_CONFIRMADO",
                    "treatment": "INSULINA",
                    "glucose": "194",
                    "hba1c": 9.2,
                },
            },
            {
                "username": "jose_ribamar",
                "first_name": "José Ribamar",
                "last_name": "Souza",
                "cpf": "12332145600",
                "sus": "700000000000010",
                "birth_date": datetime.date(1950, 6, 30),
                "gender": "Masculino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "HIPERTENSO_E2",
                    "systolic": 172,
                    "diastolic": 104,
                    "framingham": "ALTO",
                    "conduct": "ENCAMINHAMENTO_MEDICO",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
            {
                "username": "luciana_rodrigues",
                "first_name": "Luciana",
                "last_name": "Rodrigues",
                "cpf": "23443256711",
                "sus": "700000000000011",
                "birth_date": datetime.date(1985, 10, 14),
                "gender": "Feminino",
                "has": {
                    "diagnosed": False,
                    "med": "NAO",
                    "bp_class": "PRE_HIPERTENSO",
                    "systolic": 136,
                    "diastolic": 88,
                    "framingham": "BAIXO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
            {
                "username": "antonio_carlos",
                "first_name": "Antônio Carlos",
                "last_name": "Mendes",
                "cpf": "34554367822",
                "sus": "700000000000012",
                "birth_date": datetime.date(1969, 2, 8),
                "gender": "Masculino",
                "has": {
                    "diagnosed": True,
                    "med": "SIM",
                    "bp_class": "PRE_HIPERTENSO",
                    "systolic": 132,
                    "diastolic": 84,
                    "framingham": "MODERADO",
                    "conduct": "ACOMPANHAMENTO_APS",
                },
                "dm": {
                    "diagnosed": False,
                    "med": "NAO",
                    "result": "NORMAL",
                    "treatment": "ALIMENTAR_ESTILO_VIDA",
                },
            },
        ]

        created_patients = []
        for i, pdata in enumerate(patient_definitions):
            u, _ = User.objects.get_or_create(
                username=pdata["username"],
                defaults={
                    "first_name": pdata["first_name"],
                    "last_name": pdata["last_name"],
                    "email": f"{pdata['username']}@rastreiamais.local",
                    "is_active": True,
                },
            )
            u.first_name = pdata["first_name"]
            u.last_name = pdata["last_name"]
            u.set_password(password)
            u.save()

            patient_addr, _ = Address.objects.get_or_create(
                street=f"Rua das Acácias, Lote {i + 1}",
                number=str(100 + i * 10),
                district="Jardim Magnólia",
                city="Campina Grande",
                uf="PB",
                defaults={"zipcode": "58400-000"},
            )

            patient_prof, _ = PatientUser.objects.get_or_create(
                user=u,
                defaults={
                    "cpf": pdata["cpf"],
                    "sus": pdata["sus"],
                    "birth_date": pdata["birth_date"],
                    "gender": pdata["gender"],
                    "phone": "(83) 98765-4321",
                    "micro_area": microarea,
                    "address": patient_addr,
                },
            )
            patient_prof.is_deleted = False
            patient_prof.cpf = pdata["cpf"]
            patient_prof.sus = pdata["sus"]
            patient_prof.save()
            created_patients.append(patient_prof)

            # HAS
            hinfo = pdata["has"]
            HAS.objects.update_or_create(
                patient=patient_prof,
                defaults={
                    "is_diagnosed": hinfo.get("diagnosed", False),
                    "uses_medication": hinfo.get("med", "NAO"),
                    "BP_classifications": hinfo.get("bp_class", "NORMAL"),
                    "BP_assessment1_1": hinfo.get("systolic", 120),
                    "BP_assessment1_2": hinfo.get("diastolic", 80),
                    "framingham_score": hinfo.get("framingham", "BAIXO"),
                    "conduct_adopted": hinfo.get("conduct", "ACOMPANHAMENTO_APS"),
                    "is_deleted": False,
                },
            )

            # DM
            dinfo = pdata["dm"]
            DM.objects.update_or_create(
                patient=patient_prof,
                defaults={
                    "is_diagnosed": dinfo.get("diagnosed", False),
                    "uses_medication": dinfo.get("med", "NAO"),
                    "screening_result": dinfo.get("result", "NORMAL"),
                    "treatment_type": dinfo.get("treatment", "ALIMENTAR_ESTILO_VIDA"),
                    "fasting_capillary_blood_glucose": dinfo.get("glucose", "92"),
                    "glycated_hemoglobin": dinfo.get("hba1c", 5.6),
                    "is_deleted": False,
                },
            )

        self.stdout.write(self.style.SUCCESS(f"✔ 12 Pacientes criados/atualizados com perfis clínicos completos."))

        # 6. Agendamentos Clínicos Variados para Dr. Carlos e Euzerlane
        now = timezone.now()
        Appointment.objects.filter(patient__in=created_patients).delete()

        appt_configs = [
            (created_patients[2], prof_carlos, now + datetime.timedelta(hours=1), "Crítico", "Consulta", "ativo", "Crise hipertensiva (PA 188/114). Necessidade urgente de ajuste farmacológico."),
            (created_patients[1], prof_carlos, now + datetime.timedelta(hours=3), "Crítico", "Consulta", "ativo", "Descompensação glicêmica e controle cardiovascular associado."),
            (created_patients[8], prof_euzerlane, now + datetime.timedelta(days=1, hours=2), "Crítico", "Avaliação", "ativo", "Avaliação de lesão em extremidade inferior (pé diabético) e renovação de curativo."),
            (created_patients[4], prof_carlos, now + datetime.timedelta(days=1, hours=4), "Moderado", "Retorno", "ativo", "Retorno para titulação de Enalapril e Metformina."),
            (created_patients[0], prof_euzerlane, now + datetime.timedelta(days=2, hours=1), "Seguro", "Consulta", "ativo", "Acompanhamento de rotina na APS. Paciente assintomática e controlada."),
            (created_patients[3], prof_carlos, now + datetime.timedelta(days=2, hours=3), "Moderado", "Consulta", "ativo", "Ajuste na dose de antidiabético oral pós-exames."),
            (created_patients[7], prof_euzerlane, now + datetime.timedelta(days=3, hours=2), "Moderado", "Avaliação", "ativo", "Avaliação de adesão e aconselhamento sobre estilo de vida."),
            (created_patients[5], prof_carlos, now - datetime.timedelta(days=2), "Seguro", "Consulta", "finalizado", "Consulta de rotina concluída. Metas pressóricas atingidas."),
            (created_patients[6], prof_euzerlane, now - datetime.timedelta(days=1), "Seguro", "Consulta", "finalizado", "Atendimento de enfermagem concluído com orientações alimentares."),
            (created_patients[9], prof_carlos, now - datetime.timedelta(days=3), "Crítico", "Consulta", "finalizado", "Atendimento médico finalizado e encaminhado para cardiologia."),
            (created_patients[10], prof_carlos, now - datetime.timedelta(days=4), "Seguro", "Consulta", "cancelado", "Paciente desmarcou por motivos pessoais de trabalho."),
        ]

        for p, prof, dt, risk, atype, status, desc in appt_configs:
            Appointment.objects.create(
                patient=p,
                professional=prof,
                local=ubs,
                scheduled_datetime=dt,
                risk_level=risk,
                type=atype,
                status=status,
                description=desc,
            )

        self.stdout.write(self.style.SUCCESS(f"✔ 11 Agendamentos criados com diferentes status e riscos."))

        # 7. Alertas Clínicos
        Alert.objects.filter(patient__in=created_patients).delete()
        alerts_data = [
            (created_patients[2], "Pico Hipertensivo Crítico (188/114 mmHg)", "Aferição domiciliar acusou PA em estágio 3 com cefaleia intensa. Paciente requer atendimento presencial prioritário.", "critical", "pending"),
            (created_patients[8], "Hiperglicemia Grave & Suspeita de Infecção", "Glicemia capilar matinal de 194 mg/dL e queixa de dormência persistente em membros inferiores.", "critical", "pending"),
            (created_patients[1], "Comorbidade Não Controlada (HAS E2 + DM)", "Paciente necessita de renovação de receita para Insulina NPH e reavaliação de função renal.", "moderate", "pending"),
            (created_patients[4], "Adesão Irregular a Medicamentos", "Paciente relata esquecimento frequente das doses noturnas de anti-hipertensivo.", "moderate", "pending"),
            (created_patients[7], "Pressão Limítrofe (152/96 mmHg)", "Aferição em visita do ACS indicou descontrole leve da pressão arterial sistólica.", "moderate", "pending"),
        ]

        for p, title, desc, risk, stat in alerts_data:
            Alert.objects.create(
                patient=p,
                title=title,
                description=desc,
                risk_level=risk,
                status=stat,
            )

        self.stdout.write(self.style.SUCCESS(f"✔ 5 Alertas clínicos criados (2 Críticos, 3 Moderados)."))
        self.stdout.write(self.style.SUCCESS("\n🎉 Base de dados local semeada com sucesso com dados clínicos completos!"))
