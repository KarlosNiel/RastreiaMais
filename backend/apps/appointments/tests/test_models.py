"""
Testes para modelos do app appointments
"""
from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timedelta
from apps.accounts.tests.factories import PatientWithCreatorFactory, ProfessionalWithManagerFactory
from apps.appointments.models import Appointment


class AppointmentModelTest(TestCase):
    """Testes para o modelo Appointment"""
    
    def setUp(self):
        self.patient = PatientWithCreatorFactory()
        self.professional = ProfessionalWithManagerFactory()
    
    def test_create_appointment(self):
        """Testa criação de consulta"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Moderado',
            description='Consulta de rotina',
            type='Consulta',
            status='Agendado'
        )
        
        self.assertIsInstance(appointment, Appointment)
        self.assertEqual(appointment.patient, self.patient)
        self.assertEqual(appointment.professional, self.professional)
        self.assertEqual(appointment.risk_level, 'Moderado')
        self.assertEqual(appointment.type, 'Consulta')
        self.assertEqual(appointment.status, 'Agendado')
    
    def test_appointment_str_method(self):
        """Testa método __str__ do Appointment"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Seguro',
            type='Consulta',
            status='Agendado'
        )
        
        expected_str = f"{self.patient} - {scheduled_time.strftime('%d/%m/%Y %H:%M')}"
        self.assertEqual(str(appointment), expected_str)
    
    def test_risk_level_choices(self):
        """Testa validação de choices do campo risk_level"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        # Testa choice válido
        appointment = Appointment(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Crítico',
            type='Consulta',
            status='Agendado'
        )
        appointment.full_clean()  # Deve passar
        
        # Testa choice inválido
        invalid_appointment = Appointment(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Invalid Level',
            type='Consulta',
            status='Agendado'
        )
        
        with self.assertRaises(Exception):  # ValidationError ou IntegrityError
            invalid_appointment.full_clean()
    
    def test_type_choices(self):
        """Testa validação de choices do campo type"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        # Testa choices válidos
        valid_types = ['Consulta', 'Exame', 'Evento']
        
        for appointment_type in valid_types:
            appointment = Appointment(
                patient=self.patient,
                professional=self.professional,
                scheduled_datetime=scheduled_time,
                risk_level='Seguro',
                type=appointment_type,
                status='Agendado'
            )
            appointment.full_clean()  # Deve passar
    
    def test_status_choices(self):
        """Testa validação de choices do campo status"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        # Testa choices válidos
        valid_statuses = ['Finalizado', 'Agendado', 'Cancelado']
        
        for status in valid_statuses:
            appointment = Appointment(
                patient=self.patient,
                professional=self.professional,
                scheduled_datetime=scheduled_time,
                risk_level='Seguro',
                type='Consulta',
                status=status
            )
            appointment.full_clean()  # Deve passar
    
    def test_soft_delete_inheritance(self):
        """Testa herança do soft delete do BaseModel"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Seguro',
            type='Consulta',
            status='Agendado'
        )
        
        # Verifica campos herdados do BaseModel
        self.assertIsNotNone(appointment.created_at)
        self.assertIsNotNone(appointment.updated_at)
        self.assertIsNotNone(appointment.created_by)
        
        # Testa soft delete
        appointment.delete()
        self.assertTrue(appointment.is_deleted)
        self.assertIsNotNone(appointment.deleted_at)
        
        # Testa restore
        appointment.restore()
        self.assertFalse(appointment.is_deleted)
        self.assertIsNone(appointment.deleted_at)
    
    def test_appointment_without_local(self):
        """Testa criação de consulta sem local específico"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Seguro',
            type='Consulta',
            status='Agendado',
            local=None  # Sem local específico
        )
        
        self.assertIsNone(appointment.local)
        self.assertIsInstance(appointment, Appointment)
    
    def test_appointment_without_description(self):
        """Testa criação de consulta sem descrição"""
        scheduled_time = timezone.now() + timedelta(days=1)
        
        appointment = Appointment.objects.create(
            patient=self.patient,
            professional=self.professional,
            scheduled_datetime=scheduled_time,
            risk_level='Seguro',
            type='Consulta',
            status='Agendado',
            description=None  # Sem descrição
        )
        
        self.assertIsNone(appointment.description)
        self.assertIsInstance(appointment, Appointment)
