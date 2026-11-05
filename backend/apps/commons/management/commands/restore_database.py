import os
import gzip
import hashlib
from django.core.management.base import BaseCommand, CommandError
from django.core.management import call_command
from apps.commons.utils.audit import audit_logger


class Command(BaseCommand):
    help = "Valida integridade SHA-256 e restaura um backup do banco de dados gerado pelo backup_database."

    def add_arguments(self, parser):
        parser.add_argument(
            "--file",
            type=str,
            required=True,
            help="Caminho do arquivo de backup (.json.gz ou .json) a ser restaurado.",
        )
        parser.add_argument(
            "--skip-checksum",
            action="store_true",
            help="Pula a validação do arquivo de checksum .sha256.",
        )

    def handle(self, *args, **options):
        file_path = options["file"]
        skip_checksum = options["skip_checksum"]

        if not os.path.exists(file_path):
            raise CommandError(f"Arquivo de backup não encontrado: {file_path}")

        # 1. Validação de integridade SHA-256
        if not skip_checksum:
            checksum_path = f"{file_path}.sha256"
            if os.path.exists(checksum_path):
                self.stdout.write("Validando integridade criptográfica SHA-256...")
                with open(checksum_path, "r", encoding="utf-8") as f:
                    expected_hash = f.read().split()[0].strip()

                sha256_hash = hashlib.sha256()
                with open(file_path, "rb") as f:
                    for byte_block in iter(lambda: f.read(65536), b""):
                        sha256_hash.update(byte_block)
                actual_hash = sha256_hash.hexdigest()

                if actual_hash != expected_hash:
                    raise CommandError(
                        f"FALHA DE INTEGRIDADE: O hash do arquivo ({actual_hash}) "
                        f"não confere com o esperado ({expected_hash}). O arquivo pode estar corrompido."
                    )
                self.stdout.write(self.style.SUCCESS("Integridade SHA-256 confirmada!"))
            else:
                self.stdout.write(self.style.WARNING("Aviso: Arquivo .sha256 não encontrado. Continuando sem validação de hash."))

        # 2. Descompressão temporária e carga de dados
        temp_restore_json = f"{file_path}.temp_restore.json"
        try:
            if file_path.endswith(".gz"):
                self.stdout.write("Descompactando arquivo gzip...")
                with gzip.open(file_path, "rb") as f_in, open(temp_restore_json, "wb") as f_out:
                    f_out.writelines(f_in)
                target_file = temp_restore_json
            else:
                target_file = file_path

            self.stdout.write("Carregando registros no banco de dados (loaddata)...")
            call_command("loaddata", target_file)
            self.stdout.write(self.style.SUCCESS(f"Restauração concluída com sucesso a partir de {file_path}!"))
            audit_logger.warning(f"DatabaseRestored File='{file_path}' Status='SUCCESS'")
        finally:
            if os.path.exists(temp_restore_json):
                os.remove(temp_restore_json)

