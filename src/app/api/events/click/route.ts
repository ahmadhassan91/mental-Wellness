import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { writeEvent } from '@/lib/analytics';
import { logger, generateRequestId } from '@/lib/logger';

// Force dynamic rendering - required for API routes on Netlify
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const clickEventSchema = z.object({
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

const eventLimits = new Map<string, number>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const lastCall = eventLimits.get(ip) || 0;

  if (now - lastCall < 1000) {
    return false;
  }

  eventLimits.set(ip, now);
  return true;
}

export async function POST(request: Request) {
  const requestId = generateRequestId();
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  if (!checkRateLimit(ip)) {
    logger.warn('Rate limit exceeded', { requestId, ip });
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const validated = clickEventSchema.parse(body);

    const { data: provider } = await supabase
      .from('providers')
      .select('id')
      .eq('id', validated.providerId)
      .maybeSingle();

    if (!provider) {
      logger.warn('Invalid provider ID', { requestId, providerId: validated.providerId });
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    await writeEvent({
      providerId: validated.providerId,
      eventType: 'click',
      utm: validated.utm,
      requestId,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn('Invalid request body', { requestId, errors: error.errors });
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    logger.error('Failed to record click event', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
