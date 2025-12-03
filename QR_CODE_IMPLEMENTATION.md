# QR Code Implementation for User Registration

## Overview
This document describes the implementation of QR code storage and scanning functionality for registered users in the VPAA system.

## Changes Made

### 1. UserProfile Model (`django_backend/api/models.py`)
- Added a new `UserProfile` model that extends the Django `User` model
- Stores a unique QR code for each user in the format: `USER-{user_id}-{uuid}`
- Automatically creates a profile when a user is created via Django signal
- QR code is automatically generated if not provided

### 2. User Serializer (`django_backend/api/serializers.py`)
- Added `UserProfileSerializer` to serialize profile data
- Updated `UserSerializer` to include QR code information
- QR code is accessible via `user.qr_code` or `user.profile.qr_code`

### 3. Registration & Login (`django_backend/api/views.py`)
- **Registration**: Automatically creates a `UserProfile` with QR code when a new user registers
- **Login**: Ensures profile exists (creates if missing) when user logs in
- **Me Endpoint**: Returns user information including QR code

### 4. QR Code Scanning (`django_backend/api/views.py`)
- Updated `scan_qr_code` endpoint to:
  - Accept QR codes in format `USER-{user_id}-{code}`
  - Lookup user by QR code from `UserProfile`
  - Automatically create/update participant record for the event
  - Mark attendance when QR code is scanned
  - Return user and participant information

### 5. Participant Scan Page (`client/src/pages/participant/Scan.tsx`)
- Fetches QR code from backend API (`/api/auth/me/`)
- Displays the stored QR code (not a temporary one)
- Shows QR code value for verification
- Copy QR code to clipboard functionality

### 6. Admin Attendance Scanner (`client/src/pages/admin/Attendance.tsx`)
- Updated to call the scan endpoint with QR code data
- Handles `USER-{id}-{code}` format QR codes
- Automatically marks attendance when valid QR code is scanned

### 7. Database Migration (`django_backend/api/migrations/0003_userprofile.py`)
- Created migration to add `UserProfile` table
- Generates QR codes for existing users during migration

## How It Works

### User Registration Flow
1. User registers with email and password
2. Django creates a `User` record
3. Signal automatically creates a `UserProfile` with a unique QR code
4. QR code format: `USER-{user_id}-{12_char_uuid}`

### QR Code Scanning Flow
1. Participant displays their QR code (from their profile)
2. Admin scans the QR code using the attendance scanner
3. Backend looks up user by QR code from `UserProfile`
4. Finds or creates participant record for the event
5. Marks participant as attended
6. Returns success message with participant details

### QR Code Format
- Format: `USER-{user_id}-{uuid}`
- Example: `USER-1-A1B2C3D4E5F6`
- Unique per user
- Stored in database for lookup

## API Endpoints

### Get Current User (with QR code)
```
GET /api/auth/me/
Headers: Authorization: Token <token>
Response: { "user": { ..., "qr_code": "USER-1-A1B2C3D4E5F6" } }
```

### Scan QR Code
```
POST /api/scan/qr/
Headers: Authorization: Token <token>
Body: {
  "qr_data": "USER-1-A1B2C3D4E5F6",
  "event_id": 1
}
Response: {
  "success": true,
  "participant": {...},
  "user": {...},
  "message": "John Doe marked as present"
}
```

## Migration Instructions

1. Run the migration:
   ```bash
   cd django_backend
   python manage.py migrate
   ```

2. This will:
   - Create the `UserProfile` table
   - Generate QR codes for all existing users
   - Set up the relationship between User and UserProfile

## Testing

1. **Register a new user**: QR code should be automatically generated
2. **Login**: Profile should be created if missing
3. **View QR code**: Participant scan page should show the stored QR code
4. **Scan QR code**: Admin scanner should successfully mark attendance

## Notes

- QR codes are unique per user and stored permanently
- QR codes are generated automatically - no manual intervention needed
- Existing users will get QR codes when they next log in or when migration runs
- QR code lookup is fast (indexed by unique constraint)

