# Permissions Implementation Summary

## Overview
The system now enforces strict role-based permissions:
- **Admins**: Full CRUD access to all resources
- **Participants**: Can only register, attend events, evaluate, and view their own certificates

## Backend Permissions

### Admin-Only Operations
Only users with email `adminvpaa@gmail.com` or `is_staff=True` can:
- Create, update, delete events
- Upload participants (CSV/Excel)
- Conclude events
- Mark attendance
- Issue certificates
- Access QR codes
- Generate reports
- Resend certificates
- View all participants and certificates

### Participant-Only Operations
Participants can:
- **View events** (read-only)
- **Join events** (create their own participant record)
- **Submit evaluation** (only their own)
- **Submit quiz** (only their own)
- **View their own certificates** (read-only)
- **Download their own certificates**

### Restrictions
- Participants **cannot**:
  - Create/edit/delete events
  - See other participants' data
  - Mark attendance for others
  - Issue certificates
  - Access admin routes
  - View reports
  - Upload participants

## Frontend Route Protection

### Admin Routes (requireAdmin={true})
- `/admin/dashboard`
- `/admin/events`
- `/admin/attendance`
- `/admin/certificates`
- `/admin/reports`

If a participant tries to access these routes, they are redirected to `/participant/dashboard`.

### Participant Routes (requireParticipant={true})
- `/participant/dashboard`
- `/participant/my-certificates`
- `/participant/scan`

If an admin tries to access these routes, they are redirected to `/admin/dashboard`.

## API Permission Classes

1. **IsAdminOrReadOnly**: Events - Admins can CRUD, others read-only
2. **IsAdmin**: Reports, QR scanning - Admin only
3. **IsParticipantOrAdmin**: Participants, Certificates - Admins see all, participants see only their own

## Data Filtering

### Events
- Admins: See all events with all participants
- Participants: See all events but only their own participant record

### Participants
- Admins: See all participants
- Participants: See only their own participant records

### Certificates
- Admins: See all certificates
- Participants: See only their own certificates

## Testing Permissions

### Test Admin Access
1. Login as `adminvpaa@gmail.com` / `adminvpaa`
2. Should be able to:
   - Create/edit/delete events
   - Upload participants
   - Mark attendance
   - Issue certificates
   - View reports

### Test Participant Access
1. Login with `name@hcdc.edu.ph` email
2. Should be able to:
   - View events (read-only)
   - Join events
   - Submit evaluation (after event concluded)
   - View own certificates
   - Download own certificates
3. Should NOT be able to:
   - Access `/admin/*` routes (redirected)
   - Create/edit/delete events (403 error)
   - See other participants' data
   - Issue certificates (403 error)

## Security Notes

- All permission checks are enforced on both frontend (route protection) and backend (API permissions)
- Participants can only modify their own evaluation/quiz submissions
- Certificate downloads are restricted to certificate owners
- All admin operations require authentication and admin role verification

