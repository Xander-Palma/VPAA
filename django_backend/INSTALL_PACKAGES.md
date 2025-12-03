# Installing Required Python Packages

The error `ModuleNotFoundError: No module named 'qrcode'` means the required packages aren't installed.

## Quick Fix

### Option 1: Run the batch script (Windows)
```bash
cd django_backend
install_dependencies.bat
```

### Option 2: Manual installation
Make sure your virtual environment is activated, then run:

```bash
cd django_backend
.venv\Scripts\activate
pip install -r requirements.txt
```

Or install individually:
```bash
pip install qrcode>=7.4.2
pip install Pillow>=10.0.0
pip install reportlab>=4.0.0
pip install openpyxl>=3.1.0
pip install pandas>=2.0.0
pip install sendgrid>=6.10.0
pip install python-dotenv>=1.0.0
```

### Option 3: Using Python directly
```bash
cd django_backend
.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## Verify Installation

After installation, verify the packages are installed:
```bash
.venv\Scripts\python.exe -m pip list
```

You should see:
- qrcode
- Pillow
- reportlab
- openpyxl
- pandas
- sendgrid
- python-dotenv

## After Installation

1. Restart your Django server:
   ```bash
   python manage.py runserver
   ```

2. The server should start without the `ModuleNotFoundError`.

## Required Packages

- **qrcode**: For generating QR codes
- **Pillow**: Image processing (required by qrcode)
- **reportlab**: For PDF certificate generation
- **openpyxl**: For reading Excel files
- **pandas**: For CSV/Excel data processing
- **sendgrid**: For sending emails (optional, has SMTP fallback)
- **python-dotenv**: For environment variable management

