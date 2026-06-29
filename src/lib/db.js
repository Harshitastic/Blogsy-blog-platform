import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const globalForPrisma = global;

let connectionString =
  process.env.DATABASE_URL &&
  (process.env.DATABASE_URL.startsWith('postgres://') ||
    process.env.DATABASE_URL.startsWith('postgresql://'))
    ? process.env.DATABASE_URL
    : 'postgresql://postgres:postgres@localhost:5432/postgres';

if (connectionString && (connectionString.startsWith('postgres://') || connectionString.startsWith('postgresql://'))) {
  connectionString = connectionString.replace(/\/neondb(\?|$)/, '/blogsy$1');
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
