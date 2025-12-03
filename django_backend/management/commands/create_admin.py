"""
Django management command to create admin user
Usage: python manage.py create_admin
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Creates the admin user for VPAA system'

    def handle(self, *args, **options):
        email = 'adminvpaa@gmail.com'
        password = 'adminvpaa'
        username = 'adminvpaa'

        try:
            user = User.objects.get(email=email)
            self.stdout.write(self.style.WARNING(f'Admin user already exists: {user.username}'))
            # Update password and permissions
            user.set_password(password)
            user.is_staff = True
            user.is_superuser = True
            user.save()
            self.stdout.write(self.style.SUCCESS('Admin password and permissions updated!'))
        except User.DoesNotExist:
            # Try by username
            try:
                user = User.objects.get(username=username)
                user.email = email
                user.set_password(password)
                user.is_staff = True
                user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Admin user updated: {user.username}'))
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
                self.stdout.write(self.style.SUCCESS(f'Admin user created: {user.username}'))

        self.stdout.write(self.style.SUCCESS('\nAdmin credentials:'))
        self.stdout.write(f'  Email: {email}')
        self.stdout.write(f'  Password: {password}')
        self.stdout.write(f'  Username: {user.username}'))

