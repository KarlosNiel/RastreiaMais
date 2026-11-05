from django.db import models
from django.core.exceptions import ValidationError
from apps.commons.models import BaseModel
import re

UF_CHOICE = [
    ("AC", "Acre"), ("AL", "Alagoas"), ("AP", "Amapá"), ("AM", "Amazonas"),
    ("BA", "Bahia"), ("CE", "Ceará"), ("DF", "Distrito Federal"), ("ES", "Espírito Santo"),
    ("GO", "Goiás"), ("MA", "Maranhão"), ("MT", "Mato Grosso"), ("MS", "Mato Grosso do Sul"),
    ("MG", "Minas Gerais"), ("PA", "Pará"), ("PB", "Paraíba"), ("PR", "Paraná"),
    ("PE", "Pernambuco"), ("PI", "Piauí"), ("RJ", "Rio de Janeiro"), ("RN", "Rio Grande do Norte"),
    ("RS", "Rio Grande do Sul"), ("RO", "Rondônia"), ("RR", "Roraima"), ("SC", "Santa Catarina"),
    ("SP", "São Paulo"), ("SE", "Sergipe"), ("TO", "Tocantins"),
]

# Create your models here.

#Address=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class Address(BaseModel):
    class Meta:
        verbose_name = "Endereço"
        verbose_name_plural = "Endereços"

    uf = models.CharField(choices=UF_CHOICE, max_length=2)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    street = models.CharField(max_length=100)
    number = models.CharField(max_length=20, default="S/N")
    complement = models.CharField(max_length=100, null=True, blank=True)
    zipcode = models.CharField(max_length=10, null=True, blank=True)

    def __str__(self):
        return f"{self.street}, {self.number} - {self.district}, {self.city}/{self.uf}"
    
    def clean(self): #* Validação do CEP usando regex.
        super().clean() #* executar primeiro as validações padrões e depois as customizadas como essa.

        if self.zipcode:

            self.zipcode = self.zipcode.strip() #* Remover espaços vazios

            if not re.match(r'^\d{5}-?\d{3}$', self.zipcode):
                raise ValidationError('CEP deve estar no formato 00000-000')

#Micro-Area=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class MicroArea(BaseModel):
    class Meta:
        verbose_name = "Micro-Área"
        verbose_name_plural = "Micro-Áreas"

    name = models.CharField(max_length=100)
    maps_localization = models.URLField(null=True, blank=True)
    address = models.OneToOneField(Address, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name

#Institution=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class Institution(BaseModel):
    class Meta:
        verbose_name = "Instituição"
        verbose_name_plural = "Instituições"
        
    name = models.CharField(max_length=100)
    maps_localization = models.URLField(null=True, blank=True)
    address = models.OneToOneField(Address, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name