from rest_framework.routers import DefaultRouter
from .viewsets import MedicationViewset

router_medications = DefaultRouter()
router_medications.register(r'medications', MedicationViewset)

urlpatterns = router_medications.urls