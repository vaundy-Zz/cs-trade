import { PrismaClient } from "@prisma/client";
import { logger } from "@/observability/logger";

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "error" },
      { emit: "event", level: "warn" }
    ]
  });
};

const prisma = globalThis.prisma ?? prismaClientSingleton();

prisma.$on("query", (e) => {
  logger.debug(
    {
      query: e.query,
      params: e.params,
      duration: e.duration,
      target: e.target
    },
    "Prisma Query"
  );
});

prisma.$on("error", (e) => {
  logger.error({ target: e.target }, "Prisma Error");
});

prisma.$on("warn", (e) => {
  logger.warn({ message: e.message, target: e.target }, "Prisma Warning");
});

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

export default prisma;
