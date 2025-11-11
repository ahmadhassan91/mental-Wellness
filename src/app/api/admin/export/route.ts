import { NextResponse } from 'next/server';
import { basicAuthGuard, createUnauthorizedResponse } from '@/lib/auth';
import { getEvents } from '@/lib/analytics';
import { convertToCSV } from '@/lib/utils';
import { logger, generateRequestId } from '@/lib/logger';
import { format } from 'date-fns';

// Force dynamic rendering - required for API routes on Netlify
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const authHeader = request.headers.get('authorization');

  if (!basicAuthGuard(authHeader)) {
    logger.warn('Unauthorized admin export attempt', { requestId });
    return createUnauthorizedResponse();
  }

  try {
    const url = new URL(request.url);
    const providerId = url.searchParams.get('providerId');
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const filters: {
      providerId?: string;
      startDate?: Date;
      endDate?: Date;
    } = {};

    if (providerId) filters.providerId = providerId;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    const events = await getEvents(filters);

    const csvData = events.map((event) => {
      const utm = event.utm as Record<string, string> | null;
      return {
        id: event.id,
        providerName: (event.provider as any)?.name || 'Unknown',
        eventType: event.eventType,
        createdAt: new Date(event.createdAt).toISOString(),
        utmSource: utm?.source || '',
        utmMedium: utm?.medium || '',
        utmCampaign: utm?.campaign || '',
      };
    });

    const csv = convertToCSV(csvData);
    const filename = `analytics-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;

    logger.info('Admin export completed', { requestId, rows: events.length });

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error('Failed to export admin data', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
