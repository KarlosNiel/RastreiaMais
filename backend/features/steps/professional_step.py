from behave import when, then
from django.core.exceptions import ValidationError
from apps.accounts.models import ProfessionalUser

@when('eu crio um ProfessionalUser com role "{role}"')
def step_impl(context, role):
    context.professional = ProfessionalUser.objects.create(
        user=context.user,
        role=role
    )

@then('o ProfessionalUser deve ser criado com sucesso e ter role "{role}"')
def step_impl(context, role):
    assert isinstance(context.professional, ProfessionalUser)
    assert context.professional.role == role


@when('eu tento criar um ProfessionalUser com role "{role}"')
def step_impl(context, role):
    context.professional = ProfessionalUser(
        user=context.user,
        role=role
    )
    try:
        context.professional.full_clean()
    except ValidationError as e:
        context.error = e


@then("deve ocorrer um erro de validação")
def step_impl(context):
    assert isinstance(context.error, ValidationError)