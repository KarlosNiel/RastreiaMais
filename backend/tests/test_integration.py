"""
Testes de integração para o sistema completo
"""
from django.test import TestCase, TransactionTestCase
from django.contrib.auth.models import User
from django.db import transaction
from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
from apps.medications.models import Medication
from apps.appointments.models import Appointment
from apps.accounts.tests.factories import CompleteUserHierarchyFactory
from datetime import date, timedelta
from django.utils import timezone


class SystemIntegrationTest(TransactionTestCase):
    """Testes de integração do sistema completo"""
    
    def setUp(self):
        """Setup com hierarquia completa de usuários"""
        self.hierarchy = CompleteUserHierarchyFactory.create_hierarchy()
        self.admin = self.hierarchy['admin']
        self.manager = self.hierarchy['manager']
        self.professional = self.hierarchy['professional']
        self.patient = self.hierarchy['patient']
    
    def test_complete_user_workflow(self):
        """Testa fluxo completo de criação de usuários"""
        # Verifica que a hierarquia foi criada corretamente
        self.assertIsInstance(self.admin, User)
        self.assertIsInstance(self.manager, ManagerUser)
        self.assertIsInstance(self.professional, ProfessionalUser)
        self.assertIsInstance(self.patient, PatientUser)
        
        # Verifica relacionamentos
        self.assertEqual(self.manager.created_by, self.admin)
        self.assertEqual(self.professional.created_by, self.manager.user)
        self.assertEqual(self.patient.created_by, self.manager.user)
    
    def test_medication_workflow(self):
        """Testa fluxo completo de medicamentos"""
        # Cria medicamento para o paciente
        medication = Medication.objects.create(
            patient=self.patient,
            name='Paracetamol',
            description='Analgésico',
            end_date=date.today() + timedelta(days=30),
            active=True,
            created_by=self.professional.user
        )
        
        # Verifica criação
        self.assertIsInstance(medication, Medication)
        self.assertEqual(medication.patient, self.patient)
        self.assertTrue(medication.is_active())
        
        # Testa soft delete
        medication.delete(user=self.professional.user)
        self.assertTrue(medication.is_deleted)
        self.assertEqual(medication.deleted_by, self.professional.user)
        
        # Testa restore
        medication.restore(user=self.manager.user)
        self.assertFalse(medication.is_deleted)
        self.assertEqual(medication.updated_by, self.manager.user)
    
    def test_appointment_workflow(self):
        """Testa fluxo completo de consultas"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        # Cria consulta
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Moderado',
            description='Consulta de rotina',
            type='Consulta',
            status='Agendado',
            created_by=self.professional.user
        )
        
        # Verifica criação
        self.assertIsInstance(appointment, Appointment)
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.professional, self.professional)
        
        # Atualiza status da consulta
        appointment.status = 'Finalizado'
        appointment.save(update_fields=['status'])
        
        self.assertEqual(appointment.status, 'Finalizado')
    
    def test_cross_app_relationships(self):
        """Testa relacionamentos entre apps"""
        # Cria medicamento e consulta para o mesmo paciente
        medication = Medication.objects.create(
            patient=self.patient,
            name='Aspirina',
            description='Anti-inflamatório',
            end_date=date.today() + timedelta(days=15),
            active=True,
            created_by=self.professional.user
        )
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=timezone.now() + timedelta(days=1),
            risk_level='Seguro',
            type='Consulta',
            status='Agendado',
            created_by=self.professional.user
        )
        
        # Verifica que ambos pertencem ao mesmo paciente
        self.assertEqual(medication.patient, appointment.patient)
        
        # Verifica que ambos foram criados pelo mesmo profissional
        self.assertEqual(medication.created_by, appointment.created_by)
    
    def test_permission_hierarchy_enforcement(self):
        """Testa aplicação da hierarquia de permissões"""
        # Manager pode criar professional
        new_professional_user = User.objects.create_user(
            username='new_professional',
            email='new_professional@test.com'
        )
        
        new_professional = ProfessionalUser(
            user=new_professional_user,
            role='Enfermeiro',
            created_by=self.manager.user
        )
        new_professional.full_clean()  # Deve passar
        
        # Professional não pode criar outro professional
        another_professional_user = User.objects.create_user(
            username='another_professional',
            email='another_professional@test.com'
        )
        
        another_professional = ProfessionalUser(
            user=another_professional_user,
            role='ACS',
            created_by=self.professional.user
        )
        
        with self.assertRaises(Exception):  # ValidationError
            another_professional.full_clean()
    
    def test_data_consistency_across_soft_delete(self):
        """Testa consistência de dados com soft delete"""
        # Cria dados relacionados
        medication = Medication.objects.create(
            patient=self.patient,
            name='Teste Consistência',
            description='Teste',
            end_date=date.today() + timedelta(days=30),
            active=True,
            created_by=self.professional.user
        )
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=timezone.now() + timedelta(days=1),
            risk_level='Seguro',
            type='Consulta',
            status='Agendado',
            created_by=self.professional.user
        )
        
        # Soft delete do paciente
        self.patient.delete(user=self.manager.user)
        
        # Verifica que o paciente foi marcado como deletado
        self.assertTrue(self.patient.is_deleted)
        
        # Verifica que medicamentos e consultas ainda existem
        # (devido ao CASCADE, eles também seriam deletados em hard delete)
        medication.refresh_from_db()
        appointment.refresh_from_db()
        
        # Em um sistema real, você pode querer implementar lógica
        # para marcar medicamentos/consultas como inativos quando
        # o paciente é deletado
        self.assertFalse(medication.is_deleted)
        self.assertFalse(appointment.is_deleted)
    
    def test_audit_trail_completeness(self):
        """Testa completude do trilha de auditoria"""
        medication = Medication.objects.create(
            patient=self.patient,
            name='Auditoria Teste',
            description='Teste',
            end_date=date.today() + timedelta(days=30),
            active=True,
            created_by=self.professional.user
        )
        
        # Verifica campos de auditoria
        self.assertIsNotNone(medication.created_at)
        self.assertIsNotNone(medication.updated_at)
        self.assertEqual(medication.created_by, self.professional.user)
        
        # Atualiza medicamento
        medication.name = 'Nome Atualizado'
        medication.save(update_fields=['name'])
        
        # Verifica que updated_at foi atualizado
        self.assertIsNotNone(medication.updated_at)
        
        # Soft delete
        medication.delete(user=self.manager.user)
        
        # Verifica campos de delete
        self.assertTrue(medication.is_deleted)
        self.assertIsNotNone(medication.deleted_at)
        self.assertEqual(medication.deleted_by, self.manager.user)
