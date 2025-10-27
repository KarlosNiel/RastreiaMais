def single_profile_validation(user, current_model): #! Valida que o User não tenha dois ou mais perfis do mesmo tipo

    from rest_framework import serializers
    from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser

    existing_profiles = [] #* lista que armazena o perfil que user nao utiliza
    for model in [PatientUser, ProfessionalUser, ManagerUser]:
        if model != current_model and model.objects.filter(user=user).exists():
            existing_profiles.append(model.__name__)

    if existing_profiles: #* se tentar criar outro tipo de perfil lança o erro
        raise serializers.ValidationError(
            {"user": f"Esse usuário já possui um outro perfil de {', '.join(existing_profiles)}."}
        )