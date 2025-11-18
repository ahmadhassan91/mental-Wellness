import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { logger, generateRequestId } from '@/lib/logger';

// Force dynamic rendering - required for API routes on Netlify
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const createAppointmentSchema = z.object({
  providerId: z.string().min(1),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  patientName: z.string().min(1),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(10),
  appointmentType: z.enum(['initial', 'follow_up']),
  modality: z.enum(['telehealth', 'in_person']),
  notes: z.string().optional(),
  utm: z.record(z.string()).optional(),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();
    
    // Log incoming request for debugging
    logger.info('Appointment creation request', {
      requestId,
      payload: body,
    });
    
    const validated = createAppointmentSchema.parse(body);

    const { data: provider, error: providerError } = await supabase
      .from('providers')
      .select('id, name')
      .eq('id', validated.providerId)
      .maybeSingle();

    if (providerError || !provider) {
      logger.warn('Invalid provider ID', { requestId, providerId: validated.providerId });
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const startTime = validated.startTime;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTime = `${String(hours + 1).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id')
      .eq('provider_id', validated.providerId)
      .eq('appointment_date', validated.appointmentDate)
      .eq('start_time', startTime)
      .neq('status', 'cancelled')
      .maybeSingle();

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        provider_id: validated.providerId,
        appointment_date: validated.appointmentDate,
        start_time: startTime,
        end_time: endTime,
        patient_name: validated.patientName,
        patient_email: validated.patientEmail,
        patient_phone: validated.patientPhone,
        appointment_type: validated.appointmentType,
        modality: validated.modality,
        notes: validated.notes || '',
        utm: validated.utm || {},
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Appointment created', {
      requestId,
      appointmentId: appointment.id,
      providerId: validated.providerId,
    });

    return NextResponse.json({
      success: true,
      appointment: {
        id: appointment.id,
        providerId: appointment.provider_id,
        appointmentDate: appointment.appointment_date,
        startTime: appointment.start_time,
        status: appointment.status,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid appointment data', { 
        requestId, 
        errors: error.errors,
        formattedErrors: error.format()
      });
      
      // Return detailed validation errors
      return NextResponse.json({ 
        error: 'Invalid appointment data',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
      }, { status: 400 });
    }

    logger.error('Failed to create appointment', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const date = url.searchParams.get('date');
    const status = url.searchParams.get('status');

    let query = supabase
      .from('appointments')
      .select(`
        id,
        provider_id,
        patient_name,
        patient_email,
        patient_phone,
        appointment_date,
        start_time,
        end_time,
        appointment_type,
        modality,
        status,
        notes,
        synced_to_emr,
        created_at
      `)
      .order('appointment_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (providerId) {
      query = query.eq('provider_id', providerId);
    }

    if (date) {
      query = query.eq('appointment_date', date);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments, error } = await query;

    if (error) {
      throw error;
    }

    logger.info('Appointments fetched', { requestId, count: appointments?.length || 0 });

    return NextResponse.json(appointments || []);
  } catch (error) {
    logger.error('Failed to fetch appointments', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}
