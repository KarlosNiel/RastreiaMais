import json
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class DashboardKPIsViewSetTest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword123",
            email="test@example.com"
        )
        self.url = "/api/v1/reports/kpis/"

    def test_unauthenticated_request_fails(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_authenticated_request_returns_kpis(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertIn("total_patients", data)
        self.assertIn("total_appointments", data)
        self.assertIn("critical_appointments", data)
        self.assertIn("critical_alerts", data)

    def test_professional_user_kpis(self):
        from apps.accounts.models import ProfessionalUser
        prof = ProfessionalUser.objects.create(user=self.user, role="Enfermeiro")
        self.client.force_authenticate(user=self.user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["total_patients"], 0)
        self.assertEqual(data["total_appointments"], 0)
