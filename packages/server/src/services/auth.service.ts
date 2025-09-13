import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, needsRehash } from '../lib/crypto.js';
import { 
  generateAccessToken, 
  generateRefreshToken, 
  verifyRefreshToken 
} from '../lib/jwt.js';
import { z } from 'zod';

// Validation schemas
export const RegisterSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/),
  password: z.string().min(8).max(100),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RefreshTokenInput = z.infer<typeof RefreshTokenSchema>;

export class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterInput) {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: data.email },
          { username: data.username },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === data.email) {
        throw new Error('Email already registered');
      }
      throw new Error('Username already taken');
    }

    // Hash the password
    const hashedPassword = await hashPassword(data.password);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { token: refreshToken, tokenId } = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokenId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Login a user
   */
  async login(data: LoginInput, ipAddress: string, userAgent?: string) {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    // Always run password verification to prevent timing attacks
    const validPassword = user ? await verifyPassword(user.password, data.password) : false;

    // Log login attempt
    await prisma.loginAttempt.create({
      data: {
        email: data.email,
        ipAddress,
        userAgent: userAgent || null,
        success: validPassword,
        userId: user?.id || null,
      },
    });

    if (!user || !validPassword) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account is disabled');
    }

    // Check if password needs rehashing
    if (needsRehash(user.password)) {
      const newHash = await hashPassword(data.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: newHash },
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    const { token: refreshToken, tokenId } = generateRefreshToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokenId,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string) {
    // Verify the refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: payload.tokenId },
      include: { user: true },
    });

    if (!storedToken) {
      throw new Error('Invalid refresh token');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new Error('Refresh token has expired');
    }

    if (!storedToken.user.isActive) {
      throw new Error('Account is disabled');
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
    });

    return {
      accessToken,
      user: {
        id: storedToken.user.id,
        email: storedToken.user.email,
        username: storedToken.user.username,
        firstName: storedToken.user.firstName,
        lastName: storedToken.user.lastName,
        isEmailVerified: storedToken.user.isEmailVerified,
      },
    };
  }

  /**
   * Logout a user (invalidate refresh token)
   */
  async logout(refreshToken: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      
      // Delete the refresh token
      await prisma.refreshToken.deleteMany({
        where: { token: payload.tokenId },
      });

      return { success: true };
    } catch (error) {
      // Even if token is invalid, return success
      return { success: true };
    }
  }

  /**
   * Logout all sessions for a user
   */
  async logoutAll(userId: string) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return { success: true };
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  /**
   * Clean up expired refresh tokens
   */
  async cleanupExpiredTokens() {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    return { deleted: result.count };
  }
}