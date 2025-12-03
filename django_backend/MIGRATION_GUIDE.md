# Database Migration Guide

After adding the new models, you need to create and run migrations:

## Steps

1. **Create migrations:**
   ```bash
   cd django_backend
   python manage.py makemigrations
   ```

2. **Apply migrations:**
   ```bash
   python manage.py migrate
   ```

3. **Create admin user (if not exists):**
   ```bash
   python manage.py createsuperuser
   ```
   Use:
   - Username: adminvpaa
   - Email: adminvpaa@gmail.com
   - Password: adminvpaa

4. **Create default admin user via Django shell (optional):**
   ```bash
   python manage.py shell
   ```
   Then run:
   ```python
   from django.contrib.auth.models import User
   user = User.objects.create_user('adminvpaa', 'adminvpaa@gmail.com', 'adminvpaa')
   user.is_staff = True
   user.is_superuser = True
   user.save()
   ```

## New Models Added

- `Certificate` - Stores certificate data
- `EventSession` - Multi-session event support
- `Quiz` - Quiz questions
- `EvaluationQuestion` - Custom evaluation questions

## Model Changes

- `Event` - Added fields: qr_code, certificate_template, speakers, agenda, is_multi_session
- `Participant` - Added fields: quiz_passed, quiz_score, quiz_data, attendance_logs, changed check_in_time/check_out_time to DateTimeField

