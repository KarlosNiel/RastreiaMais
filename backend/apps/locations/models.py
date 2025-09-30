from django.db import models
from django.core.exceptions import ValidationError
from apps.commons.models import BaseModel
import re

UF_CHOICE = [
    ("PB", "Paraíba"),
    ("PE", "Pernambuco")
]

# Create your models here.

#Address=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class Address(BaseModel):
    uf = models.CharField(choices=UF_CHOICE, max_length=2)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    street = models.CharField(max_length=100)
    number = models.PositiveIntegerField()
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
    name = models.CharField(max_length=100)
    maps_localization = models.URLField(null=True, blank=True)
    address = models.OneToOneField(Address, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name

#Institution=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class Institution(BaseModel):
    name = models.CharField(max_length=100)
    maps_localization = models.URLField(null=True, blank=True)
    address = models.OneToOneField(Address, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name
    

