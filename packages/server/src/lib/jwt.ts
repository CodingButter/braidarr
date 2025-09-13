import jwt, { SignOptions } from 'jsonwebtoken';
import { randomBytes } from 'crypto';

interface TokenPayload {
  userId: string;
  email: string;
  username: string;
}

interface RefreshTokenPayload extends TokenPayload {
  tokenId: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-jwt-refresh-secret';
const JWT_ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const JWT_REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY || '7d';

/**
 * Generate an access token
 * @param payload - The token payload
 * @returns The signed JWT access token
 */
export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_ACCESS_EXPIRY,
    issuer: 'braidarr',
    audience: 'braidarr-client',
  } as SignOptions);
}

/**
 * Generate a refresh token
 * @param payload - The token payload
 * @returns The signed JWT refresh token and token ID
 */
export function generateRefreshToken(payload: TokenPayload): {
  token: string;
  tokenId: string;
} {
  const tokenId = randomBytes(32).toString('hex');
  const refreshPayload: RefreshTokenPayload = {
    ...payload,
    tokenId,
  };

  const token = jwt.sign(refreshPayload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRY,
    issuer: 'braidarr',
    audience: 'braidarr-client',
  } as SignOptions);

  return { token, tokenId };
}

/**
 * Verify an access token
 * @param token - The JWT token to verify
 * @returns The decoded token payload
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'braidarr',
      audience: 'braidarr-client',
    }) as jwt.JwtPayload & TokenPayload;

    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Access token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid access token');
    }
    throw error;
  }
}

/**
 * Verify a refresh token
 * @param token - The JWT refresh token to verify
 * @returns The decoded token payload
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'braidarr',
      audience: 'braidarr-client',
    }) as jwt.JwtPayload & RefreshTokenPayload;

    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
      tokenId: decoded.tokenId,
    };
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode a token without verification (for debugging)
 * @param token - The JWT token to decode
 * @returns The decoded token payload or null
 */
export function decodeToken(token: string): jwt.JwtPayload | null {
  return jwt.decode(token) as jwt.JwtPayload | null;
}