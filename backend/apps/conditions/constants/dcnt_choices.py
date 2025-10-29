from django.db import models

class TreatmentStatusChoices(models.TextChoices):
    SIM = "SIM", "Sim"
    NAO = "NAO", "Não"
    IRREGULAR = "IRREGULAR", "Irregular"
    NAO_SE_APLICA = "NAO_SE_APLICA", "Não se aplica"