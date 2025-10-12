from django.contrib import admin
from apps.accounts.admin import BaseModelAdmin
from apps.alerts.models import Alert


# Register your models here.
@admin.register(Alert)
class AlertAdmin(BaseModelAdmin):
    list_display = ('id', 'title', 'risk_level', 'is_deleted', 'created_by', 'created_at')
    list_filter = ('risk_level', 'is_deleted')
    search_fields = ('title', 'description')