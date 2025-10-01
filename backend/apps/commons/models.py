from django.db import models
from django.utils.timezone import now
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError

# Create your models here.

#QuerySet=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class SoftDeleteQuerySet(models.QuerySet): #* Custom QuerySet para implementar soft_delete.
    def delete(self):
        return super().update(is_deleted=True, deleted_at=now())
    
    def restore(self):
        return super().update(is_deleted=False, deleted_at=None )
    
    def hard_delete(self): #! Cuidado! deleta permanentemente o objeto.
        return super().delete()

    def active(self):
        return self.filter(is_deleted=False)
    
    def deleted(self):
        return self.filter(is_deleted=True)
    
#Manager=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class ActiveManager(models.Manager): #* Inclui apenas os objetos que não foram soft_deleted.
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(is_deleted=False)
    
class AllManager(models.Manager): #* Inclui todos os objetos, mesmo os com soft_delete, mas cuidado com o hard_delete!
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db)
    
#BaseModel=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
class BaseModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(User, related_name='%(class)s_created', on_delete=models.SET_NULL, null=True, blank=True)
    updated_by = models.ForeignKey(User, related_name='%(class)s_updated', on_delete=models.SET_NULL, null=True, blank=True)
    deleted_by = models.ForeignKey(User, related_name='%(class)s_deleted', on_delete=models.SET_NULL, null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(null=True, blank=True)

    # Managers
    objects = ActiveManager()
    all_objects = AllManager()

    class Meta:
        abstract = True
        ordering = ['-created_at'] #* Ordenando pelo criado mais recentemente.
        get_latest_by = 'created_at' #* Permite pegar o Primeiro ou ultimo (ex: <model>.objects.latest() ou earliest)

    def clean(self):
        super().clean()

        if self.is_deleted and not self.deleted_at:
            raise ValidationError("Se is_deleted=True, deleted_at deve estar preenchido")
        
        if not self.is_deleted and self.deleted_at: #* se is deleted for false e deleted_at estiver preenchido, self.deleted_at vira null
            self.deleted_at = None
    

    def delete(self, user=None):
        self.is_deleted = True
        self.deleted_at = now()

        if user:
            self.deleted_by = user

        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by'])

    def restore(self, user=None):
        self.is_deleted = False
        self.deleted_at = None
        self.deleted_by = None

        if user:
            self.updated_by = user

        self.save(update_fields=['is_deleted', 'deleted_at', 'deleted_by', 'updated_by'])

    def hard_delete(self, keep_parents=False): #* Esse keep_parents serve pra dizer se os objetos pais do objeto deletado devem ser deletados também
        super().delete(keep_parents=keep_parents)
    
    def get_creator_profile(self, user):
        """Retorna o tipo de user que criou o objeto"""
        if not user:
            return None
        
        from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser
        
        for model in [PatientUser, ProfessionalUser, ManagerUser]:
            try:
                return model.objects.get(user=user)
            except model.DoesNotExist:
                continue 
        return None

