from behave import given, when, then
from django.core.exceptions import ValidationError
from apps.alerts.models import Alert


@given('um alerta Alert base com título "{title}" e descrição "{description}"')
def step_impl(context, title, description):
    context.alert_data = {
        "title": title,
        "description": description
    }


@when('eu crio o alerta Alert')
def step_impl(context):
    context.alert = Alert.objects.create(**context.alert_data)


@when('eu crio o alerta Alert com risco "{risk_level}"')
def step_impl(context, risk_level):
    context.alert = Alert.objects.create(**context.alert_data, risk_level=risk_level)


@when('eu tento criar o alerta Alert com risco inválido "{risk_level}"')
def step_impl(context, risk_level):
    context.alert = Alert(**context.alert_data, risk_level=risk_level)
    try:
        context.alert.full_clean()
    except ValidationError as e:
        context.error = e


@then("o Alert deve ser criado com sucesso")
def step_impl(context):
    assert context.alert.pk is not None


@then('o nível de risco do Alert deve ser "{expected_risk}"')
def step_impl(context, expected_risk):
    assert context.alert.risk_level == expected_risk


@then('a string de representação do Alert deve ser "{expected}"')
def step_impl(context, expected):
    assert str(context.alert) == expected


@then("deve ocorrer um erro de validação no Alert")
def step_impl(context):
    assert hasattr(context, "error")
    assert isinstance(context.error, ValidationError)


@when("eu deleto o alerta Alert")
def step_impl(context):
    context.alert.delete()


@then("ele deve estar marcado como deletado no Alert")
def step_impl(context):
    context.alert.refresh_from_db()
    assert context.alert.is_deleted is True
