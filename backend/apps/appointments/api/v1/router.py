from rest_framework.routers import DefaultRouter
from .viewsets import AppointmentViewset

router_appointments = DefaultRouter()
router_appointments .register(r'appointments', AppointmentViewset)

urlpatterns = router_appointments.urls