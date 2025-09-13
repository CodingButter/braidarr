import { FastifyPluginAsync } from 'fastify';
import { 
  AuthService, 
  RegisterSchema, 
  LoginSchema
} from '../services/auth.service.js';
import { verifyAccessToken } from '../lib/jwt.js';

const authService = new AuthService();

export const authRoutes: FastifyPluginAsync = async (server) => {
  // Register endpoint
  server.post('/register', {
    schema: {
      body: RegisterSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                firstName: { type: ['string', 'null'] },
                lastName: { type: ['string', 'null'] },
                isEmailVerified: { type: 'boolean' },
              },
            },
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const validatedData = RegisterSchema.parse(request.body);
      const result = await authService.register(validatedData);
      
      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: result.user,
        accessToken: result.accessToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('already')) {
          reply.status(409).send({ error: error.message });
          return;
        }
      }
      throw error;
    }
  });

  // Login endpoint
  server.post('/login', {
    schema: {
      body: LoginSchema,
      response: {
        200: {
          type: 'object',
          properties: {
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                firstName: { type: ['string', 'null'] },
                lastName: { type: ['string', 'null'] },
                isEmailVerified: { type: 'boolean' },
              },
            },
            accessToken: { type: 'string' },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const validatedData = LoginSchema.parse(request.body);
      const ipAddress = request.ip;
      const userAgent = request.headers['user-agent'];
      
      const result = await authService.login(
        validatedData, 
        ipAddress, 
        userAgent
      );
      
      // Set refresh token as httpOnly cookie
      reply.setCookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return {
        user: result.user,
        accessToken: result.accessToken,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('Invalid') || error.message.includes('disabled')) {
          reply.status(401).send({ error: error.message });
          return;
        }
      }
      throw error;
    }
  });

  // Refresh token endpoint
  server.post('/refresh', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                email: { type: 'string' },
                username: { type: 'string' },
                firstName: { type: ['string', 'null'] },
                lastName: { type: ['string', 'null'] },
                isEmailVerified: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  }, async (request, reply) => {
    try {
      // Get refresh token from cookie or body
      const refreshToken = request.cookies.refreshToken || 
        (request.body as any)?.refreshToken;
      
      if (!refreshToken) {
        reply.status(401).send({ error: 'Refresh token required' });
        return;
      }

      const result = await authService.refreshAccessToken(refreshToken);
      
      return result;
    } catch (error) {
      if (error instanceof Error) {
        reply.status(401).send({ error: error.message });
        return;
      }
      throw error;
    }
  });

  // Logout endpoint
  server.post('/logout', async (request, reply) => {
    try {
      // Get refresh token from cookie
      const refreshToken = request.cookies.refreshToken;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      
      // Clear the cookie
      reply.clearCookie('refreshToken');
      
      return { success: true };
    } catch (error) {
      // Always return success for logout
      reply.clearCookie('refreshToken');
      return { success: true };
    }
  });

  // Get current user endpoint (protected)
  server.get('/me', async (request, reply) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.status(401).send({ error: 'Authorization required' });
        return;
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      const user = await authService.getUserById(payload.userId);
      
      return { user };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('Invalid')) {
          reply.status(401).send({ error: error.message });
          return;
        }
        if (error.message.includes('not found')) {
          reply.status(404).send({ error: error.message });
          return;
        }
      }
      throw error;
    }
  });

  // Logout all sessions (protected)
  server.post('/logout-all', async (request, reply) => {
    try {
      // Get token from Authorization header
      const authHeader = request.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        reply.status(401).send({ error: 'Authorization required' });
        return;
      }

      const token = authHeader.substring(7);
      const payload = verifyAccessToken(token);
      
      await authService.logoutAll(payload.userId);
      
      // Clear the cookie
      reply.clearCookie('refreshToken');
      
      return { success: true };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('expired') || error.message.includes('Invalid')) {
          reply.status(401).send({ error: error.message });
          return;
        }
      }
      throw error;
    }
  });
};