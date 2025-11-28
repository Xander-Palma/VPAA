from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EventViewSet, ParticipantViewSet, login_view, me

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='events')
router.register(r'participants', ParticipantViewSet, basename='participants')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='api-login'),
    path('auth/me/', me, name='api-me'),
]
