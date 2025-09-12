import { z } from 'zod'
// import { ENVIRONMENTS, DEFAULT_CONFIG } from '@braidarr/shared'

export const ENVIRONMENTS = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
} as const

const DEFAULT_CONFIG = {
  API: {
    PORT: 3401,
    HOST: 'localhost',
    CORS_ORIGINS: ['http://localhost:3400', 'http://localhost:3000'],
  },
  WEB: {
    PORT: 3400,
  },
} as const

/**
 * Environment configuration schema
 */
export const EnvironmentConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(DEFAULT_CONFIG.API.PORT),
  HOST: z.string().default(DEFAULT_CONFIG.API.HOST),

  // Database
  DATABASE_URL: z.string().optional(),
  DATABASE_SSL: z.coerce.boolean().default(false),

  // CORS
  CORS_ORIGINS: z
    .string()
    .transform((str) => str.split(',').map((s) => s.trim()))
    .default(DEFAULT_CONFIG.API.CORS_ORIGINS.join(',')),

  // Security
  JWT_SECRET: z.string().optional(),
  BCRYPT_ROUNDS: z.coerce.number().default(12),

  // Rate limiting
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),

  // Logging
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),

  // External services
  PLEX_URL: z.string().optional(),
  PLEX_TOKEN: z.string().optional(),
})

export type EnvironmentConfig = z.infer<typeof EnvironmentConfigSchema>

/**
 * Load and validate environment configuration
 */
export function loadConfig(): EnvironmentConfig {
  const parsed = EnvironmentConfigSchema.safeParse(process.env)

  if (!parsed.success) {
    console.error('Invalid environment configuration:')
    console.error(parsed.error.format())
    process.exit(1)
  }

  return parsed.data
}

/**
 * Database configuration
 */
export interface DatabaseConfig {
  url?: string
  ssl?: boolean
  pool?: {
    min: number
    max: number
  }
  migrations?: {
    directory: string
  }
}

/**
 * API configuration
 */
export interface ApiConfig {
  host: string
  port: number
  cors: {
    origin: string[]
    credentials: boolean
  }
  rateLimit: {
    max: number
    timeWindow: string
  }
  swagger?: {
    enabled: boolean
    path: string
  }
}

/**
 * Web configuration
 */
export interface WebConfig {
  port: number
  apiUrl: string
  publicUrl: string
}

/**
 * Application configuration
 */
export interface AppConfig {
  environment: 'development' | 'staging' | 'production'
  version: string
  api: ApiConfig
  web?: WebConfig
  database?: DatabaseConfig
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error'
  }
  security: {
    jwtSecret?: string
    bcryptRounds: number
  }
  external?: {
    plex?: {
      url: string
      token: string
    }
  }
}

/**
 * Create application configuration from environment
 */
export function createAppConfig(env: EnvironmentConfig): AppConfig {
  const config: AppConfig = {
    environment: env.NODE_ENV,
    version: process.env.npm_package_version || '0.0.1',
    api: {
      host: env.HOST,
      port: env.PORT,
      cors: {
        origin: env.CORS_ORIGINS,
        credentials: true,
      },
      rateLimit: {
        max: env.RATE_LIMIT_MAX,
        timeWindow: env.RATE_LIMIT_WINDOW,
      },
      swagger: {
        enabled: env.NODE_ENV !== 'production',
        path: '/docs',
      },
    },
    logging: {
      level: env.LOG_LEVEL,
    },
    security: {
      ...(env.JWT_SECRET && { jwtSecret: env.JWT_SECRET }),
      bcryptRounds: env.BCRYPT_ROUNDS,
    },
  }

  // Add database config if URL is provided
  if (env.DATABASE_URL) {
    config.database = {
      url: env.DATABASE_URL,
      ssl: env.DATABASE_SSL,
      pool: {
        min: 2,
        max: 10,
      },
    }
  }

  // Add Plex config if provided
  if (env.PLEX_URL && env.PLEX_TOKEN) {
    config.external = {
      plex: {
        url: env.PLEX_URL,
        token: env.PLEX_TOKEN,
      },
    }
  }

  return config
}

/**
 * Default configurations for different environments
 */
export const defaultConfigs = {
  development: (): AppConfig =>
    createAppConfig({
      NODE_ENV: 'development',
      PORT: 3401,
      HOST: 'localhost',
      CORS_ORIGINS: ['http://localhost:3400'],
      LOG_LEVEL: 'debug',
      RATE_LIMIT_MAX: 1000,
      RATE_LIMIT_WINDOW: '1 minute',
      BCRYPT_ROUNDS: 10, // Lower for dev
      DATABASE_SSL: false,
    } as EnvironmentConfig),

  production: (): AppConfig =>
    createAppConfig({
      NODE_ENV: 'production',
      PORT: 3401,
      HOST: '0.0.0.0',
      CORS_ORIGINS: [], // Must be set via environment
      LOG_LEVEL: 'info',
      RATE_LIMIT_MAX: 100,
      RATE_LIMIT_WINDOW: '1 minute',
      BCRYPT_ROUNDS: 12,
      DATABASE_SSL: true,
    } as EnvironmentConfig),
}
