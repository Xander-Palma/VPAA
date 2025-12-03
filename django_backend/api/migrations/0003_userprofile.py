# Generated manually for UserProfile model

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import uuid


def generate_qr_code(apps, schema_editor):
    """Generate QR codes for existing users"""
    UserProfile = apps.get_model('api', 'UserProfile')
    
    for profile in UserProfile.objects.all():
        if not profile.qr_code:
            profile.qr_code = f"USER-{profile.user.id}-{uuid.uuid4().hex[:12].upper()}"
            profile.save()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('api', '0002_event_agenda_event_certificate_template_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('qr_code', models.CharField(blank=True, max_length=255, null=True, unique=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.RunPython(generate_qr_code, migrations.RunPython.noop),
    ]

