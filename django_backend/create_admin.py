"""
Script to create admin user
Run: python manage.py shell < create_admin.py
Or: python manage.py shell, then paste the code
"""
from django.contrib.auth.models import User

# Create admin user if it doesn't exist
email = 'adminvpaa@gmail.com'
password = 'adminvpaa'
username = 'adminvpaa'

try:
    user = User.objects.get(email=email)
    print(f"Admin user already exists: {user.username}")
    # Update password
    user.set_password(password)
    user.is_staff = True
    user.is_superuser = True
    user.save()
    print("Admin password updated!")
except User.DoesNotExist:
    # Try by username
    try:
        user = User.objects.get(username=username)
        user.email = email
        user.set_password(password)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        print(f"Admin user updated: {user.username}")
    except User.DoesNotExist:
        # Create new user
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
print(f"Username: {user.username}")

