from django.urls import path, include
from django.contrib import admin
from rest_framework.authtoken import views as drf_views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/token/', drf_views.obtain_auth_token, name='api-token'),
    path('api/', include('api.urls')),
]
