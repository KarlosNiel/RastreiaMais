from behave import when, then
from apps.accounts.models import ManagerUser

@when('eu crio um ManagerUser com telefone "{telefone}"')
def step_impl(context, telefone):
    context.manager = ManagerUser.objects.create(
        user=context.user,
        phone=telefone
    )

@then("o ManagerUser deve ser criado com sucesso")
def step_impl(context):
    assert isinstance(context.manager, ManagerUser)
    assert context.manager.user == context.user