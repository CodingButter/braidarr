/**
 * Plex Server Discovery Routes
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { plexService } from '../../integrations/plex/index.js';

// Request/Response schemas
const getServersSchema = {
  headers: z.object({
    'x-plex-token': z.string(),
  }),
  response: {
    200: z.array(
      z.object({
        name: z.string(),
        product: z.string(),
        productVersion: z.string(),
        platform: z.string(),
        platformVersion: z.string(),
        device: z.string(),
        clientIdentifier: z.string(),
        createdAt: z.string(),
        lastSeenAt: z.string(),
        provides: z.string(),
        ownerId: z.number(),
        sourceTitle: z.string(),
        publicAddress: z.string(),
        accessToken: z.string(),
        owned: z.boolean(),
        home: z.boolean(),
        synced: z.boolean(),
        relay: z.boolean(),
        presence: z.boolean(),
        httpsRequired: z.boolean(),
        publicAddressMatches: z.boolean(),
        dnsRebindingProtection: z.boolean(),
        natLoopbackSupported: z.boolean(),
        connections: z.array(
          z.object({
            protocol: z.string(),
            address: z.string(),
            port: z.number(),
            uri: z.string(),
            local: z.boolean(),
            relay: z.boolean(),
            IPv6: z.boolean(),
          })
        ),
      })
    ),
    401: z.object({
      error: z.string(),
      message: z.string(),
    }),
    500: z.object({
      error: z.string(),
      message: z.string(),
    }),
  },
};

const getLibrariesSchema = {
  headers: z.object({
    'x-plex-token': z.string().optional(),
  }),
  body: z.object({
    serverUrl: z.string().url(),
    serverToken: z.string(),
  }),
  response: {
    200: z.array(
      z.object({
        allowSync: z.boolean(),
        art: z.string(),
        composite: z.string(),
        filters: z.boolean(),
        refreshing: z.boolean(),
        thumb: z.string(),
        key: z.string(),
        type: z.enum(['movie', 'show', 'artist', 'photo', 'mixed']),
        title: z.string(),
        agent: z.string(),
        scanner: z.string(),
        language: z.string(),
        uuid: z.string(),
        updatedAt: z.number(),
        createdAt: z.number(),
        scannedAt: z.number(),
        content: z.boolean(),
        directory: z.boolean(),
        contentChangedAt: z.number(),
        hidden: z.number(),
        location: z.array(
          z.object({
            id: z.number(),
            path: z.string(),
          })
        ),
      })
    ),
    400: z.object({
      error: z.string(),
      message: z.string(),
    }),
    500: z.object({
      error: z.string(),
      message: z.string(),
    }),
  },
};

const testConnectionSchema = {
  body: z.object({
    serverUrl: z.string().url(),
    serverToken: z.string(),
  }),
  response: {
    200: z.object({
      connected: z.boolean(),
      serverUrl: z.string(),
      details: z.object({
        machineIdentifier: z.string().optional(),
        version: z.string().optional(),
        platform: z.string().optional(),
        platformVersion: z.string().optional(),
      }).optional(),
      error: z.string().optional(),
    }),
    400: z.object({
      error: z.string(),
      message: z.string(),
    }),
  },
};

export const plexServerRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * GET /plex/servers
   * Get available Plex servers for authenticated user
   */
  fastify.get<{
    Headers: { 'x-plex-token': string };
  }>(
    '/',
    {},
    async (request, reply) => {
      const authToken = request.headers['x-plex-token'];

      if (!authToken) {
        return reply.code(401).send({
          error: 'Unauthorized',
          message: 'Plex authentication token required',
        });
      }

      try {
        const servers = await plexService.getServers(authToken);
        return reply.code(200).send(servers);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve Plex servers',
        });
      }
    }
  );

  /**
   * POST /plex/servers/libraries
   * Get libraries from a specific Plex server
   */
  fastify.post<{
    Body: { serverUrl: string; serverToken: string };
  }>(
    '/libraries',
    {},
    async (request, reply) => {
      const { serverUrl, serverToken } = request.body;

      if (!serverUrl || !serverToken) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Server URL and token are required',
        });
      }

      try {
        const libraries = await plexService.getServerLibraries(
          serverUrl,
          serverToken
        );
        return reply.code(200).send(libraries);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve server libraries',
        });
      }
    }
  );

  /**
   * POST /plex/servers/test
   * Test connection to a Plex server
   */
  fastify.post<{
    Body: { serverUrl: string; serverToken: string };
  }>(
    '/test',
    {},
    async (request, reply) => {
      const { serverUrl, serverToken } = request.body;

      if (!serverUrl || !serverToken) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Server URL and token are required',
        });
      }

      try {
        const result = await plexService.testServerConnection(
          serverUrl,
          serverToken
        );
        
        return reply.code(200).send({
          ...result,
          serverUrl,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Failed to test server connection',
        });
      }
    }
  );
};