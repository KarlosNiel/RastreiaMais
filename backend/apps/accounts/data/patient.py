from django.db import models
from apps.accounts.constants import patient_choices
from apps.locations.models import MicroArea, Address


#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class LifeStyle(models.Model):
    class Meta: 
        abstract = True

    feed = models.CharField(
        "Alimentação", max_length=20, null=True, blank=True,
        choices=patient_choices.FeedingChoices.choices
    )

    salt_consumption = models.CharField(
        "Consumo de Sal", max_length=20, null=True, blank=True,
        choices=patient_choices.SaltConsumptionChoices.choices
    )

    alcohol_consumption = models.CharField(
        "Consumo de Álcool", max_length=20, null=True, blank=True,
        choices=patient_choices.AlcoholConsumptionChoices.choices
    )

    smoking = models.CharField(
        "Tabagismo", max_length=20, null=True, blank=True,
        choices=patient_choices.SmokingChoices.choices
    )

    last_consultation = models.CharField(
        "Última vez que foi a uma consulta para avaliar seu quadro?",
        max_length=20, null=True, blank=True,
        choices=patient_choices.LastCheckChoices.choices
    )


#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class SocialdemographicData(models.Model):
    class Meta:
        abstract = True

    cpf = models.CharField(
        "CPF", max_length=20, null=True, blank=True
    )
    birth_date = models.DateField(
        "Data de Nascimento", null=True, blank=True
    )
    gender = models.CharField(
        "Gênero", max_length=50, null=True, blank=True
    )
    age = models.PositiveIntegerField(
        "Idade", null=True, blank=True
    )
    race_ethnicity = models.CharField(
        "Raça/Etnia", max_length=100, null=True, blank=True
    )
    scholarity = models.CharField(
        "Escolaridade", max_length=40, null=True, blank=True,
        choices=patient_choices.EducationLevelChoices.choices
    )
    occupation = models.CharField(
        "Ocupação", max_length=40, null=True, blank=True
    )
    civil_status = models.CharField(
        "Estado Civil", max_length=40, null=True, blank=True,
        choices=patient_choices.MaritalStatusChoices.choices
    )
    people_per_household = models.PositiveIntegerField(
        "N⁰ de pessoas no domicílio", null=True, blank=True
    )
    family_responsability = models.CharField(
        "Resp. familiar", max_length=40, null=True, blank=True
    )
    family_income = models.DecimalField(
        "Renda Familiar", max_digits=12, decimal_places=2, null=True, blank=True
    )
    bolsa_familia = models.BooleanField(
        "Bolsa Família", null=True, blank=True
    )
    micro_area = models.ForeignKey(
        MicroArea, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Micro Área"
    )
    address = models.OneToOneField(
        Address, on_delete=models.CASCADE, null=True, blank=True, verbose_name="Endereço"
    )
    phone = models.CharField(
        "Telefone", max_length=40, null=True, blank=True
    )
    whatsapp = models.BooleanField(
        "Whatsapp", null=True, blank=True
    )


#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class PsychosocialRisks(models.Model):
    class Meta:
        abstract = True

    use_psychotropic_medication = models.BooleanField("Usa medicação psicotrópica?", null=True, blank=True)
    use_psychotropic_medication_answer = models.CharField("Qual medicação psicotrópica?", max_length=255, null=True, blank=True)
    any_psychological_psychiatric_diagnosis = models.BooleanField("Possui algum diagnóstico psicológico/psiquiátrico?", null=True, blank=True)
    any_psychological_psychiatric_diagnosis_answer = models.CharField("Qual diagnóstico?", max_length=255, null=True, blank=True)
    everyday_stress_interfere_with_your_BP_BS_control = models.BooleanField("O estresse do dia a dia interfere no controle da Pressão/Glicemia?", null=True, blank=True)
    economic_factors_interfere_with_your_treatment = models.BooleanField("Fatores econômicos interferem no tratamento?", null=True, blank=True)
    feel_receive_support_from_family_friends_to_maintain_treatment = models.BooleanField("Sente que recebe apoio da família/amigos para manter o tratamento?", null=True, blank=True)
    regularly_follow_health_guidelines = models.BooleanField("Segue regularmente as orientações de saúde?", null=True, blank=True)


#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class EnvironmentalRisks(models.Model):
    class Meta:
        abstract = True

    delayed_wound_healing_after_scratches_or_bites = models.BooleanField("Apresenta cicatrização demorada após arranhões ou mordidas?", null=True, blank=True)
    presence_of_pets_at_home = models.BooleanField("Possui animais de estimação em casa?", null=True, blank=True)
    presence_of_pets_at_home_answer = models.CharField("Quais animais de estimação?", max_length=255, null=True, blank=True)
    your_animals_are_vaccinated = models.BooleanField("Os animais são vacinados?", null=True, blank=True)
    diagnosed_transmissible_disease_in_household = models.CharField(
        "Você ou alguém em sua casa já foi diagnosticado com alguma doença transmissível?",
        max_length=255, null=True, blank=True,
        choices=patient_choices.TransmissibleDiseaseChoices.choices
    )
    direct_contact_with_animal_bodily_fluids = models.CharField("Tem contato direto com fluidos corporais de animais?", max_length=255, null=True, blank=True)
    received_guidance_on_zoonoses = models.BooleanField("Já recebeu orientação sobre zoonoses?", null=True, blank=True)


#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class PhysicalMotorRisks(models.Model):
    class Meta:
        abstract = True

    performs_physical_activity = models.BooleanField("Realiza atividade física?", null=True, blank=True)
    performs_physical_activity_answer = models.CharField("Qual tipo de atividade física?", max_length=255, null=True, blank=True)
    has_edema = models.BooleanField("Apresenta edema (inchaço)?", null=True, blank=True)
    has_dyspnea = models.BooleanField("Apresenta dispneia (falta de ar)?", null=True, blank=True)
    has_paresthesia_or_cramps = models.BooleanField("Apresenta parestesia ou câimbras?", null=True, blank=True)
    has_difficulty_walking_or_activity = models.BooleanField("Apresenta dificuldade para andar ou realizar atividades físicas?", null=True, blank=True)


#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class ClassificationConducmMultiProfessional(models.Model):
    class Meta:
        abstract = True

    requires_multidisciplinary_referral = models.BooleanField("Necessita de encaminhamento multiprofissional?", null=True, blank=True)
    requires_multidisciplinary_referral_choose = models.CharField(
        "Encaminhar para qual profissional?", max_length=255, null=True, blank=True,
        choices=patient_choices.ReferralProfessionChoices.choices
    )
