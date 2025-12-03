#!/usr/bin/env python
"""Verify all required packages are installed"""
import sys

# Map of package names (for pip install) to import names
required_packages = {
    'qrcode': 'qrcode',
    'Pillow': 'PIL',  # Pillow imports as PIL
    'reportlab': 'reportlab',
    'openpyxl': 'openpyxl',
    'pandas': 'pandas',
    'sendgrid': 'sendgrid',
    'python-dotenv': 'dotenv',  # python-dotenv imports as dotenv
    'django': 'django',
    'djangorestframework': 'rest_framework',  # djangorestframework imports as rest_framework
    'django-cors-headers': 'corsheaders',  # django-cors-headers imports as corsheaders
}

missing = []
for package_name, import_name in required_packages.items():
    try:
        __import__(import_name)
        print(f"✓ {package_name} - OK")
    except ImportError:
        print(f"✗ {package_name} - MISSING")
        missing.append(package_name)

if missing:
    print(f"\nMissing packages: {', '.join(missing)}")
    print(f"\nInstall with: pip install {' '.join(missing)}")
    sys.exit(1)
else:
    print("\n✓ All packages installed!")
    sys.exit(0)

