def single_profile_validation(user, current_model):

    from rest_framework import serializers
    from apps.accounts.models import PatientUser, ProfessionalUser, ManagerUser

    existing_profiles = []
    for model in [PatientUser, ProfessionalUser, ManagerUser]:
        if model != current_model and model.objects.filter(user=user).exists():
            existing_profiles.append(model.__name__)

    if existing_profiles:
        raise serializers.ValidationError(
            {"user": f"Esse usuário já possui um outro perfil de {', '.join(existing_profiles)}."}
        )