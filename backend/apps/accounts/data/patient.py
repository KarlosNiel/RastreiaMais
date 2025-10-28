from django.db import models
from apps.accounts.constants import patient_choices
from apps.locations.models import MicroArea, Address

class LifeStyle(models.Model):
    class Meta: 
        abstract = True

    feed = models.CharField(
        max_length=20, null=True, blank=True ,
        choices=patient_choices.FeedingChoices.choices,
        verbose_name="Alimentação"
    )

    salt_consumption = models.CharField(
        max_length=20, null=True, blank=True,
        choices=patient_choices.SaltConsumptionChoices.choices, 
        verbose_name="Consumo de Sal"
    )

    alcohol_consumption = models.CharField(
        max_length=20, null=True, blank=True ,
        choices=patient_choices.AlcoholConsumptionChoices.choices, 
        verbose_name="Consumo de Alcool"
    )

    smoking = models.CharField(
        max_length=20, null=True, blank=True ,
        choices=patient_choices.SmokingChoices.choices, 
        verbose_name="Tabagismo"
    )

    last_consultation = models.CharField(
        max_length=20, null=True, blank=True,
        choices=patient_choices.LastCheckChoices.choices, 
        verbose_name="Última vez que foi a uma consulta para avaliar seu quadro?"
        
    )

#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class SocialdemographicData(models.Model):
    class Meta:
        abstract = True

    cpf = models.CharField(
        null=True, blank=True,
        max_length=20,
        verbose_name="CPF"
    )    
    birth_date = models.DateField(
        null=True, blank=True,
        verbose_name="Data de Nascimento"
    )
    gender = models.CharField(
        null=True, blank=True,
        verbose_name="Gênero"
    )    
    age = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="Idade"
    )
    race_ethnicity = models.CharField(
        max_length=100, null=True, blank=True,
        verbose_name="Raça/Etnia"
    )     
    scholarity = models.CharField(
        max_length=40, null=True, blank=True, 
        choices=patient_choices.EducationLevelChoices.choices,
        verbose_name="Escolaridade"
    ) 
    occupation = models.CharField(
        max_length=40, null=True, blank=True,
        verbose_name="Ocupação"
    ) 
    civil_status = models.CharField(
        max_length=40, null=True, blank=True,
        choices=patient_choices.MaritalStatusChoices.choices,
        verbose_name="Estado Civil"

    ) 
    people_per_household = models.PositiveIntegerField(
        null=True, blank=True,
        verbose_name="N⁰ de pessoas no domicílio"
    ) 
    family_responsability = models.CharField(
        max_length=40, null=True, blank=True,
        verbose_name="Resp. familiar"
    ) 
    family_income = models.DecimalField(
        max_digits=12, decimal_places=8, null=True, blank=True,
        verbose_name="Renda Familiar"
    ) 
    bolsa_familia = models.BooleanField(
        null=True, blank=True,
        verbose_name="Bolsa Família"
    )     
    micro_area = models.ForeignKey(
        MicroArea, on_delete=models.CASCADE, null=True, blank=True,
        verbose_name="Micro Área"
    ) 
    address = models.OneToOneField(
        Address, on_delete=models.CASCADE,null=True, blank=True,
        verbose_name="Endereço"
    ) 
    phone = models.CharField(
        max_length=40, null=True, blank=True,
        verbose_name="Telefone"
    ) 
    whatsapp = models.BooleanField(
        null=True, blank=True,
        verbose_name="Whatsapp"
    ) 

#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class PsychosocialRisks(models.Model): #* Modelo abstrato que representa fatores psicossociais do paciente.
    class Meta:
        abstract = True

    use_psychotropic_medication = models.BooleanField(
        null=True, blank=True,
        verbose_name="Usa medicação psicotrópica?"
    )
    use_psychotropic_medication_answer = models.CharField(
        max_length=255, null=True, blank=True,
        verbose_name="Qual medicação psicotrópica?"
    )

    any_psychological_psychiatric_diagnosis = models.BooleanField(
        null=True, blank=True,
        verbose_name="Possui algum diagnóstico psicológico/psiquiátrico?"
    )
    any_psychological_psychiatric_diagnosis_answer = models.CharField(
        max_length=255, null=True, blank=True,
        verbose_name="Qual diagnóstico?"
    )

    everyday_stress_interfere_with_your_BP_BS_control = models.BooleanField(
        null=True, blank=True,
        verbose_name="O estresse do dia a dia interfere no controle da Pressão/Glicemia?"
    )

    economic_factors_interfere_with_your_treatment = models.BooleanField(
        null=True, blank=True,
        verbose_name="Fatores econômicos interferem no tratamento?"
    )

    feel_receive_support_from_family_friends_to_maintain_treatment = models.BooleanField(
        null=True, blank=True,
        verbose_name="Sente que recebe apoio da família/amigos para manter o tratamento?"
    )

    regularly_follow_health_guidelines = models.BooleanField(
        null=True, blank=True,
        verbose_name="Segue regularmente as orientações de saúde?"
    )

#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

class EnvironmentalRisks(models.Model): #*  Modelo abstrato que representa fatores de risco ambientais do paciente.
    class Meta:
        abstract = True

    delayed_wound_healing_after_scratches_or_bites = models.BooleanField(
        null=True, blank=True,
        verbose_name="Apresenta cicatrização demorada após arranhões ou mordidas?"
    )

    presence_of_pets_at_home = models.BooleanField(
        null=True, blank=True,
        verbose_name="Possui animais de estimação em casa?"
    )
    presence_of_pets_at_home_answer = models.CharField(
        max_length=255, null=True, blank=True,
        verbose_name="Quais animais de estimação?"
    )

    your_animals_are_vaccinated = models.BooleanField(
        null=True, blank=True,
        verbose_name="Os animais são vacinados?"
    )

    diagnosed_transmissible_disease_in_household = models.CharField(
        max_length=255, null=True, blank=True,
        choices=patient_choices.TransmissibleDiseaseChoices.choices,
        verbose_name="Você ou alguém em sua casa já foi diagnosticado com alguma doença transmissível?"
    )

    direct_contact_with_animal_bodily_fluids = models.CharField(
        max_length=255, null=True, blank=True,
        verbose_name="Tem contato direto com fluidos corporais de animais?"
    )

    received_guidance_on_zoonoses = models.BooleanField(
        null=True, blank=True,
        verbose_name="Já recebeu orientação sobre zoonoses?"
    )

#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class PhysicalMotorRisks(models.Model): #* Modelo abstrato que representa fatores de risco físicos e motores do paciente.
    class Meta:
        abstract = True

    performs_physical_activity = models.BooleanField(
        null=True, blank=True,
        verbose_name="Realiza atividade física?"
    )
    performs_physical_activity_answer = models.CharField(
        max_length=255, null=True, blank=True,
        verbose_name="Qual tipo de atividade física?"
    )

    has_edema = models.BooleanField(
        null=True, blank=True,
        verbose_name="Apresenta edema (inchaço)?"
    )

    has_dyspnea = models.BooleanField(
        null=True, blank=True,
        verbose_name="Apresenta dispneia (falta de ar)?"
    )

    has_paresthesia_or_cramps = models.BooleanField(
        null=True, blank=True,
        verbose_name="Apresenta parestesia ou câimbras?"
    )

    has_difficulty_walking_or_activity = models.BooleanField(
        null=True, blank=True,
        verbose_name="Apresenta dificuldade para andar ou realizar atividades físicas?"
    )

#=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
class ClassificationConducmMultiProfessional(models.Model): #* Modelo abstrato que representa a necessidade de encaminhamento multiprofissional.
    class Meta:
        abstract = True

    requires_multidisciplinary_referral = models.BooleanField(
        null=True, blank=True,
        verbose_name="Necessita de encaminhamento multiprofissional?"
    )

    requires_multidisciplinary_referral_choose = models.CharField(
        max_length=255, null=True, blank=True,
        choices=patient_choices.ReferralProfessionChoices.choices,
        verbose_name="Encaminhar para qual profissional?"
    )