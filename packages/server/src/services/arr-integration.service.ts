/**
 * Arr Integration Service
 * Manages Arr application integrations and provides high-level operations
 */

import { SonarrClient } from '../integrations/arr/sonarr/client.js';
import { RadarrClient } from '../integrations/arr/radarr/client.js';
import { ProwlarrClient } from '../integrations/arr/prowlarr/client.js';
import { QBittorrentClient } from '../integrations/download-clients/qbittorrent/client.js';
import type { 
  ArrConfig, 
  ArrConnectionTest,
  SonarrSeries,
  RadarrMovie,
  ProwlarrIndexer,
} from '../integrations/arr/shared/types.js';
import type { 
  DownloadClientConfig, 
  DownloadClientConnectionTest,
  Torrent,
} from '../integrations/download-clients/shared/types.js';

export interface ArrInstanceConfig {
  id: string;
  name: string;
  type: 'SONARR' | 'RADARR' | 'PROWLARR' | 'LIDARR' | 'READARR' | 'WHISPARR';
  baseUrl: string;
  apiKey: string;
  isEnabled: boolean;
  settings?: Record<string, any>;
}

export interface DownloadClientInstanceConfig {
  id: string;
  name: string;
  type: 'QBITTORRENT' | 'TRANSMISSION' | 'DELUGE' | 'RTORRENT' | 'UTORRENT' | 'SABNZBD' | 'NZBGET';
  host: string;
  port: number;
  username?: string;
  password?: string;
  category?: string;
  priority: number;
  isEnabled: boolean;
  settings?: Record<string, any>;
}

export interface MediaSearchOptions {
  query: string;
  year?: number;
  type: 'movie' | 'tv';
  tmdbId?: number;
  tvdbId?: number;
  imdbId?: string;
}

export interface MediaAddOptions {
  title: string;
  year?: number;
  qualityProfileId: number;
  rootFolderPath: string;
  monitored?: boolean;
  searchOnAdd?: boolean;
  tags?: number[];
}

export class ArrIntegrationService {
  private arrClients: Map<string, SonarrClient | RadarrClient | ProwlarrClient> = new Map();
  private downloadClients: Map<string, QBittorrentClient> = new Map();

  /**
   * Initialize arr client
   */
  initializeArrClient(config: ArrInstanceConfig): void {
    const clientConfig: ArrConfig = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
    };

    let client;
    switch (config.type) {
      case 'SONARR':
        client = new SonarrClient(clientConfig);
        break;
      case 'RADARR':
        client = new RadarrClient(clientConfig);
        break;
      case 'PROWLARR':
        client = new ProwlarrClient(clientConfig);
        break;
      default:
        throw new Error(`Unsupported arr type: ${config.type}`);
    }

    this.arrClients.set(config.id, client);
  }

  /**
   * Initialize download client
   */
  initializeDownloadClient(config: DownloadClientInstanceConfig): void {
    const clientConfig: DownloadClientConfig = {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    };

    let client;
    switch (config.type) {
      case 'QBITTORRENT':
        client = new QBittorrentClient(clientConfig);
        break;
      default:
        throw new Error(`Unsupported download client type: ${config.type}`);
    }

    this.downloadClients.set(config.id, client);
  }

  /**
   * Test arr instance connection
   */
  async testArrConnection(config: ArrInstanceConfig): Promise<ArrConnectionTest> {
    const clientConfig: ArrConfig = {
      baseUrl: config.baseUrl,
      apiKey: config.apiKey,
    };

    let client;
    switch (config.type) {
      case 'SONARR':
        client = new SonarrClient(clientConfig);
        break;
      case 'RADARR':
        client = new RadarrClient(clientConfig);
        break;
      case 'PROWLARR':
        client = new ProwlarrClient(clientConfig);
        break;
      default:
        throw new Error(`Unsupported arr type: ${config.type}`);
    }

    return client.testConnection();
  }

  /**
   * Test download client connection
   */
  async testDownloadClientConnection(config: DownloadClientInstanceConfig): Promise<DownloadClientConnectionTest> {
    const clientConfig: DownloadClientConfig = {
      host: config.host,
      port: config.port,
      username: config.username,
      password: config.password,
    };

    let client;
    switch (config.type) {
      case 'QBITTORRENT':
        client = new QBittorrentClient(clientConfig);
        break;
      default:
        throw new Error(`Unsupported download client type: ${config.type}`);
    }

    return client.testConnection();
  }

  /**
   * Search for media across all enabled arr instances
   */
  async searchMedia(options: MediaSearchOptions): Promise<{
    movies: any[];
    series: any[];
  }> {
    const results = {
      movies: [] as any[],
      series: [] as any[],
    };

    for (const [instanceId, client] of this.arrClients) {
      try {
        if (client instanceof SonarrClient && (options.type === 'tv' || !options.type)) {
          const series = await client.searchSeries(options.query);
          results.series.push(...series.map(s => ({ ...s, sourceInstanceId: instanceId })));
        }

        if (client instanceof RadarrClient && (options.type === 'movie' || !options.type)) {
          const movies = await client.searchMovies(options.query);
          results.movies.push(...movies.map(m => ({ ...m, sourceInstanceId: instanceId })));
        }
      } catch (error) {
        console.error(`Error searching ${instanceId}:`, error);
      }
    }

    return results;
  }

  /**
   * Add series to Sonarr
   */
  async addSeries(instanceId: string, options: MediaAddOptions & {
    tvdbId: number;
    titleSlug: string;
    languageProfileId?: number;
    seriesType?: 'standard' | 'daily' | 'anime';
  }): Promise<SonarrSeries> {
    const client = this.arrClients.get(instanceId);
    
    if (!client || !(client instanceof SonarrClient)) {
      throw new Error(`Sonarr instance ${instanceId} not found or not configured`);
    }

    return client.addSeries({
      tvdbId: options.tvdbId,
      title: options.title,
      titleSlug: options.titleSlug,
      qualityProfileId: options.qualityProfileId,
      languageProfileId: options.languageProfileId || 1,
      rootFolderPath: options.rootFolderPath,
      monitored: options.monitored !== false,
      searchForMissingEpisodes: options.searchOnAdd !== false,
      seriesType: options.seriesType || 'standard',
      tags: options.tags || [],
    });
  }

  /**
   * Add movie to Radarr
   */
  async addMovie(instanceId: string, options: MediaAddOptions & {
    tmdbId: number;
    titleSlug: string;
    minimumAvailability?: 'tba' | 'announced' | 'inCinemas' | 'released';
  }): Promise<RadarrMovie> {
    const client = this.arrClients.get(instanceId);
    
    if (!client || !(client instanceof RadarrClient)) {
      throw new Error(`Radarr instance ${instanceId} not found or not configured`);
    }

    return client.addMovie({
      tmdbId: options.tmdbId,
      title: options.title,
      titleSlug: options.titleSlug,
      qualityProfileId: options.qualityProfileId,
      rootFolderPath: options.rootFolderPath,
      monitored: options.monitored !== false,
      searchForMovie: options.searchOnAdd !== false,
      minimumAvailability: options.minimumAvailability || 'announced',
      tags: options.tags || [],
    });
  }

  /**
   * Get quality profiles from arr instance
   */
  async getQualityProfiles(instanceId: string): Promise<any[]> {
    const client = this.arrClients.get(instanceId);
    
    if (!client) {
      throw new Error(`Arr instance ${instanceId} not found or not configured`);
    }

    return client.getQualityProfiles();
  }

  /**
   * Get root folders from arr instance
   */
  async getRootFolders(instanceId: string): Promise<any[]> {
    const client = this.arrClients.get(instanceId);
    
    if (!client) {
      throw new Error(`Arr instance ${instanceId} not found or not configured`);
    }

    return client.getRootFolders();
  }

  /**
   * Get tags from arr instance
   */
  async getTags(instanceId: string): Promise<any[]> {
    const client = this.arrClients.get(instanceId);
    
    if (!client) {
      throw new Error(`Arr instance ${instanceId} not found or not configured`);
    }

    return client.getTags();
  }

  /**
   * Get indexers from Prowlarr
   */
  async getIndexers(prowlarrInstanceId: string): Promise<ProwlarrIndexer[]> {
    const client = this.arrClients.get(prowlarrInstanceId);
    
    if (!client || !(client instanceof ProwlarrClient)) {
      throw new Error(`Prowlarr instance ${prowlarrInstanceId} not found or not configured`);
    }

    return client.getIndexers();
  }

  /**
   * Search indexers via Prowlarr
   */
  async searchIndexers(prowlarrInstanceId: string, options: {
    query?: string;
    categories?: number[];
    indexerIds?: number[];
  }): Promise<any[]> {
    const client = this.arrClients.get(prowlarrInstanceId);
    
    if (!client || !(client instanceof ProwlarrClient)) {
      throw new Error(`Prowlarr instance ${prowlarrInstanceId} not found or not configured`);
    }

    return client.search(options);
  }

  /**
   * Get torrents from download client
   */
  async getTorrents(clientId: string): Promise<Torrent[]> {
    const client = this.downloadClients.get(clientId);
    
    if (!client) {
      throw new Error(`Download client ${clientId} not found or not configured`);
    }

    return client.getTorrents();
  }

  /**
   * Add torrent to download client
   */
  async addTorrent(clientId: string, options: {
    urls?: string[];
    torrents?: Buffer[];
    savePath?: string;
    category?: string;
    tags?: string[];
    paused?: boolean;
  }): Promise<void> {
    const client = this.downloadClients.get(clientId);
    
    if (!client) {
      throw new Error(`Download client ${clientId} not found or not configured`);
    }

    return client.addTorrent(options);
  }

  /**
   * Get system status from arr instance
   */
  async getSystemStatus(instanceId: string): Promise<any> {
    const client = this.arrClients.get(instanceId);
    
    if (!client) {
      throw new Error(`Arr instance ${instanceId} not found or not configured`);
    }

    return client.getSystemStatus();
  }

  /**
   * Get health status from arr instance
   */
  async getHealthStatus(instanceId: string): Promise<any[]> {
    const client = this.arrClients.get(instanceId);
    
    if (!client) {
      throw new Error(`Arr instance ${instanceId} not found or not configured`);
    }

    return client.getHealth();
  }

  /**
   * Remove arr client
   */
  removeArrClient(instanceId: string): void {
    this.arrClients.delete(instanceId);
  }

  /**
   * Remove download client
   */
  removeDownloadClient(clientId: string): void {
    this.downloadClients.delete(clientId);
  }

  /**
   * Get all configured arr instances
   */
  getConfiguredArrInstances(): string[] {
    return Array.from(this.arrClients.keys());
  }

  /**
   * Get all configured download clients
   */
  getConfiguredDownloadClients(): string[] {
    return Array.from(this.downloadClients.keys());
  }

  /**
   * Check if arr instance is configured
   */
  isArrInstanceConfigured(instanceId: string): boolean {
    return this.arrClients.has(instanceId);
  }

  /**
   * Check if download client is configured
   */
  isDownloadClientConfigured(clientId: string): boolean {
    return this.downloadClients.has(clientId);
  }
}