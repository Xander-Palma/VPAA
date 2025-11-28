Django backend for VPAA frontend.

Quick start (create virtualenv first):

python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
cd django_backend
python manage.py migrate
python manage.py createsuperuser  # optional
python manage.py runserver 8000

API endpoints:
- POST /api/auth/login/  (body: {"username": "...", "password": "..."})
- GET  /api/auth/me/     (requires token header `Authorization: Token <token>`)
- GET/POST /api/events/
