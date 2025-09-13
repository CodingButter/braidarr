import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { ApiKeyService } from '../packages/server/src/services/api-key.service';
import { AuthService } from '../packages/server/src/services/auth.service';

const prisma = new PrismaClient();
const apiKeyService = new ApiKeyService();
const authService = new AuthService();

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'testpassword123',
  firstName: 'Test',
  lastName: 'User'
};

test.describe('API Key Authentication E2E Tests', () => {
  let userId: string;
  let accessToken: string;
  let testApiKey: { key: string; id: string };

  test.beforeAll(async () => {
    // Clean up any existing test data
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });

    // Create test user
    const registerResult = await authService.register(testUser);
    userId = registerResult.user.id;
    accessToken = registerResult.accessToken;
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.apiKey.deleteMany({
      where: { userId }
    });
    await prisma.user.deleteMany({
      where: { email: testUser.email }
    });
    await prisma.$disconnect();
  });

  test.describe('API Key Management', () => {
    test('should create API key with proper authentication', async ({ request }) => {
      const response = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Test API Key',
          scopes: [
            {
              resource: 'movies',
              actions: ['read', 'write']
            },
            {
              resource: 'tv',
              actions: ['read']
            }
          ]
        }
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('apiKey');
      expect(responseData).toHaveProperty('key');
      expect(responseData).toHaveProperty('warning');
      expect(responseData.apiKey.name).toBe('Test API Key');
      expect(responseData.key).toMatch(/^ba_[a-zA-Z0-9]+$/);

      // Store for later tests
      testApiKey = {
        key: responseData.key,
        id: responseData.apiKey.id
      };
    });

    test('should fail to create API key without authentication', async ({ request }) => {
      const response = await request.post('/api/api-keys', {
        data: {
          name: 'Unauthorized API Key',
          scopes: [{ resource: 'movies', actions: ['read'] }]
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should fail to create API key with invalid scopes', async ({ request }) => {
      const response = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Invalid Scopes API Key',
          scopes: [
            {
              resource: '',
              actions: ['read']
            }
          ]
        }
      });

      expect(response.status()).toBe(400);
    });

    test('should list user API keys', async ({ request }) => {
      const response = await request.get('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('apiKeys');
      expect(Array.isArray(responseData.apiKeys)).toBe(true);
      expect(responseData.apiKeys.length).toBeGreaterThan(0);
      
      // Check that API key data is properly formatted
      const apiKey = responseData.apiKeys[0];
      expect(apiKey).toHaveProperty('id');
      expect(apiKey).toHaveProperty('name');
      expect(apiKey).toHaveProperty('keyPrefix');
      expect(apiKey).toHaveProperty('scopes');
      expect(apiKey).toHaveProperty('isActive');
      expect(apiKey.keyPrefix).toMatch(/^ba_[a-zA-Z0-9]{8}$/);
    });

    test('should get specific API key details', async ({ request }) => {
      const response = await request.get(`/api/api-keys/${testApiKey.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('apiKey');
      expect(responseData.apiKey.id).toBe(testApiKey.id);
      expect(responseData.apiKey.name).toBe('Test API Key');
    });

    test('should update API key properties', async ({ request }) => {
      const response = await request.patch(`/api/api-keys/${testApiKey.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Updated Test API Key',
          isActive: false
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.apiKey.name).toBe('Updated Test API Key');
      expect(responseData.apiKey.isActive).toBe(false);
    });

    test('should get API key usage statistics', async ({ request }) => {
      const response = await request.get(`/api/api-keys/${testApiKey.id}/usage`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData).toHaveProperty('usage');
      expect(responseData.usage).toHaveProperty('totalRequests');
      expect(responseData.usage).toHaveProperty('requestsToday');
      expect(responseData.usage).toHaveProperty('requestsThisMonth');
    });

    test('should revoke API key', async ({ request }) => {
      const response = await request.delete(`/api/api-keys/${testApiKey.id}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(responseData.message).toBe('API key revoked successfully');
    });
  });

  test.describe('API Key Authentication Flow', () => {
    let activeApiKey: { key: string; id: string };

    test.beforeAll(async ({ request }) => {
      // Create a fresh API key for authentication tests
      const response = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Auth Test API Key',
          scopes: [
            {
              resource: 'arr',
              actions: ['read', 'write']
            }
          ]
        }
      });

      const responseData = await response.json();
      activeApiKey = {
        key: responseData.key,
        id: responseData.apiKey.id
      };
    });

    test('should authenticate with valid API key', async ({ request }) => {
      const response = await request.get('/api/health', {
        headers: {
          'X-API-Key': activeApiKey.key
        }
      });

      expect(response.status()).toBe(200);
    });

    test('should fail authentication with invalid API key', async ({ request }) => {
      const response = await request.get('/api/health', {
        headers: {
          'X-API-Key': 'ba_invalidkey123456789'
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should fail authentication with malformed API key', async ({ request }) => {
      const response = await request.get('/api/health', {
        headers: {
          'X-API-Key': 'invalid_format'
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should fail authentication with expired API key', async ({ request }) => {
      // Create an API key that expires immediately
      const expiredResponse = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Expired API Key',
          scopes: [{ resource: 'arr', actions: ['read'] }],
          expiresAt: new Date(Date.now() - 1000).toISOString() // 1 second ago
        }
      });

      const expiredData = await expiredResponse.json();
      
      const response = await request.get('/api/health', {
        headers: {
          'X-API-Key': expiredData.key
        }
      });

      expect(response.status()).toBe(401);
    });

    test('should respect API key scopes', async ({ request }) => {
      // Create API key with limited scopes
      const limitedResponse = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Limited Scope API Key',
          scopes: [
            {
              resource: 'movies',
              actions: ['read']
            }
          ]
        }
      });

      const limitedData = await limitedResponse.json();

      // Should succeed for allowed scope
      const allowedResponse = await request.get('/api/health', {
        headers: {
          'X-API-Key': limitedData.key
        }
      });
      expect(allowedResponse.status()).toBe(200);

      // Note: We would need specific scoped endpoints to test scope restrictions
      // This is a placeholder for when those endpoints are implemented
    });
  });

  test.describe('API Key Security Tests', () => {
    test('should rate limit API key requests', async ({ request }) => {
      // This test would need a rate-limited endpoint
      // Creating API key for rate limit testing
      const response = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Rate Limit Test Key',
          scopes: [{ resource: 'arr', actions: ['read'] }]
        }
      });

      const responseData = await response.json();
      const rateLimitKey = responseData.key;

      // Make multiple rapid requests to test rate limiting
      const requests = Array.from({ length: 100 }, () =>
        request.get('/api/health', {
          headers: { 'X-API-Key': rateLimitKey }
        })
      );

      const responses = await Promise.all(requests);
      const rateLimitedResponses = responses.filter(r => r.status() === 429);
      
      // Expect some requests to be rate limited
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    test('should prevent API key reuse after revocation', async ({ request }) => {
      // Create API key
      const createResponse = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Revocation Test Key',
          scopes: [{ resource: 'arr', actions: ['read'] }]
        }
      });

      const createData = await createResponse.json();
      const keyToRevoke = createData.key;
      const keyId = createData.apiKey.id;

      // Verify key works
      const beforeRevocation = await request.get('/api/health', {
        headers: { 'X-API-Key': keyToRevoke }
      });
      expect(beforeRevocation.status()).toBe(200);

      // Revoke the key
      await request.delete(`/api/api-keys/${keyId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      // Verify key no longer works
      const afterRevocation = await request.get('/api/health', {
        headers: { 'X-API-Key': keyToRevoke }
      });
      expect(afterRevocation.status()).toBe(401);
    });
  });

  test.describe('Edge Cases and Error Handling', () => {
    test('should handle missing API key header gracefully', async ({ request }) => {
      const response = await request.get('/api/api-keys');
      expect(response.status()).toBe(401);
    });

    test('should handle malformed authorization header', async ({ request }) => {
      const response = await request.get('/api/api-keys', {
        headers: {
          'Authorization': 'InvalidFormat'
        }
      });
      expect(response.status()).toBe(401);
    });

    test('should prevent API key creation with duplicate names for same user', async ({ request }) => {
      const keyData = {
        name: 'Duplicate Name Test',
        scopes: [{ resource: 'arr', actions: ['read'] }]
      };

      // Create first key
      const first = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: keyData
      });
      expect(first.status()).toBe(201);

      // Try to create second key with same name
      const second = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: keyData
      });
      expect(second.status()).toBe(409); // Conflict
    });

    test('should validate API key name length limits', async ({ request }) => {
      const longName = 'a'.repeat(101); // Exceeds 100 character limit
      
      const response = await request.post('/api/api-keys', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          name: longName,
          scopes: [{ resource: 'arr', actions: ['read'] }]
        }
      });

      expect(response.status()).toBe(400);
    });

    test('should handle API key operations for non-existent keys', async ({ request }) => {
      const fakeKeyId = 'non-existent-key-id';

      const getResponse = await request.get(`/api/api-keys/${fakeKeyId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      expect(getResponse.status()).toBe(404);

      const updateResponse = await request.patch(`/api/api-keys/${fakeKeyId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: { name: 'Updated Name' }
      });
      expect(updateResponse.status()).toBe(404);

      const deleteResponse = await request.delete(`/api/api-keys/${fakeKeyId}`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      expect(deleteResponse.status()).toBe(404);
    });
  });
});