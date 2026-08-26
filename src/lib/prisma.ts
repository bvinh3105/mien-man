import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export function getDB(): PrismaClient {
  if (process.env.DATABASE_URL) {
    // Local dev with SQLite file
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient();
    }
    return globalForPrisma.prisma;
  }

  // Cloudflare D1 — get binding from request context
  const { getRequestContext } = require("@cloudflare/next-on-pages");
  const { env } = getRequestContext();
  const adapter = new PrismaD1(env.DB);
  return new PrismaClient({ adapter });
}

// For backward compat in local dev
export const prisma = process.env.DATABASE_URL
  ? (globalForPrisma.prisma || new PrismaClient())
  : (null as unknown as PrismaClient);

if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  globalForPrisma.prisma = prisma;
}
