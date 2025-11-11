import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { logger, generateRequestId } from '@/lib/logger';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  const requestId = generateRequestId();

  try {
    const { data: providers, error } = await supabase
      .from('providers')
      .select('id, name, photo_url, specialties, modalities, accepting_new, portal_link, show')
      .eq('show', true)
      .order('name', { ascending: true });

    if (error) {
      throw error;
    }

    const formattedProviders = providers?.map(p => ({
      id: p.id,
      name: p.name,
      photoUrl: p.photo_url,
      specialties: p.specialties || [],
      modalities: p.modalities || [],
      acceptingNew: p.accepting_new,
      portalLink: p.portal_link,
    })) || [];

    logger.info('Providers fetched', { requestId, count: formattedProviders.length });

    return NextResponse.json(formattedProviders);
  } catch (error) {
    logger.error('Failed to fetch providers', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
