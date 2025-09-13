/**
 * User test fixtures for authentication testing
 */

export interface TestUser {
  email: string;
  password: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'user' | 'guest';
  status?: 'active' | 'inactive' | 'pending';
}

export const testUsers: Record<string, TestUser> = {
  // Admin user with full permissions
  admin: {
    email: 'admin@test.braidarr.com',
    password: 'Admin@123!Secure',
    username: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    status: 'active'
  },

  // Regular active user
  activeUser: {
    email: 'user@test.braidarr.com',
    password: 'User@123!Secure',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    role: 'user',
    status: 'active'
  },

  // Inactive user account
  inactiveUser: {
    email: 'inactive@test.braidarr.com',
    password: 'Inactive@123!',
    username: 'inactiveuser',
    firstName: 'Inactive',
    lastName: 'User',
    role: 'user',
    status: 'inactive'
  },

  // Pending verification user
  pendingUser: {
    email: 'pending@test.braidarr.com',
    password: 'Pending@123!',
    username: 'pendinguser',
    firstName: 'Pending',
    lastName: 'User',
    role: 'user',
    status: 'pending'
  },

  // New registration user
  newUser: {
    email: 'newuser@test.braidarr.com',
    password: 'NewUser@123!',
    username: 'newuser',
    firstName: 'New',
    lastName: 'User'
  },

  // User for password reset testing
  resetUser: {
    email: 'reset@test.braidarr.com',
    password: 'OldPassword@123!',
    username: 'resetuser',
    firstName: 'Reset',
    lastName: 'User',
    role: 'user',
    status: 'active'
  },

  // User for rate limiting tests
  rateLimitUser: {
    email: 'ratelimit@test.braidarr.com',
    password: 'RateLimit@123!',
    username: 'ratelimituser',
    role: 'user',
    status: 'active'
  }
};

// Invalid user data for negative testing
export const invalidUsers = {
  // Invalid email format
  invalidEmail: {
    email: 'not-an-email',
    password: 'Valid@123!',
    username: 'invalidemailuser'
  },

  // Weak password
  weakPassword: {
    email: 'weak@test.braidarr.com',
    password: '123',
    username: 'weakpassuser'
  },

  // Missing required fields
  missingFields: {
    email: 'missing@test.braidarr.com'
    // password missing
  },

  // SQL injection attempt
  sqlInjection: {
    email: "admin'--@test.com",
    password: "' OR '1'='1",
    username: 'sqlinject'
  },

  // XSS attempt
  xssAttempt: {
    email: 'xss@test.braidarr.com',
    password: 'Valid@123!',
    username: '<script>alert("XSS")</script>'
  },

  // Very long input
  tooLong: {
    email: 'toolong@test.braidarr.com',
    password: 'Valid@123!',
    username: 'a'.repeat(256)
  }
};

// Batch users for load testing
export const batchUsers = Array.from({ length: 100 }, (_, i) => ({
  email: `loadtest${i}@test.braidarr.com`,
  password: `LoadTest@${i}!`,
  username: `loadtest${i}`,
  firstName: 'Load',
  lastName: `Test${i}`,
  role: 'user' as const,
  status: 'active' as const
}));

// Helper function to get user credentials
export function getUserCredentials(userKey: keyof typeof testUsers): { email: string; password: string } {
  const user = testUsers[userKey];
  return {
    email: user.email,
    password: user.password
  };
}

// Helper function to create random user
export function generateRandomUser(): TestUser {
  const randomId = Math.random().toString(36).substring(7);
  return {
    email: `random${randomId}@test.braidarr.com`,
    password: `Random@${randomId}!`,
    username: `random${randomId}`,
    firstName: 'Random',
    lastName: 'User',
    role: 'user',
    status: 'active'
  };
}