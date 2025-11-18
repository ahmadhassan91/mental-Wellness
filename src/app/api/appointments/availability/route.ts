import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, generateRequestId } from '@/lib/logger';

// Force dynamic rendering - required for API routes on Netlify
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
  const requestId = generateRequestId();

  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const dateStr = url.searchParams.get('date');

    if (!providerId || !dateStr) {
      return NextResponse.json(
        { error: 'Provider ID and date are required' },
        { status: 400 }
      );
    }

    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();

    const { data: availability, error: availError } = await supabase
      .from('provider_availability')
      .select('start_time, end_time')
      .eq('provider_id', providerId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_active', true);

    if (availError) {
      throw availError;
    }

    if (!availability || availability.length === 0) {
      return NextResponse.json({ slots: [] });
    }

    const { data: bookedAppointments, error: apptError } = await supabase
      .from('appointments')
      .select('start_time, end_time')
      .eq('provider_id', providerId)
      .eq('appointment_date', dateStr)
      .neq('status', 'cancelled');

    if (apptError) {
      throw apptError;
    }

    const bookedTimes = new Set(
      (bookedAppointments || []).map((apt) => apt.start_time)
    );

    const slots = [];
    for (const avail of availability) {
      const startHour = parseInt(avail.start_time.split(':')[0]);
      const endHour = parseInt(avail.end_time.split(':')[0]);

      for (let hour = startHour; hour < endHour; hour++) {
        const timeSlot = `${String(hour).padStart(2, '0')}:00`;
        slots.push({
          time: timeSlot,
          available: !bookedTimes.has(timeSlot),
        });
      }
    }

    logger.info('Availability fetched', {
      requestId,
      providerId,
      date: dateStr,
      slotsCount: slots.length,
    });

    return NextResponse.json({ slots });
  } catch (error) {
    logger.error('Failed to fetch availability', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to fetch availability' }, { status: 500 });
  }
}
