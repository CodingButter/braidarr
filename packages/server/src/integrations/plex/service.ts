/**
 * Plex Service
 * Higher-level service for managing Plex authentication and operations
 */

import { PlexClient } from './client.js';
import {
  PlexAuthState,
  PlexUser,
  PlexServer,
  PlexLibrary,
  PlexConfig,
} from './types.js';

interface PinAuthSession {
  authState: PlexAuthState;
  client: PlexClient;
  createdAt: Date;
  lastChecked?: Date;
  attempts: number;
}

export class PlexService {
  private activeSessions: Map<string, PinAuthSession> = new Map();
  private readonly maxAttempts = 300; // 5 minutes with 1 second polling
  private readonly sessionTimeout = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // Clean up expired sessions periodically
    setInterval(() => this.cleanupExpiredSessions(), 60000); // Every minute
  }

  /**
   * Initialize PIN authentication flow
   */
  async initiatePinAuth(config?: Partial<PlexConfig>): Promise<PlexAuthState> {
    const client = new PlexClient(config);
    const authState = await client.requestPin(true);

    // Store the session
    const sessionId = authState.clientIdentifier;
    this.activeSessions.set(sessionId, {
      authState,
      client,
      createdAt: new Date(),
      attempts: 0,
    });

    return authState;
  }

  /**
   * Check PIN authentication status
   */
  async checkPinStatus(
    clientIdentifier: string,
    pinId: number
  ): Promise<{ authenticated: boolean; authToken?: string; user?: PlexUser }> {
    const session = this.activeSessions.get(clientIdentifier);
    
    if (!session) {
      throw new Error('Invalid or expired authentication session');
    }

    // Check if session has expired
    const now = new Date();
    const sessionAge = now.getTime() - session.createdAt.getTime();
    if (sessionAge > this.sessionTimeout) {
      this.activeSessions.delete(clientIdentifier);
      throw new Error('Authentication session has expired');
    }

    // Check if we've exceeded max attempts
    session.attempts++;
    if (session.attempts > this.maxAttempts) {
      this.activeSessions.delete(clientIdentifier);
      throw new Error('Maximum authentication attempts exceeded');
    }

    session.lastChecked = now;

    // Check PIN status
    const result = await session.client.checkPin(pinId);

    if (result.authenticated && result.authToken) {
      // Get user information
      const user = await session.client.getCurrentUser();
      
      // Clean up the session as it's no longer needed
      this.activeSessions.delete(clientIdentifier);

      return {
        authenticated: true,
        authToken: result.authToken,
        user,
      };
    }

    return { authenticated: false };
  }

  /**
   * Cancel PIN authentication
   */
  cancelPinAuth(clientIdentifier: string): boolean {
    return this.activeSessions.delete(clientIdentifier);
  }

  /**
   * Get Plex servers for authenticated user
   */
  async getServers(authToken: string): Promise<PlexServer[]> {
    const client = new PlexClient();
    client.setAuthToken(authToken);
    return client.getServers();
  }

  /**
   * Get libraries from a Plex server
   */
  async getServerLibraries(
    serverUrl: string,
    serverToken: string
  ): Promise<PlexLibrary[]> {
    const client = new PlexClient();
    return client.getLibraries(serverUrl, serverToken);
  }

  /**
   * Test connection to a Plex server
   */
  async testServerConnection(
    serverUrl: string,
    serverToken: string
  ): Promise<{ connected: boolean; details?: any; error?: string }> {
    const client = new PlexClient();
    return client.testServerConnection(serverUrl, serverToken);
  }

  /**
   * Validate an authentication token
   */
  async validateToken(authToken: string): Promise<{ valid: boolean; user?: PlexUser }> {
    try {
      const client = new PlexClient();
      client.setAuthToken(authToken);
      const user = await client.getCurrentUser();
      return { valid: true, user };
    } catch (error) {
      return { valid: false };
    }
  }

  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date().getTime();
    const expiredSessions: string[] = [];

    this.activeSessions.forEach((session, id) => {
      const sessionAge = now - session.createdAt.getTime();
      if (sessionAge > this.sessionTimeout) {
        expiredSessions.push(id);
      }
    });

    expiredSessions.forEach((id) => {
      this.activeSessions.delete(id);
    });

    if (expiredSessions.length > 0) {
      console.log(`Cleaned up ${expiredSessions.length} expired Plex auth sessions`);
    }
  }

  /**
   * Get active session count (for monitoring)
   */
  getActiveSessionCount(): number {
    return this.activeSessions.size;
  }
}

// Export singleton instance
export const plexService = new PlexService();