import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ApiKeyService } from '../services/api-key.service.js';
import { authenticate } from '../middleware/auth.js';

const apiKeyService = new ApiKeyService();

// Validation schemas
const ApiKeyScopeSchema = z.object({
  resource: z.string().min(1),
  actions: z.array(z.string().min(1)),
});

const CreateApiKeySchema = z.object({
  name: z.string().min(1).max(100),
  scopes: z.array(ApiKeyScopeSchema),
  expiresAt: z.string().datetime().optional().transform(val => val ? new Date(val) : undefined),
});

const UpdateApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  scopes: z.array(ApiKeyScopeSchema).optional(),
  expiresAt: z.string().datetime().nullable().optional().transform(val => {
    if (val === null) return null;
    if (val === undefined) return undefined;
    return new Date(val);
  }),
  isActive: z.boolean().optional(),
});

export async function apiKeyRoutes(fastify: FastifyInstance) {
  // All API key routes require authentication
  fastify.addHook('preHandler', authenticate);

  // Get available scopes
  fastify.get(
    '/scopes',
    {
      schema: {
        description: 'Get available API key scopes and permissions',
        tags: ['api-keys'],
        response: {
          200: {
            type: 'object',
            properties: {
              scopes: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    resource: { type: 'string' },
                    actions: { type: 'array', items: { type: 'string' } },
                    description: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      const scopes = apiKeyService.getAvailableScopes();
      return { scopes };
    }
  );

  // Get all API keys for the authenticated user
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all API keys for the authenticated user',
        tags: ['api-keys'],
        response: {
          200: {
            type: 'object',
            properties: {
              apiKeys: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    keyPrefix: { type: 'string' },
                    scopes: { type: 'string' },
                    lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
                    lastUsedIp: { type: 'string', nullable: true },
                    isActive: { type: 'boolean' },
                    expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, _reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const apiKeys = await apiKeyService.getUserApiKeys(request.user.userId);
      
      // Parse scopes for easier frontend consumption
      const apiKeysWithParsedScopes = apiKeys.map(key => ({
        ...key,
        scopes: JSON.parse(key.scopes),
      }));

      return { apiKeys: apiKeysWithParsedScopes };
    }
  );

  // Create a new API key
  fastify.post<{ Body: z.infer<typeof CreateApiKeySchema> }>(
    '/',
    {
      schema: {
        description: 'Create a new API key',
        tags: ['api-keys'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            scopes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  resource: { type: 'string', minLength: 1 },
                  actions: { type: 'array', items: { type: 'string', minLength: 1 } },
                },
                required: ['resource', 'actions'],
              },
            },
            expiresAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'scopes'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              apiKey: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  keyPrefix: { type: 'string' },
                  scopes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        resource: { type: 'string' },
                        actions: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                  expiresAt: { type: 'string', format: 'date-time', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
              key: { type: 'string' },
              warning: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const validatedData = CreateApiKeySchema.parse(request.body);

      const { apiKey, plainKey } = await apiKeyService.createApiKey({
        name: validatedData.name,
        scopes: validatedData.scopes,
        expiresAt: validatedData.expiresAt || null,
        userId: request.user.userId,
      });

      return reply.status(201).send({
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          keyPrefix: apiKey.keyPrefix,
          scopes: JSON.parse(apiKey.scopes),
          expiresAt: apiKey.expiresAt,
          createdAt: apiKey.createdAt,
        },
        key: plainKey,
        warning: 'This is the only time you will see the full API key. Please store it securely.',
      });
    }
  );

  // Get a specific API key
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        description: 'Get a specific API key by ID',
        tags: ['api-keys'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              apiKey: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  keyPrefix: { type: 'string' },
                  scopes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        resource: { type: 'string' },
                        actions: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                  lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
                  lastUsedIp: { type: 'string', nullable: true },
                  isActive: { type: 'boolean' },
                  expiresAt: { type: 'string', format: 'date-time', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const { id } = request.params;
      const apiKey = await apiKeyService.getApiKey(id, request.user.userId);

      if (!apiKey) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'API key not found',
        });
      }

      return {
        apiKey: {
          ...apiKey,
          scopes: JSON.parse(apiKey.scopes),
        },
      };
    }
  );

  // Update an API key
  fastify.patch<{ Params: { id: string }; Body: z.infer<typeof UpdateApiKeySchema> }>(
    '/:id',
    {
      schema: {
        description: 'Update an API key',
        tags: ['api-keys'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            scopes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  resource: { type: 'string', minLength: 1 },
                  actions: { type: 'array', items: { type: 'string', minLength: 1 } },
                },
                required: ['resource', 'actions'],
              },
            },
            expiresAt: { type: 'string', format: 'date-time', nullable: true },
            isActive: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              apiKey: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  name: { type: 'string' },
                  keyPrefix: { type: 'string' },
                  scopes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        resource: { type: 'string' },
                        actions: { type: 'array', items: { type: 'string' } },
                      },
                    },
                  },
                  lastUsedAt: { type: 'string', format: 'date-time', nullable: true },
                  lastUsedIp: { type: 'string', nullable: true },
                  isActive: { type: 'boolean' },
                  expiresAt: { type: 'string', format: 'date-time', nullable: true },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const { id } = request.params;
      const validatedData = UpdateApiKeySchema.parse(request.body);

      // Filter out undefined values for the API call
      const updateData: {
        name?: string;
        scopes?: { resource: string; actions: string[]; }[];
        expiresAt?: Date | null;
        isActive?: boolean;
      } = {};
      
      if (validatedData.name !== undefined) updateData.name = validatedData.name;
      if (validatedData.scopes !== undefined) updateData.scopes = validatedData.scopes;
      if (validatedData.expiresAt !== undefined) updateData.expiresAt = validatedData.expiresAt;
      if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;

      const apiKey = await apiKeyService.updateApiKey(id, request.user.userId, updateData);

      if (!apiKey) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'API key not found',
        });
      }

      return {
        apiKey: {
          ...apiKey,
          scopes: JSON.parse(apiKey.scopes),
        },
      };
    }
  );

  // Delete/revoke an API key
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        description: 'Delete/revoke an API key',
        tags: ['api-keys'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const { id } = request.params;
      const success = await apiKeyService.revokeApiKey(id, request.user.userId);

      if (!success) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'API key not found',
        });
      }

      return { message: 'API key revoked successfully' };
    }
  );

  // Get usage statistics for an API key
  fastify.get<{ Params: { id: string } }>(
    '/:id/usage',
    {
      schema: {
        description: 'Get usage statistics for an API key',
        tags: ['api-keys'],
        params: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              usage: {
                type: 'object',
                properties: {
                  totalRequests: { type: 'number' },
                  lastUsed: { type: 'string', format: 'date-time', nullable: true },
                  requestsToday: { type: 'number' },
                  requestsThisMonth: { type: 'number' },
                },
              },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      if (!request.user) {
        throw new Error('User not authenticated');
      }

      const { id } = request.params;
      const usage = await apiKeyService.getApiKeyUsageStats(id, request.user.userId);

      if (!usage) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'API key not found',
        });
      }

      return { usage };
    }
  );
}