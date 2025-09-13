/**
 * Plex Routes Module
 */

import { FastifyPluginAsync } from 'fastify';
import { plexAuthRoutes } from './auth.routes.js';
import { plexServerRoutes } from './server.routes.js';

export const plexRoutes: FastifyPluginAsync = async (fastify) => {
  // Register authentication routes
  await fastify.register(plexAuthRoutes, { prefix: '/auth' });
  
  // Register server discovery routes
  await fastify.register(plexServerRoutes, { prefix: '/servers' });
};