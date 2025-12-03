# Updated Credentials

## Admin Credentials (UPDATED)

**Email**: `adminvpaa@gmail.com`  
**Password**: `adminvpaa` (changed from `admin123`)

## Participant Login (UPDATED)

Participants can now:
- **Login with ANY email** (not just @hcdc.edu.ph)
- **Use their own password** (set during registration)
- **Auto-register** if account doesn't exist

### How It Works:

1. **Existing Users**: Enter email and password → Login
2. **New Users**: Enter email and password → System automatically creates account → Login

### Examples:

- `student@hcdc.edu.ph` / `password123` ✅
- `john.doe@gmail.com` / `mypassword` ✅
- `participant@example.com` / `secret123` ✅

All emails are accepted for participants. The system will:
- Try to login first
- If login fails, automatically register the user
- Save the account in Django
- Log them in immediately

## Setup Admin User

To create/update the admin user with new password:

```bash
cd django_backend
python manage.py create_admin
```

Or manually:
```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User

user, created = User.objects.get_or_create(
    username='adminvpaa',
    defaults={
        'email': 'adminvpaa@gmail.com',
        'first_name': 'VPAA',
        'last_name': 'Admin',
        'is_staff': True,
        'is_superuser': True
    }
)
user.set_password('adminvpaa')
user.is_staff = True
user.is_superuser = True
user.save()
print(f"Admin user {'created' if created else 'updated'}!")
```

