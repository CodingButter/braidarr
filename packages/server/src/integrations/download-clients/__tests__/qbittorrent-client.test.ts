/**
 * qBittorrent Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { QBittorrentClient } from '../qbittorrent/client.js';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = vi.mocked(axios);

describe('QBittorrentClient', () => {
  let client: QBittorrentClient;

  beforeEach(() => {
    vi.clearAllMocks();
    
    client = new QBittorrentClient({
      host: 'localhost',
      port: 8080,
      username: 'admin',
      password: 'adminpass',
    });

    // Mock axios create
    mockedAxios.create.mockReturnValue({
      request: vi.fn(),
      defaults: {
        baseURL: 'http://localhost:8080',
        headers: {},
      },
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
    } as any);
  });

  describe('constructor', () => {
    it('should create client with valid config', () => {
      expect(client).toBeInstanceOf(QBittorrentClient);
      expect(client.isConfigured()).toBe(true);
    });

    it('should throw error with missing host', () => {
      expect(() => {
        new QBittorrentClient({
          host: '',
          port: 8080,
        });
      }).toThrow('qBittorrent host is required');
    });

    it('should throw error with missing port', () => {
      expect(() => {
        new QBittorrentClient({
          host: 'localhost',
          port: 0,
        });
      }).toThrow('qBittorrent port is required');
    });
  });

  describe('testConnection', () => {
    it('should return connected true on successful connection', async () => {
      const mockVersion = '4.6.0';
      const mockApiVersion = '2.9.3';

      // Mock the getVersion and getApiVersion methods
      vi.spyOn(client, 'getVersion').mockResolvedValue(mockVersion);
      vi.spyOn(client, 'getApiVersion').mockResolvedValue(mockApiVersion);

      const result = await client.testConnection();

      expect(result.connected).toBe(true);
      expect(result.version).toBe(mockVersion);
      expect(result.details?.apiVersion).toBe(mockApiVersion);
      expect(result.details?.client).toBe('qBittorrent');
    });

    it('should return connected false on connection error', async () => {
      // Mock the getVersion method to throw an error
      vi.spyOn(client, 'getVersion').mockRejectedValue(new Error('Connection failed'));

      const result = await client.testConnection();

      expect(result.connected).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('getTorrents', () => {
    it('should get all torrents', async () => {
      const mockTorrents = [
        {
          hash: 'abc123',
          name: 'Test Torrent',
          size: 1000000,
          progress: 0.5,
          state: 'downloading',
          dlspeed: 1000,
          upspeed: 500,
        },
      ];

      const mockRequest = vi.fn().mockResolvedValue(mockTorrents);
      (client as any).request = mockRequest;

      const results = await client.getTorrents();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v2/torrents/info',
        params: {},
      });
      expect(results).toHaveLength(1);
      expect(results[0].hash).toBe('abc123');
      expect(results[0].name).toBe('Test Torrent');
    });

    it('should filter torrents by state', async () => {
      const mockTorrents = [];
      const mockRequest = vi.fn().mockResolvedValue(mockTorrents);
      (client as any).request = mockRequest;

      await client.getTorrents({ state: ['downloading', 'seeding'] });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v2/torrents/info',
        params: {
          filter: 'downloading|seeding',
        },
      });
    });

    it('should filter torrents by hash', async () => {
      const mockTorrents = [];
      const mockRequest = vi.fn().mockResolvedValue(mockTorrents);
      (client as any).request = mockRequest;

      await client.getTorrents({ hashes: ['abc123', 'def456'] });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v2/torrents/info',
        params: {
          hashes: 'abc123|def456',
        },
      });
    });
  });

  describe('addTorrent', () => {
    it('should add torrent from URL', async () => {
      const mockRequest = vi.fn().mockResolvedValue(undefined);
      (client as any).request = mockRequest;

      await client.addTorrent({
        urls: ['magnet:?xt=urn:btih:abc123'],
        savePath: '/downloads',
        category: 'movies',
      });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v2/torrents/add',
        data: expect.any(FormData),
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    });
  });

  describe('deleteTorrents', () => {
    it('should delete torrents', async () => {
      const mockRequest = vi.fn().mockResolvedValue(undefined);
      (client as any).request = mockRequest;

      await client.deleteTorrents(['abc123', 'def456'], true);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v2/torrents/delete',
        data: expect.any(URLSearchParams),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    });
  });

  describe('pauseTorrents', () => {
    it('should pause torrents', async () => {
      const mockRequest = vi.fn().mockResolvedValue(undefined);
      (client as any).request = mockRequest;

      await client.pauseTorrents(['abc123']);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v2/torrents/pause',
        data: expect.any(URLSearchParams),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    });
  });

  describe('resumeTorrents', () => {
    it('should resume torrents', async () => {
      const mockRequest = vi.fn().mockResolvedValue(undefined);
      (client as any).request = mockRequest;

      await client.resumeTorrents(['abc123']);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v2/torrents/resume',
        data: expect.any(URLSearchParams),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    });
  });

  describe('getCategories', () => {
    it('should get categories', async () => {
      const mockCategories = {
        movies: { name: 'movies', savePath: '/movies' },
        tv: { name: 'tv', savePath: '/tv' },
      };

      const mockRequest = vi.fn().mockResolvedValue(mockCategories);
      (client as any).request = mockRequest;

      const results = await client.getCategories();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v2/torrents/categories',
      });
      expect(results).toEqual(mockCategories);
    });
  });

  describe('createCategory', () => {
    it('should create category', async () => {
      const mockRequest = vi.fn().mockResolvedValue(undefined);
      (client as any).request = mockRequest;

      await client.createCategory('anime', '/anime');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/api/v2/torrents/createCategory',
        data: expect.any(URLSearchParams),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });
    });
  });

  describe('getGlobalTransferInfo', () => {
    it('should get global transfer info', async () => {
      const mockTransferInfo = {
        dl_info_speed: 1000,
        up_info_speed: 500,
        dl_info_data: 2000000,
        up_info_data: 1000000,
        alltime_dl: 10000000,
        alltime_ul: 5000000,
      };

      const mockRequest = vi.fn().mockResolvedValue(mockTransferInfo);
      (client as any).request = mockRequest;

      const results = await client.getGlobalTransferInfo();

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/api/v2/transfer/info',
      });
      expect(results.downloadSpeed).toBe(1000);
      expect(results.uploadSpeed).toBe(500);
      expect(results.allTimeDownloaded).toBe(10000000);
      expect(results.allTimeUploaded).toBe(5000000);
    });
  });
});