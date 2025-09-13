/**
 * Plex Client Tests
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import axios from 'axios';
import { PlexClient } from '../client.js';
import type { PlexPinResponse } from '../types.js';

// Mock axios
vi.mock('axios');

describe('PlexClient', () => {
  let client: PlexClient;

  beforeEach(() => {
    // Setup default mock for axios.create
    const mockAxiosInstance = {
      post: vi.fn(),
      get: vi.fn(),
      defaults: { headers: {} as any },
      interceptors: {
        response: {
          use: vi.fn(),
        },
      },
    };
    
    (axios.create as any) = vi.fn(() => mockAxiosInstance);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('requestPin', () => {
    it('should request a PIN successfully', async () => {
      const mockPinResponse: PlexPinResponse = {
        id: 123456,
        code: 'ABCD',
        product: 'Plex Web',
        trusted: false,
        qr: 'https://plex.tv/api/v2/pins/123456/qr',
        clientIdentifier: 'test-client-id',
        location: {
          code: 'US',
          european_union: false,
          continent_code: 'NA',
          country: 'United States',
          city: 'New York',
          time_zone: 'America/New_York',
          postal_code: '10001',
          in_privacy_restricted_country: false,
          subdivisions: 'NY',
          coordinates: '40.7128,-74.0060',
        },
        expiresIn: 900,
        createdAt: '2025-09-12T10:00:00Z',
        expiresAt: '2025-09-12T10:15:00Z',
        authToken: null,
        newRegistration: null,
      };

      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue({ data: mockPinResponse }),
        get: vi.fn(),
        defaults: { headers: {} as any },
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      (axios.create as any).mockReturnValue(mockAxiosInstance);
      client = new PlexClient();

      const result = await client.requestPin(true);

      expect(result).toEqual({
        pinId: 123456,
        pinCode: 'ABCD',
        clientIdentifier: expect.any(String),
        expiresAt: '2025-09-12T10:15:00Z',
        qrUrl: 'https://plex.tv/api/v2/pins/123456/qr',
      });

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/api/v2/pins',
        null,
        { params: { strong: true } }
      );
    });

    it('should handle request PIN failure', async () => {
      const mockAxiosInstance = {
        post: vi.fn().mockRejectedValue(new Error('Network error')),
        get: vi.fn(),
        defaults: { headers: {} as any },
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      (axios.create as any).mockReturnValue(mockAxiosInstance);
      client = new PlexClient();

      await expect(client.requestPin()).rejects.toThrow(
        'Failed to request PIN from Plex'
      );
    });
  });

  describe('checkPin', () => {
    it('should return authenticated true when token is received', async () => {
      const mockPinResponse: PlexPinResponse = {
        id: 123456,
        code: 'ABCD',
        product: 'Plex Web',
        trusted: false,
        qr: 'https://plex.tv/api/v2/pins/123456/qr',
        clientIdentifier: 'test-client-id',
        location: {
          code: 'US',
          european_union: false,
          continent_code: 'NA',
          country: 'United States',
          city: 'New York',
          time_zone: 'America/New_York',
          postal_code: '10001',
          in_privacy_restricted_country: false,
          subdivisions: 'NY',
          coordinates: '40.7128,-74.0060',
        },
        expiresIn: 900,
        createdAt: '2025-09-12T10:00:00Z',
        expiresAt: '2025-09-12T10:15:00Z',
        authToken: 'test-auth-token',
        newRegistration: false,
      };

      const mockAxiosInstance = {
        post: vi.fn(),
        get: vi.fn().mockResolvedValue({ data: mockPinResponse }),
        defaults: { headers: {} as any },
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      (axios.create as any).mockReturnValue(mockAxiosInstance);
      client = new PlexClient();

      const result = await client.checkPin(123456);

      expect(result).toEqual({
        authenticated: true,
        authToken: 'test-auth-token',
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/api/v2/pins/123456');
    });

    it('should return authenticated false when no token', async () => {
      const mockPinResponse: PlexPinResponse = {
        id: 123456,
        code: 'ABCD',
        product: 'Plex Web',
        trusted: false,
        qr: 'https://plex.tv/api/v2/pins/123456/qr',
        clientIdentifier: 'test-client-id',
        location: {
          code: 'US',
          european_union: false,
          continent_code: 'NA',
          country: 'United States',
          city: 'New York',
          time_zone: 'America/New_York',
          postal_code: '10001',
          in_privacy_restricted_country: false,
          subdivisions: 'NY',
          coordinates: '40.7128,-74.0060',
        },
        expiresIn: 900,
        createdAt: '2025-09-12T10:00:00Z',
        expiresAt: '2025-09-12T10:15:00Z',
        authToken: null,
        newRegistration: null,
      };

      const mockAxiosInstance = {
        post: vi.fn(),
        get: vi.fn().mockResolvedValue({ data: mockPinResponse }),
        defaults: { headers: {} as any },
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      (axios.create as any).mockReturnValue(mockAxiosInstance);
      client = new PlexClient();

      const result = await client.checkPin(123456);

      expect(result).toEqual({
        authenticated: false,
      });
    });

    it('should handle 404 error gracefully', async () => {
      const error = {
        isAxiosError: true,
        response: { status: 404 },
      };

      const mockAxiosInstance = {
        post: vi.fn(),
        get: vi.fn().mockRejectedValue(error),
        defaults: { headers: {} as any },
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      (axios.create as any).mockReturnValue(mockAxiosInstance);
      (axios.isAxiosError as any) = vi.fn().mockReturnValue(true);
      client = new PlexClient();

      const result = await client.checkPin(123456);

      expect(result).toEqual({
        authenticated: false,
      });
    });
  });

  describe('Authentication', () => {
    it('should set and clear auth token', () => {
      const mockAxiosInstance = {
        post: vi.fn(),
        get: vi.fn(),
        defaults: { headers: {} as any },
        interceptors: {
          response: {
            use: vi.fn(),
          },
        },
      };

      (axios.create as any).mockReturnValue(mockAxiosInstance);
      client = new PlexClient();

      // Initially not authenticated
      expect(client.isAuthenticated()).toBe(false);

      // Set auth token
      client.setAuthToken('test-token');
      expect(client.isAuthenticated()).toBe(true);
      expect(mockAxiosInstance.defaults.headers['X-Plex-Token']).toBe('test-token');

      // Clear auth token
      client.clearAuthToken();
      expect(client.isAuthenticated()).toBe(false);
      expect(mockAxiosInstance.defaults.headers['X-Plex-Token']).toBeUndefined();
    });
  });

  describe('Client Identifier', () => {
    it('should generate a unique client identifier', () => {
      const client1 = new PlexClient();
      const client2 = new PlexClient();

      const id1 = client1.getClientIdentifier();
      const id2 = client2.getClientIdentifier();

      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });

    it('should use provided client identifier', () => {
      const customId = 'custom-client-id';
      const customClient = new PlexClient({ clientIdentifier: customId });

      expect(customClient.getClientIdentifier()).toBe(customId);
    });
  });
});