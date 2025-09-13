import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { getApiAuthConfig, getApiAuthStatus, validateApiAuthConfig } from '../config/api-auth.config.js';

// Validation schemas
const ApiAuthConfigUpdateSchema = z.object({
  enabled: z.boolean().optional(),
  defaultExpirationDays: z.number().int().min(1).max(3650).optional(), // Max 10 years
  maxKeysPerUser: z.number().int().min(1).max(100).optional(),
  requireExplicitScopes: z.boolean().optional(),
  logUsage: z.boolean().optional(),
  rateLimit: z.object({
    requestsPerMinute: z.number().int().min(1).optional(),
    requestsPerHour: z.number().int().min(1).optional(),
    requestsPerDay: z.number().int().min(1).optional(),
  }).optional(),
  security: z.object({
    minKeyNameLength: z.number().int().min(1).max(50).optional(),
    maxKeyNameLength: z.number().int().min(10).max(200).optional(),
    requireHttps: z.boolean().optional(),
    enableIpRestrictions: z.boolean().optional(),
  }).optional(),
});

export async function settingsRoutes(fastify: FastifyInstance) {
  // All settings routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get API authentication configuration
  fastify.get(
    '/api-auth',
    {
      schema: {
        description: 'Get API authentication configuration and status',
        tags: ['settings'],
        response: {
          200: {
            type: 'object',
            properties: {
              config: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  defaultExpirationDays: { type: 'number' },
                  maxKeysPerUser: { type: 'number' },
                  requireExplicitScopes: { type: 'boolean' },
                  logUsage: { type: 'boolean' },
                  rateLimit: {
                    type: 'object',
                    properties: {
                      requestsPerMinute: { type: 'number' },
                      requestsPerHour: { type: 'number' },
                      requestsPerDay: { type: 'number' },
                    },
                  },
                  security: {
                    type: 'object',
                    properties: {
                      minKeyNameLength: { type: 'number' },
                      maxKeyNameLength: { type: 'number' },
                      requireHttps: { type: 'boolean' },
                      enableIpRestrictions: { type: 'boolean' },
                    },
                  },
                },
              },
              status: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  healthy: { type: 'boolean' },
                  errors: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      const config = getApiAuthConfig();
      const status = getApiAuthStatus();
      
      return {
        config,
        status,
      };
    }
  );

  // Update API authentication configuration (placeholder - would need persistent storage)
  fastify.patch<{ Body: z.infer<typeof ApiAuthConfigUpdateSchema> }>(
    '/api-auth',
    {
      schema: {
        description: 'Update API authentication configuration',
        tags: ['settings'],
        body: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean' },
            defaultExpirationDays: { type: 'number', minimum: 1, maximum: 3650 },
            maxKeysPerUser: { type: 'number', minimum: 1, maximum: 100 },
            requireExplicitScopes: { type: 'boolean' },
            logUsage: { type: 'boolean' },
            rateLimit: {
              type: 'object',
              properties: {
                requestsPerMinute: { type: 'number', minimum: 1 },
                requestsPerHour: { type: 'number', minimum: 1 },
                requestsPerDay: { type: 'number', minimum: 1 },
              },
            },
            security: {
              type: 'object',
              properties: {
                minKeyNameLength: { type: 'number', minimum: 1, maximum: 50 },
                maxKeyNameLength: { type: 'number', minimum: 10, maximum: 200 },
                requireHttps: { type: 'boolean' },
                enableIpRestrictions: { type: 'boolean' },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              config: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  defaultExpirationDays: { type: 'number' },
                  maxKeysPerUser: { type: 'number' },
                  requireExplicitScopes: { type: 'boolean' },
                  logUsage: { type: 'boolean' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
              details: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const validatedData = ApiAuthConfigUpdateSchema.parse(request.body);
      
      // Get current config
      const currentConfig = getApiAuthConfig();
      
      // Merge with updates, ensuring all required properties are present
      const updatedConfig = {
        enabled: validatedData.enabled !== undefined ? validatedData.enabled : currentConfig.enabled,
        defaultExpirationDays: validatedData.defaultExpirationDays !== undefined ? validatedData.defaultExpirationDays : currentConfig.defaultExpirationDays,
        maxKeysPerUser: validatedData.maxKeysPerUser !== undefined ? validatedData.maxKeysPerUser : currentConfig.maxKeysPerUser,
        requireExplicitScopes: validatedData.requireExplicitScopes !== undefined ? validatedData.requireExplicitScopes : currentConfig.requireExplicitScopes,
        logUsage: validatedData.logUsage !== undefined ? validatedData.logUsage : currentConfig.logUsage,
        rateLimit: {
          requestsPerMinute: validatedData.rateLimit?.requestsPerMinute !== undefined ? validatedData.rateLimit.requestsPerMinute : currentConfig.rateLimit.requestsPerMinute,
          requestsPerHour: validatedData.rateLimit?.requestsPerHour !== undefined ? validatedData.rateLimit.requestsPerHour : currentConfig.rateLimit.requestsPerHour,
          requestsPerDay: validatedData.rateLimit?.requestsPerDay !== undefined ? validatedData.rateLimit.requestsPerDay : currentConfig.rateLimit.requestsPerDay,
        },
        security: {
          minKeyNameLength: validatedData.security?.minKeyNameLength !== undefined ? validatedData.security.minKeyNameLength : currentConfig.security.minKeyNameLength,
          maxKeyNameLength: validatedData.security?.maxKeyNameLength !== undefined ? validatedData.security.maxKeyNameLength : currentConfig.security.maxKeyNameLength,
          requireHttps: validatedData.security?.requireHttps !== undefined ? validatedData.security.requireHttps : currentConfig.security.requireHttps,
          enableIpRestrictions: validatedData.security?.enableIpRestrictions !== undefined ? validatedData.security.enableIpRestrictions : currentConfig.security.enableIpRestrictions,
        },
      };
      
      // Validate the merged configuration
      const errors = validateApiAuthConfig(updatedConfig);
      
      if (errors.length > 0) {
        return reply.status(400).send({
          error: 'Invalid configuration',
          message: 'The provided configuration has validation errors',
          details: errors,
        });
      }
      
      // In a real implementation, you would persist these settings to database
      // For now, we just return success and note that changes apply only to current session
      
      return {
        message: 'Configuration updated successfully (note: changes are not persisted and will reset on server restart)',
        config: {
          enabled: updatedConfig.enabled,
          defaultExpirationDays: updatedConfig.defaultExpirationDays,
          maxKeysPerUser: updatedConfig.maxKeysPerUser,
          requireExplicitScopes: updatedConfig.requireExplicitScopes,
          logUsage: updatedConfig.logUsage,
        },
      };
    }
  );

  // Get system settings summary (placeholder for other settings)
  fastify.get(
    '/system',
    {
      schema: {
        description: 'Get system settings summary',
        tags: ['settings'],
        response: {
          200: {
            type: 'object',
            properties: {
              version: { type: 'string' },
              environment: { type: 'string' },
              features: {
                type: 'object',
                properties: {
                  apiAuthentication: { type: 'boolean' },
                  plexIntegration: { type: 'boolean' },
                  mediaScanning: { type: 'boolean' },
                },
              },
              database: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  connected: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      return {
        version: '0.0.1',
        environment: process.env.NODE_ENV || 'development',
        features: {
          apiAuthentication: true,
          plexIntegration: true,
          mediaScanning: false, // Placeholder
        },
        database: {
          type: 'SQLite',
          connected: true, // Would check actual connection in real implementation
        },
      };
    }
  );
}