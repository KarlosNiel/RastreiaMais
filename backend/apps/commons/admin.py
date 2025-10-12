from django.contrib import admin

# Register your models here.
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