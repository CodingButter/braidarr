import { FastifyPluginAsync } from 'fastify';

export const rateLimitPlugin: FastifyPluginAsync = async (server) => {
  // This plugin sets up route-specific rate limits
  // Global rate limit is already registered in main index.ts
  
  // Create rate limit configurations
  const authRateLimit = {
    max: 5, // 5 requests
    timeWindow: 15 * 60 * 1000, // per 15 minutes
    keyGenerator: (request: any) => {
      // Use IP + email for login/register to prevent brute force
      const email = (request.body as any)?.email;
      if (email) {
        return `${request.ip}:${email}`;
      }
      return request.ip;
    },
    errorResponseBuilder: () => {
      return {
        error: 'Too many requests',
        message: 'You have exceeded the maximum number of authentication attempts. Please try again later.',
        retryAfter: 15 * 60, // seconds
      };
    },
  };

  const refreshRateLimit = {
    max: 30, // 30 requests
    timeWindow: 60 * 1000, // per minute
    keyGenerator: (request: any) => request.ip,
    errorResponseBuilder: () => {
      return {
        error: 'Too many requests',
        message: 'Please slow down your requests.',
        retryAfter: 60, // seconds
      };
    },
  };

  // Add rate limit decorators for use in route handlers
  server.decorate('authRateLimit', authRateLimit);
  server.decorate('refreshRateLimit', refreshRateLimit);
};

// Helper function to get remaining rate limit info
export function getRateLimitInfo(headers: Record<string, any>) {
  return {
    limit: headers['x-ratelimit-limit'],
    remaining: headers['x-ratelimit-remaining'],
    reset: headers['x-ratelimit-reset'],
  };
}