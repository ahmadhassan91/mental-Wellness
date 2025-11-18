import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { writeEvent } from '@/lib/analytics';
import { logger, generateRequestId } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const landedEventSchema = z.object({
  providerId: z.string().min(1),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
      term: z.string().optional(),
      content: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: Request) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();
    const validated = landedEventSchema.parse(body);

    const { data: provider, error } = await supabase
      .from('providers')
      .select('id')
      .eq('id', validated.providerId)
      .maybeSingle();

    if (error || !provider) {
      logger.warn('Invalid provider ID', { requestId, providerId: validated.providerId });
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    await writeEvent({
      providerId: validated.providerId,
      eventType: 'landed_portal',
      utm: validated.utm,
      requestId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request body', { requestId, errors: error.errors });
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    logger.error('Failed to record landed event', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
