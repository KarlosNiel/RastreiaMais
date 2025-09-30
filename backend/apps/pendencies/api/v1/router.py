from rest_framework.routers import DefaultRouter
from .viewsets import PendencyViewset

router_pendency = DefaultRouter()
router_pendency.register(r'pendecies', PendencyViewset)

urlpatterns = router_pendency.urls