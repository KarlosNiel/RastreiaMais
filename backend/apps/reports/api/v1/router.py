from rest_framework.routers import DefaultRouter
from .viewsets import SOAPReportViewSet

router_reports = DefaultRouter()
router_reports.register(r"soap", SOAPReportViewSet, basename="soap-report")
