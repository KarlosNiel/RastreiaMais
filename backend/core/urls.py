"""
Configuração de URLs para o projeto core.

A lista `urlpatterns` roteia URLs para views. Para mais informações, veja:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Exemplos:
Views baseadas em função
    1. Adicione uma importação:  from my_app import views
    2. Adicione uma URL ao urlpatterns:  path('', views.home, name='home')
Views baseadas em classe
    1. Adicione uma importação:  from other_app.views import Home
    2. Adicione uma URL ao urlpatterns:  path('', Home.as_view(), name='home')
Incluindo outro URLconf
    1. Importe a função include(): from django.urls import include, path
    2. Adicione uma URL ao urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import include

from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .router.api import api_urls    

urlpatterns = [
    path('admin/', admin.site.urls),
    path(
        'api/', 
        include(
            (api_urls, 'core.router.api.api_urls'), 
            namespace='api'
        )
    ),
        path(
        'api/token/',
        TokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),
    path(
        'api/token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path(
        'api/docs/',
        SpectacularSwaggerView.as_view(url_name='schema'),
        name='swagger-ui'
    ),
    path(
        'api/redoc/',
        SpectacularRedocView.as_view(url_name='schema'),
        name='redoc'
    ),
]
