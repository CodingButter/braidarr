/**
 * Test setup and configuration
 * Runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import dotenv from 'dotenv';
import path from 'path';

// Load test environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3301';
process.env.WEB_PORT = '3300';
process.env.DATABASE_URL = 'sqlite://./data/test-braidarr.db';
process.env.JWT_SECRET = 'test-secret-qa-8x2k9mNpQ3s5v8yABdEfHjMnPrTvWxZa';
process.env.BCRYPT_ROUNDS = '4'; // Lower rounds for faster tests

// Mock console methods to reduce test output noise
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info
};

beforeAll(() => {
  // Suppress console output during tests unless DEBUG is set
  if (!process.env.DEBUG) {
    console.log = () => {};
    console.info = () => {};
    console.warn = () => {};
    // Keep console.error for actual errors
  }
});

afterAll(() => {
  // Restore console methods
  if (!process.env.DEBUG) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
  }
});

// Global test utilities
export const testUtils = {
  // Wait for async operations
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Generate random ID
  randomId: () => Math.random().toString(36).substring(7),
  
  // Create test timestamp
  timestamp: () => new Date().toISOString(),
  
  // Mock API response
  mockResponse: (data: any, status = 200) => ({
    status,
    statusText: status === 200 ? 'OK' : 'Error',
    headers: new Headers({ 'content-type': 'application/json' }),
    body: JSON.stringify(data),
    json: async () => data
  }),

  // Assert async error
  expectAsyncError: async (fn: () => Promise<any>, errorMessage?: string) => {
    let error: Error | null = null;
    try {
      await fn();
    } catch (e) {
      error = e as Error;
    }
    
    if (!error) {
      throw new Error('Expected function to throw an error');
    }
    
    if (errorMessage && !error.message.includes(errorMessage)) {
      throw new Error(`Expected error message to contain "${errorMessage}" but got "${error.message}"`);
    }
    
    return error;
  }
};

// Make test utils globally available
declare global {
  const testUtils: typeof testUtils;
}

(global as any).testUtils = testUtils;

// Test database setup
beforeEach(async () => {
  // Reset database state before each test
  // This would be implemented based on your database choice
  if (process.env.RESET_DB_BEFORE_EACH === 'true') {
    // await resetDatabase();
  }
});

afterEach(async () => {
  // Clean up after each test
  // Clear any test data, close connections, etc.
});

// Export test configuration
export const testConfig = {
  ports: {
    web: 3300,
    api: 3301,
    database: 3302,
    websocket: 3303,
    e2e: 3304
  },
  timeouts: {
    unit: 5000,
    integration: 10000,
    e2e: 30000
  },
  retries: {
    unit: 0,
    integration: 1,
    e2e: 2
  }
};