/**
 * Database test fixtures and utilities for authentication testing
 */

import { testUsers } from './users';

// Database connection for tests
export const testDatabaseConfig = {
  test: {
    url: 'sqlite://./data/test-braidarr.db',
    logging: false,
    synchronize: true,
    dropSchema: true
  },
  memory: {
    url: 'sqlite::memory:',
    logging: false,
    synchronize: true
  }
};

// Seed data for database
export const seedData = {
  users: [
    {
      id: '1',
      email: testUsers.admin.email,
      username: testUsers.admin.username,
      password: '$2b$04$hashed.admin.password', // Pre-hashed for speed
      firstName: testUsers.admin.firstName,
      lastName: testUsers.admin.lastName,
      role: testUsers.admin.role,
      status: testUsers.admin.status,
      emailVerified: true,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01')
    },
    {
      id: '2',
      email: testUsers.activeUser.email,
      username: testUsers.activeUser.username,
      password: '$2b$04$hashed.user.password',
      firstName: testUsers.activeUser.firstName,
      lastName: testUsers.activeUser.lastName,
      role: testUsers.activeUser.role,
      status: testUsers.activeUser.status,
      emailVerified: true,
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02')
    },
    {
      id: '3',
      email: testUsers.inactiveUser.email,
      username: testUsers.inactiveUser.username,
      password: '$2b$04$hashed.inactive.password',
      firstName: testUsers.inactiveUser.firstName,
      lastName: testUsers.inactiveUser.lastName,
      role: testUsers.inactiveUser.role,
      status: testUsers.inactiveUser.status,
      emailVerified: true,
      createdAt: new Date('2025-01-03'),
      updatedAt: new Date('2025-01-03')
    },
    {
      id: '4',
      email: testUsers.pendingUser.email,
      username: testUsers.pendingUser.username,
      password: '$2b$04$hashed.pending.password',
      firstName: testUsers.pendingUser.firstName,
      lastName: testUsers.pendingUser.lastName,
      role: testUsers.pendingUser.role,
      status: testUsers.pendingUser.status,
      emailVerified: false,
      createdAt: new Date('2025-01-04'),
      updatedAt: new Date('2025-01-04')
    }
  ],
  
  sessions: [
    {
      id: 'session-1',
      userId: '1',
      token: 'active-session-token-admin',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      createdAt: new Date(),
      lastActivity: new Date()
    },
    {
      id: 'session-2',
      userId: '2',
      token: 'active-session-token-user',
      expiresAt: new Date(Date.now() + 3600000),
      createdAt: new Date(),
      lastActivity: new Date()
    },
    {
      id: 'session-3',
      userId: '2',
      token: 'expired-session-token',
      expiresAt: new Date(Date.now() - 3600000), // Expired
      createdAt: new Date(Date.now() - 7200000),
      lastActivity: new Date(Date.now() - 3600000)
    }
  ],

  passwordResets: [
    {
      id: 'reset-1',
      userId: '2',
      token: 'valid-reset-token',
      expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      used: false,
      createdAt: new Date()
    },
    {
      id: 'reset-2',
      userId: '2',
      token: 'expired-reset-token',
      expiresAt: new Date(Date.now() - 3600000), // Expired
      used: false,
      createdAt: new Date(Date.now() - 7200000)
    },
    {
      id: 'reset-3',
      userId: '2',
      token: 'used-reset-token',
      expiresAt: new Date(Date.now() + 3600000),
      used: true,
      createdAt: new Date(Date.now() - 1800000)
    }
  ],

  loginAttempts: [
    {
      id: 'attempt-1',
      email: 'ratelimit@test.braidarr.com',
      ipAddress: '127.0.0.1',
      success: false,
      attemptedAt: new Date(Date.now() - 60000) // 1 minute ago
    },
    {
      id: 'attempt-2',
      email: 'ratelimit@test.braidarr.com',
      ipAddress: '127.0.0.1',
      success: false,
      attemptedAt: new Date(Date.now() - 30000) // 30 seconds ago
    }
  ]
};

// Database cleanup utility
export async function cleanDatabase(db: any): Promise<void> {
  // Clean all tables in reverse order of dependencies
  const tables = [
    'login_attempts',
    'password_resets',
    'sessions',
    'users'
  ];

  for (const table of tables) {
    await db.query(`DELETE FROM ${table}`);
  }
}

// Database seeding utility
export async function seedDatabase(db: any): Promise<void> {
  // Seed users
  for (const user of seedData.users) {
    await db.query(
      `INSERT INTO users (id, email, username, password, firstName, lastName, role, status, emailVerified, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(user)
    );
  }

  // Seed sessions
  for (const session of seedData.sessions) {
    await db.query(
      `INSERT INTO sessions (id, userId, token, expiresAt, createdAt, lastActivity)
       VALUES (?, ?, ?, ?, ?, ?)`,
      Object.values(session)
    );
  }

  // Seed password resets
  for (const reset of seedData.passwordResets) {
    await db.query(
      `INSERT INTO password_resets (id, userId, token, expiresAt, used, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      Object.values(reset)
    );
  }

  // Seed login attempts
  for (const attempt of seedData.loginAttempts) {
    await db.query(
      `INSERT INTO login_attempts (id, email, ipAddress, success, attemptedAt)
       VALUES (?, ?, ?, ?, ?)`,
      Object.values(attempt)
    );
  }
}

// Reset database to clean state
export async function resetDatabase(db: any): Promise<void> {
  await cleanDatabase(db);
  await seedDatabase(db);
}

// Helper to create test database connection
export function createTestDatabase(config: 'test' | 'memory' = 'memory'): any {
  // This would normally return a database connection
  // For now, returning config for reference
  return testDatabaseConfig[config];
}

// Transaction helpers for testing
export async function withTransaction(db: any, callback: () => Promise<void>): Promise<void> {
  await db.query('BEGIN');
  try {
    await callback();
    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

// Verification helpers
export async function verifyUserExists(db: any, email: string): Promise<boolean> {
  const result = await db.query('SELECT id FROM users WHERE email = ?', [email]);
  return result.length > 0;
}

export async function verifySessionExists(db: any, token: string): Promise<boolean> {
  const result = await db.query('SELECT id FROM sessions WHERE token = ?', [token]);
  return result.length > 0;
}

export async function getLoginAttemptCount(db: any, email: string, minutes: number = 5): Promise<number> {
  const since = new Date(Date.now() - minutes * 60000);
  const result = await db.query(
    'SELECT COUNT(*) as count FROM login_attempts WHERE email = ? AND attemptedAt > ?',
    [email, since]
  );
  return result[0].count;
}