import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, generateRequestId } from '@/lib/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ providerId: string }> }
) {
  const requestId = generateRequestId();
  const { providerId } = await params;

  try {
    const { data: providerData } = await supabase
      .from('providers')
      .select('id, name, photo_url, specialties, modalities, accepting_new, portal_link')
      .eq('id', providerId)
      .eq('show', true)
      .maybeSingle();

    const provider = providerData ? {
      id: providerData.id,
      name: providerData.name,
      photoUrl: providerData.photo_url,
      specialties: providerData.specialties || [],
      modalities: providerData.modalities || [],
      acceptingNew: providerData.accepting_new,
      portalLink: providerData.portal_link,
    } : null;

    if (!provider) {
      logger.warn('Provider not found', { requestId, providerId });
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    logger.info('Provider fetched', { requestId, providerId });

    return NextResponse.json(provider);
  } catch (error) {
    logger.error('Failed to fetch provider', {
      requestId,
      providerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to fetch provider' }, { status: 500 });
  }
}
