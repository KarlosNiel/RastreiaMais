"""
Factories para criação de dados de teste
"""
import factory
from django.contrib.auth.models import User
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser


class UserFactory(factory.django.DjangoModelFactory):
    """Factory para criação de usuários"""
    
    class Meta:
        model = User
    
    username = factory.Sequence(lambda n: f'user{n}')
    email = factory.LazyAttribute(lambda obj: f'{obj.username}@test.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True


class AdminUserFactory(UserFactory):
    """Factory para criação de usuários admin"""
    is_staff = True
    is_superuser = True


class ManagerUserFactory(factory.django.DjangoModelFactory):
    """Factory para criação de ManagerUser"""
    
    class Meta:
        model = ManagerUser
    
    user = factory.SubFactory(UserFactory)
    phone = factory.Faker('phone_number')


class ProfessionalUserFactory(factory.django.DjangoModelFactory):
    """Factory para criação de ProfessionalUser"""
    
    class Meta:
        model = ProfessionalUser
    
    user = factory.SubFactory(UserFactory)
    role = factory.Iterator(['Odontologista', 'Enfermeiro', 'ACS'])
    created_by = factory.SubFactory(UserFactory)


class PatientUserFactory(factory.django.DjangoModelFactory):
    """Factory para criação de PatientUser"""
    
    class Meta:
        model = PatientUser
    
    user = factory.SubFactory(UserFactory)
    created_by = factory.SubFactory(UserFactory)


# Factories com relacionamentos específicos
class ManagerWithProfileFactory(factory.django.DjangoModelFactory):
    """Factory que cria um manager completo com perfil"""
    
    class Meta:
        model = ManagerUser
    
    user = factory.SubFactory(UserFactory)
    phone = factory.Faker('phone_number')
    created_by = factory.SubFactory(AdminUserFactory)


class ProfessionalWithManagerFactory(factory.django.DjangoModelFactory):
    """Factory que cria um professional com manager como criador"""
    
    class Meta:
        model = ProfessionalUser
    
    user = factory.SubFactory(UserFactory)
    role = factory.Iterator(['Odontologista', 'Enfermeiro', 'ACS'])
    created_by = factory.SelfAttribute("manager.user")

    # Criamos junto um manager para preencher o created_by
    manager = factory.SubFactory(ManagerWithProfileFactory)



class PatientWithCreatorFactory(factory.django.DjangoModelFactory):
    """Factory que cria um patient com creator específico"""
    
    class Meta:
        model = PatientUser
    
    user = factory.SubFactory(UserFactory)
    created_by = factory.SubFactory(UserFactory)


# Factories para cenários específicos
class CompleteUserHierarchyFactory:
    """Factory que cria uma hierarquia completa de usuários"""
    
    @staticmethod
    def create_hierarchy():
        """Cria uma hierarquia completa: Admin -> Manager -> Professional -> Patient"""
        admin = AdminUserFactory()
        manager = ManagerWithProfileFactory(created_by=admin)
        professional = ProfessionalWithManagerFactory(created_by=manager.user)
        patient = PatientWithCreatorFactory(created_by=manager.user)
        
        return {
            'admin': admin,
            'manager': manager,
            'professional': professional,
            'patient': patient
        }
