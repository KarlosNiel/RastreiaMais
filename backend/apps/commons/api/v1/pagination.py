from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    """
    Paginação padrão com suporte a:
      - ?page=N
      - ?page_size=N (máximo 200)
      - ?page_size=all ou ?paginate=false (desativa paginação quando explicitamente solicitado)
    """
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 200

    def paginate_queryset(self, queryset, request, view=None):
        if request.query_params.get('paginate', '').lower() == 'false' or request.query_params.get('page_size', '').lower() == 'all':
            return None
        return super().paginate_queryset(queryset, request, view)

