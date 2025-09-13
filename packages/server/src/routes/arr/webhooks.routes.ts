/**
 * Arr Application Webhook Routes
 * Handles incoming webhooks from Sonarr, Radarr, Prowlarr, etc.
 */

import { FastifyInstance } from 'fastify';
import { parseWebhookPayload } from '../../integrations/arr/shared/utils.js';

export async function arrWebhookRoutes(fastify: FastifyInstance) {
  // Sonarr webhook endpoint
  fastify.post('/sonarr', {
    schema: {
      description: 'Receive Sonarr webhook notifications',
      tags: ['webhooks', 'arr', 'sonarr'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
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
      const webhookData = parseWebhookPayload(request.body);
      
      if (!webhookData) {
        return reply.status(400).send({
          error: 'Invalid Webhook Payload',
          message: 'Could not parse Sonarr webhook payload',
        });
      }

      fastify.log.info('Received Sonarr webhook:', {
        eventType: webhookData.eventType,
        seriesTitle: webhookData.data.series?.title,
        episodeTitle: webhookData.data.episodes?.[0]?.title,
      });

      // TODO: Process webhook data based on event type
      await processWebhookEvent('SONARR', webhookData);

      return reply.send({
        success: true,
        message: 'Sonarr webhook processed successfully',
      });
    } catch (error) {
      fastify.log.error('Error processing Sonarr webhook:', error);
      
      return reply.status(500).send({
        error: 'Webhook Processing Error',
        message: 'Failed to process Sonarr webhook',
      });
    }
  });

  // Radarr webhook endpoint
  fastify.post('/radarr', {
    schema: {
      description: 'Receive Radarr webhook notifications',
      tags: ['webhooks', 'arr', 'radarr'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
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
      const webhookData = parseWebhookPayload(request.body);
      
      if (!webhookData) {
        return reply.status(400).send({
          error: 'Invalid Webhook Payload',
          message: 'Could not parse Radarr webhook payload',
        });
      }

      fastify.log.info('Received Radarr webhook:', {
        eventType: webhookData.eventType,
        movieTitle: webhookData.data.movie?.title,
        movieYear: webhookData.data.movie?.year,
      });

      // TODO: Process webhook data based on event type
      await processWebhookEvent('RADARR', webhookData);

      return reply.send({
        success: true,
        message: 'Radarr webhook processed successfully',
      });
    } catch (error) {
      fastify.log.error('Error processing Radarr webhook:', error);
      
      return reply.status(500).send({
        error: 'Webhook Processing Error',
        message: 'Failed to process Radarr webhook',
      });
    }
  });

  // Prowlarr webhook endpoint
  fastify.post('/prowlarr', {
    schema: {
      description: 'Receive Prowlarr webhook notifications',
      tags: ['webhooks', 'arr', 'prowlarr'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
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
      const webhookData = parseWebhookPayload(request.body);
      
      if (!webhookData) {
        return reply.status(400).send({
          error: 'Invalid Webhook Payload',
          message: 'Could not parse Prowlarr webhook payload',
        });
      }

      fastify.log.info('Received Prowlarr webhook:', {
        eventType: webhookData.eventType,
      });

      // TODO: Process webhook data based on event type
      await processWebhookEvent('PROWLARR', webhookData);

      return reply.send({
        success: true,
        message: 'Prowlarr webhook processed successfully',
      });
    } catch (error) {
      fastify.log.error('Error processing Prowlarr webhook:', error);
      
      return reply.status(500).send({
        error: 'Webhook Processing Error',
        message: 'Failed to process Prowlarr webhook',
      });
    }
  });

  // Generic arr webhook endpoint (for other arr applications)
  fastify.post('/generic', {
    schema: {
      description: 'Receive generic Arr application webhook notifications',
      tags: ['webhooks', 'arr', 'generic'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      querystring: {
        type: 'object',
        properties: {
          source: { type: 'string', enum: ['SONARR', 'RADARR', 'PROWLARR', 'LIDARR', 'READARR', 'WHISPARR'] },
        },
        required: ['source'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
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
      const { source } = request.query as { source: string };
      const webhookData = parseWebhookPayload(request.body);
      
      if (!webhookData) {
        return reply.status(400).send({
          error: 'Invalid Webhook Payload',
          message: `Could not parse ${source} webhook payload`,
        });
      }

      fastify.log.info(`Received ${source} webhook:`, {
        eventType: webhookData.eventType,
      });

      // TODO: Process webhook data based on event type
      await processWebhookEvent(source as any, webhookData);

      return reply.send({
        success: true,
        message: `${source} webhook processed successfully`,
      });
    } catch (error) {
      fastify.log.error('Error processing generic webhook:', error);
      
      return reply.status(500).send({
        error: 'Webhook Processing Error',
        message: 'Failed to process webhook',
      });
    }
  });

  // Test webhook endpoint
  fastify.post('/test', {
    schema: {
      description: 'Test webhook endpoint',
      tags: ['webhooks', 'arr', 'test'],
      body: {
        type: 'object',
        additionalProperties: true,
      },
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            received: { type: 'object' },
          },
        },
      },
    },
  }, async (request, reply) => {
    fastify.log.info('Received test webhook:', request.body);

    return reply.send({
      success: true,
      message: 'Test webhook received successfully',
      received: request.body,
    });
  });
}

/**
 * Process webhook events based on type and source
 */
async function processWebhookEvent(
  source: 'SONARR' | 'RADARR' | 'PROWLARR' | 'LIDARR' | 'READARR' | 'WHISPARR',
  webhookData: { eventType: string; data: any }
): Promise<void> {
  // TODO: Implement webhook processing logic
  // This could include:
  // 1. Storing webhook events in the database
  // 2. Triggering notifications
  // 3. Updating media requests status
  // 4. Triggering AI analysis
  // 5. Sending notifications to users

  console.log(`Processing ${source} webhook:`, {
    eventType: webhookData.eventType,
    dataKeys: Object.keys(webhookData.data),
  });

  // Example processing based on event type
  switch (webhookData.eventType) {
    case 'Download':
      console.log('Processing download event...');
      // Handle successful download
      break;

    case 'Upgrade':
      console.log('Processing upgrade event...');
      // Handle quality upgrade
      break;

    case 'Rename':
      console.log('Processing rename event...');
      // Handle file rename
      break;

    case 'SeriesDelete':
    case 'MovieDelete':
      console.log('Processing delete event...');
      // Handle deletion
      break;

    case 'HealthIssue':
      console.log('Processing health issue event...');
      // Handle health issues
      break;

    case 'ApplicationUpdate':
      console.log('Processing application update event...');
      // Handle application updates
      break;

    case 'Test':
      console.log('Processing test event...');
      // Handle test webhooks
      break;

    default:
      console.log(`Unknown event type: ${webhookData.eventType}`);
  }
}