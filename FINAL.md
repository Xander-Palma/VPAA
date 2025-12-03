# VPAA Event Coordination & Certificate Issuance System
## Complete System Documentation

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Installation Guide](#installation-guide)
4. [User Manual](#user-manual)
5. [Code Documentation](#code-documentation)
6. [Complete Feature List](#complete-feature-list)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

The **VPAA Event Coordination & Certificate Issuance System** is a comprehensive web-based platform designed for managing academic events, tracking participant attendance, collecting evaluations, and automatically generating and distributing certificates. The system supports role-based access control with separate interfaces for administrators and participants.

### Architecture

- **Backend**: Django REST Framework (Python)
- **Frontend**: React + TypeScript + Vite
- **Database**: SQLite (default) / PostgreSQL (production)
- **State Management**: Zustand
- **UI Components**: shadcn/ui
- **Authentication**: Token-based (Django REST Framework)

### Key Capabilities

- ✅ Event lifecycle management (creation, editing, conclusion)
- ✅ QR code-based attendance tracking
- ✅ Multi-session event support
- ✅ Participant registration and management
- ✅ Evaluation form collection
- ✅ Quiz/assessment system
- ✅ Automatic certificate generation (PDF)
- ✅ Email distribution of certificates
- ✅ Certificate verification system
- ✅ Comprehensive reporting (CSV/PDF)
- ✅ Bulk participant upload (CSV/Excel)
- ✅ Role-based access control (Admin/Participant)

---

## 📦 Prerequisites

### Required Software

#### Backend Prerequisites
- **Python 3.8+** (Python 3.10+ recommended)
- **pip** (Python package manager)
- **Virtual Environment** (venv or virtualenv)
- **Git** (for cloning the repository)

#### Frontend Prerequisites
- **Node.js 16+** (Node.js 18+ recommended)
- **npm** or **yarn** (package manager)
- **Git** (for cloning the repository)

#### Optional (Production)
- **PostgreSQL** (for production database)
- **SendGrid Account** (for email delivery)
- **Web Server** (Nginx/Apache for production deployment)

### System Requirements

- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **RAM**: Minimum 4GB (8GB recommended)
- **Disk Space**: 500MB for installation + database storage
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

---

## 🚀 Installation Guide

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd VPAA---Seminar-and-Certificate-Automation
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory

```bash
cd django_backend
```

#### 2.2 Create Virtual Environment

**Windows:**
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Linux/macOS:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### 2.3 Install Dependencies

```bash
pip install -r requirements.txt
```

**Or use the provided batch script (Windows):**
```bash
install_dependencies.bat
```

#### 2.4 Verify Installation

```bash
python verify_install.py
```

#### 2.5 Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### 2.6 Create Admin User

**Option 1: Using Management Command**
```bash
python manage.py create_admin
```

**Option 2: Using Django Shell**
```bash
python manage.py shell < create_admin.py
```

**Option 3: Manual Creation**
```bash
python manage.py createsuperuser
```

**Default Admin Credentials:**
- Email: `adminvpaa@gmail.com`
- Password: `admin123`

#### 2.7 Start Backend Server

**Windows:**
```bash
runserver.bat
```

**Linux/macOS:**
```bash
python manage.py runserver
```

The backend will run on `http://127.0.0.1:8000`

### Step 3: Frontend Setup

#### 3.1 Navigate to Project Root

```bash
cd ..
```

#### 3.2 Install Dependencies

```bash
npm install
```

#### 3.3 Start Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or the port shown in terminal)

### Step 4: Verify Installation

1. **Backend**: Visit `http://127.0.0.1:8000/api/` - Should show API root
2. **Frontend**: Visit `http://localhost:5173` - Should show login page
3. **Login**: Use admin credentials to access the system

---

## 👥 User Manual

### Admin User Guide

#### Login
1. Navigate to the login page
2. Select "Administrator" tab
3. Enter email: `adminvpaa@gmail.com`
4. Enter password: `admin123`
5. Click "Sign In as Admin"

#### Dashboard
- View event statistics
- Quick access to all management features
- Recent activity overview

#### Event Management

**Creating an Event:**
1. Go to **Events** page
2. Click **"Create Event"** button
3. Fill in event details:
   - Event Title (required)
   - Description
   - Date (required)
   - Start Time / End Time
   - Location
   - Requirements (Attendance, Evaluation, Quiz)
4. Preview certificate design in the "Certificate Preview" tab
5. Click **"Save Event"**

**Editing an Event:**
1. Find the event in the events list
2. Click the **⋮** (three dots) menu
3. Select **"Edit Details"**
4. Modify fields as needed
5. Click **"Update Event"**

**Concluding an Event:**
1. Find the event in the events list
2. Click **"Conclude Event"** button
3. Confirm the action
4. Event status changes to "completed"
5. Participants can now submit evaluations

**Uploading Participants:**
1. Find the event in the events list
2. Click the **⋮** menu
3. Select **"Upload Participants (CSV/Excel)"**
4. Select a file with columns: `name`, `email`
5. Click **"Upload"**

**Deleting an Event:**
1. Find the event in the events list
2. Click the **⋮** menu
3. Select **"Delete Event"**
4. Confirm deletion

#### Attendance Management

**QR Code Scanning:**
1. Go to **Attendance** page
2. Select an event from the dropdown
3. Click **"Start Scanning"** or use the camera icon
4. Scan participant QR code
5. Participant is automatically marked as present

**Manual Attendance:**
1. Go to **Events** page
2. Click **"View Participants"** for an event
3. Manually update participant status if needed

#### Certificate Management

**Issuing Certificates:**
1. Go to **Certificates** page
2. Select an event from the dropdown
3. View list of eligible participants
4. Click **"Issue Certificate"** for each participant
5. Certificate is generated, saved, and emailed automatically

**Bulk Certificate Issuance:**
1. Go to **Certificates** page
2. Select an event
3. Use bulk actions to issue certificates for all eligible participants

**Downloading Certificates:**
1. Go to **Certificates** page
2. Find the issued certificate
3. Click the **Download** icon
4. PDF certificate downloads to your device

**Resending Certificate Email:**
1. Go to **Certificates** page
2. Find the issued certificate
3. Click the **Mail** icon
4. Certificate is resent to participant's email

#### Reports

**Attendance Report:**
1. Go to **Reports** page
2. Select an event
3. Click **"Download Attendance Report"**
4. Choose format: CSV or PDF
5. Report downloads with participant attendance data

**Evaluation Report:**
1. Go to **Reports** page
2. Select an event
3. Click **"Download Evaluation Report"**
4. CSV file downloads with all evaluation responses

### Participant User Guide

#### Registration & Login

**First Time Registration:**
1. Navigate to login page
2. Select "Participant" tab
3. Enter your email address
4. Enter a password
5. Click "Sign In as Participant"
6. If account doesn't exist, it will be created automatically

**Subsequent Logins:**
1. Navigate to login page
2. Select "Participant" tab
3. Enter your email and password
4. Click "Sign In as Participant"

#### Dashboard
- View all available events
- See event status (Upcoming, Ongoing, Completed)
- View your registration status for each event
- Quick access to your certificates

#### Joining Events

1. Go to **Dashboard**
2. Browse available events
3. Click **"Join Event"** on an event card
4. You are now registered for the event
5. Button changes to show your registration status

#### Attendance

**QR Code Display:**
1. Go to **Scan** page
2. Your unique QR code is displayed
3. Present this QR code to admin for scanning
4. You will receive confirmation when scanned

#### Evaluation

**Submitting Evaluation:**
1. Go to **Dashboard**
2. Find a completed event you attended
3. Click **"Evaluate Event"** button
4. Fill out the evaluation form:
   - Overall rating
   - Instructor rating
   - Comments/feedback
5. Click **"Submit Evaluation"**
6. Confirmation message appears

#### Certificates

**Viewing Your Certificates:**
1. Go to **My Certificates** page
2. View all certificates you've earned
3. See event details and issue dates

**Downloading Certificates:**
1. Go to **My Certificates** page
2. Find the certificate you want
3. Click **"Download Certificate"**
4. PDF certificate downloads to your device

**Certificate Verification:**
- Each certificate has a unique verification code
- QR code on certificate can be scanned for verification
- Verification code format: `VERIFY-XXXXXX`

---

## 📚 Code Documentation

### Project Structure

```
VPAA---Seminar-and-Certificate-Automation/
├── client/                          # Frontend React application
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── layout/             # Layout components (Sidebar, Layout)
│   │   │   └── ui/                 # shadcn/ui components
│   │   ├── pages/                  # Page components
│   │   │   ├── admin/              # Admin pages
│   │   │   ├── participant/        # Participant pages
│   │   │   └── auth/              # Authentication pages
│   │   ├── lib/                    # Utilities and store
│   │   │   ├── store.ts            # Zustand state management
│   │   │   └── utils.ts            # Helper functions
│   │   └── hooks/                  # Custom React hooks
│   ├── public/                     # Static assets
│   └── index.html                  # HTML entry point
│
├── django_backend/                  # Django backend application
│   ├── api/                        # Main API application
│   │   ├── models.py               # Database models
│   │   ├── views.py                # API views and endpoints
│   │   ├── serializers.py          # Data serialization
│   │   ├── urls.py                 # URL routing
│   │   ├── permissions.py          # Permission classes
│   │   └── utils.py                # Utility functions (PDF, QR, Email)
│   ├── vpaaproject/                # Django project settings
│   │   ├── settings.py             # Django configuration
│   │   └── urls.py                 # Root URL configuration
│   ├── management/                 # Custom management commands
│   │   └── commands/
│   │       └── create_admin.py     # Admin user creation command
│   ├── certificates/               # Generated certificate PDFs storage
│   ├── requirements.txt            # Python dependencies
│   └── manage.py                   # Django management script
│
├── server/                          # Express server (for Vite)
│   └── index.ts                    # Server configuration
│
└── FINAL.md                        # This documentation file
```

### Backend Architecture

#### Models (`django_backend/api/models.py`)

**Event Model:**
- `title`: Event name
- `description`: Event details
- `date`: Event date
- `time_start` / `time_end`: Event timing
- `location`: Venue information
- `status`: Event status (upcoming, ongoing, completed)
- `requirements`: JSON field for attendance/evaluation/quiz requirements
- `qr_code`: Event QR code data
- `certificate_template`: Certificate design configuration
- `speakers`: List of speakers/trainers
- `agenda`: Event agenda
- `is_multi_session`: Multi-session event flag
- `participants_count`: Number of registered participants

**Participant Model:**
- `event`: Foreign key to Event
- `user`: Foreign key to User (optional)
- `name`: Participant name
- `email`: Participant email
- `status`: Registration status (registered, attended, completed)
- `check_in_time` / `check_out_time`: Attendance timestamps
- `has_evaluated`: Evaluation submission flag
- `evaluation_data`: JSON field for evaluation responses
- `quiz_passed`: Quiz completion status
- `quiz_score`: Quiz score percentage
- `quiz_data`: JSON field for quiz answers and results
- `attendance_logs`: JSON field for attendance history

**Certificate Model:**
- `participant`: Foreign key to Participant
- `certificate_number`: Unique certificate identifier
- `verification_code`: Verification code for authenticity
- `issued_at`: Certificate issue timestamp
- `emailed`: Email sent flag
- `pdf_file`: PDF file storage

**UserProfile Model:**
- `user`: One-to-one relationship with User
- `qr_code_data`: Unique QR code for participant scanning

#### API Views (`django_backend/api/views.py`)

**EventViewSet:**
- `list()`: Get all events
- `create()`: Create new event (Admin only)
- `retrieve()`: Get event details
- `update()`: Update event (Admin only)
- `destroy()`: Delete event (Admin only)
- `join()`: Join event as participant
- `conclude()`: Conclude event (Admin only)
- `upload_participants()`: Upload participants from CSV/Excel (Admin only)
- `qr_code()`: Get event QR code image (Admin only)

**ParticipantViewSet:**
- `list()`: Get participants (filtered by role)
- `create()`: Create participant record
- `retrieve()`: Get participant details
- `update()`: Update participant (Admin only)
- `destroy()`: Delete participant (Admin only)
- `mark_attendance()`: Mark attendance (Admin only)
- `submit_evaluation()`: Submit evaluation form
- `submit_quiz()`: Submit quiz answers
- `issue_certificate()`: Issue certificate (Admin only)

**CertificateViewSet:**
- `list()`: Get certificates (filtered by role)
- `retrieve()`: Get certificate details
- `download()`: Download certificate PDF
- `resend_email()`: Resend certificate email (Admin only)
- `verify()`: Verify certificate by code

**Custom Views:**
- `login_view()`: User authentication
- `register_view()`: User registration
- `me()`: Get current user info
- `scan_qr_code()`: Scan QR code for attendance (Admin only)
- `reports_attendance()`: Generate attendance report (Admin only)
- `reports_evaluation()`: Generate evaluation report (Admin only)

#### Permissions (`django_backend/api/permissions.py`)

**IsAdmin:**
- Checks if user is admin (email `adminvpaa@gmail.com` or `is_staff=True`)

**IsAdminOrReadOnly:**
- Admins: Full CRUD access
- Others: Read-only access

**IsParticipantOrAdmin:**
- Admins: See all records
- Participants: See only their own records

#### Utilities (`django_backend/api/utils.py`)

**generate_qr_code(data, size):**
- Generates QR code image from data string
- Returns BytesIO buffer

**generate_certificate_pdf(certificate):**
- Creates professional PDF certificate
- Includes decorative borders, QR code, verification details
- Returns BytesIO buffer

**send_certificate_email(certificate):**
- Sends certificate via SendGrid or SMTP
- Attaches PDF certificate
- Updates certificate email status

### Frontend Architecture

#### State Management (`client/src/lib/store.ts`)

**Zustand Store:**
- `events`: Array of all events
- `participants`: Object mapping event IDs to participant arrays
- `currentUser`: Currently logged-in user
- `token`: Authentication token

**Actions:**
- `login()`: Authenticate user
- `register()`: Register new user
- `logout()`: Clear session
- `fetchEvents()`: Load all events
- `addEvent()`: Create new event
- `updateEvent()`: Update event
- `deleteEvent()`: Delete event
- `joinEvent()`: Join event as participant
- `concludeEvent()`: Conclude event
- `uploadParticipants()`: Upload participants CSV/Excel
- `scanQrCode()`: Scan QR code for attendance
- `submitEvaluation()`: Submit evaluation form
- `issueCertificate()`: Issue certificate
- `downloadCertificate()`: Download certificate PDF
- `resendCertificateEmail()`: Resend certificate email
- `verifyCertificate()`: Verify certificate
- `fetchReports()`: Download reports

#### Components

**Layout Components:**
- `Layout.tsx`: Main application layout with sidebar
- `Sidebar.tsx`: Navigation sidebar with role-based menu

**Admin Pages:**
- `Dashboard.tsx`: Admin dashboard with statistics
- `Events.tsx`: Event management (CRUD operations)
- `Attendance.tsx`: QR code scanning and attendance tracking
- `Certificates.tsx`: Certificate issuance and management
- `Reports.tsx`: Report generation and download

**Participant Pages:**
- `Dashboard.tsx`: Participant dashboard with available events
- `Certificates.tsx`: View and download personal certificates
- `Scan.tsx`: Display personal QR code for attendance

**Auth Pages:**
- `Login.tsx`: Login/registration form with role selection

#### Routing (`client/src/App.tsx`)

**Admin Routes:**
- `/admin/dashboard`
- `/admin/events`
- `/admin/attendance`
- `/admin/certificates`
- `/admin/reports`

**Participant Routes:**
- `/participant/dashboard`
- `/participant/my-certificates`
- `/participant/scan`

**Public Routes:**
- `/login`
- `/` (redirects based on role)

---

## ✨ Complete Feature List

### 🔐 Authentication & Authorization

- [x] User registration with email and password
- [x] User login with email/username
- [x] Token-based authentication
- [x] Role-based access control (Admin/Participant)
- [x] Automatic account creation for new participants
- [x] Session management
- [x] Protected routes (frontend and backend)
- [x] User profile management with QR codes

### 📅 Event Management

- [x] Create events with full details
- [x] Edit event information
- [x] Delete events
- [x] View all events (filtered by role)
- [x] Event status management (upcoming, ongoing, completed)
- [x] Event requirements configuration:
  - Attendance requirement toggle
  - Evaluation requirement toggle
  - Quiz requirement toggle
- [x] Multi-session event support
- [x] Event agenda management
- [x] Speaker/trainer information
- [x] Certificate template preview
- [x] Event QR code generation
- [x] Event search and filtering
- [x] Event conclusion (unlocks evaluation)

### 👥 Participant Management

- [x] Participant registration for events
- [x] Join events (self-registration)
- [x] View participant list per event
- [x] Bulk participant upload (CSV/Excel)
- [x] Participant status tracking:
  - Registered
  - Attended
  - Completed
- [x] Participant search and filtering
- [x] Participant profile management
- [x] Email-based participant identification

### ✅ Attendance Tracking

- [x] QR code-based check-in system
- [x] Unique QR code per participant
- [x] Real-time attendance scanning
- [x] Session-based time-in/time-out
- [x] Attendance logs with timestamps
- [x] Manual attendance override (Admin)
- [x] Attendance statistics dashboard
- [x] Attendance confirmation notifications
- [x] Multi-session attendance tracking

### 📝 Evaluation System

- [x] Evaluation form submission
- [x] Evaluation unlock after event conclusion
- [x] Evaluation data collection:
  - Overall rating
  - Instructor rating
  - Comments/feedback
- [x] Evaluation status tracking
- [x] Evaluation analytics
- [x] Evaluation report generation (CSV)
- [x] Prevent duplicate submissions

### 🧪 Quiz/Assessment System

- [x] Quiz question management
- [x] Quiz submission tracking
- [x] Automatic scoring
- [x] Passing grade configuration (70%)
- [x] Quiz results storage
- [x] Quiz requirement enforcement
- [x] Quiz data in participant records

### 🎓 Certificate Management

- [x] Automatic certificate generation (PDF)
- [x] Professional certificate design:
  - Decorative borders
  - Corner decorations
  - QR code for verification
  - Verification code
  - Certificate number
  - Issue date
- [x] Certificate eligibility validation:
  - Attendance check
  - Evaluation check
  - Quiz pass check (if required)
- [x] Certificate issuance (Admin)
- [x] Bulk certificate issuance
- [x] Certificate download (PDF)
- [x] Certificate email distribution
- [x] Certificate resend functionality
- [x] Certificate verification system
- [x] Certificate storage in Django
- [x] Certificate number generation
- [x] Verification code generation

### 📊 Reporting

- [x] Attendance reports:
  - CSV format
  - PDF format
  - Participant details
  - Attendance timestamps
  - Status information
- [x] Evaluation reports:
  - CSV format
  - All evaluation responses
  - Participant information
  - Submission timestamps
- [x] Certificate issuance logs
- [x] Participant completion reports
- [x] Event statistics

### 📧 Email Integration

- [x] SendGrid integration
- [x] SMTP fallback
- [x] Certificate email with PDF attachment
- [x] Email status tracking
- [x] Resend email functionality
- [x] Email template customization

### 📱 QR Code System

- [x] Participant QR code generation
- [x] Event QR code generation
- [x] QR code scanning interface
- [x] QR code verification
- [x] QR code display for participants
- [x] QR code image generation

### 📄 File Management

- [x] CSV file upload and parsing
- [x] Excel file upload and parsing (.xlsx, .xls)
- [x] PDF certificate generation
- [x] PDF file storage
- [x] File download functionality
- [x] Bulk file operations

### 🎨 User Interface

- [x] Modern, responsive design
- [x] Dark mode support
- [x] Mobile-friendly interface
- [x] Toast notifications
- [x] Loading states
- [x] Error handling and display
- [x] Form validation
- [x] Search and filtering
- [x] Data tables with sorting
- [x] Dialog modals
- [x] Certificate preview
- [x] Real-time updates

### 🔒 Security Features

- [x] Role-based permissions
- [x] API endpoint protection
- [x] Frontend route guards
- [x] Token-based authentication
- [x] CORS configuration
- [x] Input validation
- [x] SQL injection prevention (Django ORM)
- [x] XSS protection
- [x] CSRF protection (Django)

### 🛠️ Developer Features

- [x] Django management commands
- [x] Database migrations
- [x] API documentation
- [x] Error logging
- [x] Development server scripts
- [x] Installation verification scripts
- [x] Troubleshooting documentation

---

## 🔌 API Reference

### Base URL
```
http://127.0.0.1:8000/api/
```

### Authentication

All authenticated endpoints require a token in the header:
```
Authorization: Token <your-token>
```

### Endpoints

#### Authentication

**POST `/api/auth/login/`**
- Login user
- Body: `{ "username": "email@example.com", "password": "password" }`
- Returns: `{ "token": "...", "user": {...} }`

**POST `/api/auth/register/`**
- Register new user
- Body: `{ "email": "email@example.com", "password": "password", "name": "Name" }`
- Returns: `{ "token": "...", "user": {...} }`

**GET `/api/auth/me/`**
- Get current user info
- Returns: `{ "user": {...} }`

#### Events

**GET `/api/events/`**
- List all events
- Returns: Array of event objects

**POST `/api/events/`** (Admin only)
- Create new event
- Body: Event object with required fields

**GET `/api/events/{id}/`**
- Get event details
- Returns: Event object

**PATCH `/api/events/{id}/`** (Admin only)
- Update event
- Body: Partial event object

**DELETE `/api/events/{id}/`** (Admin only)
- Delete event

**POST `/api/events/{id}/join/`**
- Join event as participant
- Body: `{ "email": "...", "name": "..." }` (optional if authenticated)
- Returns: Participant object

**POST `/api/events/{id}/conclude/`** (Admin only)
- Conclude event
- Returns: Updated event object

**POST `/api/events/{id}/upload_participants/`** (Admin only)
- Upload participants from CSV/Excel
- Body: Form data with `file` field
- Returns: `{ "message": "...", "created": 5 }`

**GET `/api/events/{id}/qr_code/`** (Admin only)
- Get event QR code image
- Returns: PNG image

#### Participants

**GET `/api/participants/`**
- List participants (filtered by role)
- Query params: `?event={event_id}`
- Returns: Array of participant objects

**POST `/api/participants/{id}/mark_attendance/`** (Admin only)
- Mark participant attendance
- Body: `{ "type": "in" | "out", "session": "..." }`
- Returns: Updated participant object

**POST `/api/participants/{id}/submit_evaluation/`**
- Submit evaluation form
- Body: `{ "evaluation_data": {...} }`
- Returns: Updated participant object

**POST `/api/participants/{id}/submit_quiz/`**
- Submit quiz answers
- Body: `{ "answers": {...} }`
- Returns: Quiz results

**POST `/api/participants/{id}/issue_certificate/`** (Admin only)
- Issue certificate
- Body: `{ "send_email": true }`
- Returns: Certificate object

#### Certificates

**GET `/api/certificates/`**
- List certificates (filtered by role)
- Query params: `?participant={participant_id}`
- Returns: Array of certificate objects

**GET `/api/certificates/{id}/download/`**
- Download certificate PDF
- Returns: PDF file

**POST `/api/certificates/{id}/resend_email/`** (Admin only)
- Resend certificate email
- Returns: `{ "message": "Email sent successfully" }`

**GET `/api/certificates/verify/?code={code}`**
- Verify certificate by code
- Returns: Certificate verification details

#### Reports

**GET `/api/reports/attendance/{event_id}/?format=csv|pdf`** (Admin only)
- Generate attendance report
- Returns: CSV or PDF file

**GET `/api/reports/evaluation/{event_id}/`** (Admin only)
- Generate evaluation report
- Returns: CSV file

#### QR Scanning

**POST `/api/scan/qr/`** (Admin only)
- Scan QR code for attendance
- Body: `{ "qr_data": "...", "event_id": 1 }`
- Returns: Participant and attendance confirmation

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues

**ModuleNotFoundError: No module named 'qrcode'**
```bash
# Solution: Install dependencies
cd django_backend
pip install -r requirements.txt
```

**Database migration errors**
```bash
# Solution: Reset migrations (development only)
python manage.py migrate --run-syncdb
```

**Port already in use**
```bash
# Solution: Use different port
python manage.py runserver 8001
```

**Admin login fails**
```bash
# Solution: Create admin user
python manage.py create_admin
```

#### Frontend Issues

**npm install fails**
```bash
# Solution: Clear cache and retry
npm cache clean --force
npm install
```

**Vite port conflict**
```bash
# Solution: Change port in vite.config.ts
server: { port: 5174 }
```

**API connection errors**
- Check backend server is running
- Verify CORS settings in Django
- Check API base URL in store.ts

#### General Issues

**QR code not scanning**
- Ensure camera permissions are granted
- Check QR code format matches expected pattern
- Verify participant is registered for the event

**Certificate not generating**
- Check participant eligibility (attendance, evaluation, quiz)
- Verify reportlab is installed
- Check file permissions for certificate storage

**Email not sending**
- Verify SendGrid API key (if using SendGrid)
- Check SMTP settings (if using SMTP)
- Ensure email addresses are valid

### Getting Help

1. Check the `TROUBLESHOOTING.md` file in `django_backend/`
2. Review error messages in browser console (F12)
3. Check Django server logs
4. Verify all dependencies are installed
5. Ensure database migrations are up to date

---

## 📝 License

This project is developed for VPAA (Vice President for Academic Affairs) Event Coordination System.

---

## 👨‍💻 Development Team

Developed for academic event management and certificate issuance automation.

---

## 📞 Support

For issues, questions, or contributions, please refer to the project repository or contact the development team.

---

**Last Updated**: 2024
**Version**: 1.0.0
**Status**: Production Ready

