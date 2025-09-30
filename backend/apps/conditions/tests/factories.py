"""
Factories para criação de dados de teste do app conditions
"""
import factory
from conditions.models import DCNT, HAS, DM, OtherDCNT
from accounts.tests.factories import PatientWithCreatorFactory


class DCNTFactory(factory.django.DjangoModelFactory):
    """Factory para criação de DCNT"""
    
    class Meta:
        model = DCNT
    
    patient = factory.SubFactory(PatientWithCreatorFactory)
    is_diagnosed = factory.Faker('boolean')
    uses_medication = factory.Faker('boolean')
    medications_name = factory.Faker('text', max_nb_chars=200)
    family_history = factory.Faker('boolean')
    created_by = factory.SubFactory('accounts.tests.factories.UserFactory')


class HASFactory(factory.django.DjangoModelFactory):
    """Factory para criação de HAS"""
    
    class Meta:
        model = HAS
    
    patient = factory.SubFactory(PatientWithCreatorFactory)
    is_diagnosed = factory.Faker('boolean')
    uses_medication = factory.Faker('boolean')
    medications_name = factory.Faker('text', max_nb_chars=200)
    family_history = factory.Faker('boolean')
    any_complications_HBP = factory.Iterator(['AVC', 'Infarto', None])
    created_by = factory.SubFactory('accounts.tests.factories.UserFactory')


class DMFactory(factory.django.DjangoModelFactory):
    """Factory para criação de DM"""
    
    class Meta:
        model = DM
    
    patient = factory.SubFactory(PatientWithCreatorFactory)
    is_diagnosed = factory.Faker('boolean')
    uses_medication = factory.Faker('boolean')
    medications_name = factory.Faker('text', max_nb_chars=200)
    family_history = factory.Faker('boolean')
    treatment_type = factory.Iterator(['Oral', 'Insulina', None])
    treatment_type_other = factory.Faker('text', max_nb_chars=100)
    diabetes_comorbidities = factory.Iterator(['Cardiaca', 'Renal', None])
    diabetes_comorbidities_others = factory.Faker('text', max_nb_chars=100)
    diabetic_foot = factory.Faker('boolean')
    diabetic_foot_member = factory.Faker('text', max_nb_chars=100)
    created_by = factory.SubFactory('accounts.tests.factories.UserFactory')


class OtherDCNTFactory(factory.django.DjangoModelFactory):
    """Factory para criação de OtherDCNT"""
    
    class Meta:
        model = OtherDCNT
    
    patient = factory.SubFactory(PatientWithCreatorFactory)
    is_diagnosed = factory.Faker('boolean')
    uses_medication = factory.Faker('boolean')
    medications_name = factory.Faker('text', max_nb_chars=200)
    family_history = factory.Faker('boolean')
    name = factory.Faker('text', max_nb_chars=100)
    created_by = factory.SubFactory('accounts.tests.factories.UserFactory')
