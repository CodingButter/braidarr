import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mock data for arr ecosystem testing
const mockSonarrConfig = {
  name: 'Test Sonarr Instance',
  baseUrl: 'http://localhost:8989',
  apiKey: 'test-sonarr-api-key',
  type: 'sonarr'
};

const mockRadarrConfig = {
  name: 'Test Radarr Instance',
  baseUrl: 'http://localhost:7878',
  apiKey: 'test-radarr-api-key',
  type: 'radarr'
};

const mockIndexerConfig = {
  name: 'Test Indexer',
  type: 'torznab',
  baseUrl: 'http://localhost:9117/api/v2.0/indexers/test/results/torznab',
  apiKey: 'test-indexer-key',
  categories: ['5000', '5040'] // TV and TV/HD categories
};

const mockDownloadClientConfig = {
  name: 'Test qBittorrent',
  type: 'qbittorrent',
  host: 'localhost',
  port: 8080,
  username: 'admin',
  password: 'adminpass',
  category: 'tv-sonarr'
};

test.describe('Arr Ecosystem Integration Tests', () => {
  let userApiKey: string;
  let userId: string;

  test.beforeAll(async ({ request }) => {
    // Create test user and API key for arr ecosystem tests
    const registerResponse = await request.post('/api/auth/register', {
      data: {
        email: 'arr-test@example.com',
        username: 'arrtest',
        password: 'arrpassword123',
        firstName: 'Arr',
        lastName: 'Tester'
      }
    });

    const registerData = await registerResponse.json();
    userId = registerData.user.id;

    // Create API key with full arr ecosystem permissions
    const apiKeyResponse = await request.post('/api/api-keys', {
      headers: {
        'Authorization': `Bearer ${registerData.accessToken}`,
        'Content-Type': 'application/json'
      },
      data: {
        name: 'Arr Ecosystem Test Key',
        scopes: [
          { resource: 'arr', actions: ['read', 'write'] },
          { resource: 'indexers', actions: ['read', 'write'] },
          { resource: 'download-clients', actions: ['read', 'write'] },
          { resource: 'quality-profiles', actions: ['read', 'write'] },
          { resource: 'root-folders', actions: ['read', 'write'] }
        ]
      }
    });

    const apiKeyData = await apiKeyResponse.json();
    userApiKey = apiKeyData.key;
  });

  test.afterAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: { email: 'arr-test@example.com' }
    });
    await prisma.$disconnect();
  });

  test.describe('Sonarr Integration', () => {
    test('should configure Sonarr instance', async ({ request }) => {
      const response = await request.post('/api/arr/sonarr', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockSonarrConfig
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.instance.name).toBe(mockSonarrConfig.name);
      expect(responseData.instance.type).toBe('sonarr');
      expect(responseData.instance.baseUrl).toBe(mockSonarrConfig.baseUrl);
    });

    test('should test Sonarr connection', async ({ request }) => {
      const response = await request.post('/api/arr/sonarr/test', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockSonarrConfig
      });

      // This would normally connect to actual Sonarr instance
      // In testing environment, we expect either success or connection error
      expect([200, 503]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('status');
        expect(responseData.status).toBe('connected');
      }
    });

    test('should sync Sonarr series data', async ({ request }) => {
      const response = await request.post('/api/arr/sonarr/sync', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      // Expect either successful sync or connection error
      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('synced');
        expect(typeof responseData.synced).toBe('number');
      }
    });

    test('should get Sonarr quality profiles', async ({ request }) => {
      const response = await request.get('/api/arr/sonarr/quality-profiles', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(Array.isArray(responseData.profiles)).toBe(true);
      }
    });

    test('should get Sonarr root folders', async ({ request }) => {
      const response = await request.get('/api/arr/sonarr/root-folders', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(Array.isArray(responseData.rootFolders)).toBe(true);
      }
    });
  });

  test.describe('Radarr Integration', () => {
    test('should configure Radarr instance', async ({ request }) => {
      const response = await request.post('/api/arr/radarr', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockRadarrConfig
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.instance.name).toBe(mockRadarrConfig.name);
      expect(responseData.instance.type).toBe('radarr');
      expect(responseData.instance.baseUrl).toBe(mockRadarrConfig.baseUrl);
    });

    test('should test Radarr connection', async ({ request }) => {
      const response = await request.post('/api/arr/radarr/test', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockRadarrConfig
      });

      expect([200, 503]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('status');
        expect(responseData.status).toBe('connected');
      }
    });

    test('should sync Radarr movie data', async ({ request }) => {
      const response = await request.post('/api/arr/radarr/sync', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('synced');
        expect(typeof responseData.synced).toBe('number');
      }
    });

    test('should get Radarr quality profiles', async ({ request }) => {
      const response = await request.get('/api/arr/radarr/quality-profiles', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(Array.isArray(responseData.profiles)).toBe(true);
      }
    });
  });

  test.describe('Indexer Integration', () => {
    test('should add indexer configuration', async ({ request }) => {
      const response = await request.post('/api/indexers', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockIndexerConfig
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.indexer.name).toBe(mockIndexerConfig.name);
      expect(responseData.indexer.type).toBe(mockIndexerConfig.type);
    });

    test('should test indexer connection', async ({ request }) => {
      const response = await request.post('/api/indexers/test', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockIndexerConfig
      });

      expect([200, 503]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('status');
        expect(['connected', 'error']).toContain(responseData.status);
      }
    });

    test('should search indexer for content', async ({ request }) => {
      const response = await request.get('/api/indexers/search', {
        headers: {
          'X-API-Key': userApiKey
        },
        params: {
          q: 'test search query',
          cat: '5000'
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(Array.isArray(responseData.results)).toBe(true);
      }
    });

    test('should get indexer capabilities', async ({ request }) => {
      const response = await request.get('/api/indexers/caps', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('categories');
        expect(Array.isArray(responseData.categories)).toBe(true);
      }
    });
  });

  test.describe('Download Client Integration', () => {
    test('should add download client configuration', async ({ request }) => {
      const response = await request.post('/api/download-clients', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockDownloadClientConfig
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.client.name).toBe(mockDownloadClientConfig.name);
      expect(responseData.client.type).toBe(mockDownloadClientConfig.type);
    });

    test('should test download client connection', async ({ request }) => {
      const response = await request.post('/api/download-clients/test', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: mockDownloadClientConfig
      });

      expect([200, 503]).toContain(response.status());
      
      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('status');
        expect(['connected', 'error']).toContain(responseData.status);
      }
    });

    test('should get download client status', async ({ request }) => {
      const response = await request.get('/api/download-clients/status', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect([200, 503]).toContain(response.status());

      if (response.status() === 200) {
        const responseData = await response.json();
        expect(responseData).toHaveProperty('downloads');
        expect(Array.isArray(responseData.downloads)).toBe(true);
      }
    });
  });

  test.describe('Quality Profile Management', () => {
    test('should create custom quality profile', async ({ request }) => {
      const qualityProfile = {
        name: 'Test Quality Profile',
        cutoff: 'WEBDL-1080p',
        items: [
          { quality: 'HDTV-720p', allowed: true },
          { quality: 'WEBDL-720p', allowed: true },
          { quality: 'WEBDL-1080p', allowed: true }
        ]
      };

      const response = await request.post('/api/quality-profiles', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: qualityProfile
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.profile.name).toBe(qualityProfile.name);
      expect(responseData.profile.cutoff).toBe(qualityProfile.cutoff);
    });

    test('should list quality profiles', async ({ request }) => {
      const response = await request.get('/api/quality-profiles', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(Array.isArray(responseData.profiles)).toBe(true);
    });

    test('should update quality profile', async ({ request }) => {
      // First create a profile to update
      const createResponse = await request.post('/api/quality-profiles', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Profile to Update',
          cutoff: 'WEBDL-720p',
          items: [{ quality: 'WEBDL-720p', allowed: true }]
        }
      });

      const createData = await createResponse.json();
      const profileId = createData.profile.id;

      // Update the profile
      const updateResponse = await request.patch(`/api/quality-profiles/${profileId}`, {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Updated Profile Name',
          cutoff: 'WEBDL-1080p'
        }
      });

      expect(updateResponse.status()).toBe(200);
      
      const updateData = await updateResponse.json();
      expect(updateData.profile.name).toBe('Updated Profile Name');
      expect(updateData.profile.cutoff).toBe('WEBDL-1080p');
    });
  });

  test.describe('Root Folder Operations', () => {
    test('should add root folder', async ({ request }) => {
      const rootFolder = {
        path: '/media/tv',
        label: 'TV Shows',
        defaultProfile: 1,
        defaultTags: ['tv', 'sonarr']
      };

      const response = await request.post('/api/root-folders', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: rootFolder
      });

      expect(response.status()).toBe(201);
      
      const responseData = await response.json();
      expect(responseData.rootFolder.path).toBe(rootFolder.path);
      expect(responseData.rootFolder.label).toBe(rootFolder.label);
    });

    test('should list root folders', async ({ request }) => {
      const response = await request.get('/api/root-folders', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(Array.isArray(responseData.rootFolders)).toBe(true);
    });

    test('should check root folder disk usage', async ({ request }) => {
      const response = await request.get('/api/root-folders/disk-usage', {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect(response.status()).toBe(200);
      
      const responseData = await response.json();
      expect(Array.isArray(responseData.diskUsage)).toBe(true);
    });

    test('should delete root folder', async ({ request }) => {
      // First create a root folder to delete
      const createResponse = await request.post('/api/root-folders', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: {
          path: '/media/temp-delete-test',
          label: 'Temporary Folder'
        }
      });

      const createData = await createResponse.json();
      const folderId = createData.rootFolder.id;

      // Delete the folder
      const deleteResponse = await request.delete(`/api/root-folders/${folderId}`, {
        headers: {
          'X-API-Key': userApiKey
        }
      });

      expect(deleteResponse.status()).toBe(200);
      
      const deleteData = await deleteResponse.json();
      expect(deleteData.message).toBe('Root folder deleted successfully');
    });
  });

  test.describe('Arr Ecosystem Error Handling', () => {
    test('should handle invalid arr instance configuration', async ({ request }) => {
      const invalidConfig = {
        name: '',
        baseUrl: 'invalid-url',
        apiKey: '',
        type: 'invalid'
      };

      const response = await request.post('/api/arr/sonarr', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: invalidConfig
      });

      expect(response.status()).toBe(400);
    });

    test('should handle connection timeouts gracefully', async ({ request }) => {
      const timeoutConfig = {
        name: 'Timeout Test',
        baseUrl: 'http://192.0.2.1:8989', // Non-routable IP for timeout
        apiKey: 'test-key',
        type: 'sonarr'
      };

      const response = await request.post('/api/arr/sonarr/test', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: timeoutConfig
      });

      expect([503, 408]).toContain(response.status()); // Service unavailable or timeout
    });

    test('should validate API key permissions for arr operations', async ({ request }) => {
      // Create API key with limited permissions
      const limitedKeyResponse = await request.post('/api/api-keys', {
        headers: {
          'X-API-Key': userApiKey,
          'Content-Type': 'application/json'
        },
        data: {
          name: 'Limited Permission Key',
          scopes: [
            { resource: 'arr', actions: ['read'] } // Read-only
          ]
        }
      });

      const limitedData = await limitedKeyResponse.json();
      const limitedKey = limitedData.key;

      // Try to create arr instance with read-only key (should fail)
      const response = await request.post('/api/arr/sonarr', {
        headers: {
          'X-API-Key': limitedKey,
          'Content-Type': 'application/json'
        },
        data: mockSonarrConfig
      });

      expect(response.status()).toBe(403); // Forbidden
    });
  });
});