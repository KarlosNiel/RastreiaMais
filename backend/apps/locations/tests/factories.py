"""
Factories para criação de dados de teste do app locations
"""
import factory
from apps.locations.models import Address, MicroArea, Institution


class AddressFactory(factory.django.DjangoModelFactory):
    """Factory para criação de Address"""
    
    class Meta:
        model = Address
    
    uf = factory.Iterator(['PB', 'PE'])
    city = factory.Faker('city')
    district = factory.Faker('city_suffix')
    street = factory.Faker('street_name')
    number = factory.Faker('random_int', min=1, max=9999)
    complement = factory.Faker('secondary_address')
    zipcode = factory.Faker('postcode', locale='pt_BR')
    created_by = factory.SubFactory('apps.accounts.tests.factories.UserFactory')


class MicroAreaFactory(factory.django.DjangoModelFactory):
    """Factory para criação de MicroArea"""
    
    class Meta:
        model = MicroArea
    
    name = factory.Sequence(lambda n: f'Micro Área {n}')
    maps_localization = factory.Faker('url')
    address = factory.SubFactory(AddressFactory)
    created_by = factory.SubFactory('apps.accounts.tests.factories.UserFactory')


class InstitutionFactory(factory.django.DjangoModelFactory):
    """Factory para criação de Institution"""
    
    class Meta:
        model = Institution
    
    name = factory.Faker('company')
    maps_localization = factory.Faker('url')
    address = factory.SubFactory(AddressFactory)
    created_by = factory.SubFactory('apps.accounts.tests.factories.UserFactory')
