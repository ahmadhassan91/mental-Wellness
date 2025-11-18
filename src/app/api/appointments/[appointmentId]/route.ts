import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { basicAuthGuard, createUnauthorizedResponse } from '@/lib/auth';
import { z } from 'zod';
import { logger, generateRequestId } from '@/lib/logger';

// Force dynamic rendering - required for API routes on Netlify
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const updateAppointmentSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']).optional(),
  notes: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  const requestId = generateRequestId();
  const authHeader = request.headers.get('authorization');

  if (!basicAuthGuard(authHeader)) {
    logger.warn('Unauthorized appointment update attempt', { requestId });
    return createUnauthorizedResponse();
  }

  try {
    const body = await request.json();
    const validated = updateAppointmentSchema.parse(body);

    const { data: appointment, error } = await supabase
      .from('appointments')
      .update(validated)
      .eq('id', params.appointmentId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Appointment updated', {
      requestId,
      appointmentId: params.appointmentId,
    });

    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid update data', { requestId, errors: error.errors });
      return NextResponse.json({ error: 'Invalid update data' }, { status: 400 });
    }

    logger.error('Failed to update appointment', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function GET(
  request: Request,
  { params }: { params: { appointmentId: string } }
) {
  const requestId = generateRequestId();

  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', params.appointmentId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    logger.info('Appointment fetched', { requestId, appointmentId: params.appointmentId });

    return NextResponse.json(appointment);
  } catch (error) {
    logger.error('Failed to fetch appointment', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
  }
}
