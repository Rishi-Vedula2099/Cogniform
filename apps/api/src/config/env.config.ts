import { z } from "zod";

/**
 * Centralised environment validation. ConfigModule calls `validateEnv(env)` at
 * boot; if any required var is missing/invalid the app refuses to start.
 * The inferred `Env` type is the typed config surface.
 */
const boolString = z
  .string()
  .transform((v) => v === "true" || v === "1")
  .default("false");

export const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  API_PREFIX: z.string().default("api"),

  // URLs
  CLIENT_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),

  // Database / cache
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  // Auth
  JWT_ACCESS_SECRET: z.string().min(32).default("dev_access_secret_minimum_32_chars_long_ok"),
  JWT_REFRESH_SECRET: z.string().min(32).default("dev_refresh_secret_minimum_32_chars_long_ok"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  JWT_REFRESH_TTL: z.string().default("7d"),
  AUTH_COOKIE_DOMAIN: z.string().optional(),
  SECURE_COOKIES: boolString,

  // OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().optional(),
  MAIL_FROM: z.string().email().default("no-reply@cogniform.app"),

  // Storage (R2/S3)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().default("cogniform"),
  R2_PUBLIC_URL: z.string().optional(),

  // AI
  OPENAI_API_KEY: z.string().optional(),

  // Encryption for integration secrets
  INTEGRATIONS_ENCRYPTION_KEY: z.string().min(32).default("dev_integration_encryption_key_32_ch"),

  // Captcha
  TURNSTILE_SECRET_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error("❌ Invalid environment variables configuration:", result.error.format());
    throw new Error("Invalid environment variables configuration");
  }
  return result.data;
}
