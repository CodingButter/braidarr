import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { IndexerService } from '../services/indexer.service.js';
import { authenticateApiKey } from '../middleware/api-auth.js';

const indexerService = new IndexerService();

// Validation schemas
const CreateIndexerSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['usenet', 'torrent']),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  categories: z.array(z.number()).default([]),
  priority: z.number().min(1).max(100).default(25),
  isEnabled: z.boolean().default(true),
});

const UpdateIndexerSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['usenet', 'torrent']).optional(),
  baseUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  categories: z.array(z.number()).optional(),
  priority: z.number().min(1).max(100).optional(),
  isEnabled: z.boolean().optional(),
});

export async function indexerRoutes(fastify: FastifyInstance) {
  // All indexer routes require API key authentication
  fastify.addHook('preHandler', authenticateApiKey);

  // Get all indexers
  fastify.get(
    '/',
    {
      schema: {
        description: 'Get all indexers',
        tags: ['indexers'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                baseUrl: { type: 'string' },
                categories: { type: 'string' },
                priority: { type: 'number' },
                isEnabled: { type: 'boolean' },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      const indexers = await indexerService.getAllIndexers();
      
      // Parse categories for response
      return indexers.map(indexer => ({
        ...indexer,
        categories: JSON.parse(indexer.categories),
        // Don't expose API key in list response
        apiKey: indexer.apiKey ? '***REDACTED***' : null
      }));
    }
  );

  // Get enabled indexers only
  fastify.get(
    '/enabled',
    {
      schema: {
        description: 'Get enabled indexers only',
        tags: ['indexers'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                type: { type: 'string' },
                baseUrl: { type: 'string' },
                categories: { type: 'array', items: { type: 'number' } },
                priority: { type: 'number' },
                isEnabled: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      const indexers = await indexerService.getEnabledIndexers();
      
      return indexers.map(indexer => ({
        ...indexer,
        categories: JSON.parse(indexer.categories),
        // Don't expose API key
        apiKey: undefined
      }));
    }
  );

  // Create a new indexer
  fastify.post<{ Body: z.infer<typeof CreateIndexerSchema> }>(
    '/',
    {
      schema: {
        description: 'Create a new indexer',
        tags: ['indexers'],
        body: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 100 },
            type: { type: 'string', enum: ['usenet', 'torrent'] },
            baseUrl: { type: 'string', format: 'uri' },
            apiKey: { type: 'string' },
            categories: { type: 'array', items: { type: 'number' } },
            priority: { type: 'number', minimum: 1, maximum: 100 },
            isEnabled: { type: 'boolean' },
          },
          required: ['name', 'type', 'baseUrl'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              baseUrl: { type: 'string' },
              categories: { type: 'array', items: { type: 'number' } },
              priority: { type: 'number' },
              isEnabled: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const validatedData = CreateIndexerSchema.parse(request.body);

      const indexer = await indexerService.createIndexer(validatedData);

      return reply.status(201).send({
        ...indexer,
        categories: JSON.parse(indexer.categories),
        // Don't expose API key in response
        apiKey: indexer.apiKey ? '***REDACTED***' : null
      });
    }
  );

  // Get a specific indexer
  fastify.get<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        description: 'Get a specific indexer by ID',
        tags: ['indexers'],
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
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              baseUrl: { type: 'string' },
              categories: { type: 'array', items: { type: 'number' } },
              priority: { type: 'number' },
              isEnabled: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
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
      const { id } = request.params;
      const indexer = await indexerService.getIndexerById(id);

      if (!indexer) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Indexer not found',
        });
      }

      return {
        ...indexer,
        categories: JSON.parse(indexer.categories),
        // Don't expose full API key, just show if it exists
        apiKey: indexer.apiKey ? '***REDACTED***' : null
      };
    }
  );

  // Update an indexer
  fastify.put<{ Params: { id: string }; Body: z.infer<typeof UpdateIndexerSchema> }>(
    '/:id',
    {
      schema: {
        description: 'Update an indexer',
        tags: ['indexers'],
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
            type: { type: 'string', enum: ['usenet', 'torrent'] },
            baseUrl: { type: 'string', format: 'uri' },
            apiKey: { type: 'string' },
            categories: { type: 'array', items: { type: 'number' } },
            priority: { type: 'number', minimum: 1, maximum: 100 },
            isEnabled: { type: 'boolean' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              baseUrl: { type: 'string' },
              categories: { type: 'array', items: { type: 'number' } },
              priority: { type: 'number' },
              isEnabled: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
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
      const { id } = request.params;
      const validatedData = UpdateIndexerSchema.parse(request.body);

      const indexer = await indexerService.updateIndexer(id, validatedData);

      if (!indexer) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Indexer not found',
        });
      }

      return {
        ...indexer,
        categories: JSON.parse(indexer.categories),
        // Don't expose API key in response
        apiKey: indexer.apiKey ? '***REDACTED***' : null
      };
    }
  );

  // Delete an indexer
  fastify.delete<{ Params: { id: string } }>(
    '/:id',
    {
      schema: {
        description: 'Delete an indexer',
        tags: ['indexers'],
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
      const { id } = request.params;
      const success = await indexerService.deleteIndexer(id);

      if (!success) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Indexer not found',
        });
      }

      return { message: 'Indexer deleted successfully' };
    }
  );

  // Test an indexer
  fastify.post<{ Params: { id: string } }>(
    '/:id/test',
    {
      schema: {
        description: 'Test an indexer connection',
        tags: ['indexers'],
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
              success: { type: 'boolean' },
              message: { type: 'string' },
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                  },
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
      const { id } = request.params;
      const result = await indexerService.testIndexer(id);

      if (!result.success && result.message === 'Indexer not found') {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Indexer not found',
        });
      }

      return result;
    }
  );

  // Search across indexers
  fastify.get<{ 
    Querystring: { 
      q: string; 
      cat?: number; 
      indexers?: string; 
    } 
  }>(
    '/search',
    {
      schema: {
        description: 'Search across indexers',
        tags: ['indexers'],
        querystring: {
          type: 'object',
          properties: {
            q: { type: 'string', minLength: 1 },
            cat: { type: 'number' },
            indexers: { type: 'string' }, // comma-separated indexer IDs
          },
          required: ['q'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              results: { type: 'array', items: { type: 'object' } },
              query: { type: 'string' },
              category: { type: 'number' },
              indexers: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    async (request, _reply) => {
      const { q: query, cat: category, indexers: indexerParam } = request.query;
      
      const indexerIds = indexerParam ? indexerParam.split(',') : undefined;
      
      const results = await indexerService.search(query, category, indexerIds);

      return {
        results,
        query,
        category: category || null,
        indexers: indexerIds || []
      };
    }
  );

  // Get supported indexer types
  fastify.get(
    '/types',
    {
      schema: {
        description: 'Get supported indexer types',
        tags: ['indexers'],
        response: {
          200: {
            type: 'object',
            properties: {
              types: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    value: { type: 'string' },
                    label: { type: 'string' },
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
      const types = indexerService.getSupportedTypes();
      return { types };
    }
  );

  // Get default categories for a type
  fastify.get<{ Params: { type: string } }>(
    '/types/:type/categories',
    {
      schema: {
        description: 'Get default categories for an indexer type',
        tags: ['indexers'],
        params: {
          type: 'object',
          properties: {
            type: { type: 'string' },
          },
          required: ['type'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              categories: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
    async (request, _reply) => {
      const { type } = request.params;
      const categories = indexerService.getDefaultCategories(type);
      return { categories };
    }
  );
}