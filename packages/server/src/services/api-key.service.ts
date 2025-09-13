import { randomBytes, createHash } from 'crypto';
import { prisma } from '../lib/prisma.js';
import { ApiKey, Prisma } from '@prisma/client';

export interface ApiKeyScope {
  resource: string;
  actions: string[];
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: ApiKeyScope[];
  expiresAt?: Date | null;
  userId: string;
}

export interface ApiKeyWithUser extends ApiKey {
  user: {
    id: string;
    email: string;
    username: string;
    isActive: boolean;
  };
}

export interface ApiKeyUsageStats {
  totalRequests: number;
  lastUsed: Date | null;
  requestsToday: number;
  requestsThisMonth: number;
}

export class ApiKeyService {
  /**
   * Generate a new API key
   */
  generateApiKey(): { key: string; keyPrefix: string; hashedKey: string } {
    // Generate 32 bytes of random data for the key
    const keyBytes = randomBytes(32);
    const key = `sk_${keyBytes.toString('hex')}`;
    
    // Create prefix for identification (first 8 characters after sk_)
    const keyPrefix = key.substring(0, 11); // sk_ + 8 chars
    
    // Hash the key for storage
    const hashedKey = createHash('sha256').update(key).digest('hex');
    
    return { key, keyPrefix, hashedKey };
  }

  /**
   * Create a new API key for a user
   */
  async createApiKey(request: CreateApiKeyRequest): Promise<{ apiKey: ApiKey; plainKey: string }> {
    const { key, keyPrefix, hashedKey } = this.generateApiKey();
    
    const apiKey = await prisma.apiKey.create({
      data: {
        name: request.name,
        key: hashedKey,
        keyPrefix,
        scopes: JSON.stringify(request.scopes),
        expiresAt: request.expiresAt || null,
        userId: request.userId,
      },
    });

    return { apiKey, plainKey: key };
  }

  /**
   * Validate an API key and return associated user information
   */
  async validateApiKey(key: string): Promise<ApiKeyWithUser | null> {
    // Hash the provided key to match against stored hash
    const hashedKey = createHash('sha256').update(key).digest('hex');
    
    const apiKey = await prisma.apiKey.findUnique({
      where: { 
        key: hashedKey,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            isActive: true,
          },
        },
      },
    });

    if (!apiKey) {
      return null;
    }

    // Check if the user is still active
    if (!apiKey.user.isActive) {
      return null;
    }

    // Check if the API key has expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      return null;
    }

    return apiKey;
  }

  /**
   * Record API key usage
   */
  async recordUsage(
    apiKeyId: string,
    endpoint: string,
    method: string,
    ipAddress: string,
    userAgent: string,
    responseCode: number
  ): Promise<void> {
    // Record the usage
    await prisma.apiKeyUsage.create({
      data: {
        apiKeyId,
        endpoint,
        method,
        ipAddress,
        userAgent,
        responseCode,
      },
    });

    // Update last used information on the API key
    await prisma.apiKey.update({
      where: { id: apiKeyId },
      data: {
        lastUsedAt: new Date(),
        lastUsedIp: ipAddress,
      },
    });
  }

  /**
   * Get all API keys for a user
   */
  async getUserApiKeys(userId: string): Promise<Omit<ApiKey, 'key'>[]> {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        lastUsedIp: true,
        isActive: true,
        expiresAt: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return apiKeys;
  }

  /**
   * Get API key by ID (for a specific user)
   */
  async getApiKey(id: string, userId: string): Promise<Omit<ApiKey, 'key'> | null> {
    const apiKey = await prisma.apiKey.findFirst({
      where: { 
        id,
        userId,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        lastUsedIp: true,
        isActive: true,
        expiresAt: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiKey;
  }

  /**
   * Update API key (name, scopes, expiration)
   */
  async updateApiKey(
    id: string,
    userId: string,
    updates: {
      name?: string;
      scopes?: ApiKeyScope[];
      expiresAt?: Date | null;
      isActive?: boolean;
    }
  ): Promise<Omit<ApiKey, 'key'> | null> {
    const updateData: Prisma.ApiKeyUpdateInput = {};
    
    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }
    if (updates.scopes !== undefined) {
      updateData.scopes = JSON.stringify(updates.scopes);
    }
    if (updates.expiresAt !== undefined) {
      updateData.expiresAt = updates.expiresAt;
    }
    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }

    try {
      const apiKey = await prisma.apiKey.update({
        where: { 
          id,
          userId,
        },
        data: updateData,
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          scopes: true,
          lastUsedAt: true,
          lastUsedIp: true,
          isActive: true,
          expiresAt: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return apiKey;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null; // Record not found
      }
      throw error;
    }
  }

  /**
   * Delete/revoke an API key
   */
  async revokeApiKey(id: string, userId: string): Promise<boolean> {
    try {
      await prisma.apiKey.delete({
        where: { 
          id,
          userId,
        },
      });
      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return false; // Record not found
      }
      throw error;
    }
  }

  /**
   * Get usage statistics for an API key
   */
  async getApiKeyUsageStats(apiKeyId: string, userId: string): Promise<ApiKeyUsageStats | null> {
    // First verify the API key belongs to the user
    const apiKey = await prisma.apiKey.findFirst({
      where: { id: apiKeyId, userId },
    });

    if (!apiKey) {
      return null;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get usage statistics
    const [totalRequests, requestsToday, requestsThisMonth, lastUsage] = await Promise.all([
      prisma.apiKeyUsage.count({
        where: { apiKeyId },
      }),
      prisma.apiKeyUsage.count({
        where: { 
          apiKeyId,
          createdAt: { gte: startOfDay },
        },
      }),
      prisma.apiKeyUsage.count({
        where: { 
          apiKeyId,
          createdAt: { gte: startOfMonth },
        },
      }),
      prisma.apiKeyUsage.findFirst({
        where: { apiKeyId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
    ]);

    return {
      totalRequests,
      lastUsed: lastUsage?.createdAt || null,
      requestsToday,
      requestsThisMonth,
    };
  }

  /**
   * Check if an API key has permission for a specific resource and action
   */
  hasPermission(apiKey: ApiKeyWithUser, resource: string, action: string): boolean {
    try {
      const scopes: ApiKeyScope[] = JSON.parse(apiKey.scopes);
      
      // Check for wildcard permission
      const wildcardScope = scopes.find(scope => scope.resource === '*');
      if (wildcardScope && (wildcardScope.actions.includes('*') || wildcardScope.actions.includes(action))) {
        return true;
      }

      // Check for specific resource permission
      const resourceScope = scopes.find(scope => scope.resource === resource);
      if (resourceScope && (resourceScope.actions.includes('*') || resourceScope.actions.includes(action))) {
        return true;
      }

      return false;
    } catch (error) {
      // If scopes are malformed, deny access
      return false;
    }
  }

  /**
   * Get available scopes and actions
   */
  getAvailableScopes(): { resource: string; actions: string[]; description: string }[] {
    return [
      {
        resource: '*',
        actions: ['*'],
        description: 'Full access to all resources and actions',
      },
      {
        resource: 'users',
        actions: ['read', 'create', 'update', 'delete'],
        description: 'User management operations',
      },
      {
        resource: 'media',
        actions: ['read', 'create', 'update', 'delete', 'scan'],
        description: 'Media library operations',
      },
      {
        resource: 'plex',
        actions: ['read', 'sync', 'auth'],
        description: 'Plex integration operations',
      },
      {
        resource: 'settings',
        actions: ['read', 'update'],
        description: 'System settings operations',
      },
      {
        resource: 'stats',
        actions: ['read'],
        description: 'System statistics and analytics',
      },
    ];
  }
}