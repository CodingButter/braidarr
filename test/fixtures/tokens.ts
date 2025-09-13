/**
 * JWT token test fixtures for authentication testing
 */

import { sign } from 'jsonwebtoken';

// Test JWT secret (different from production)
export const TEST_JWT_SECRET = 'test-secret-qa-8x2k9mNpQ3s5v8yABdEfHjMnPrTvWxZa';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  exp?: number;
  iat?: number;
}

// Generate valid token
export function generateValidToken(payload: Partial<TokenPayload> = {}): string {
  const defaultPayload: TokenPayload = {
    userId: '123',
    email: 'test@braidarr.com',
    role: 'user',
    ...payload
  };

  return sign(defaultPayload, TEST_JWT_SECRET, { expiresIn: '1h' });
}

// Generate expired token
export function generateExpiredToken(payload: Partial<TokenPayload> = {}): string {
  const expiredPayload: TokenPayload = {
    userId: '123',
    email: 'test@braidarr.com',
    role: 'user',
    ...payload
  };

  return sign(expiredPayload, TEST_JWT_SECRET, { expiresIn: '-1h' });
}

// Generate token with invalid signature
export function generateInvalidSignatureToken(payload: Partial<TokenPayload> = {}): string {
  const defaultPayload: TokenPayload = {
    userId: '123',
    email: 'test@braidarr.com',
    role: 'user',
    ...payload
  };

  return sign(defaultPayload, 'wrong-secret', { expiresIn: '1h' });
}

// Pre-generated test tokens
export const testTokens = {
  // Valid tokens
  validAdmin: generateValidToken({ role: 'admin', userId: '1', email: 'admin@test.braidarr.com' }),
  validUser: generateValidToken({ role: 'user', userId: '2', email: 'user@test.braidarr.com' }),
  validGuest: generateValidToken({ role: 'guest', userId: '3', email: 'guest@test.braidarr.com' }),

  // Expired tokens
  expired: generateExpiredToken(),
  expiredAdmin: generateExpiredToken({ role: 'admin' }),

  // Invalid tokens
  invalidSignature: generateInvalidSignatureToken(),
  malformed: 'not.a.jwt',
  empty: '',
  null: null,
  undefined: undefined,

  // Tokens with missing claims
  missingUserId: sign({ email: 'test@braidarr.com', role: 'user' }, TEST_JWT_SECRET),
  missingEmail: sign({ userId: '123', role: 'user' }, TEST_JWT_SECRET),
  missingRole: sign({ userId: '123', email: 'test@braidarr.com' }, TEST_JWT_SECRET),

  // Special case tokens
  aboutToExpire: sign(
    { userId: '123', email: 'test@braidarr.com', role: 'user' },
    TEST_JWT_SECRET,
    { expiresIn: '30s' }
  ),
  longLived: sign(
    { userId: '123', email: 'test@braidarr.com', role: 'user' },
    TEST_JWT_SECRET,
    { expiresIn: '30d' }
  )
};

// Refresh tokens
export const refreshTokens = {
  valid: generateValidToken({ userId: '123' }),
  expired: generateExpiredToken({ userId: '123' }),
  invalid: 'invalid-refresh-token',
  used: generateValidToken({ userId: '123' }), // Simulate already used token
  revoked: generateValidToken({ userId: '456' }) // Simulate revoked token
};

// Bearer token headers
export const authHeaders = {
  validAdmin: { Authorization: `Bearer ${testTokens.validAdmin}` },
  validUser: { Authorization: `Bearer ${testTokens.validUser}` },
  expired: { Authorization: `Bearer ${testTokens.expired}` },
  invalid: { Authorization: `Bearer ${testTokens.invalidSignature}` },
  malformed: { Authorization: `Bearer ${testTokens.malformed}` },
  noBearer: { Authorization: testTokens.validUser },
  empty: { Authorization: '' },
  missing: {}
};

// Helper function to decode token without verification
export function decodeToken(token: string): TokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

// Helper function to create custom token
export function createCustomToken(
  payload: Partial<TokenPayload>,
  secret: string = TEST_JWT_SECRET,
  options: any = {}
): string {
  return sign(payload, secret, { expiresIn: '1h', ...options });
}

// Token validation test cases
export const tokenValidationCases = [
  { name: 'Valid admin token', token: testTokens.validAdmin, shouldPass: true },
  { name: 'Valid user token', token: testTokens.validUser, shouldPass: true },
  { name: 'Expired token', token: testTokens.expired, shouldPass: false },
  { name: 'Invalid signature', token: testTokens.invalidSignature, shouldPass: false },
  { name: 'Malformed token', token: testTokens.malformed, shouldPass: false },
  { name: 'Empty token', token: testTokens.empty, shouldPass: false },
  { name: 'Missing userId', token: testTokens.missingUserId, shouldPass: false },
  { name: 'Missing role', token: testTokens.missingRole, shouldPass: false }
];