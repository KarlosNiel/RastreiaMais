from rest_framework.routers import DefaultRouter
from .viewsets import HASViewset, DMViewset, OtherDCNTViewset

router_conditions = DefaultRouter()
router_conditions.register(r'has', HASViewset)
router_conditions.register(r'dm', DMViewset)
router_conditions.register(r'other-dcnt', OtherDCNTViewset)

urlpatterns = router_conditions.urls