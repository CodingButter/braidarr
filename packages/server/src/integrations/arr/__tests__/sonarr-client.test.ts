/**
 * Sonarr Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SonarrClient } from '../sonarr/client.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('SonarrClient', () => {
  let client: SonarrClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    client = new SonarrClient({
      baseUrl: 'http://localhost:8989',
      apiKey: 'test-api-key-1234567890',
    });

    // Mock axios create
    mockedAxios.create.mockReturnValue({
      request: vi.fn(),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    } as any);
  });

  describe('constructor', () => {
    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(SonarrClient);
      expect(client.isConfigured()).toBe(true);
    });

    it('should throw error with invalid base URL', () => {
      expect(() => {
        new SonarrClient({
          baseUrl: '',
          apiKey: 'test-api-key-1234567890',
        });
      }).toThrow('Sonarr base URL is required');
    });

    it('should throw error with invalid API key', () => {
      expect(() => {
        new SonarrClient({
          baseUrl: 'http://localhost:8989',
          apiKey: 'short',
        });
      }).toThrow('Valid Sonarr API key is required');
    });
  });

  describe('testConnection', () => {
    it('should return connected true on successful connection', async () => {
      const mockSystemStatus = {
        version: '4.0.0.123',
        instanceName: 'Sonarr',
      };

      // Mock the request method to return system status
      const mockRequest = vi.fn().mockResolvedValue(mockSystemStatus);
      (client as any).request = mockRequest;

      const result = await client.testConnection();

      expect(result.connected).toBe(true);
      expect(result.version).toBe('4.0.0.123');
      expect(result.details?.instanceName).toBe('Sonarr');
    });

    it('should return connected false on connection error', async () => {
      // Mock the request method to throw an error
      const mockRequest = vi.fn().mockRejectedValue(new Error('Connection failed'));
      (client as any).request = mockRequest;

      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('searchSeries', () => {
    it('should search for series', async () => {
      const mockSearchResults = [
        {
          title: 'Breaking Bad',
          year: 2008,
          tvdbId: 81189,
          imdbId: 'tt0903747',
        },
      ];

      const mockRequest = vi.fn().mockResolvedValue(mockSearchResults);
      (client as any).request = mockRequest;

      const results = await client.searchSeries('Breaking Bad');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v3/series/lookup',
        params: { term: 'Breaking Bad' },
      });
      expect(results).toEqual(mockSearchResults);
    });
  });

  describe('getSeries', () => {
    it('should get all series', async () => {
      const mockSeries = [
        {
          id: 1,
          title: 'Breaking Bad',
          monitored: true,
        },
      ];

      const mockRequest = vi.fn().mockResolvedValue(mockSeries);
      (client as any).request = mockRequest;

      const results = await client.getSeries();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v3/series',
        params: { includeSeasonImages: false },
      });
      expect(results).toEqual(mockSeries);
    });
  });

  describe('addSeries', () => {
    it('should add a new series', async () => {
      const mockAddedSeries = {
        id: 1,
        title: 'Breaking Bad',
        tvdbId: 81189,
        monitored: true,
      };

      const mockRequest = vi.fn().mockResolvedValue(mockAddedSeries);
      (client as any).request = mockRequest;

      const options = {
        tvdbId: 81189,
        title: 'Breaking Bad',
        titleSlug: 'breaking-bad',
        qualityProfileId: 1,
        rootFolderPath: '/tv',
      };

      const result = await client.addSeries(options);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v3/series',
        data: expect.objectContaining({
          tvdbId: 81189,
          title: 'Breaking Bad',
          titleSlug: 'breaking-bad',
          qualityProfileId: 1,
          rootFolderPath: '/tv',
          monitored: true,
          seasonFolder: true,
          seriesType: 'standard',
        }),
      });
      expect(result).toEqual(mockAddedSeries);
    });
  });

  describe('getQualityProfiles', () => {
    it('should get quality profiles', async () => {
      const mockProfiles = [
        {
          id: 1,
          name: 'HD-1080p',
          upgradeAllowed: true,
        },
      ];

      const mockRequest = vi.fn().mockResolvedValue(mockProfiles);
      (client as any).request = mockRequest;

      const results = await client.getQualityProfiles();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v3/qualityprofile',
      });
      expect(results).toEqual(mockProfiles);
    });
  });

  describe('getRootFolders', () => {
    it('should get root folders', async () => {
      const mockFolders = [
        {
          id: 1,
          path: '/tv',
          accessible: true,
          freeSpace: 1000000000,
        },
      ];

      const mockRequest = vi.fn().mockResolvedValue(mockFolders);
      (client as any).request = mockRequest;

      const results = await client.getRootFolders();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v3/rootfolder',
      });
      expect(results).toEqual(mockFolders);
    });
  });
});