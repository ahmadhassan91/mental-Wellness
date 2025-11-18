import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { basicAuthGuard, createUnauthorizedResponse } from '@/lib/auth';
import { logger, generateRequestId } from '@/lib/logger';

// Force dynamic rendering - required for API routes on Netlify
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface TherapyNotesAppointment {
  appointmentId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  providerId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  appointmentType: string;
  modality: string;
  notes?: string;
}

async function syncToTherapyNotes(appointment: any): Promise<{
  success: boolean;
  therapynotesId?: string;
  error?: string;
}> {
  const therapyNotesApiKey = process.env.THERAPYNOTES_API_KEY;
  const therapyNotesApiUrl = process.env.THERAPYNOTES_API_URL || 'https://api.therapynotes.com/v1';

  if (!therapyNotesApiKey) {
    logger.warn('TherapyNotes API key not configured');
    return {
      success: false,
      error: 'TherapyNotes API not configured',
    };
  }

  try {
    const payload: TherapyNotesAppointment = {
      appointmentId: appointment.id,
      patientName: appointment.patient_name,
      patientEmail: appointment.patient_email,
      patientPhone: appointment.patient_phone,
      providerId: appointment.provider_id,
      appointmentDate: appointment.appointment_date,
      startTime: appointment.start_time,
      endTime: appointment.end_time,
      appointmentType: appointment.appointment_type,
      modality: appointment.modality,
      notes: appointment.notes,
    };

    const response = await fetch(`${therapyNotesApiUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${therapyNotesApiKey}`,
        'X-API-Version': '2024-01-01',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    const result = await response.json();

    return {
      success: true,
      therapynotesId: result.id || result.appointmentId,
    };
  } catch (error) {
    logger.error('TherapyNotes sync failed', {
      appointmentId: appointment.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const authHeader = request.headers.get('authorization');

  if (!basicAuthGuard(authHeader)) {
    logger.warn('Unauthorized sync attempt', { requestId });
    return createUnauthorizedResponse();
  }

  try {
    const body = await request.json();
    const { appointmentId, appointmentIds } = body;

    const idsToSync: string[] = appointmentId
      ? [appointmentId]
      : appointmentIds || [];

    if (idsToSync.length === 0) {
      let query = supabase
        .from('appointments')
        .select('*')
        .eq('synced_to_emr', false)
        .neq('status', 'cancelled')
        .order('appointment_date', { ascending: true });

      const { data: unsyncedAppointments, error } = await query;

      if (error) throw error;

      if (!unsyncedAppointments || unsyncedAppointments.length === 0) {
        return NextResponse.json({
          message: 'No appointments to sync',
          synced: 0,
          failed: 0,
        });
      }

      idsToSync.push(...unsyncedAppointments.map((a) => a.id));
    }

    const results = {
      synced: 0,
      failed: 0,
      errors: [] as Array<{ appointmentId: string; error: string }>,
    };

    for (const id of idsToSync) {
      const { data: appointment, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchError || !appointment) {
        results.failed++;
        results.errors.push({
          appointmentId: id,
          error: 'Appointment not found',
        });
        continue;
      }

      const syncResult = await syncToTherapyNotes(appointment);

      await supabase.from('appointment_sync_log').insert({
        appointment_id: appointment.id,
        sync_type: 'create',
        status: syncResult.success ? 'success' : 'failed',
        request_payload: {
          appointmentId: appointment.id,
          patientName: appointment.patient_name,
          appointmentDate: appointment.appointment_date,
        },
        response_payload: syncResult.therapynotesId ? { id: syncResult.therapynotesId } : {},
        error_message: syncResult.error,
      });

      if (syncResult.success) {
        await supabase
          .from('appointments')
          .update({
            synced_to_emr: true,
            therapynotes_id: syncResult.therapynotesId,
            synced_at: new Date().toISOString(),
          })
          .eq('id', appointment.id);

        results.synced++;
      } else {
        results.failed++;
        results.errors.push({
          appointmentId: appointment.id,
          error: syncResult.error || 'Unknown error',
        });
      }
    }

    logger.info('Sync completed', {
      requestId,
      synced: results.synced,
      failed: results.failed,
    });

    return NextResponse.json({
      message: 'Sync completed',
      ...results,
    });
  } catch (error) {
    logger.error('Sync failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const authHeader = request.headers.get('authorization');

  if (!basicAuthGuard(authHeader)) {
    logger.warn('Unauthorized sync status attempt', { requestId });
    return createUnauthorizedResponse();
  }

  try {
    const { data: stats } = await supabase.rpc('get_sync_stats').single();

    const { data: recentLogs, error: logsError } = await supabase
      .from('appointment_sync_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (logsError) throw logsError;

    return NextResponse.json({
      stats: stats || { synced: 0, unsynced: 0, failed: 0 },
      recentLogs: recentLogs || [],
    });
  } catch (error) {
    logger.error('Failed to fetch sync status', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to fetch sync status' }, { status: 500 });
  }
}
