from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EventViewSet, ParticipantViewSet, CertificateViewSet,
    login_view, me, register_view, reports_attendance, 
    reports_evaluation, scan_qr_code
)

router = DefaultRouter()
router.register(r'events', EventViewSet, basename='events')
router.register(r'participants', ParticipantViewSet, basename='participants')
router.register(r'certificates', CertificateViewSet, basename='certificates')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', login_view, name='api-login'),
    path('auth/register/', register_view, name='api-register'),
    path('auth/me/', me, name='api-me'),
    path('reports/attendance/<int:event_id>/', reports_attendance, name='reports-attendance'),
    path('reports/evaluation/<int:event_id>/', reports_evaluation, name='reports-evaluation'),
    path('scan/qr/', scan_qr_code, name='scan-qr'),
]
