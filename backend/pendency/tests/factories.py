"""
Factories para criação de dados de teste do app pendency
"""
import factory
from pendency.models import Pendency
from accounts.tests.factories import PatientWithCreatorFactory
from locations.tests.factories import MicroAreaFactory


class PendencyFactory(factory.django.DjangoModelFactory):
    """Factory para criação de Pendency"""
    
    class Meta:
        model = Pendency
    
    patient = factory.SubFactory(PatientWithCreatorFactory)
    micro_area = factory.SubFactory(MicroAreaFactory)
    created_by = factory.SubFactory('accounts.tests.factories.UserFactory')
