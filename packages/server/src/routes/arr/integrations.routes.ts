/**
 * Arr Integration Management Routes
 * Handles CRUD operations for Arr application integrations
 */

import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { SonarrClient } from '../../integrations/arr/sonarr/client.js';
import { RadarrClient } from '../../integrations/arr/radarr/client.js';
import { ProwlarrClient } from '../../integrations/arr/prowlarr/client.js';
import { QBittorrentClient } from '../../integrations/download-clients/qbittorrent/client.js';

// Validation schemas
const ArrInstanceSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['SONARR', 'RADARR', 'PROWLARR', 'LIDARR', 'READARR', 'WHISPARR']),
  baseUrl: z.string().url(),
  apiKey: z.string().min(10),
  isEnabled: z.boolean().optional().default(true),
  settings: z.record(z.any()).optional(),
});

const DownloadClientSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['QBITTORRENT', 'TRANSMISSION', 'DELUGE', 'RTORRENT', 'UTORRENT', 'SABNZBD', 'NZBGET']),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535),
  username: z.string().optional(),
  password: z.string().optional(),
  category: z.string().optional(),
  priority: z.number().int().min(0).max(10).optional().default(0),
  isEnabled: z.boolean().optional().default(true),
  settings: z.record(z.any()).optional(),
});

export async function arrIntegrationsRoutes(fastify: FastifyInstance) {
  // Get all arr instances
  fastify.get('/instances', {
    schema: {
      description: 'Get all Arr application instances',
      tags: ['arr', 'integrations'],
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
              isEnabled: { type: 'boolean' },
              isConnected: { type: 'boolean' },
              lastConnectedAt: { type: 'string', format: 'date-time' },
              version: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // TODO: Implement database query to get all arr instances
      // const instances = await prisma.arrInstance.findMany({
      //   select: {
      //     id: true,
      //     name: true,
      //     type: true,
      //     baseUrl: true,
      //     isEnabled: true,
      //     isConnected: true,
      //     lastConnectedAt: true,
      //     version: true,
      //     createdAt: true,
      //     updatedAt: true,
      //   },
      // });

      const instances = []; // Placeholder
      return reply.send(instances);
    } catch (error) {
      fastify.log.error('Error fetching arr instances:', error);
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to fetch arr instances',
      });
    }
  });

  // Get arr instance by ID
  fastify.get('/instances/:id', {
    schema: {
      description: 'Get Arr application instance by ID',
      tags: ['arr', 'integrations'],
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
            isEnabled: { type: 'boolean' },
            isConnected: { type: 'boolean' },
            lastConnectedAt: { type: 'string', format: 'date-time' },
            version: { type: 'string' },
            settings: { type: 'object' },
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
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // TODO: Implement database query to get arr instance by ID
      // const instance = await prisma.arrInstance.findUnique({
      //   where: { id },
      //   select: {
      //     id: true,
      //     name: true,
      //     type: true,
      //     baseUrl: true,
      //     isEnabled: true,
      //     isConnected: true,
      //     lastConnectedAt: true,
      //     version: true,
      //     settings: true,
      //     createdAt: true,
      //     updatedAt: true,
      //   },
      // });

      const instance = null; // Placeholder

      if (!instance) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Arr instance not found',
        });
      }

      return reply.send(instance);
    } catch (error) {
      fastify.log.error('Error fetching arr instance:', error);
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to fetch arr instance',
      });
    }
  });

  // Create new arr instance
  fastify.post('/instances', {
    schema: {
      description: 'Create new Arr application instance',
      tags: ['arr', 'integrations'],
      body: ArrInstanceSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            baseUrl: { type: 'string' },
            isEnabled: { type: 'boolean' },
            isConnected: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        400: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const data = request.body as z.infer<typeof ArrInstanceSchema>;

      // Test connection before creating
      let client;
      switch (data.type) {
        case 'SONARR':
          client = new SonarrClient({ baseUrl: data.baseUrl, apiKey: data.apiKey });
          break;
        case 'RADARR':
          client = new RadarrClient({ baseUrl: data.baseUrl, apiKey: data.apiKey });
          break;
        case 'PROWLARR':
          client = new ProwlarrClient({ baseUrl: data.baseUrl, apiKey: data.apiKey });
          break;
        default:
          throw new Error(`Unsupported arr type: ${data.type}`);
      }

      const connectionTest = await client.testConnection();
      if (!connectionTest.connected) {
        return reply.status(400).send({
          error: 'Connection Test Failed',
          message: connectionTest.error || 'Unable to connect to the arr application',
        });
      }

      // TODO: Implement database insert
      // const instance = await prisma.arrInstance.create({
      //   data: {
      //     ...data,
      //     apiKey: encrypt(data.apiKey), // Encrypt API key
      //     isConnected: true,
      //     lastConnectedAt: new Date(),
      //     version: connectionTest.version,
      //   },
      // });

      const instance = {
        id: 'test-id',
        ...data,
        isConnected: true,
        createdAt: new Date().toISOString(),
      }; // Placeholder

      return reply.status(201).send(instance);
    } catch (error) {
      fastify.log.error('Error creating arr instance:', error);
      return reply.status(500).send({
        error: 'Creation Error',
        message: 'Failed to create arr instance',
      });
    }
  });

  // Update arr instance
  fastify.put('/instances/:id', {
    schema: {
      description: 'Update Arr application instance',
      tags: ['arr', 'integrations'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      body: ArrInstanceSchema.partial(),
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            baseUrl: { type: 'string' },
            isEnabled: { type: 'boolean' },
            isConnected: { type: 'boolean' },
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
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = request.body as Partial<z.infer<typeof ArrInstanceSchema>>;

      // TODO: Check if instance exists and update
      // const instance = await prisma.arrInstance.update({
      //   where: { id },
      //   data: {
      //     ...data,
      //     ...(data.apiKey && { apiKey: encrypt(data.apiKey) }),
      //   },
      // });

      const instance = {
        id,
        ...data,
        updatedAt: new Date().toISOString(),
      }; // Placeholder

      return reply.send(instance);
    } catch (error) {
      fastify.log.error('Error updating arr instance:', error);
      return reply.status(500).send({
        error: 'Update Error',
        message: 'Failed to update arr instance',
      });
    }
  });

  // Delete arr instance
  fastify.delete('/instances/:id', {
    schema: {
      description: 'Delete Arr application instance',
      tags: ['arr', 'integrations'],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
      response: {
        204: {},
        404: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // TODO: Delete from database
      // await prisma.arrInstance.delete({
      //   where: { id },
      // });

      return reply.status(204).send();
    } catch (error) {
      fastify.log.error('Error deleting arr instance:', error);
      return reply.status(500).send({
        error: 'Deletion Error',
        message: 'Failed to delete arr instance',
      });
    }
  });

  // Test arr instance connection
  fastify.post('/instances/:id/test', {
    schema: {
      description: 'Test Arr application instance connection',
      tags: ['arr', 'integrations'],
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
            connected: { type: 'boolean' },
            version: { type: 'string' },
            error: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // TODO: Get instance from database and test connection
      // const instance = await prisma.arrInstance.findUnique({
      //   where: { id },
      // });

      const instance = null; // Placeholder

      if (!instance) {
        return reply.status(404).send({
          error: 'Not Found',
          message: 'Arr instance not found',
        });
      }

      // Test connection logic would go here
      const connectionTest = {
        connected: true,
        version: '4.0.0',
        details: {},
      };

      return reply.send(connectionTest);
    } catch (error) {
      fastify.log.error('Error testing arr instance connection:', error);
      return reply.status(500).send({
        error: 'Test Error',
        message: 'Failed to test arr instance connection',
      });
    }
  });

  // Get download clients
  fastify.get('/download-clients', {
    schema: {
      description: 'Get all download clients',
      tags: ['arr', 'download-clients'],
      response: {
        200: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
              host: { type: 'string' },
              port: { type: 'number' },
              category: { type: 'string' },
              priority: { type: 'number' },
              isEnabled: { type: 'boolean' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // TODO: Implement database query for download clients
      const clients = []; // Placeholder
      return reply.send(clients);
    } catch (error) {
      fastify.log.error('Error fetching download clients:', error);
      return reply.status(500).send({
        error: 'Database Error',
        message: 'Failed to fetch download clients',
      });
    }
  });

  // Create download client
  fastify.post('/download-clients', {
    schema: {
      description: 'Create new download client',
      tags: ['arr', 'download-clients'],
      body: DownloadClientSchema,
      response: {
        201: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: { type: 'string' },
            host: { type: 'string' },
            port: { type: 'number' },
            isEnabled: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const data = request.body as z.infer<typeof DownloadClientSchema>;

      // Test connection before creating
      if (data.type === 'QBITTORRENT') {
        const client = new QBittorrentClient({
          host: data.host,
          port: data.port,
          username: data.username,
          password: data.password,
        });

        const connectionTest = await client.testConnection();
        if (!connectionTest.connected) {
          return reply.status(400).send({
            error: 'Connection Test Failed',
            message: connectionTest.error || 'Unable to connect to the download client',
          });
        }
      }

      // TODO: Implement database insert
      const client = {
        id: 'test-id',
        ...data,
        createdAt: new Date().toISOString(),
      }; // Placeholder

      return reply.status(201).send(client);
    } catch (error) {
      fastify.log.error('Error creating download client:', error);
      return reply.status(500).send({
        error: 'Creation Error',
        message: 'Failed to create download client',
      });
    }
  });

  // Test download client connection
  fastify.post('/download-clients/:id/test', {
    schema: {
      description: 'Test download client connection',
      tags: ['arr', 'download-clients'],
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
            connected: { type: 'boolean' },
            version: { type: 'string' },
            error: { type: 'string' },
            details: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      // TODO: Get client from database and test connection
      const connectionTest = {
        connected: true,
        version: '4.6.0',
        details: {},
      };

      return reply.send(connectionTest);
    } catch (error) {
      fastify.log.error('Error testing download client connection:', error);
      return reply.status(500).send({
        error: 'Test Error',
        message: 'Failed to test download client connection',
      });
    }
  });
}