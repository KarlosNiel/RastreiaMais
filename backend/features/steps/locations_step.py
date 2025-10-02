from behave import given, when, then
from apps.locations.models import Address, Institution, MicroArea
from django.core.exceptions import ValidationError

# ---------- Address ----------
@given('um endereço base com UF "{uf}", cidade "{city}", distrito "{district}", rua "{street}" e número {number:d}')
def step_impl(context, uf, city, district, street, number):
    context.address = Address(
        uf=uf,
        city=city,
        district=district,
        street=street,
        number=number
    )

@when('eu defino o CEP como "{zipcode}"')
def step_impl(context, zipcode):
    context.address.zipcode = zipcode
    try:
        context.address.full_clean()
        context.validation_passed = True
        context.validation_error = None
    except ValidationError as e:
        context.validation_passed = False
        context.validation_error = e

@then('a validação do endereço deve passar')
def step_impl(context):
    assert getattr(context, "validation_passed", False) is True, "A validação do endereço falhou"

@then('deve ocorrer um erro de validação no endereço')
def step_impl(context):
    assert isinstance(getattr(context, "validation_error", None), ValidationError), "Não ocorreu ValidationError"

@then('a string de representação do endereço deve ser "{expected}"')
def step_impl(context, expected):
    assert str(context.address) == expected, f"Esperado '{expected}', obtido '{str(context.address)}'"

# ---------- Institution ----------
@when('eu crio uma Institution chamada "{name}"')
def step_impl(context, name):
    context.address.save()  # necessário para OneToOneField
    context.institution = Institution.objects.create(name=name, address=context.address)

@then('a string de representação da Institution deve ser "{expected}"')
def step_impl(context, expected):
    assert str(context.institution) == expected, f"Esperado '{expected}', obtido '{str(context.institution)}'"

# ---------- MicroArea ----------
@when('eu crio uma MicroArea chamada "{name}"')
def step_impl(context, name):
    context.address.save()  # necessário para OneToOneField
    context.micro_area = MicroArea.objects.create(name=name, address=context.address)

@then('a string de representação da MicroArea deve ser "{expected}"')
def step_impl(context, expected):
    assert str(context.micro_area) == expected, f"Esperado '{expected}', obtido '{str(context.micro_area)}'"
