# Admin User Setup Guide

## Problem
If you can't log in as admin, the admin user doesn't exist in the Django database yet.

## Solution: Create Admin User

### Method 1: Using Django Management Command (Recommended)

```bash
cd django_backend
python manage.py create_admin
```

This will create/update the admin user with:
- **Email**: `adminvpaa@gmail.com`
- **Password**: `adminvpaa`
- **Username**: `adminvpaa`

### Method 2: Using Django Shell

```bash
cd django_backend
python manage.py shell
```

Then paste this code:

```python
from django.contrib.auth.models import User

email = 'adminvpaa@gmail.com'
password = 'adminvpaa'
username = 'adminvpaa'

try:
    user = User.objects.get(email=email)
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print(f"Admin user updated: {user.username}")
except User.DoesNotExist:
    try:
        user = User.objects.get(username=username)
        user.email = email
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Admin user updated: {user.username}")
    except User.DoesNotExist:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name='VPAA',
            last_name='Admin'
        )
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Admin user created: {user.username}")

print(f"\nAdmin credentials:")
print(f"Email: {email}")
print(f"Password: {password}")
```

### Method 3: Using createsuperuser

```bash
cd django_backend
python manage.py createsuperuser
```

Then enter:
- Username: `adminvpaa`
- Email: `adminvpaa@gmail.com`
- Password: `adminvpaa`

## Login Credentials

After creating the admin user, use these credentials:

- **Email**: `adminvpaa@gmail.com`
- **Password**: `adminvpaa`

Make sure to:
1. Select the **"Administrator"** tab on the login page
2. Enter the email and password exactly as shown
3. Click "Sign In as Admin"

## Troubleshooting

### Still can't login?

1. **Check if user exists:**
   ```bash
   python manage.py shell
   ```
   ```python
   from django.contrib.auth.models import User
   user = User.objects.get(email='adminvpaa@gmail.com')
   print(f"User exists: {user.username}, is_staff: {user.is_staff}")
   ```

2. **Reset password:**
   ```python
   user = User.objects.get(email='adminvpaa@gmail.com')
   user.set_password('adminvpaa')
   user.is_staff = True
   user.is_superuser = True
   user.save()
   ```

3. **Check Django server is running:**
   - Make sure `python manage.py runserver` is running
   - Check the API base URL in frontend matches the Django server URL

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for errors
   - Check Network tab to see if API calls are failing

## Verification

After setup, you should be able to:
- Login with `adminvpaa@gmail.com` / `adminvpaa`
- Access all admin routes (`/admin/*`)
- Create, edit, delete events
- Upload participants
- Issue certificates
- Generate reports

