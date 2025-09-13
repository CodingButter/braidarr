/**
 * Plex API Client
 * Handles all interactions with the Plex API
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import {
  PlexPinResponse,
  PlexHeaders,
  PlexUser,
  PlexServer,
  PlexLibrary,
  PlexConfig,
  PlexAuthState,
} from './types.js';
import { retryWithBackoff, formatPlexError } from './utils.js';

export class PlexClient {
  private readonly authApi: AxiosInstance;
  private readonly config: PlexConfig;
  private readonly headers: PlexHeaders;
  private authToken: string | undefined;

  constructor(config?: Partial<PlexConfig>) {
    // Set default configuration
    this.config = {
      appName: config?.appName || 'Braidarr',
      appVersion: config?.appVersion || '1.0.0',
      platform: config?.platform || 'Web',
      platformVersion: config?.platformVersion || '1.0.0',
      device: config?.device || 'Browser',
      deviceName: config?.deviceName || 'Braidarr Web Client',
      deviceVendor: config?.deviceVendor || 'Braidarr',
      model: config?.model || 'Web',
      clientIdentifier: config?.clientIdentifier || uuidv4(),
    };

    // Set up headers
    this.headers = {
      'X-Plex-Product': this.config.appName,
      'X-Plex-Version': this.config.appVersion,
      'X-Plex-Client-Identifier': this.config.clientIdentifier,
      'X-Plex-Platform': this.config.platform,
      'X-Plex-Platform-Version': this.config.platformVersion,
      'X-Plex-Device': this.config.device,
      'X-Plex-Device-Name': this.config.deviceName,
      'X-Plex-Device-Vendor': this.config.deviceVendor,
      'X-Plex-Model': this.config.model,
      'Accept': 'application/json',
    };

    // Create axios instance for auth API
    this.authApi = axios.create({
      baseURL: 'https://plex.tv',
      headers: this.headers,
      timeout: 30000,
    });

    // Add response interceptor for error handling
    this.authApi.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('Plex API Error:', {
          status: error.response?.status,
          data: error.response?.data,
          message: error.message,
        });
        throw error;
      }
    );
  }

  /**
   * Set the authentication token for authenticated requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
    this.authApi.defaults.headers['X-Plex-Token'] = token;
  }

  /**
   * Clear the authentication token
   */
  clearAuthToken(): void {
    this.authToken = undefined;
    if (this.authApi.defaults.headers) {
      delete this.authApi.defaults.headers['X-Plex-Token'];
    }
  }

  /**
   * Request a PIN for authentication
   */
  async requestPin(strong: boolean = true): Promise<PlexAuthState> {
    return retryWithBackoff(async () => {
      try {
        const response = await this.authApi.post<PlexPinResponse>(
          '/api/v2/pins',
          null,
          {
            params: { strong },
          }
        );

        const { id, code, expiresAt, qr } = response.data;

        return {
          pinId: id,
          pinCode: code,
          clientIdentifier: this.config.clientIdentifier,
          expiresAt,
          qrUrl: qr,
        };
      } catch (error: any) {
        const errorMessage = formatPlexError(error);
        console.error('Failed to request PIN:', errorMessage, error);
        throw new Error(`Failed to request PIN from Plex: ${errorMessage}`);
      }
    }, { maxRetries: 2 }); // Fewer retries for PIN requests
  }

  /**
   * Check the status of a PIN authentication
   */
  async checkPin(pinId: number): Promise<{ authenticated: boolean; authToken?: string }> {
    try {
      const response = await this.authApi.get<PlexPinResponse>(
        `/api/v2/pins/${pinId}`
      );

      const { authToken } = response.data;

      if (authToken) {
        this.setAuthToken(authToken);
        return { authenticated: true, authToken };
      }

      return { authenticated: false };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // PIN has expired or is invalid
        return { authenticated: false };
      }
      console.error('Failed to check PIN status:', error);
      throw new Error('Failed to check PIN status');
    }
  }

  /**
   * Get the current user's information
   */
  async getCurrentUser(): Promise<PlexUser> {
    if (!this.authToken) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await this.authApi.get('/api/v2/user');
      return response.data;
    } catch (error) {
      console.error('Failed to get current user:', error);
      throw new Error('Failed to get user information from Plex');
    }
  }

  /**
   * Get available Plex servers for the authenticated user
   */
  async getServers(): Promise<PlexServer[]> {
    if (!this.authToken) {
      throw new Error('No authentication token available');
    }

    return retryWithBackoff(async () => {
      try {
        const response = await this.authApi.get('/api/v2/resources', {
          params: {
            includeHttps: 1,
            includeRelay: 1,
          },
        });

        // Filter only Plex Media Server resources
        const servers = response.data.filter(
          (resource: any) => resource.provides === 'server'
        );

        return servers;
      } catch (error: any) {
        const errorMessage = formatPlexError(error);
        console.error('Failed to get servers:', errorMessage, error);
        throw new Error(`Failed to get servers from Plex: ${errorMessage}`);
      }
    });
  }

  /**
   * Get libraries from a specific Plex server
   */
  async getLibraries(serverUrl: string, serverToken: string): Promise<PlexLibrary[]> {
    if (!serverUrl || !serverToken) {
      throw new Error('Server URL and token are required');
    }

    return retryWithBackoff(async () => {
      try {
        const serverApi = axios.create({
          baseURL: serverUrl.replace(/\/+$/, ''), // Remove trailing slashes
          headers: {
            ...this.headers,
            'X-Plex-Token': serverToken,
          },
          timeout: 15000,
        });

        const response = await serverApi.get('/library/sections');
        
        // Handle the MediaContainer structure
        if (response.data?.MediaContainer?.Directory) {
          return response.data.MediaContainer.Directory;
        }

        return [];
      } catch (error: any) {
        const errorMessage = formatPlexError(error);
        console.error('Failed to get libraries:', errorMessage, error);
        throw new Error(`Failed to get libraries from Plex server: ${errorMessage}`);
      }
    });
  }

  /**
   * Test connection to a Plex server
   */
  async testServerConnection(serverUrl: string, serverToken: string): Promise<{ connected: boolean; details?: any; error?: string }> {
    if (!serverUrl || !serverToken) {
      return { connected: false, error: 'Server URL and token are required' };
    }

    try {
      const serverApi = axios.create({
        baseURL: serverUrl.replace(/\/+$/, ''), // Remove trailing slashes
        headers: {
          ...this.headers,
          'X-Plex-Token': serverToken,
        },
        timeout: 10000,
      });

      const response = await serverApi.get('/identity');
      
      if (response.status === 200) {
        return { 
          connected: true, 
          details: {
            machineIdentifier: response.data?.MediaContainer?.machineIdentifier,
            version: response.data?.MediaContainer?.version,
            platform: response.data?.MediaContainer?.platform,
            platformVersion: response.data?.MediaContainer?.platformVersion
          }
        };
      }
      
      return { connected: false, error: `Server responded with status ${response.status}` };
    } catch (error: any) {
      const errorMessage = formatPlexError(error);
      console.error('Failed to test server connection:', errorMessage, error);
      return { connected: false, error: errorMessage };
    }
  }

  /**
   * Get the client identifier
   */
  getClientIdentifier(): string {
    return this.config.clientIdentifier;
  }

  /**
   * Check if client is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken;
  }
}