import { env } from "./env";

export function getDatabaseConfig() {
  return {
    url: env.DATABASE_URL,
    pool: {
      min: env.DATABASE_POOL_MIN,
      max: env.DATABASE_POOL_MAX,
    },
  };
}
