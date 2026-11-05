from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from apps.accounts.models import PatientUser
from apps.commons.utils.audit import lgpd_logger, audit_logger


def generate_valid_dummy_cpf(seed_number: int) -> str:
    """Gera um CPF sintético com dígitos verificadores matematicamente válidos (Módulo 11)."""
    base = [int(d) for d in f"{seed_number:09d}"[-9:]]
    if len(set(base)) == 1:
        base[0] = (base[0] + 1) % 10

    # 1º DV
    d1 = sum(v * (10 - i) for i, v in enumerate(base)) % 11
    d1 = 0 if d1 < 2 else 11 - d1
    base.append(d1)

    # 2º DV
    d2 = sum(v * (11 - i) for i, v in enumerate(base)) % 11
    d2 = 0 if d2 < 2 else 11 - d2
    base.append(d2)

    return "".join(map(str, base))


class Command(BaseCommand):
    help = "Anonimiza dados pessoais identificáveis (PII) de pacientes para conformidade LGPD (Art. 13)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run",
            action="store_true",
            help="Simula a anonimização sem alterar o banco de dados.",
        )
        parser.add_argument(
            "--confirm",
            action="store_true",
            help="Confirma a execução irreversível em ambiente de homologação/pesquisa.",
        )

    def handle(self, *args, **options):
        dry_run = options["dry_run"]
        confirm = options["confirm"]

        if not dry_run and not confirm:
            raise CommandError(
                "AÇÃO DESTRUTIVA: A anonimização altera permanentemente os nomes e CPFs reais dos pacientes. "
                "Para confirmar, execute novamente adicionando o argumento: --confirm"
            )

        patients = list(PatientUser.all_objects.select_related("user", "address"))
        total = len(patients)

        if total == 0:
            self.stdout.write("Nenhum paciente encontrado para anonimização.")
            return

        self.stdout.write(f"Iniciando anonimização de {total} pacientes (Modo: {'SIMULAÇÃO' if dry_run else 'EXECUÇÃO'})...")

        if dry_run:
            for p in patients[:5]:
                self.stdout.write(f"[Dry-run] Paciente ID={p.id}: Nome='Paciente Anonimizado_{p.id}', CPF='{generate_valid_dummy_cpf(p.id)}'")
            self.stdout.write(self.style.SUCCESS(f"Simulação concluída. {total} registros seriam anonimizados com dados clínicos preservados."))
            return

        with transaction.atomic():
            for p in patients:
                # 1. Anonimiza User Django
                user = p.user
                user.first_name = "Paciente"
                user.last_name = f"Anonimizado_{p.id}"
                user.email = f"paciente_{p.id}@anonimizado.local"
                dummy_cpf = generate_valid_dummy_cpf(p.id)
                user.username = dummy_cpf
                user.save(update_fields=["first_name", "last_name", "email", "username"])

                # 2. Anonimiza campos sensíveis de PatientUser
                p.cpf = dummy_cpf
                if p.sus:
                    p.sus = f"799{p.id:012d}"
                p.phone = "83999990000"
                p.whatsapp = False
                p.save(update_fields=["cpf", "sus", "phone", "whatsapp"])

                # 3. Anonimiza endereço, se houver
                if p.address:
                    addr = p.address
                    addr.street = "Logradouro Anonimizado"
                    addr.number = "S/N"
                    addr.complement = ""
                    addr.zipcode = "58000-000"
                    addr.save(update_fields=["street", "number", "complement", "zipcode"])

        msg = f"Anonimização LGPD concluída com sucesso: {total} pacientes descaracterizados com dados clínicos preservados."
        self.stdout.write(self.style.SUCCESS(msg))
        lgpd_logger.warning(f"LGPDDataAnonymizationCompleted TotalRecords={total}")
        audit_logger.warning(f"LGPDDataAnonymizationCompleted TotalRecords={total}")
