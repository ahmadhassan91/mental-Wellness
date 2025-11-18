# Deployment Checklist

## Environment Variables

Ensure all these are set in your Netlify environment:

### Required (Already Configured)
- [x] `DATABASE_URL` - Supabase PostgreSQL connection
- [x] `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- [x] `ADMIN_USER` - Admin login username
- [x] `ADMIN_PASS` - Admin login password
- [x] `NEXT_PUBLIC_CLINIC_PHONE` - Clinic phone number
- [x] `NEXT_PUBLIC_BASE_URL` - Your Netlify domain

### Optional (For TherapyNotes Integration)
- [ ] `THERAPYNOTES_API_KEY` - Your TherapyNotes API key
- [ ] `THERAPYNOTES_API_URL` - TherapyNotes API endpoint (default: https://api.therapynotes.com/v1)

## Deployment Steps

### 1. Push Latest Changes
```bash
git add .
git commit -m "Add complete scheduling system with TherapyNotes sync"
git push
```

### 2. Netlify Auto-Deploy
- Netlify will automatically detect changes
- Build will start automatically
- Monitor build logs for any errors

### 3. Verify Database
- [x] Tables created: `provider_availability`, `appointments`, `appointment_sync_log`
- [x] RLS policies enabled
- [x] Sample availability data seeded

### 4. Test Features

#### Patient Flow
1. Visit `https://your-site.netlify.app/providers`
2. Click "Book Appointment" on any provider
3. Select a weekday date
4. Choose an available time slot
5. Fill in contact information
6. Confirm booking
7. ✅ Should see success message

#### Admin Flow
1. Visit `https://your-site.netlify.app/admin`
2. Login with credentials
3. Click "Manage Appointments"
4. ✅ Should see appointments table
5. Test status updates
6. Test TherapyNotes sync (will fail without API key)

## Post-Deployment

### Configure TherapyNotes API (Optional)

If you want EMR sync:

1. **Get API Credentials**
   - Contact TherapyNotes support
   - Request API access
   - Obtain API key

2. **Add to Netlify**
   - Go to Site Settings → Environment Variables
   - Add `THERAPYNOTES_API_KEY`
   - Add `THERAPYNOTES_API_URL` (if using custom endpoint)
   - Redeploy site

3. **Test Sync**
   - Create test appointment
   - Go to admin appointments page
   - Click "Sync Now"
   - ✅ Should sync successfully

### Customize Provider Availability

Current default: Monday-Friday, 9 AM - 5 PM

To customize:

```sql
-- Update specific provider availability
UPDATE provider_availability
SET start_time = '08:00', end_time = '18:00'
WHERE provider_id = 'your-provider-id';

-- Add Saturday hours
INSERT INTO provider_availability (provider_id, day_of_week, start_time, end_time)
VALUES ('your-provider-id', 6, '10:00', '14:00');
```

### Monitor System

Check these regularly:

1. **Appointment Volume**
   ```sql
   SELECT COUNT(*), status
   FROM appointments
   GROUP BY status;
   ```

2. **Sync Success Rate**
   ```sql
   SELECT
     COUNT(*) FILTER (WHERE status = 'success') as synced,
     COUNT(*) FILTER (WHERE status = 'failed') as failed
   FROM appointment_sync_log;
   ```

3. **Recent Errors**
   ```sql
   SELECT error_message, COUNT(*)
   FROM appointment_sync_log
   WHERE status = 'failed'
   GROUP BY error_message
   ORDER BY COUNT(*) DESC;
   ```

## Features Now Live

### ✅ Patient Features
- Browse providers with filters
- Book appointments online
- Select date and time
- Choose appointment type (initial/follow-up)
- Choose modality (telehealth/in-person)
- Add notes/concerns

### ✅ Admin Features
- View all appointments
- Search and filter
- Update appointment status
- One-click TherapyNotes sync
- Bulk sync all pending
- View sync history

### ✅ Technical Features
- Supabase database integration
- Row-level security
- Real-time availability checking
- Conflict prevention (no double-booking)
- Comprehensive audit logging
- RESTful API endpoints

## Known Limitations

1. **Availability**
   - Default: Weekdays only, 1-hour slots
   - Manual configuration required for custom schedules

2. **TherapyNotes Sync**
   - Requires manual API key setup
   - One-way sync (app → TherapyNotes)
   - No automatic webhook callbacks

3. **Notifications**
   - No email confirmations yet
   - No SMS reminders yet
   - Manual communication required

## Future Enhancements

Consider adding:

- [ ] Email confirmations using SendGrid/Resend
- [ ] SMS reminders using Twilio
- [ ] Patient self-service portal
- [ ] Calendar view for admins
- [ ] Recurring appointments
- [ ] Waitlist management
- [ ] Multi-location support
- [ ] Insurance verification

## Support Resources

- **Application Logs**: Check Netlify function logs
- **Database Logs**: Check Supabase dashboard
- **API Testing**: Use Postman or curl
- **TherapyNotes Support**: https://www.therapynotes.com/support

## Success Criteria

Your deployment is successful when:

- ✅ Site loads at your Netlify URL
- ✅ Providers display correctly
- ✅ Booking modal opens
- ✅ Available time slots appear
- ✅ Appointments are created in database
- ✅ Admin can login and view appointments
- ✅ Admin can update appointment status

## Rollback Plan

If issues occur:

1. **Revert Code**
   ```bash
   git revert HEAD
   git push
   ```

2. **Check Netlify Deploy**
   - Go to Deploys tab
   - Click on previous successful deploy
   - Click "Publish deploy"

3. **Database Rollback**
   - Supabase provides automatic backups
   - Contact Supabase support if needed

## Questions?

Common issues and solutions documented in `SCHEDULING_GUIDE.md`.
