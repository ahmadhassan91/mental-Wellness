import { NextResponse } from 'next/server';
import { basicAuthGuard, createUnauthorizedResponse } from '@/lib/auth';
import { getEvents } from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { logger, generateRequestId } from '@/lib/logger';

export async function GET(request: Request) {
  const requestId = generateRequestId();
  const authHeader = request.headers.get('authorization');

  if (!basicAuthGuard(authHeader)) {
    logger.warn('Unauthorized admin access attempt', { requestId });
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

    const [events, providers] = await Promise.all([
      getEvents(filters),
      prisma.provider.findMany({
        select: {
          id: true,
          name: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    logger.info('Admin events fetched', { requestId, count: events.length });

    return NextResponse.json({
      events,
      providers,
    });
  } catch (error) {
    logger.error('Failed to fetch admin events', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
