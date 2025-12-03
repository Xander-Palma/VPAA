from django.contrib import admin
from .models import Event, Participant, UserProfile

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'date', 'status', 'participants_count')


@admin.register(Participant)
class ParticipantAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'event', 'status')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'qr_code', 'created_at')
    search_fields = ('user__email', 'user__username', 'qr_code')
    readonly_fields = ('created_at', 'updated_at')
