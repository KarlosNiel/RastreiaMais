import os
import gzip
import hashlib
import glob
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core.management import call_command
from django.conf import settings
from apps.commons.utils.audit import audit_logger


class Command(BaseCommand):
    help = "Gera um backup completo, comprimido (gzip) e com hash SHA-256 do banco de dados."

    def add_arguments(self, parser):
        parser.add_argument(
            "--output-dir",
            type=str,
            default=os.path.join(settings.BASE_DIR, "backups"),
            help="Diretório onde o arquivo de backup será salvo (padrão: backend/backups).",
        )
        parser.add_argument(
            "--keep-last",
            type=int,
            default=7,
            help="Número de backups recentes a reter (exclui os mais antigos).",
        )

    def handle(self, *args, **options):
        output_dir = options["output_dir"]
        keep_last = options["keep_last"]
        os.makedirs(output_dir, exist_ok=True)

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_filename = f"backup_rastreiamais_{timestamp}.json.gz"
        checksum_filename = f"{backup_filename}.sha256"

        backup_path = os.path.join(output_dir, backup_filename)
        checksum_path = os.path.join(output_dir, checksum_filename)

        self.stdout.write(self.style.NOTICE(f"Iniciando backup estruturado do banco de dados..."))

        # 1. Executa dumpdata comprimindo em stream gzip
        temp_json_path = os.path.join(output_dir, f"temp_{timestamp}.json")
        try:
            with open(temp_json_path, "w", encoding="utf-8") as f:
                call_command(
                    "dumpdata",
                    "--natural-foreign",
                    "--natural-primary",
                    "--exclude=contenttypes",
                    "--exclude=auth.Permission",
                    "--exclude=sessions.Session",
                    "--indent=2",
                    stdout=f
                )

            with open(temp_json_path, "rb") as f_in, gzip.open(backup_path, "wb", compresslevel=9) as f_out:
                f_out.writelines(f_in)
        finally:
            if os.path.exists(temp_json_path):
                os.remove(temp_json_path)

        # 2. Gera hash SHA-256 para integridade criptográfica
        sha256_hash = hashlib.sha256()
        with open(backup_path, "rb") as f:
            for byte_block in iter(lambda: f.read(65536), b""):
                sha256_hash.update(byte_block)
        hexdigest = sha256_hash.hexdigest()

        with open(checksum_path, "w", encoding="utf-8") as f:
            f.write(f"{hexdigest}  {backup_filename}\n")

        file_size_kb = os.path.getsize(backup_path) / 1024
        msg = f"Backup concluído com sucesso: {backup_filename} ({file_size_kb:.1f} KB, SHA-256: {hexdigest[:12]}...)"
        self.stdout.write(self.style.SUCCESS(msg))
        audit_logger.info(f"DatabaseBackupCreated File='{backup_filename}' SizeKB={file_size_kb:.1f} SHA256='{hexdigest}'")

        # 3. Política de retenção
        if keep_last > 0:
            all_backups = sorted(glob.glob(os.path.join(output_dir, "backup_rastreiamais_*.json.gz")))
            if len(all_backups) > keep_last:
                to_delete = all_backups[:-keep_last]
                for old_backup in to_delete:
                    try:
                        os.remove(old_backup)
                        old_chk = f"{old_backup}.sha256"
                        if os.path.exists(old_chk):
                            os.remove(old_chk)
                        self.stdout.write(f"Backup rotacionado e removido: {os.path.basename(old_backup)}")
                    except Exception as e:
                        self.stderr.write(f"Erro ao remover backup antigo {old_backup}: {e}")

