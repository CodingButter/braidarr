/**
 * Application constants
 */

export const APP_NAME = "Braidarr" as const;
export const APP_DESCRIPTION =
  "AI-powered media management and automation platform" as const;
export const APP_VERSION = "0.0.1" as const;

/**
 * API constants
 */
export const API_PREFIX = "/api/v1" as const;
export const DEFAULT_PAGE_SIZE = 20 as const;
export const MAX_PAGE_SIZE = 100 as const;

/**
 * User roles
 */
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
} as const;

/**
 * Media types
 */
export const MEDIA_TYPES = {
  MOVIE: "movie",
  TV: "tv",
  MUSIC: "music",
  BOOK: "book",
} as const;

/**
 * Environment types
 */
export const ENVIRONMENTS = {
  DEVELOPMENT: "development",
  STAGING: "staging",
  PRODUCTION: "production",
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMITED: "RATE_LIMITED",
} as const;

/**
 * Default configurations
 */
export const DEFAULT_CONFIG = {
  API: {
    PORT: 3401,
    HOST: "localhost",
    CORS_ORIGINS: ["http://localhost:3400", "http://localhost:3000"],
  },
  WEB: {
    PORT: 3400,
  },
} as const;

/**
 * Regular expressions
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
