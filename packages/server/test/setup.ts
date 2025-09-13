/**
 * Test setup for server package
 * Runs before all tests
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.PORT = '3301';
process.env.DATABASE_URL = 'sqlite::memory:';
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
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
  randomId: () => Math.random().toString(36).substring(7),
  timestamp: () => new Date().toISOString()
};

// Make test utils globally available
declare global {
  const testUtils: typeof testUtils;
}

(global as any).testUtils = testUtils;