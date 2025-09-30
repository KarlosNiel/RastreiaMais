from rest_framework.routers import DefaultRouter
from .viewsets import *

router_accounts = DefaultRouter()
router_accounts.register(r'patients', PatientUserViewset)
router_accounts.register(r'professionals', ProfessionalUserViewset)
router_accounts.register(r'managers', ManagerUserViewset)

urlpatterns = router_accounts.urls