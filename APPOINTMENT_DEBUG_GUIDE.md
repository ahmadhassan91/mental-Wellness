# 400 Bad Request Error - Debugging Guide

## Problem
POST request to `/api/appointments` returns 400 Bad Request error.

## Changes Made

### 1. Enhanced API Route Logging (`src/app/api/appointments/route.ts`)
✅ Added request payload logging
✅ Added detailed Zod validation error responses
✅ Now returns specific field validation errors

```typescript
// Before: Generic error message
{ error: 'Invalid appointment data' }

// After: Detailed error response
{
  error: 'Invalid appointment data',
  details: [
    {
      field: 'patientPhone',
      message: 'String must contain at least 10 character(s)',
      code: 'too_small'
    }
  ]
}
```

### 2. Improved Frontend Error Handling (`src/components/AppointmentBooking.tsx`)
✅ Added console logging for debugging
✅ Shows detailed validation errors in notifications
✅ Logs request payload before sending

## How to Debug

### Step 1: Check Browser Console
Open browser DevTools console and look for:
```
📤 Sending appointment request: { ... }
```

This shows the exact payload being sent.

### Step 2: Check Server Logs (Netlify)
Look for these log entries:
```
INFO: Appointment creation request
WARN: Invalid appointment data (if validation fails)
```

### Step 3: Common Issues & Fixes

#### Issue 1: Phone Number Too Short
**Error:** `patientPhone: String must contain at least 10 character(s)`
**Fix:** Ensure phone input has at least 10 digits

#### Issue 2: Invalid Time Format
**Error:** `startTime: Invalid`
**Cause:** Time sent as "9:00" instead of "09:00"
**Fix:** Zero-pad hours and minutes (HH:mm format)

#### Issue 3: Invalid Date Format
**Error:** `appointmentDate: Invalid`
**Cause:** Date not in YYYY-MM-DD format
**Fix:** Use `date.toISOString().split('T')[0]`

#### Issue 4: Invalid Enum Value
**Error:** `appointmentType: Invalid enum value`
**Fix:** Use only 'initial' or 'follow_up'

## Validation Schema

```typescript
{
  providerId: string (min 1),
  appointmentDate: string (YYYY-MM-DD),
  startTime: string (HH:mm),
  patientName: string (min 1),
  patientEmail: string (valid email),
  patientPhone: string (min 10),
  appointmentType: 'initial' | 'follow_up',
  modality: 'telehealth' | 'in_person',
  notes: string (optional),
  utm: Record<string, string> (optional)
}
```

## Valid Example Payload

```json
{
  "providerId": "cm3mh8sd50000prnkklzl0p8c",
  "appointmentDate": "2024-01-20",
  "startTime": "09:00",
  "patientName": "Jane Smith",
  "patientEmail": "jane@example.com",
  "patientPhone": "5551234567",
  "appointmentType": "initial",
  "modality": "telehealth",
  "notes": "First consultation",
  "utm": {
    "source": "google",
    "medium": "cpc"
  }
}
```

## Testing with cURL

```bash
curl -X POST https://your-site.netlify.app/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "providerId": "cm3mh8sd50000prnkklzl0p8c",
    "appointmentDate": "2024-01-20",
    "startTime": "09:00",
    "patientName": "Jane Smith",
    "patientEmail": "jane@example.com",
    "patientPhone": "5551234567",
    "appointmentType": "initial",
    "modality": "telehealth"
  }'
```

## Next Steps

1. **Deploy Changes:**
   ```bash
   git add src/app/api/appointments/route.ts src/components/AppointmentBooking.tsx
   git commit -m "feat: Add detailed error logging for appointment booking"
   git push origin main
   ```

2. **Test the Endpoint:**
   - Open the booking modal in your browser
   - Fill out the appointment form
   - Open browser DevTools console
   - Submit the form
   - Check console for "📤 Sending appointment request"
   - Check for any error details

3. **Check Netlify Logs:**
   - Go to Netlify dashboard → Functions → appointments
   - Look for the most recent request
   - Check for validation errors

4. **Common Fixes:**
   - If phone validation fails: Add minimum length validation in the form
   - If time format fails: Ensure times are zero-padded
   - If provider not found: Check that providerId exists in database

## Database Prerequisites

Before testing, ensure:

1. **Migration Applied:**
   ```sql
   -- Check if tables exist
   SELECT tablename FROM pg_tables 
   WHERE schemaname = 'public' 
   AND tablename IN ('appointments', 'provider_availability');
   ```

2. **Provider Exists:**
   ```sql
   -- Get a valid provider ID
   SELECT id, name FROM providers LIMIT 1;
   ```

3. **Provider Has Availability:**
   ```sql
   -- Check availability slots
   SELECT * FROM provider_availability 
   WHERE provider_id = 'your-provider-id';
   ```

## Files Modified

- ✅ `src/app/api/appointments/route.ts` - Enhanced error logging
- ✅ `src/components/AppointmentBooking.tsx` - Better error display
- ✅ `debug-appointment.js` - Validation testing script
- ✅ `APPOINTMENT_DEBUG_GUIDE.md` - This file
