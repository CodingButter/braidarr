/**
 * API Authentication Configuration
 * 
 * This module handles configuration for API key authentication features,
 * allowing administrators to control how external applications can authenticate.
 */

export interface ApiAuthConfig {
  /** Whether API key authentication is enabled globally */
  enabled: boolean;
  
  /** Default expiration time for new API keys (in days) */
  defaultExpirationDays: number;
  
  /** Maximum number of API keys per user */
  maxKeysPerUser: number;
  
  /** Whether to require explicit scopes (vs allowing wildcard by default) */
  requireExplicitScopes: boolean;
  
  /** Whether to log API key usage */
  logUsage: boolean;
  
  /** Rate limiting for API key requests */
  rateLimit: {
    /** Maximum requests per API key per minute */
    requestsPerMinute: number;
    
    /** Maximum requests per API key per hour */
    requestsPerHour: number;
    
    /** Maximum requests per API key per day */
    requestsPerDay: number;
  };
  
  /** Security settings */
  security: {
    /** Minimum length for API key names */
    minKeyNameLength: number;
    
    /** Maximum length for API key names */
    maxKeyNameLength: number;
    
    /** Whether to enforce HTTPS for API key requests (production) */
    requireHttps: boolean;
    
    /** Whether to validate IP restrictions (if implemented) */
    enableIpRestrictions: boolean;
  };
}

/**
 * Default API authentication configuration
 */
const defaultConfig: ApiAuthConfig = {
  enabled: true,
  defaultExpirationDays: 365, // 1 year default
  maxKeysPerUser: 10,
  requireExplicitScopes: false, // Allow wildcard scopes by default
  logUsage: true,
  
  rateLimit: {
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
  },
  
  security: {
    minKeyNameLength: 3,
    maxKeyNameLength: 100,
    requireHttps: process.env.NODE_ENV === 'production',
    enableIpRestrictions: false, // Future feature
  },
};

/**
 * Load API authentication configuration from environment variables
 */
function loadConfigFromEnv(): Partial<ApiAuthConfig> {
  const config: Partial<ApiAuthConfig> = {};
  
  // Main settings
  if (process.env.API_AUTH_ENABLED !== undefined) {
    config.enabled = process.env.API_AUTH_ENABLED === 'true';
  }
  
  if (process.env.API_AUTH_DEFAULT_EXPIRATION_DAYS) {
    config.defaultExpirationDays = parseInt(process.env.API_AUTH_DEFAULT_EXPIRATION_DAYS, 10);
  }
  
  if (process.env.API_AUTH_MAX_KEYS_PER_USER) {
    config.maxKeysPerUser = parseInt(process.env.API_AUTH_MAX_KEYS_PER_USER, 10);
  }
  
  if (process.env.API_AUTH_REQUIRE_EXPLICIT_SCOPES !== undefined) {
    config.requireExplicitScopes = process.env.API_AUTH_REQUIRE_EXPLICIT_SCOPES === 'true';
  }
  
  if (process.env.API_AUTH_LOG_USAGE !== undefined) {
    config.logUsage = process.env.API_AUTH_LOG_USAGE === 'true';
  }
  
  // Rate limiting
  const rateLimit: Partial<ApiAuthConfig['rateLimit']> = {};
  
  if (process.env.API_AUTH_RATE_LIMIT_PER_MINUTE) {
    rateLimit.requestsPerMinute = parseInt(process.env.API_AUTH_RATE_LIMIT_PER_MINUTE, 10);
  }
  
  if (process.env.API_AUTH_RATE_LIMIT_PER_HOUR) {
    rateLimit.requestsPerHour = parseInt(process.env.API_AUTH_RATE_LIMIT_PER_HOUR, 10);
  }
  
  if (process.env.API_AUTH_RATE_LIMIT_PER_DAY) {
    rateLimit.requestsPerDay = parseInt(process.env.API_AUTH_RATE_LIMIT_PER_DAY, 10);
  }
  
  if (Object.keys(rateLimit).length > 0) {
    config.rateLimit = { ...defaultConfig.rateLimit, ...rateLimit };
  }
  
  // Security settings
  const security: Partial<ApiAuthConfig['security']> = {};
  
  if (process.env.API_AUTH_MIN_KEY_NAME_LENGTH) {
    security.minKeyNameLength = parseInt(process.env.API_AUTH_MIN_KEY_NAME_LENGTH, 10);
  }
  
  if (process.env.API_AUTH_MAX_KEY_NAME_LENGTH) {
    security.maxKeyNameLength = parseInt(process.env.API_AUTH_MAX_KEY_NAME_LENGTH, 10);
  }
  
  if (process.env.API_AUTH_REQUIRE_HTTPS !== undefined) {
    security.requireHttps = process.env.API_AUTH_REQUIRE_HTTPS === 'true';
  }
  
  if (process.env.API_AUTH_ENABLE_IP_RESTRICTIONS !== undefined) {
    security.enableIpRestrictions = process.env.API_AUTH_ENABLE_IP_RESTRICTIONS === 'true';
  }
  
  if (Object.keys(security).length > 0) {
    config.security = { ...defaultConfig.security, ...security };
  }
  
  return config;
}

/**
 * Get the current API authentication configuration
 */
export function getApiAuthConfig(): ApiAuthConfig {
  const envConfig = loadConfigFromEnv();
  return { ...defaultConfig, ...envConfig };
}

/**
 * Validate API authentication configuration
 */
export function validateApiAuthConfig(config: ApiAuthConfig): string[] {
  const errors: string[] = [];
  
  if (config.defaultExpirationDays <= 0) {
    errors.push('defaultExpirationDays must be greater than 0');
  }
  
  if (config.maxKeysPerUser <= 0) {
    errors.push('maxKeysPerUser must be greater than 0');
  }
  
  if (config.rateLimit.requestsPerMinute <= 0) {
    errors.push('rateLimit.requestsPerMinute must be greater than 0');
  }
  
  if (config.rateLimit.requestsPerHour <= 0) {
    errors.push('rateLimit.requestsPerHour must be greater than 0');
  }
  
  if (config.rateLimit.requestsPerDay <= 0) {
    errors.push('rateLimit.requestsPerDay must be greater than 0');
  }
  
  if (config.security.minKeyNameLength <= 0) {
    errors.push('security.minKeyNameLength must be greater than 0');
  }
  
  if (config.security.maxKeyNameLength <= config.security.minKeyNameLength) {
    errors.push('security.maxKeyNameLength must be greater than minKeyNameLength');
  }
  
  // Logical validation
  if (config.rateLimit.requestsPerHour < config.rateLimit.requestsPerMinute * 60) {
    errors.push('rateLimit.requestsPerHour should be at least requestsPerMinute * 60');
  }
  
  if (config.rateLimit.requestsPerDay < config.rateLimit.requestsPerHour * 24) {
    errors.push('rateLimit.requestsPerDay should be at least requestsPerHour * 24');
  }
  
  return errors;
}

/**
 * Get API authentication status (for health checks and admin dashboards)
 */
export function getApiAuthStatus() {
  const config = getApiAuthConfig();
  const errors = validateApiAuthConfig(config);
  
  return {
    enabled: config.enabled,
    healthy: errors.length === 0,
    errors,
    config: {
      maxKeysPerUser: config.maxKeysPerUser,
      defaultExpirationDays: config.defaultExpirationDays,
      requireExplicitScopes: config.requireExplicitScopes,
      rateLimit: config.rateLimit,
    },
  };
}