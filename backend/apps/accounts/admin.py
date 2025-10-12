from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import PatientUser, ProfessionalUser, ManagerUser
from apps.commons.admin import BaseModelAdmin
from django.contrib.auth.models import User
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

admin.site.unregister(User)

@admin.register(User)
class UserAdmin(BaseUserAdmin):  
    #* Mostra campos extras no formulário de criação
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'first_name', 'last_name', 'email', 'password1', 'password2'),
        }),
    )
    
    #* Mostra campos extras no formulário de edição
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Informações pessoais', {'fields': ('first_name', 'last_name', 'email')}),
        ('Permissões', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Datas importantes', {'fields': ('last_login', 'date_joined')}),
    )

    list_display = ('username', 'first_name', 'last_name', 'email', 'is_staff')

@admin.register(PatientUser)
class PatientUserAdmin(BaseModelAdmin):
    list_display = ('id', 'get_full_name', 'created_by', 'updated_by', 'deleted_by', 'is_deleted', 'created_at',)
    list_filter = ('is_deleted',)
    
    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome completo'

# =============================================================================
@admin.register(ProfessionalUser)
class ProfessionalUserAdmin(BaseModelAdmin):
    list_display = ('id', 'get_full_name', 'role', 'created_by', 'is_deleted', 'created_at')
    list_filter = ('role', 'is_deleted')

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome completo'


# =============================================================================
@admin.register(ManagerUser)
class ManagerUserAdmin(BaseModelAdmin):
    list_display = ('id', 'get_full_name', 'phone', 'created_by', 'is_deleted', 'created_at')
    list_filter = ('is_deleted',)

    def get_full_name(self, obj):
        return obj.user.get_full_name()
    get_full_name.short_description = 'Nome completo'
