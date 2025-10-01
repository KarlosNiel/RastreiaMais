from rest_framework.routers import DefaultRouter
from .viewsets import PendencyViewset

router_pendencies= DefaultRouter()
router_pendencies.register(r'pendecies', PendencyViewset)

urlpatterns = router_pendencies.urls