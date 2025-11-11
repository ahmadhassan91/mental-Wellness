import { createClient } from '@supabase/supabase-js';
import { UTMParams } from './utils';
import { logger } from './logger';

// Only create Supabase client if environment variables are available
const createSupabaseClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn('Supabase credentials not set, client will not be initialized');
    return null;
  }
  
  return createClient(url, key);
};

const supabase = createSupabaseClient();

export type EventType = 'click' | 'landed_portal';

export interface WriteEventInput {
  providerId: string;
  eventType: EventType;
  utm?: UTMParams;
  requestId?: string;
}

export async function writeEvent(input: WriteEventInput): Promise<void> {
  if (!supabase) {
    logger.error('Supabase client not initialized', { requestId: input.requestId });
    throw new Error('Database client not available');
  }
  
  try {
    const { error } = await supabase
      .from('booking_events')
      .insert({
        provider_id: input.providerId,
        event_type: input.eventType,
        utm: input.utm || {},
      });

    if (error) throw error;

    logger.info('Event recorded', {
      requestId: input.requestId,
      providerId: input.providerId,
      eventType: input.eventType,
    });
  } catch (error) {
    logger.error('Failed to write event', {
      requestId: input.requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      providerId: input.providerId,
      eventType: input.eventType,
    });
    throw error;
  }
}

export interface GetEventsFilters {
  providerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getEvents(filters?: GetEventsFilters) {
  if (!supabase) {
    throw new Error('Database client not available');
  }
  
  let query = supabase
    .from('booking_events')
    .select(`
      id,
      provider_id,
      event_type,
      utm,
      created_at,
      providers:provider_id (name)
    `)
    .order('created_at', { ascending: false });

  if (filters?.providerId) {
    query = query.eq('provider_id', filters.providerId);
  }

  if (filters?.startDate) {
    query = query.gte('created_at', filters.startDate.toISOString());
  }

  if (filters?.endDate) {
    query = query.lte('created_at', filters.endDate.toISOString());
  }

  const { data, error } = await query;

  if (error) throw error;

  return data?.map(event => ({
    id: event.id,
    providerId: event.provider_id,
    eventType: event.event_type,
    utm: event.utm,
    createdAt: new Date(event.created_at),
    provider: event.providers,
  })) || [];
}
