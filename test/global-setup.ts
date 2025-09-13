import { chromium, FullConfig } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

/**
 * Global setup for QA testing
 * Prepares test environment and seed data
 */
async function globalSetup(config: FullConfig) {
  console.log('🔧 Setting up QA test environment...');

  // Initialize database connection
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'postgresql://test:test@localhost:3302/braidarr_test'
      }
    }
  });

  try {
    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await cleanupTestData(prisma);

    // Seed test data if needed
    console.log('🌱 Seeding test data...');
    await seedTestData(prisma);

    // Verify services are running
    console.log('🔍 Verifying services...');
    await verifyServices();

    console.log('✅ QA test environment setup complete');

  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up existing test data
 */
async function cleanupTestData(prisma: PrismaClient) {
  try {
    // Delete test users and related data
    await prisma.apiKey.deleteMany({
      where: {
        user: {
          email: {
            contains: 'qa-test'
          }
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'qa-test'
        }
      }
    });

    // Delete any test configuration data
    await prisma.arrInstance.deleteMany({
      where: {
        name: {
          startsWith: 'Test'
        }
      }
    });

    console.log('✅ Test data cleanup complete');
  } catch (error) {
    console.error('❌ Failed to cleanup test data:', error);
    // Don't throw here, continue with setup
  }
}

/**
 * Seed required test data
 */
async function seedTestData(prisma: PrismaClient) {
  try {
    // Create test users with proper permissions
    const testUsers = [
      {
        email: 'qa-test-admin@example.com',
        username: 'qatestadmin',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9c5VE7f3vq', // hashed 'qapassword123'
        firstName: 'QA',
        lastName: 'Admin',
        isEmailVerified: true,
        role: 'admin'
      },
      {
        email: 'qa-test-user@example.com',
        username: 'qatestuser',
        password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9c5VE7f3vq', // hashed 'qapassword123'
        firstName: 'QA',
        lastName: 'User',
        isEmailVerified: true,
        role: 'user'
      }
    ];

    for (const userData of testUsers) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: userData,
        create: userData
      });
    }

    console.log('✅ Test users created');

    // Create test API keys for automated testing
    const adminUser = await prisma.user.findUnique({
      where: { email: 'qa-test-admin@example.com' }
    });

    if (adminUser) {
      await prisma.apiKey.upsert({
        where: { 
          userId_name: {
            userId: adminUser.id,
            name: 'QA Test Master Key'
          }
        },
        update: {},
        create: {
          name: 'QA Test Master Key',
          keyHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj9c5VE7f3vq', // hashed test key
          keyPrefix: 'ba_qa_test',
          scopes: JSON.stringify([
            { resource: 'arr', actions: ['read', 'write'] },
            { resource: 'users', actions: ['read', 'write'] },
            { resource: 'media', actions: ['read', 'write'] },
            { resource: 'indexers', actions: ['read', 'write'] },
            { resource: 'download-clients', actions: ['read', 'write'] },
            { resource: 'quality-profiles', actions: ['read', 'write'] },
            { resource: 'root-folders', actions: ['read', 'write'] }
          ]),
          userId: adminUser.id,
          isActive: true,
          expiresAt: null // Never expires for testing
        }
      });

      console.log('✅ Test API keys created');
    }

    // Create test configuration for arr instances (mock data)
    const mockArrInstances = [
      {
        name: 'Test Sonarr Instance',
        type: 'sonarr',
        baseUrl: 'http://localhost:8989',
        apiKey: 'test-sonarr-api-key-for-qa',
        isActive: true,
        userId: adminUser?.id
      },
      {
        name: 'Test Radarr Instance', 
        type: 'radarr',
        baseUrl: 'http://localhost:7878',
        apiKey: 'test-radarr-api-key-for-qa',
        isActive: true,
        userId: adminUser?.id
      }
    ];

    for (const instance of mockArrInstances) {
      if (instance.userId) {
        await prisma.arrInstance.upsert({
          where: {
            userId_name: {
              userId: instance.userId,
              name: instance.name
            }
          },
          update: instance,
          create: instance
        });
      }
    }

    console.log('✅ Test arr instances created');

  } catch (error) {
    console.error('❌ Failed to seed test data:', error);
    throw error;
  }
}

/**
 * Verify required services are running
 */
async function verifyServices() {
  const services = [
    { name: 'Web Server', url: 'http://localhost:3300', timeout: 30000 },
    { name: 'API Server', url: 'http://localhost:3301/api/health', timeout: 30000 }
  ];

  for (const service of services) {
    try {
      console.log(`🔍 Checking ${service.name}...`);
      
      const response = await fetch(service.url, {
        method: 'GET',
        signal: AbortSignal.timeout(service.timeout)
      });

      if (response.ok) {
        console.log(`✅ ${service.name} is running`);
      } else {
        throw new Error(`${service.name} returned ${response.status}`);
      }
    } catch (error) {
      console.error(`❌ ${service.name} is not responding:`, error);
      throw new Error(`Required service ${service.name} is not available`);
    }
  }
}

/**
 * Create authenticated browser context for tests
 */
export async function createAuthenticatedContext() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  
  // You can add authentication logic here if needed
  // For example, set cookies or local storage
  
  return { browser, context };
}

/**
 * Get test API key for automated testing
 */
export function getTestApiKey(): string {
  return process.env.TEST_API_KEY || 'ba_qa_test_key_for_automation';
}

/**
 * Get test user credentials
 */
export function getTestUser() {
  return {
    email: process.env.TEST_USER_EMAIL || 'qa-test-admin@example.com',
    password: process.env.TEST_USER_PASSWORD || 'qapassword123',
    username: 'qatestadmin'
  };
}

export default globalSetup;