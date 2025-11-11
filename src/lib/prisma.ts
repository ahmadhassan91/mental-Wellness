import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Only instantiate Prisma Client if DATABASE_URL is available
// This prevents build-time errors when env vars aren't set
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, Prisma client will not be initialized');
    return null;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient() ?? ({} as PrismaClient);

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}
