from django.contrib.auth.hashers import make_password
from django.db import transaction

DEFAULT_PROFESSIONAL_ACCOUNTS = (
    {
        "username": "carolina",
        "first_name": "Carolina",
        "last_name": "",
        "email": "carolina@rastreiamais.com",
        "password": "Carolina@123",
        "role": "Enfermeiro",
    },
    {
        "username": "jessica",
        "first_name": "Jessica",
        "last_name": "",
        "email": "jessica@rastreiamais.com",
        "password": "Jessica@123",
        "role": "Enfermeiro",
    },
    {
        "username": "hellen",
        "first_name": "Hellen",
        "last_name": "",
        "email": "hellen@rastreiamais.com",
        "password": "Hellen@123",
        "role": "Enfermeiro",
    },
)


def _find_existing_user(user_model, username: str, email: str):
    """Find an existing user by username or email (case-insensitive)."""
    user = user_model.objects.filter(username__iexact=username).first()
    if user is not None:
        return user
    return (
        user_model.objects.filter(email__iexact=email)
        .order_by("-is_active", "-id")
        .first()
    )


def _assert_no_conflicting_profile(user, patient_model, manager_model):
    """Raise ValueError if the user already holds a PatientUser or ManagerUser profile."""
    for conflict_model in (patient_model, manager_model):
        if conflict_model is None:
            continue
        conflict_mgr = getattr(conflict_model, "all_objects", conflict_model.objects)
        if conflict_mgr.filter(user=user).exists():
            raise ValueError(
                f"Usuário '{user.username}' já possui um perfil em {conflict_model.__name__}."
            )


def ensure_professional_account(
    *,
    user_model,
    professional_model,
    lockout_model=None,
    patient_model=None,
    manager_model=None,
    username: str,
    first_name: str,
    last_name: str,
    email: str,
    password: str,
    role: str,
    reset_password: bool = False,
    unlock: bool = False,
) -> tuple[object, object, bool]:
    """
    Create or restore a ProfessionalUser account idempotently.

    Compatible with both runtime models and Django migration historical models.
    Returns (user, professional_profile, created_user).
    """
    with transaction.atomic():
        user = _find_existing_user(user_model, username, email)
        created_user = False

        if user is None:
            user = user_model.objects.create(
                username=username,
                first_name=first_name,
                last_name=last_name,
                email=email,
                is_active=True,
                is_staff=False,
                password=make_password(password),
            )
            created_user = True
        else:
            _assert_no_conflicting_profile(user, patient_model, manager_model)
            user_changed = False
            if not user.first_name:
                user.first_name = first_name
                user_changed = True
            if not user.email or (reset_password and user.email.lower() != email.lower()):
                user.email = email
                user_changed = True
            if not user.is_active:
                user.is_active = True
                user_changed = True
            if reset_password or not user.password:
                user.password = make_password(password)
                user_changed = True
            if user_changed:
                user.save()

        # Runtime models expose all_objects (including soft-deleted rows);
        # historical migration models only expose the default objects manager.
        prof_mgr = getattr(professional_model, "all_objects", professional_model.objects)
        prof, _ = prof_mgr.get_or_create(
            user=user,
            defaults={
                "role": role,
                "is_deleted": False,
            },
        )
        prof_changed = False
        if prof.role != role:
            prof.role = role
            prof_changed = True
        if prof.is_deleted:
            prof.is_deleted = False
            prof_changed = True
        if getattr(prof, "deleted_at", None) is not None:
            prof.deleted_at = None
            prof_changed = True
        if getattr(prof, "deleted_by_id", None) is not None:
            prof.deleted_by_id = None
            prof_changed = True
        if prof_changed:
            prof.save()

        if unlock and lockout_model is not None:
            identifiers = {
                username.strip().lower(),
                email.strip().lower(),
                user.username.strip().lower(),
            }
            lockout_model.objects.filter(identifier__in=identifiers).delete()

        return user, prof, created_user


def ensure_default_professionals(
    *,
    user_model,
    professional_model,
    lockout_model=None,
    patient_model=None,
    manager_model=None,
    reset_password: bool = False,
    unlock: bool = False,
    usernames=None,
):
    """Provision configured default professional accounts (optionally filtered by usernames)."""
    target_usernames = {u.lower() for u in usernames} if usernames is not None else None
    results = []
    for account in DEFAULT_PROFESSIONAL_ACCOUNTS:
        if target_usernames is not None and account["username"].lower() not in target_usernames:
            continue
        results.append(
            ensure_professional_account(
                user_model=user_model,
                professional_model=professional_model,
                lockout_model=lockout_model,
                patient_model=patient_model,
                manager_model=manager_model,
                reset_password=reset_password,
                unlock=unlock,
                **account,
            )
        )
    return results
