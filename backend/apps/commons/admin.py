from django.contrib import admin
from django.contrib.admin.models import LogEntry

# Register your models here.
@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    date_hierarchy = "action_time"

    list_display = ["action_time", "user", "content_type", "object_repr", "action_flag", "change_message"]
    list_filter = ["action_flag", "content_type", "user"]
    search_fields = ["object_repr", "change_message"]

    def has_add_permission(self, request): #! Impede a criação manual de logs
        return False
    
    def has_change_permission(self, request, obj=None): #! Impede a edição de logs
        return False
    
    def has_delete_permission(self, request, obj =None): #! Impede a remoção de logs
        return False
    
    def has_view_permission(self, request, obj=None): #! Permite que apenas superusers vejam os logs
        return request.user.is_superuser

class BaseModelAdmin(admin.ModelAdmin):
    readonly_fields = ('created_at', 'updated_at', 'deleted_at') #* Campos de leitura
    list_filter = ('is_deleted', 'created_at', 'updated_at') #* Filtragem 
    search_fields = ('id', 'user__username', 'user__first_name', 'user__last_name') #* Pesquisa 
    ordering = ('-created_at',)

    def get_queryset(self, request):
        qs = self.model.all_objects.get_queryset() #* Garante que o admin possa ver inclusive os registros soft-deletados
        return qs
    
    def delete_model(self, request, obj): 
        obj.delete(user=request.user) #* Chamado quando você deleta UM objeto pela página de detalhes

    def save_model(self, request, obj, form, change):
        obj.full_clean()
        obj.save(user=request.user)

    @admin.action(description="Soft delete nos selecionados")
    def soft_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.delete(user=request.user) #* Action personalizada para fazer soft delete de objetos selecionados.

    @admin.action(description="Restaurar selecionados")
    def restore_selected(self, request, queryset):
        for obj in queryset:
            obj.restore(user=request.user) #* Action personalizada para restaurar objetos soft-deletados.

    @admin.action(description="Hard delete nos selecionados") 
    def hard_delete_selected(self, request, queryset):
        for obj in queryset:
            obj.hard_delete() #! Action para apagar permanentemente os objetos selecionados.


    actions = ['soft_delete_selected', 'restore_selected', 'hard_delete_selected']