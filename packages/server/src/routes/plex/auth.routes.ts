/**
 * Plex Authentication Routes
 */

import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { plexService } from '../../integrations/plex/index.js';

// Request/Response schemas
const initiatePinAuthSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        pinId: { type: 'number' },
        pinCode: { type: 'string' },
        clientIdentifier: { type: 'string' },
        expiresAt: { type: 'string' },
        qrUrl: { type: 'string' },
        linkUrl: { type: 'string' },
      },
      required: ['pinId', 'pinCode', 'clientIdentifier', 'expiresAt', 'qrUrl', 'linkUrl'],
    },
    500: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['error', 'message'],
    },
  },
};

const checkPinStatusSchema = {
  params: {
    type: 'object',
    properties: {
      pinId: { type: 'string' },
    },
    required: ['pinId'],
  },
  querystring: {
    type: 'object',
    properties: {
      clientIdentifier: { type: 'string' },
    },
    required: ['clientIdentifier'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        authenticated: { type: 'boolean' },
        authToken: { type: 'string' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            uuid: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            thumb: { type: 'string' },
          },
        },
      },
      required: ['authenticated'],
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['error', 'message'],
    },
    404: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['error', 'message'],
    },
  },
};

const cancelPinAuthSchema = {
  params: {
    type: 'object',
    properties: {
      clientIdentifier: { type: 'string' },
    },
    required: ['clientIdentifier'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
      required: ['success', 'message'],
    },
  },
};

const validateTokenSchema = {
  body: {
    type: 'object',
    properties: {
      authToken: { type: 'string' },
    },
    required: ['authToken'],
  },
  response: {
    200: {
      type: 'object',
      properties: {
        valid: { type: 'boolean' },
        user: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            uuid: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            thumb: { type: 'string' },
          },
        },
      },
      required: ['valid'],
    },
    400: {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
      },
      required: ['error', 'message'],
    },
  },
};

export const plexAuthRoutes: FastifyPluginAsync = async (fastify) => {
  /**
   * POST /plex/auth/pin
   * Initiate PIN authentication flow
   */
  fastify.post(
    '/pin',
    {
      schema: {
        description: 'Initiate Plex PIN authentication flow',
        tags: ['Plex', 'Authentication'],
      },
    },
    async (_request, reply) => {
      try {
        const authState = await plexService.initiatePinAuth();
        
        return reply.code(200).send({
          ...authState,
          linkUrl: `https://plex.tv/link`,
        });
      } catch (error) {
        fastify.log.error(error);
        return reply.code(500).send({
          error: 'Internal Server Error',
          message: 'Failed to initiate PIN authentication',
        });
      }
    }
  );

  /**
   * GET /plex/auth/pin/:pinId/status
   * Check PIN authentication status
   */
  fastify.get<{
    Params: { pinId: string };
    Querystring: { clientIdentifier: string };
  }>(
    '/pin/:pinId/status',
    {
      schema: {
        description: 'Check Plex PIN authentication status',
        tags: ['Plex', 'Authentication'],
      },
    },
    async (request, reply) => {
      const { pinId } = request.params;
      const { clientIdentifier } = request.query;

      try {
        const result = await plexService.checkPinStatus(
          clientIdentifier,
          parseInt(pinId)
        );

        return reply.code(200).send(result);
      } catch (error: any) {
        fastify.log.error(error);

        if (error.message.includes('Invalid or expired')) {
          return reply.code(404).send({
            error: 'Not Found',
            message: error.message,
          });
        }

        return reply.code(400).send({
          error: 'Bad Request',
          message: error.message || 'Failed to check PIN status',
        });
      }
    }
  );

  /**
   * DELETE /plex/auth/pin/:clientIdentifier
   * Cancel PIN authentication
   */
  fastify.delete<{
    Params: { clientIdentifier: string };
  }>(
    '/pin/:clientIdentifier',
    {
      schema: {
        description: 'Cancel Plex PIN authentication',
        tags: ['Plex', 'Authentication'],
      },
    },
    async (request, reply) => {
      const { clientIdentifier } = request.params;

      const cancelled = plexService.cancelPinAuth(clientIdentifier);

      return reply.code(200).send({
        success: cancelled,
        message: cancelled
          ? 'Authentication cancelled successfully'
          : 'No active authentication session found',
      });
    }
  );

  /**
   * POST /plex/auth/validate
   * Validate an authentication token
   */
  fastify.post<{
    Body: { authToken: string };
  }>(
    '/validate',
    {
      schema: {
        description: 'Validate a Plex authentication token',
        tags: ['Plex', 'Authentication'],
      },
    },
    async (request, reply) => {
      const { authToken } = request.body;

      if (!authToken) {
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Authentication token is required',
        });
      }

      try {
        const result = await plexService.validateToken(authToken);
        return reply.code(200).send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.code(400).send({
          error: 'Bad Request',
          message: 'Failed to validate authentication token',
        });
      }
    }
  );
};