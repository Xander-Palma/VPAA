"""
Run this to fix migrations when prompted for default values
Usage: python migrate_fix.py
"""
import subprocess
import sys

print("Creating migrations with default values...")
print("When prompted, we'll provide timezone.now as default")

# Run makemigrations and provide input
result = subprocess.run(
    [sys.executable, "manage.py", "makemigrations"],
    input="1\n",
    text=True,
    cwd="."
)

if result.returncode == 0:
    print("\n✓ Migrations created successfully!")
    print("\nNow run: python manage.py migrate")
else:
    print("\n✗ Migration creation failed")
    sys.exit(1)

