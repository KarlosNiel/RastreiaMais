from rest_framework.routers import DefaultRouter
from .viewsets import SOAPReportViewSet, DashboardKPIsViewSet, ClinicalAnalyticsViewSet

router_reports = DefaultRouter()
router_reports.register(r"soap", SOAPReportViewSet, basename="soap-report")
router_reports.register(r"kpis", DashboardKPIsViewSet, basename="dashboard-kpis")
router_reports.register(r"clinical-analytics", ClinicalAnalyticsViewSet, basename="clinical-analytics")

