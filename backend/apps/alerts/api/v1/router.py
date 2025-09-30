from rest_framework.routers import DefaultRouter
from .viewsets import AlertViewset

router_alerts = DefaultRouter()
router_alerts.register(r'alerts', AlertViewset)

urlpatterns = router_alerts.urls