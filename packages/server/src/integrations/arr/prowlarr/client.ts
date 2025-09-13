/**
 * Prowlarr API Client
 * Handles all interactions with Prowlarr for indexer management
 */

import { BaseArrClient } from '../shared/base-client.js';
import { ArrConfig, ProwlarrIndexer, ProwlarrApplication } from '../shared/types.js';

export interface ProwlarrIndexerTestOptions {
  indexer: any;
  forceTest?: boolean;
}

export interface ProwlarrSyncOptions {
  applicationIds?: number[];
  indexerIds?: number[];
}

export interface ProwlarrStatsOptions {
  startDate?: string;
  endDate?: string;
  indexerIds?: number[];
  applicationIds?: number[];
}

export interface ProwlarrSearchOptions {
  query?: string;
  indexerIds?: number[];
  categories?: number[];
  type?: 'search' | 'tvsearch' | 'movie' | 'music' | 'book';
  offset?: number;
  limit?: number;
  
  // TV Search specific
  tvdbId?: number;
  season?: number;
  episode?: number;
  
  // Movie Search specific
  tmdbId?: number;
  imdbId?: string;
  year?: number;
  
  // Music Search specific
  artist?: string;
  album?: string;
  track?: string;
  year?: number;
  
  // Book Search specific
  author?: string;
  title?: string;
}

export interface ProwlarrSearchResult {
  guid: string;
  age: number;
  ageHours: number;
  ageMinutes: number;
  size: number;
  files: number;
  grabs: number;
  indexer: string;
  indexerId: number;
  indexerFlags: string[];
  indexerPriority: number;
  downloadUrl: string;
  infoUrl: string;
  title: string;
  sortTitle: string;
  categories: number[];
  seeders?: number;
  leechers?: number;
  protocol: 'torrent' | 'usenet';
  publishDate: string;
  commentUrl?: string;
  downloadVolumeFactor: number;
  uploadVolumeFactor: number;
  magnetUrl?: string;
  infoHash?: string;
  imdbId?: number;
  tmdbId?: number;
  tvdbId?: number;
  tvMazeId?: number;
}

export interface ProwlarrApplicationSync {
  id: number;
  name: string;
  syncProfile: {
    id: number;
    name: string;
  };
  tags: number[];
}

export interface ProwlarrNotification {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  infoLink: string;
  fields: any[];
  tags: number[];
  onGrab: boolean;
  onHealthIssue: boolean;
  onApplicationUpdate: boolean;
  includeHealthWarnings: boolean;
}

export interface ProwlarrSyncProfile {
  id: number;
  name: string;
  enableRss: boolean;
  enableAutomaticSearch: boolean;
  enableInteractiveSearch: boolean;
  minimumSeeders: number;
}

export class ProwlarrClient extends BaseArrClient {
  constructor(config: ArrConfig) {
    super(config, 'Prowlarr');
  }

  /**
   * Get all indexers
   */
  async getIndexers(): Promise<ProwlarrIndexer[]> {
    return this.request({
      method: 'GET',
      url: '/api/v1/indexer',
    });
  }

  /**
   * Get indexer by ID
   */
  async getIndexerById(id: number): Promise<ProwlarrIndexer> {
    return this.request({
      method: 'GET',
      url: `/api/v1/indexer/${id}`,
    });
  }

  /**
   * Add indexer
   */
  async addIndexer(indexer: any): Promise<ProwlarrIndexer> {
    return this.request({
      method: 'POST',
      url: '/api/v1/indexer',
      data: indexer,
    });
  }

  /**
   * Update indexer
   */
  async updateIndexer(indexer: any): Promise<ProwlarrIndexer> {
    return this.request({
      method: 'PUT',
      url: `/api/v1/indexer/${indexer.id}`,
      data: indexer,
    });
  }

  /**
   * Delete indexer
   */
  async deleteIndexer(id: number): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v1/indexer/${id}`,
    });
  }

  /**
   * Test indexer
   */
  async testIndexer(options: ProwlarrIndexerTestOptions): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/api/v1/indexer/test',
      data: {
        ...options.indexer,
        forceTest: options.forceTest || false,
      },
    });
  }

  /**
   * Get indexer schema
   */
  async getIndexerSchema(implementation?: string): Promise<any[]> {
    const params: any = {};
    if (implementation) {
      params.implementation = implementation;
    }

    return this.request({
      method: 'GET',
      url: '/api/v1/indexer/schema',
      params,
    });
  }

  /**
   * Get indexer categories
   */
  async getIndexerCategories(): Promise<any[]> {
    return this.request({
      method: 'GET',
      url: '/api/v1/indexer/categories',
    });
  }

  /**
   * Get applications
   */
  async getApplications(): Promise<ProwlarrApplication[]> {
    return this.request({
      method: 'GET',
      url: '/api/v1/applications',
    });
  }

  /**
   * Get application by ID
   */
  async getApplicationById(id: number): Promise<ProwlarrApplication> {
    return this.request({
      method: 'GET',
      url: `/api/v1/applications/${id}`,
    });
  }

  /**
   * Add application
   */
  async addApplication(application: any): Promise<ProwlarrApplication> {
    return this.request({
      method: 'POST',
      url: '/api/v1/applications',
      data: application,
    });
  }

  /**
   * Update application
   */
  async updateApplication(application: any): Promise<ProwlarrApplication> {
    return this.request({
      method: 'PUT',
      url: `/api/v1/applications/${application.id}`,
      data: application,
    });
  }

  /**
   * Delete application
   */
  async deleteApplication(id: number): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v1/applications/${id}`,
    });
  }

  /**
   * Test application
   */
  async testApplication(application: any): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/api/v1/applications/test',
      data: application,
    });
  }

  /**
   * Get application schema
   */
  async getApplicationSchema(implementation?: string): Promise<any[]> {
    const params: any = {};
    if (implementation) {
      params.implementation = implementation;
    }

    return this.request({
      method: 'GET',
      url: '/api/v1/applications/schema',
      params,
    });
  }

  /**
   * Sync applications
   */
  async syncApplications(options: ProwlarrSyncOptions = {}): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v1/command',
      data: {
        name: 'ApplicationSync',
        ...options,
      },
    });
  }

  /**
   * Search indexers
   */
  async search(options: ProwlarrSearchOptions = {}): Promise<ProwlarrSearchResult[]> {
    const params: any = {};

    if (options.query) params.query = options.query;
    if (options.indexerIds) params.indexerIds = options.indexerIds.join(',');
    if (options.categories) params.categories = options.categories.join(',');
    if (options.type) params.type = options.type;
    if (options.offset) params.offset = options.offset;
    if (options.limit) params.limit = options.limit;

    // TV Search specific
    if (options.tvdbId) params.tvdbId = options.tvdbId;
    if (options.season) params.season = options.season;
    if (options.episode) params.episode = options.episode;

    // Movie Search specific
    if (options.tmdbId) params.tmdbId = options.tmdbId;
    if (options.imdbId) params.imdbId = options.imdbId;
    if (options.year) params.year = options.year;

    // Music Search specific
    if (options.artist) params.artist = options.artist;
    if (options.album) params.album = options.album;
    if (options.track) params.track = options.track;

    // Book Search specific
    if (options.author) params.author = options.author;
    if (options.title) params.title = options.title;

    return this.request({
      method: 'GET',
      url: '/api/v1/search',
      params,
    });
  }

  /**
   * Get indexer stats
   */
  async getIndexerStats(options: ProwlarrStatsOptions = {}): Promise<any> {
    const params: any = {};

    if (options.startDate) params.startDate = options.startDate;
    if (options.endDate) params.endDate = options.endDate;
    if (options.indexerIds) params.indexerIds = options.indexerIds.join(',');
    if (options.applicationIds) params.applicationIds = options.applicationIds.join(',');

    return this.request({
      method: 'GET',
      url: '/api/v1/indexerstats',
      params,
    });
  }

  /**
   * Get history
   */
  async getHistory(page = 1, pageSize = 20, sortKey = 'date', sortDirection = 'descending'): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v1/history',
      params: {
        page,
        pageSize,
        sortKey,
        sortDirection,
      },
    });
  }

  /**
   * Get notifications
   */
  async getNotifications(): Promise<ProwlarrNotification[]> {
    return this.request({
      method: 'GET',
      url: '/api/v1/notification',
    });
  }

  /**
   * Add notification
   */
  async addNotification(notification: any): Promise<ProwlarrNotification> {
    return this.request({
      method: 'POST',
      url: '/api/v1/notification',
      data: notification,
    });
  }

  /**
   * Update notification
   */
  async updateNotification(notification: any): Promise<ProwlarrNotification> {
    return this.request({
      method: 'PUT',
      url: `/api/v1/notification/${notification.id}`,
      data: notification,
    });
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v1/notification/${id}`,
    });
  }

  /**
   * Test notification
   */
  async testNotification(notification: any): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/api/v1/notification/test',
      data: notification,
    });
  }

  /**
   * Get sync profiles
   */
  async getSyncProfiles(): Promise<ProwlarrSyncProfile[]> {
    return this.request({
      method: 'GET',
      url: '/api/v1/syncprofile',
    });
  }

  /**
   * Add sync profile
   */
  async addSyncProfile(profile: any): Promise<ProwlarrSyncProfile> {
    return this.request({
      method: 'POST',
      url: '/api/v1/syncprofile',
      data: profile,
    });
  }

  /**
   * Update sync profile
   */
  async updateSyncProfile(profile: any): Promise<ProwlarrSyncProfile> {
    return this.request({
      method: 'PUT',
      url: `/api/v1/syncprofile/${profile.id}`,
      data: profile,
    });
  }

  /**
   * Delete sync profile
   */
  async deleteSyncProfile(id: number): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v1/syncprofile/${id}`,
    });
  }

  /**
   * Force indexer RSS sync
   */
  async forceRssSync(indexerIds?: number[]): Promise<void> {
    const commandData: any = {
      name: 'RssSync',
    };

    if (indexerIds) {
      commandData.indexerIds = indexerIds;
    }

    await this.request({
      method: 'POST',
      url: '/api/v1/command',
      data: commandData,
    });
  }

  /**
   * Sync indexer definitions
   */
  async syncIndexerDefinitions(): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v1/command',
      data: {
        name: 'CheckForIndexerUpdate',
      },
    });
  }

  /**
   * Get system status (override to use v1 API)
   */
  async getSystemStatus(): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v1/system/status',
    });
  }

  /**
   * Get health information (override to use v1 API)
   */
  async getHealth(): Promise<any[]> {
    return this.request({
      method: 'GET',
      url: '/api/v1/health',
    });
  }

  /**
   * Get logs (override to use v1 API)
   */
  async getLogs(page = 1, pageSize = 50, sortKey = 'time', sortDirection = 'descending'): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v1/log',
      params: {
        page,
        pageSize,
        sortKey,
        sortDirection,
      },
    });
  }
}