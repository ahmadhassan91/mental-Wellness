# Scheduling System Guide

## Overview

This application now includes a complete appointment scheduling system with TherapyNotes EMR integration.

## Features

### Patient-Facing Features
- **Browse Providers**: View all available mental health providers
- **Book Appointments**: Interactive booking flow with date/time selection
- **Appointment Types**: Initial consultation or follow-up sessions
- **Modality Selection**: Choose between telehealth or in-person visits
- **Real-time Availability**: See only available time slots

### Admin Features
- **Appointments Management**: View, filter, and manage all appointments
- **Status Updates**: Change appointment status (pending, confirmed, cancelled, completed, no_show)
- **TherapyNotes Sync**: One-click sync to TherapyNotes EMR
- **Sync History**: Track all sync attempts and failures
- **Search & Filter**: Find appointments by patient name, email, phone, date, or status

## Database Schema

### Tables Created

1. **provider_availability**
   - Defines provider working hours by day of week
   - Monday-Friday, 9 AM - 5 PM by default
   - Customizable per provider

2. **appointments**
   - Stores all appointment bookings
   - Patient contact information
   - Appointment details (date, time, type, modality)
   - Status tracking
   - TherapyNotes sync status

3. **appointment_sync_log**
   - Audit trail for all EMR sync attempts
   - Request/response payloads
   - Error messages for troubleshooting

## User Flow

### Booking an Appointment

1. **Browse Providers** at `/providers`
2. Click **"Book Appointment"** on any provider card
3. **Select Date & Time**:
   - Choose from available dates (weekdays only)
   - View available time slots
4. **Enter Information**:
   - Full name, email, phone
   - Appointment type (initial/follow-up)
   - Preferred modality (telehealth/in-person)
   - Optional notes
5. **Review & Confirm**:
   - Review all details
   - Submit booking
6. **Confirmation**:
   - Appointment created with "pending" status
   - Confirmation message displayed

### Managing Appointments (Admin)

1. **Login** at `/admin` with credentials
2. Click **"Manage Appointments"** button
3. **View Appointments**:
   - See all bookings in table format
   - Search by patient info
   - Filter by status or date
4. **Update Status**:
   - Use dropdown to change status
   - Statuses: pending, confirmed, cancelled, completed, no_show
5. **Sync to TherapyNotes**:
   - Click "Sync Now" for individual appointments
   - Click "Sync All" for bulk sync
   - View sync status badges

## API Endpoints

### Public Endpoints

#### `GET /api/appointments/availability`
Get available time slots for a provider on a specific date.

**Query Parameters:**
- `providerId` (required): Provider ID
- `date` (required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "slots": [
    { "time": "09:00", "available": true },
    { "time": "10:00", "available": false },
    { "time": "11:00", "available": true }
  ]
}
```

#### `POST /api/appointments`
Create a new appointment booking.

**Request Body:**
```json
{
  "providerId": "uuid",
  "appointmentDate": "2025-12-01",
  "startTime": "10:00",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "(555) 123-4567",
  "appointmentType": "initial",
  "modality": "telehealth",
  "notes": "Optional notes",
  "utm": {}
}
```

**Response:**
```json
{
  "success": true,
  "appointment": {
    "id": "uuid",
    "providerId": "uuid",
    "appointmentDate": "2025-12-01",
    "startTime": "10:00",
    "status": "pending"
  }
}
```

### Admin Endpoints (Requires Basic Auth)

#### `GET /api/appointments`
List all appointments with optional filters.

**Query Parameters:**
- `providerId` (optional): Filter by provider
- `date` (optional): Filter by date
- `status` (optional): Filter by status

#### `PATCH /api/appointments/[appointmentId]`
Update appointment status or notes.

**Request Body:**
```json
{
  "status": "confirmed",
  "notes": "Updated notes"
}
```

#### `POST /api/appointments/sync-therapynotes`
Sync appointments to TherapyNotes EMR.

**Request Body:**
```json
{
  "appointmentId": "uuid"
}
```

Or sync all unsynced:
```json
{}
```

**Response:**
```json
{
  "message": "Sync completed",
  "synced": 5,
  "failed": 1,
  "errors": [
    {
      "appointmentId": "uuid",
      "error": "Network timeout"
    }
  ]
}
```

## TherapyNotes Integration

### Configuration

Set these environment variables in your deployment:

```env
THERAPYNOTES_API_KEY=your-api-key-here
THERAPYNOTES_API_URL=https://api.therapynotes.com/v1
```

### Sync Process

1. **Automatic Tracking**: All bookings are marked as `synced_to_emr: false`
2. **Manual Sync**: Admin clicks sync button
3. **API Call**: System sends appointment data to TherapyNotes
4. **Logging**: All attempts logged in `appointment_sync_log`
5. **Status Update**: On success, appointment marked as synced with `therapynotes_id`

### Sync Payload

The system sends this data to TherapyNotes:

```json
{
  "appointmentId": "internal-uuid",
  "patientName": "John Doe",
  "patientEmail": "john@example.com",
  "patientPhone": "(555) 123-4567",
  "providerId": "provider-uuid",
  "appointmentDate": "2025-12-01",
  "startTime": "10:00",
  "endTime": "11:00",
  "appointmentType": "initial",
  "modality": "telehealth",
  "notes": "Optional notes"
}
```

### Error Handling

- Failed syncs are logged with error messages
- Appointments remain unsynced for retry
- Admin can view sync history and errors
- No data loss on sync failures

## Customization

### Provider Availability

Update provider working hours:

```sql
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
VALUES ('provider-uuid', 1, '08:00', '16:00');
```

Days: 0=Sunday, 1=Monday, ..., 6=Saturday

### Appointment Duration

Default: 1 hour per appointment. To change:

1. Edit `/api/appointments/route.ts`
2. Modify the `endTime` calculation:

```typescript
const endTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
```

### Time Slot Intervals

Default: 1-hour slots. To add 30-minute slots:

1. Edit `/api/appointments/availability/route.ts`
2. Add half-hour iterations:

```typescript
for (let hour = startHour; hour < endHour; hour++) {
  slots.push(`${hour}:00`);
  slots.push(`${hour}:30`);
}
```

## Security

### Row Level Security (RLS)

All tables have RLS enabled:

- **Public**: Can view availability and create appointments
- **Authenticated**: Full CRUD access to all appointments
- **Sync logs**: Admin-only access

### Data Protection

- No PHI stored in logs
- Patient data encrypted in transit
- TherapyNotes API uses HTTPS
- Admin requires Basic Auth

## Testing

### Test Booking Flow

1. Visit `/providers`
2. Click "Book Appointment"
3. Select tomorrow's date
4. Choose any available time
5. Fill in test data
6. Confirm booking

### Test Admin Flow

1. Login at `/admin`
2. Navigate to "Manage Appointments"
3. View your test booking
4. Change status to "confirmed"
5. Click "Sync Now"

### Test TherapyNotes Sync

Without real credentials:
- Sync will fail gracefully
- Error logged in `appointment_sync_log`
- Admin sees failure message

With credentials:
- Appointment synced to TherapyNotes
- TherapyNotes ID stored
- Status badge shows "Synced"

## Troubleshooting

### No Available Slots

**Problem**: DatePicker shows no available times

**Solutions**:
1. Check provider has availability configured
2. Verify day of week (weekends disabled by default)
3. Check for existing bookings blocking slots

### Sync Failures

**Problem**: TherapyNotes sync fails

**Solutions**:
1. Verify API key is set correctly
2. Check API URL is valid
3. Review sync log for error details
4. Ensure TherapyNotes API is accessible

### Build Errors

**Problem**: TypeScript errors during build

**Solutions**:
1. Run `npm install` to update dependencies
2. Check all imports are correct
3. Verify Mantine version compatibility

## Future Enhancements

Potential features to add:

- Email confirmations and reminders
- SMS notifications
- Patient cancellation/rescheduling
- Multi-provider time blocks
- Recurring appointments
- Waitlist management
- Calendar view for admins
- Provider self-service availability management
- Integration with additional EMR systems

## Support

For issues or questions:
1. Check sync logs in database
2. Review application logs
3. Test API endpoints directly
4. Contact TherapyNotes support for EMR issues
