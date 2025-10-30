import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  APP_URL: z.string().url({
    message: "APP_URL must be a valid URL (e.g., http://localhost:3000).",
  }),
  DATABASE_URL: z
    .string()
    .url({ message: "DATABASE_URL must be a valid Postgres connection URL." }),
  DATABASE_POOL_MIN: z.coerce.number().int().nonnegative().default(2),
  DATABASE_POOL_MAX: z.coerce.number().int().positive().default(10),
  REDIS_URL: z
    .string()
    .url({ message: "REDIS_URL must be a valid Redis connection string." }),
  REDIS_PASSWORD: z.string().optional(),
  NEXTAUTH_SECRET: z.string().min(1, "NEXTAUTH_SECRET is required."),
  NEXTAUTH_URL: z.string().url({
    message: "NEXTAUTH_URL must be a valid URL (e.g., http://localhost:3000).",
  }),
  STEAM_API_KEY: z.string().min(1, "STEAM_API_KEY is required."),
  STEAM_CALLBACK_URL: z
    .string()
    .url({ message: "STEAM_CALLBACK_URL must be a valid URL." }),
  THIRD_PARTY_API_KEY: z
    .string()
    .min(
      1,
      "THIRD_PARTY_API_KEY must be provided for third-party integrations."
    ),
  THIRD_PARTY_API_SECRET: z
    .string()
    .min(1, "THIRD_PARTY_API_SECRET is required."),
  RATE_LIMIT_ENABLED: z.coerce.boolean().default(true),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60000),
  RATE_LIMIT_REDIS_ENABLED: z.coerce.boolean().default(true),
  FEATURE_STEAM_INTEGRATION: z.coerce.boolean().default(true),
  FEATURE_ANALYTICS: z.coerce.boolean().default(true),
  FEATURE_MAINTENANCE_MODE: z.coerce.boolean().default(false),
  FEATURE_NEW_UI: z.coerce.boolean().default(false),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("json"),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .min(1, "CORS_ALLOWED_ORIGINS must list at least one origin.")
    .default("http://localhost:3000"),
  SESSION_MAX_AGE: z.coerce.number().int().positive().default(2592000),
  SENTRY_DSN: z.string().optional(),
  ANALYTICS_ID: z.string().optional(),
});

function parseEnv() {
  const envResult = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    APP_URL: process.env.APP_URL,
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_POOL_MIN: process.env.DATABASE_POOL_MIN,
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    STEAM_API_KEY: process.env.STEAM_API_KEY,
    STEAM_CALLBACK_URL: process.env.STEAM_CALLBACK_URL,
    THIRD_PARTY_API_KEY: process.env.THIRD_PARTY_API_KEY,
    THIRD_PARTY_API_SECRET: process.env.THIRD_PARTY_API_SECRET,
    RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED,
    RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
    RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
    RATE_LIMIT_REDIS_ENABLED: process.env.RATE_LIMIT_REDIS_ENABLED,
    FEATURE_STEAM_INTEGRATION: process.env.FEATURE_STEAM_INTEGRATION,
    FEATURE_ANALYTICS: process.env.FEATURE_ANALYTICS,
    FEATURE_MAINTENANCE_MODE: process.env.FEATURE_MAINTENANCE_MODE,
    FEATURE_NEW_UI: process.env.FEATURE_NEW_UI,
    LOG_LEVEL: process.env.LOG_LEVEL,
    LOG_FORMAT: process.env.LOG_FORMAT,
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS,
    SESSION_MAX_AGE: process.env.SESSION_MAX_AGE,
    SENTRY_DSN: process.env.SENTRY_DSN,
    ANALYTICS_ID: process.env.ANALYTICS_ID,
  });

  if (!envResult.success) {
    const formattedErrors = envResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment configuration. Please fix the following:\n${formattedErrors}`
    );
  }

  const data = envResult.data;

  if (data.DATABASE_POOL_MAX < data.DATABASE_POOL_MIN) {
    throw new Error(
      "DATABASE_POOL_MAX cannot be less than DATABASE_POOL_MIN. Check your configuration."
    );
  }

  return data;
}

export const env = parseEnv();

export type Env = typeof env;
