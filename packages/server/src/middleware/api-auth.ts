import { FastifyRequest, FastifyReply } from 'fastify';
import { ApiKeyService } from '../services/api-key.service.js';

const apiKeyService = new ApiKeyService();

/**
 * Middleware to authenticate requests using API keys
 * This is the primary authentication method for arr ecosystem apps
 */
export async function authenticateApiKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Get API key from header or query parameter
    const apiKey = request.headers['x-api-key'] as string || 
                   request.headers['apikey'] as string ||
                   (request.query as any)?.apikey ||
                   (request.query as any)?.api_key;

    if (!apiKey) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'API key required. Provide it via X-API-Key header or apikey query parameter.'
      });
      return;
    }

    // Validate the API key
    const apiKeyData = await apiKeyService.validateApiKey(apiKey);

    if (!apiKeyData) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Invalid or expired API key'
      });
      return;
    }

    // Record API key usage
    await apiKeyService.recordUsage(
      apiKeyData.id,
      request.url,
      request.method,
      request.ip,
      request.headers['user-agent'] || 'Unknown',
      200 // We'll update this in the response if needed
    );

    // Add API key and user info to request context
    (request as any).apiKey = apiKeyData;
    (request as any).user = {
      userId: apiKeyData.user.id,
      email: apiKeyData.user.email,
      username: apiKeyData.user.username,
      isActive: apiKeyData.user.isActive
    };

  } catch (error) {
    console.error('API key authentication error:', error);
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
}

/**
 * Check if API key has permission for specific resource and action
 */
export function requirePermission(resource: string, action: string) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKey = (request as any).apiKey;
    
    if (!apiKey) {
      reply.status(401).send({
        error: 'Unauthorized',
        message: 'Authentication required'
      });
      return;
    }

    const hasPermission = apiKeyService.hasPermission(apiKey, resource, action);
    
    if (!hasPermission) {
      reply.status(403).send({
        error: 'Forbidden',
        message: `Insufficient permissions. Required: ${resource}:${action}`
      });
      return;
    }
  };
}

/**
 * Optional API key authentication - allows requests without API key
 * but adds context if present
 */
export async function optionalApiKeyAuth(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  try {
    const apiKey = request.headers['x-api-key'] as string || 
                   request.headers['apikey'] as string ||
                   (request.query as any)?.apikey ||
                   (request.query as any)?.api_key;

    if (!apiKey) {
      // No API key provided - continue without authentication
      return;
    }

    // Validate the API key if provided
    const apiKeyData = await apiKeyService.validateApiKey(apiKey);

    if (apiKeyData) {
      // Record usage for valid keys
      await apiKeyService.recordUsage(
        apiKeyData.id,
        request.url,
        request.method,
        request.ip,
        request.headers['user-agent'] || 'Unknown',
        200
      );

      // Add context
      (request as any).apiKey = apiKeyData;
      (request as any).user = {
        userId: apiKeyData.user.id,
        email: apiKeyData.user.email,
        username: apiKeyData.user.username,
        isActive: apiKeyData.user.isActive
      };
    }
    // If invalid API key, just continue without auth context
    // (don't fail the request)

  } catch (error) {
    console.error('Optional API key authentication error:', error);
    // Don't fail the request for optional auth errors
  }
}