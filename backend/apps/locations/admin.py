from django.contrib import admin
from .models import Address, MicroArea, Institution
from apps.commons.admin import BaseModelAdmin

# Register your models here.

@admin.register(Address)
class AddressAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'street',
        'number',
        'district',
        'city',
        'uf',
        'zipcode',
        'is_deleted',
    )
    list_filter = (
        'uf',
        'city',
        'is_deleted',
    )
    search_fields = (
        'street',
        'district',
        'city',
        'zipcode',
    )
    ordering = ('city', 'district')

@admin.register(MicroArea)
class MicroAreaAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'name',
        'address_display',
        'maps_localization',
        'is_deleted',
    )
    search_fields = (
        'name',
        'address__street',
        'address__city',
    )
    list_filter = ('is_deleted',)
    ordering = ('name',)

    def address_display(self, obj):
        """Exibe o endereço completo ou 'Sem endereço'"""
        return str(obj.address) if obj.address else "— Sem endereço —"
    address_display.short_description = "Endereço"

@admin.register(Institution)
class InstitutionAdmin(BaseModelAdmin):
    list_display = (
        'id',
        'name',
        'address_display',
        'maps_localization',
        'is_deleted',
    )
    search_fields = (
        'name',
        'address__street',
        'address__city',
    )
    list_filter = ('is_deleted',)
    ordering = ('name',)

    def address_display(self, obj):
        """Exibe o endereço completo ou 'Sem endereço'"""
        return str(obj.address) if obj.address else "— Sem endereço —"
    address_display.short_description = "Endereço"
