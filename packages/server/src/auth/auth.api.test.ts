/**
 * Integration tests for Authentication API endpoints
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { testUsers, invalidUsers, getUserCredentials, generateRandomUser } from '../../../../test/fixtures/users';
import { testTokens, authHeaders } from '../../../../test/fixtures/tokens';
import { resetDatabase } from '../../../../test/fixtures/database';

// Mock Fastify app and test client (to be replaced with actual implementation)
const mockApp = {
  inject: async (options: any) => {
    // Mock response based on request
    return {
      statusCode: 200,
      headers: {},
      body: JSON.stringify({})
    };
  }
};

describe('Authentication API Integration Tests', () => {
  let app: typeof mockApp;

  beforeAll(async () => {
    // Initialize test server on QA port
    process.env.PORT = '3301';
    process.env.NODE_ENV = 'test';
    app = mockApp; // Will be replaced with actual app instance
  });

  afterAll(async () => {
    // Cleanup
  });

  beforeEach(async () => {
    // Reset database to clean state
    // await resetDatabase(db);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = generateRandomUser();
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: newUser
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.body);
      expect(body.email).toBe(newUser.email);
      expect(body.password).toBeUndefined(); // Should not return password
    });

    it('should return 400 for invalid email format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: invalidUsers.invalidEmail
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('email');
    });

    it('should return 400 for weak password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: invalidUsers.weakPassword
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('password');
    });

    it('should return 409 for duplicate email', async () => {
      const user = testUsers.activeUser;
      
      // First registration
      await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: user
      });

      // Duplicate registration
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: user
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('already exists');
    });

    it('should sanitize XSS attempts in username', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: invalidUsers.xssAttempt
      });

      if (response.statusCode === 201) {
        const body = JSON.parse(response.body);
        expect(body.username).not.toContain('<script>');
      }
    });

    it('should handle missing required fields', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/register',
        payload: invalidUsers.missingFields
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('required');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = getUserCredentials('activeUser');
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: credentials
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.token).toBeDefined();
      expect(body.user).toBeDefined();
      expect(body.user.email).toBe(credentials.email);
    });

    it('should return 401 for invalid password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: testUsers.activeUser.email,
          password: 'WrongPassword123!'
        }
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Invalid credentials');
    });

    it('should return 401 for non-existent user', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: 'nonexistent@test.braidarr.com',
          password: 'Password123!'
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 403 for inactive account', async () => {
      const credentials = getUserCredentials('inactiveUser');
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: credentials
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('inactive');
    });

    it('should handle SQL injection attempts', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: {
          email: invalidUsers.sqlInjection.email,
          password: invalidUsers.sqlInjection.password
        }
      });

      expect(response.statusCode).toBe(401);
    });

    it('should set secure cookies on successful login', async () => {
      const credentials = getUserCredentials('activeUser');
      
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: credentials
      });

      expect(response.statusCode).toBe(200);
      expect(response.headers['set-cookie']).toBeDefined();
      // Check for secure cookie attributes
      if (response.headers['set-cookie']) {
        expect(response.headers['set-cookie']).toContain('HttpOnly');
        expect(response.headers['set-cookie']).toContain('SameSite');
      }
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout with valid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: authHeaders.validUser
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('logged out');
    });

    it('should clear session cookies on logout', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout',
        headers: authHeaders.validUser
      });

      expect(response.statusCode).toBe(200);
      if (response.headers['set-cookie']) {
        expect(response.headers['set-cookie']).toContain('Max-Age=0');
      }
    });

    it('should handle logout without token gracefully', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/logout'
      });

      expect(response.statusCode).toBe(200); // Logout always succeeds
    });
  });

  describe('GET /api/auth/verify', () => {
    it('should verify valid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/verify',
        headers: authHeaders.validUser
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.valid).toBe(true);
      expect(body.user).toBeDefined();
    });

    it('should return 401 for expired token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/verify',
        headers: authHeaders.expired
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('expired');
    });

    it('should return 401 for invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/verify',
        headers: authHeaders.invalid
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for malformed token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/verify',
        headers: authHeaders.malformed
      });

      expect(response.statusCode).toBe(401);
    });

    it('should return 401 for missing token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/verify'
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh valid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        headers: authHeaders.validUser
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.token).toBeDefined();
      expect(body.token).not.toBe(testTokens.validUser); // New token
    });

    it('should return 401 for expired refresh token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/refresh',
        headers: authHeaders.expired
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /api/auth/password/reset', () => {
    it('should initiate password reset', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/password/reset',
        payload: {
          email: testUsers.resetUser.email
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('email sent');
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/password/reset',
        payload: {
          email: 'nonexistent@test.braidarr.com'
        }
      });

      expect(response.statusCode).toBe(200); // Don't reveal if email exists
    });
  });

  describe('POST /api/auth/password/confirm', () => {
    it('should reset password with valid token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/password/confirm',
        payload: {
          token: 'valid-reset-token',
          newPassword: 'NewSecureP@ss123!'
        }
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.message).toContain('password updated');
    });

    it('should return 400 for expired reset token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/password/confirm',
        payload: {
          token: 'expired-reset-token',
          newPassword: 'NewSecureP@ss123!'
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('expired');
    });

    it('should return 400 for weak new password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/password/confirm',
        payload: {
          token: 'valid-reset-token',
          newPassword: '123'
        }
      });

      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('password');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limiting after multiple failed login attempts', async () => {
      const credentials = {
        email: testUsers.rateLimitUser.email,
        password: 'wrong-password'
      };

      // Make 5 rapid failed attempts
      const attempts = [];
      for (let i = 0; i < 5; i++) {
        attempts.push(app.inject({
          method: 'POST',
          url: '/api/auth/login',
          payload: credentials
        }));
      }

      await Promise.all(attempts);

      // 6th attempt should be rate limited
      const response = await app.inject({
        method: 'POST',
        url: '/api/auth/login',
        payload: credentials
      });

      expect(response.statusCode).toBe(429);
      const body = JSON.parse(response.body);
      expect(body.error).toContain('Too many');
    });

    it('should rate limit registration attempts from same IP', async () => {
      const attempts = [];
      for (let i = 0; i < 10; i++) {
        attempts.push(app.inject({
          method: 'POST',
          url: '/api/auth/register',
          payload: generateRandomUser()
        }));
      }

      const responses = await Promise.all(attempts);
      const rateLimited = responses.some(r => r.statusCode === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers in responses', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/auth/verify',
        headers: authHeaders.validUser
      });

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });

    it('should include CORS headers for allowed origins', async () => {
      const response = await app.inject({
        method: 'OPTIONS',
        url: '/api/auth/login',
        headers: {
          'Origin': 'http://localhost:3300'
        }
      });

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3300');
      expect(response.headers['access-control-allow-credentials']).toBe('true');
    });
  });
});