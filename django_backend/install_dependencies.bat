@echo off
echo Installing required Python packages...
cd /d "%~dp0"
.venv\Scripts\python.exe -m pip install --upgrade pip
.venv\Scripts\python.exe -m pip install qrcode>=7.4.2
.venv\Scripts\python.exe -m pip install Pillow>=10.0.0
.venv\Scripts\python.exe -m pip install reportlab>=4.0.0
.venv\Scripts\python.exe -m pip install openpyxl>=3.1.0
.venv\Scripts\python.exe -m pip install pandas>=2.0.0
.venv\Scripts\python.exe -m pip install sendgrid>=6.10.0
.venv\Scripts\python.exe -m pip install python-dotenv>=1.0.0
echo.
echo Installation complete!
echo.
pause

