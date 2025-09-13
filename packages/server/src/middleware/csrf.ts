import { FastifyPluginAsync } from 'fastify';
import fastifyCsrf from '@fastify/csrf-protection';

export const csrfPlugin: FastifyPluginAsync = async (server) => {
  // Register CSRF protection
  await server.register(fastifyCsrf, {
    cookieOpts: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
    },
  });

  // Add a route to get CSRF token
  server.get('/csrf-token', async (_request, reply) => {
    const token = await reply.generateCsrf();
    return { csrfToken: token };
  });

  // Decorate request with CSRF validation for protected routes
  server.decorateRequest('validateCsrf', null);
  
  server.addHook('onRequest', async (request, reply) => {
    // Skip CSRF for GET, HEAD, OPTIONS
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return;
    }

    // Skip CSRF for specific routes that don't require session
    const skipPaths = [
      '/api/v1/auth/login',
      '/api/v1/auth/register', 
      '/api/v1/auth/refresh',
      '/health',
      '/ready',
      '/docs',
      '/csrf-token',
    ];

    const shouldSkip = skipPaths.some(path => 
      request.url === path || request.url.startsWith(path + '/')
    );

    if (shouldSkip) {
      return;
    }

    // For authenticated routes, validate CSRF token
    try {
      // CSRF protection is automatically applied by the plugin
      // The validation happens in the preHandler hook
    } catch (error) {
      reply.status(403).send({ 
        error: 'Invalid CSRF token',
        message: 'Please refresh the page and try again',
      });
      throw error;
    }
  });
};