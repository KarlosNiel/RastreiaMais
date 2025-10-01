from django.conf.urls import include
from django.urls import path

from apps.accounts.api.v1.router import router_accounts
from apps.alerts.api.v1.router import router_alerts
from apps.appointments.api.v1.router import router_appointments
from apps.conditions.api.v1.router import router_conditions
from apps.locations.api.v1.router import router_locations
from apps.medications.api.v1.router import router_medications
from apps.pendencies.api.v1.router import router_pendencies

api_v1_urls = [
    path("accounts/", include((router_accounts.urls, "accounts"), namespace='accounts')),
    path("alerts/", include((router_alerts.urls, "alerts"), namespace='alerts')),
    path("appointments/", include((router_appointments.urls, "appointments"),  namespace='appointments')),
    path("conditions/", include((router_conditions.urls, "conditions"), namespace='conditions')),
    path("locations/", include((router_locations.urls, "locations"), namespace='locations')),
    path("medications/", include((router_medications.urls, "medications"), namespace='medications')),
    path("pendencies/", include((router_pendencies.urls, "pendencies"), namespace='pendencies'))
] 