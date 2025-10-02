from behave import given, when, then
from django.contrib.auth.models import User
from django.db import IntegrityError
from apps.accounts.models import PatientUser


@given('um usuário base chamado "{nome}" com username "{username}" e email "{email}"')
def step_impl(context, nome, username, email):
    if not hasattr(context, "users"):
        context.users = {}
    parts = nome.split(" ") if nome else []
    first = parts[0] if parts else ""
    last = " ".join(parts[1:]) if len(parts) > 1 else ""
    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=first,
        last_name=last
    )
    context.users[username] = user
    context.user = user  # mantém o último como "ativo"


@when('eu crio um PatientUser para o usuário "{username}"')
def step_impl(context, username):
    user = context.users[username]
    context.patient = PatientUser.objects.create(user=user)


@then("o PatientUser deve ser criado com sucesso")
def step_impl(context):
    assert isinstance(context.patient, PatientUser)
    assert context.patient.user == context.user
    assert context.patient.is_deleted is False


@then('a string de representação deve ser "{expected}"')
def step_impl(context, expected):
    assert str(context.patient) == expected


@when('eu tento criar outro PatientUser para o mesmo usuário "{username}"')
def step_impl(context, username):
    user = context.users[username]
    try:
        PatientUser.objects.create(user=user)
    except IntegrityError as e:
        context.error = e


@then("deve ocorrer um erro de integridade")
def step_impl(context):
    assert isinstance(context.error, IntegrityError)


@when("eu deleto esse PatientUser")
def step_impl(context):
    context.patient.delete()


@then("ele deve estar marcado como deletado")
def step_impl(context):
    context.patient.refresh_from_db()
    assert context.patient.is_deleted is True


@when("eu restauro esse PatientUser")
def step_impl(context):
    context.patient.restore()


@then("ele deve estar ativo novamente")
def step_impl(context):
    context.patient.refresh_from_db()
    assert context.patient.is_deleted is False
