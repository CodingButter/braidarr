import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken } from '../lib/jwt.js';
import { AuthService } from '../services/auth.service.js';

const authService = new AuthService();

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      email: string;
      username: string;
    };
  }
}

/**
 * Authentication middleware - verifies JWT token and adds user to request
 */
export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply.status(401).send({ 
        error: 'Authentication required',
        message: 'Please provide a valid access token',
      });
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const payload = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await authService.getUserById(payload.userId);
    
    if (!user.isActive) {
      reply.status(401).send({ 
        error: 'Account disabled',
        message: 'Your account has been disabled',
      });
      return;
    }
    
    // Add user to request
    request.user = {
      userId: payload.userId,
      email: payload.email,
      username: payload.username,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        reply.status(401).send({ 
          error: 'Token expired',
          message: 'Your access token has expired. Please refresh your token.',
        });
        return;
      }
      if (error.message.includes('Invalid')) {
        reply.status(401).send({ 
          error: 'Invalid token',
          message: 'The provided token is invalid.',
        });
        return;
      }
    }
    
    reply.status(401).send({ 
      error: 'Authentication failed',
      message: 'Failed to authenticate. Please login again.',
    });
  }
}

/**
 * Optional authentication - adds user to request if token is valid but doesn't require it
 */
export async function optionalAuthenticate(
  request: FastifyRequest,
  _reply: FastifyReply
) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token provided, continue without user
      return;
    }

    const token = authHeader.substring(7);
    
    // Verify the token
    const payload = verifyAccessToken(token);
    
    // Check if user still exists and is active
    const user = await authService.getUserById(payload.userId);
    
    if (user.isActive) {
      // Add user to request
      request.user = {
        userId: payload.userId,
        email: payload.email,
        username: payload.username,
      };
    }
  } catch (error) {
    // Token is invalid or expired, continue without user
    // Log the error for monitoring
    if (request.log && typeof request.log.debug === 'function') {
      request.log.debug('Optional authentication failed');
    }
  }
}