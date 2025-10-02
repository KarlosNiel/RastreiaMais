from django.test import TestCase
from django.core.exceptions import ValidationError
from apps.alerts.models import Alert, RISK_CHOICES


class AlertModelTest(TestCase):
    """Testes para o modelo Alert"""

    def setUp(self):
        """Setup comum para todos os testes"""
        self.alert_data = {
            "title": "Alerta de Teste",
            "description": "Descrição do alerta de teste."
        }

    def test_create_alert_default_risk(self):
        """Testa criação de Alert com risco padrão"""
        alert = Alert.objects.create(**self.alert_data)

        self.assertIsInstance(alert, Alert)
        self.assertEqual(alert.title, self.alert_data["title"])
        self.assertEqual(alert.description, self.alert_data["description"])
        self.assertEqual(alert.risk_level, "Moderado")  # Valor padrão

    def test_create_alert_with_risk(self):
        """Testa criação de Alert com cada nível de risco"""
        for risk, _ in RISK_CHOICES:
            alert = Alert.objects.create(**self.alert_data, risk_level=risk)
            self.assertEqual(alert.risk_level, risk)

    def test_alert_str_method(self):
        """Testa método __str__ do Alert"""
        alert = Alert.objects.create(**self.alert_data, risk_level="Crítico")
        expected_str = f"[Crítico] {self.alert_data['title']}"
        self.assertEqual(str(alert), expected_str)

    def test_invalid_risk_level_raises_validation_error(self):
        """Testa que um nível de risco inválido lança ValidationError"""
        alert = Alert(**self.alert_data, risk_level="Inexistente")
        with self.assertRaises(ValidationError):
            alert.full_clean()  # Chama validação do Django para choices

    def test_soft_delete_alert(self):
        """Testa se o Alert herda o soft delete do BaseModel"""
        alert = Alert.objects.create(**self.alert_data)
        alert.delete()
        alert.refresh_from_db()
        self.assertTrue(alert.is_deleted)
