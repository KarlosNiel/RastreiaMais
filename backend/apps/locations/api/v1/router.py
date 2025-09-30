from rest_framework.routers import DefaultRouter
from .viewsets import AddressViewset, MicroAreaViewset, InstitutionViewset

router_locations = DefaultRouter()
router_locations.register(r'address', AddressViewset)
router_locations.register(r'micro-areas', MicroAreaViewset)
router_locations.register(r'institutions', InstitutionViewset)

urlpatterns = router_locations.urls