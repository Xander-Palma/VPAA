# Troubleshooting: ModuleNotFoundError

## Problem
Even after installing packages, you get `ModuleNotFoundError: No module named 'reportlab'`

## Root Cause
You're running Django with the **wrong Python interpreter**. The packages are installed in your virtual environment (`.venv`), but you're running Django with system Python.

## Solution

### ✅ CORRECT Way to Run Django

**Always use the virtual environment Python:**

```bash
cd django_backend
.venv\Scripts\python.exe manage.py runserver
```

**OR use the batch script I created:**
```bash
cd django_backend
runserver.bat
```

### ❌ WRONG Way (This causes the error)

```bash
python manage.py runserver  # Uses system Python, not .venv Python!
```

## Verify Your Setup

1. **Check which Python you're using:**
   ```bash
   cd django_backend
   .venv\Scripts\python.exe --version
   ```

2. **Verify packages are installed:**
   ```bash
   cd django_backend
   .venv\Scripts\python.exe verify_install.py
   ```

3. **Install packages in the virtual environment:**
   ```bash
   cd django_backend
   .venv\Scripts\python.exe -m pip install -r requirements.txt
   ```

## Quick Fix Steps

1. **Activate virtual environment:**
   ```bash
   cd django_backend
   .venv\Scripts\activate
   ```
   You should see `(.venv)` in your prompt.

2. **Install packages:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run server:**
   ```bash
   python manage.py runserver
   ```
   (Now `python` refers to `.venv\Scripts\python.exe`)

## Alternative: Use Batch Scripts

I've created helper scripts:

- **`runserver.bat`** - Runs Django server with correct Python
- **`install_dependencies.bat`** - Installs all packages
- **`verify_install.py`** - Checks if packages are installed

## Why This Happens

- System Python: `C:\Users\...\AppData\Local\Programs\Python\Python313\python.exe`
- Virtual Environment Python: `django_backend\.venv\Scripts\python.exe`

When you run `python manage.py runserver` without activating the venv, it uses system Python which doesn't have the packages!

