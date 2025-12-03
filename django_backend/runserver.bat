@echo off
echo Starting Django server with virtual environment...
cd /d "%~dp0"
.venv\Scripts\python.exe manage.py runserver
pause

