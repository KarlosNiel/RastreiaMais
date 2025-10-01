from rest_framework.routers import DefaultRouter
from .viewsets import HASViewset, DMViewset, OtherDCNTViewset

router_conditions = DefaultRouter()
router_conditions.register(r'systolic-hypertension-cases', HASViewset)
router_conditions.register(r'diabetes-mellitus-cases', DMViewset)
router_conditions.register(r'other-dcnt-cases', OtherDCNTViewset)

urlpatterns = router_conditions.urls