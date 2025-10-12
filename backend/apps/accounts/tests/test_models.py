"""
Testes para modelos do app accounts
"""
from django.test import TestCase
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.core.exceptions import ValidationError
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser


class PatientUserModelTest(TestCase):
    """Testes para o modelo PatientUser"""
    
    def setUp(self):
        """Setup comum para todos os testes"""
        self.user = User.objects.create_user(
            username='patient_test',
            email='patient@test.com',
            first_name='Carlos Daniel',
            last_name='Lucena da Silva'
        )
    
    def test_create_patient_user(self):
        """Testa criação de PatientUser"""
        patient = PatientUser.objects.create(user=self.user)
        
        self.assertIsInstance(patient, PatientUser)
        self.assertEqual(patient.user, self.user)
        self.assertTrue(hasattr(patient, 'created_at'))
        self.assertTrue(hasattr(patient, 'updated_at'))
        self.assertFalse(patient.is_deleted)
    
    def test_patient_user_str_method(self):
        """Testa método __str__ do PatientUser"""
        patient = PatientUser.objects.create(user=self.user)
        expected_str = f"Patient: {self.user.get_full_name()}"
        
        self.assertEqual(str(patient), expected_str)
    
    def test_patient_user_str_without_full_name(self):
        """Testa método __str__ quando usuário não tem nome completo"""
        user_no_name = User.objects.create_user(username='no_name')
        patient = PatientUser.objects.create(user=user_no_name)
        
        self.assertEqual(str(patient), "Patient: ")
    
    def test_one_to_one_relationship_constraint(self):
        """Testa constraint de relacionamento one-to-one"""
        PatientUser.objects.create(user=self.user)
        
        with self.assertRaises(IntegrityError):
            PatientUser.objects.create(user=self.user)
    
    def test_soft_delete_functionality(self):
        """Testa funcionalidade de soft delete"""
        patient = PatientUser.objects.create(user=self.user)
        
        # Verifica que está ativo
        self.assertFalse(patient.is_deleted)
        self.assertIn(patient, PatientUser.objects.all())
        
        # Soft delete
        patient.delete()
        
        # Verifica que foi marcado como deletado
        self.assertTrue(patient.is_deleted)
        self.assertNotIn(patient, PatientUser.objects.all())
        self.assertIn(patient, PatientUser.all_objects.all())
    
    def test_restore_functionality(self):
        """Testa funcionalidade de restore"""
        patient = PatientUser.objects.create(user=self.user)
        patient.delete()
        
        # Restore
        patient.restore()
        
        # Verifica que foi restaurado
        self.assertFalse(patient.is_deleted)
        self.assertIn(patient, PatientUser.objects.all())


class ProfessionalUserModelTest(TestCase):
    """Testes para o modelo ProfessionalUser"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='professional_test',
            email='professional@test.com',
            first_name='Dr. João',
            last_name='Silva'
        )
    
    def test_create_professional_user(self):
        """Testa criação de ProfessionalUser"""
        professional = ProfessionalUser.objects.create(
            user=self.user,
            role='Odontologista'
        )
        
        self.assertIsInstance(professional, ProfessionalUser)
        self.assertEqual(professional.user, self.user)
        self.assertEqual(professional.role, 'Odontologista')
    
    def test_professional_user_str_method(self):
        """Testa método __str__ do ProfessionalUser"""
        professional = ProfessionalUser.objects.create(
            user=self.user,
            role='Enfermeiro'
        )
        expected_str = f"Enfermeiro: {self.user.get_full_name()}"
        
        self.assertEqual(str(professional), expected_str)
    
    def test_role_choices_validation(self):
        """Testa validação de choices do campo role"""
        professional = ProfessionalUser(
            user=self.user,
            role='Invalid Role'
        )
        
        with self.assertRaises(ValidationError):
            professional.full_clean()


class ManagerUserModelTest(TestCase):
    """Testes para o modelo ManagerUser"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='manager_test',
            email='manager@test.com',
            first_name='Manager',
            last_name='User'
        )
    
    def test_create_manager_user(self):
        """Testa criação de ManagerUser"""
        manager = ManagerUser.objects.create(
            user=self.user,
            phone='11999999999'
        )
        
        self.assertIsInstance(manager, ManagerUser)
        self.assertEqual(manager.user, self.user)
        self.assertEqual(manager.phone, '11999999999')
    
    def test_manager_user_str_method(self):
        """Testa método __str__ do ManagerUser"""
        manager = ManagerUser.objects.create(
            user=self.user,
            phone='11999999999'
        )
        expected_str = f"Manager: {self.user.get_full_name()}"
        
        self.assertEqual(str(manager), expected_str)


class UserCreationPermissionsTest(TestCase):
    """Testes para permissões de criação de usuários"""
    
    def setUp(self):
        # Cria usuário admin
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@test.com',
            is_staff=True
        )
        
        # Cria manager
        self.manager_user = User.objects.create_user(
            username='manager',
            email='manager@test.com'
        )
        self.manager_profile = ManagerUser.objects.create(
            user=self.manager_user,
            phone='11999999999',
            created_by=self.admin_user
        )
        
        # Cria professional
        self.professional_user = User.objects.create_user(
            username='professional',
            email='professional@test.com'
        )
        self.professional_profile = ProfessionalUser.objects.create(
            user=self.professional_user,
            role='Odontologista',
            created_by=self.manager_user
        )
    
    def test_manager_can_create_professional(self):
        """Testa se manager pode criar professional"""
        new_user = User.objects.create_user(
            username='new_professional',
            email='new_professional@test.com'
        )
        
        professional = ProfessionalUser(
            user=new_user,
            role='Enfermeiro',
            created_by=self.manager_user
        )
        
        # Deve passar na validação
        professional.full_clean()
        professional.save()
        
        self.assertIsInstance(professional, ProfessionalUser)
    
    def test_professional_cannot_create_professional(self):
        """Testa se professional não pode criar outro professional"""
        new_user = User.objects.create_user(
            username='another_professional',
            email='another_professional@test.com'
        )
        
        professional = ProfessionalUser(
            user=new_user,
            role='Enfermeiro',
            created_by=self.professional_user
        )
        
        # Deve falhar na validação
        with self.assertRaises(ValidationError):
            professional.full_clean()
    
    def test_manager_or_professional_can_create_patient(self):
        """Testa se manager ou professional podem criar patient"""
        # Teste com manager
        new_user1 = User.objects.create_user(
            username='patient1',
            email='patient1@test.com'
        )
        
        patient1 = PatientUser(
            user=new_user1,
            created_by=self.manager_user
        )
        patient1.full_clean()
        patient1.save()
        
        # Teste com professional
        new_user2 = User.objects.create_user(
            username='patient2',
            email='patient2@test.com'
        )
        
        patient2 = PatientUser(
            user=new_user2,
            created_by=self.professional_user
        )
        patient2.full_clean()
        patient2.save()
        
        self.assertIsInstance(patient1, PatientUser)
        self.assertIsInstance(patient2, PatientUser)

from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.accounts.models import User, PatientUser, ManagerUser, ProfessionalUser


class SingleProfileMixinTest(TestCase):
    def setUp(self):
        # Cria um usuário base pra usar em todos os testes
        self.user = User.objects.create_user(username="teste", password="123456")

    def test_user_cannot_have_multiple_profiles(self):
        """Usuário não pode ter mais de um perfil (Patient + Manager, por exemplo)"""
        # Cria um PatientUser normalmente
        patient = PatientUser.objects.create(user=self.user)

        # Tenta criar um ManagerUser pro mesmo user
        manager = ManagerUser(user=self.user)

        # Deve levantar ValidationError
        with self.assertRaises(ValidationError) as context:
            manager.full_clean()

        self.assertIn("já possui um outro perfil", str(context.exception))
