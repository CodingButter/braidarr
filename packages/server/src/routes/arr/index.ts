/**
 * Arr Routes Index
 * Exports all arr-related routes
 */

import { FastifyInstance } from 'fastify';
import { arrWebhookRoutes } from './webhooks.routes.js';
import { arrIntegrationsRoutes } from './integrations.routes.js';

export async function arrRoutes(fastify: FastifyInstance) {
  // Register webhook routes
  await fastify.register(arrWebhookRoutes, { prefix: '/webhooks' });
  
  // Register integration management routes
  await fastify.register(arrIntegrationsRoutes, { prefix: '/integrations' });
}