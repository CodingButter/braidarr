/**
 * qBittorrent API Client
 * Handles all interactions with qBittorrent for torrent management
 */

import axios, { AxiosInstance } from 'axios';
import { 
  DownloadClientConfig, 
  DownloadClientConnectionTest,
  Torrent,
  DownloadClientStats,
  AddTorrentOptions,
  TorrentFilters,
  DownloadClientPreferences,
  DownloadClientCategory,
  DownloadClientRetryOptions,
} from '../shared/types.js';
import { 
  retryWithBackoff,
  buildClientUrl,
  formatDownloadClientError,
  normalizeTorrentHash,
  isValidTorrentHash,
  normalizeTorrentState,
  formatTimestamp,
} from '../shared/utils.js';

export class QBittorrentClient {
  private readonly api: AxiosInstance;
  private readonly config: Required<DownloadClientConfig>;
  private cookie: string | null = null;
  private lastLoginTime: number = 0;
  private readonly LOGIN_TIMEOUT = 3600000; // 1 hour

  constructor(config: DownloadClientConfig) {
    // Validate configuration
    if (!config.host) {
      throw new Error('qBittorrent host is required');
    }

    if (!config.port) {
      throw new Error('qBittorrent port is required');
    }

    this.config = {
      host: config.host,
      port: config.port,
      username: config.username || 'admin',
      password: config.password || '',
      useSsl: config.useSsl || false,
      urlBase: config.urlBase || '',
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    const baseURL = buildClientUrl(this.config.host, this.config.port, this.config.useSsl, this.config.urlBase);

    // Create axios instance
    this.api = axios.create({
      baseURL,
      timeout: this.config.timeout,
      headers: {
        'User-Agent': 'Braidarr/1.0.0',
      },
      withCredentials: true,
    });

    // Add request interceptor for authentication
    this.api.interceptors.request.use(
      async (config) => {
        // Check if we need to login or refresh session
        const now = Date.now();
        if (!this.cookie || (now - this.lastLoginTime) > this.LOGIN_TIMEOUT) {
          await this.login();
        }

        if (this.cookie) {
          config.headers.Cookie = this.cookie;
        }

        console.debug('qBittorrent API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
        });

        return config;
      },
      (error) => {
        console.error('qBittorrent API Request Error:', error.message);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        console.debug('qBittorrent API Response:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        console.error('qBittorrent API Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
        });
        
        // Clear cookie on 403 (unauthorized) to force re-login
        if (error.response?.status === 403) {
          this.cookie = null;
          this.lastLoginTime = 0;
        }
        
        return Promise.reject(error);
      }
    );
  }

  /**
   * Login to qBittorrent
   */
  private async login(): Promise<void> {
    try {
      console.debug('Logging in to qBittorrent...');
      
      const response = await axios.post(
        `${this.api.defaults.baseURL}/api/v2/auth/login`,
        new URLSearchParams({
          username: this.config.username,
          password: this.config.password,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          timeout: this.config.timeout,
          withCredentials: true,
        }
      );

      if (response.status === 200 && response.data === 'Ok.') {
        const setCookieHeader = response.headers['set-cookie'];
        if (setCookieHeader && setCookieHeader.length > 0) {
          this.cookie = setCookieHeader.map(cookie => cookie.split(';')[0]).join('; ');
          this.lastLoginTime = Date.now();
          console.debug('Successfully logged in to qBittorrent');
        } else {
          throw new Error('No session cookie received from qBittorrent');
        }
      } else {
        throw new Error('Invalid credentials for qBittorrent');
      }
    } catch (error) {
      this.cookie = null;
      this.lastLoginTime = 0;
      throw formatDownloadClientError(error);
    }
  }

  /**
   * Make a request with retry logic
   */
  private async request<T>(
    config: any,
    retryOptions?: DownloadClientRetryOptions
  ): Promise<T> {
    return retryWithBackoff(async () => {
      try {
        const response = await this.api.request(config);
        return response.data;
      } catch (error) {
        throw formatDownloadClientError(error);
      }
    }, retryOptions);
  }

  /**
   * Test connection to qBittorrent
   */
  async testConnection(): Promise<DownloadClientConnectionTest> {
    try {
      const version = await this.getVersion();
      const apiVersion = await this.getApiVersion();
      
      return {
        connected: true,
        version,
        details: {
          apiVersion,
          client: 'qBittorrent',
        },
      };
    } catch (error) {
      const dlError = formatDownloadClientError(error);
      return {
        connected: false,
        error: dlError.message,
      };
    }
  }

  /**
   * Get qBittorrent version
   */
  async getVersion(): Promise<string> {
    return this.request({
      method: 'GET',
      url: '/api/v2/app/version',
    });
  }

  /**
   * Get API version
   */
  async getApiVersion(): Promise<string> {
    return this.request({
      method: 'GET',
      url: '/api/v2/app/webapiVersion',
    });
  }

  /**
   * Get application preferences
   */
  async getPreferences(): Promise<DownloadClientPreferences> {
    return this.request({
      method: 'GET',
      url: '/api/v2/app/preferences',
    });
  }

  /**
   * Set application preferences
   */
  async setPreferences(preferences: Partial<DownloadClientPreferences>): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v2/app/setPreferences',
      data: new URLSearchParams({
        json: JSON.stringify(preferences),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Get global transfer info
   */
  async getGlobalTransferInfo(): Promise<DownloadClientStats> {
    const data = await this.request({
      method: 'GET',
      url: '/api/v2/transfer/info',
    });

    return {
      connectionStatus: 'connected',
      allTimeDownloaded: data.alltime_dl,
      allTimeUploaded: data.alltime_ul,
      downloadSpeed: data.dl_info_speed,
      uploadSpeed: data.up_info_speed,
      dlInfoSpeed: data.dl_info_speed,
      upInfoSpeed: data.up_info_speed,
      dlInfoData: data.dl_info_data,
      upInfoData: data.up_info_data,
      dlRateLimit: data.dl_rate_limit,
      upRateLimit: data.up_rate_limit,
      dhtNodes: data.dht_nodes,
      freeSpaceOnDisk: data.free_space_on_disk,
      globalRatio: data.global_ratio,
      queuedIoJobs: data.queued_io_jobs,
      queueing: data.queueing,
      readCacheHits: data.read_cache_hits,
      readCacheOverload: data.read_cache_overload,
      refreshInterval: data.refresh_interval,
      totalBuffersSize: data.total_buffers_size,
      totalPeerConnections: data.total_peer_connections,
      totalQueuedSize: data.total_queued_size,
      totalWastedSession: data.total_wasted_session,
      useAltSpeedLimits: data.use_alt_speed_limits,
      writeCache: data.write_cache,
      writeCacheOverload: data.write_cache_overload,
    };
  }

  /**
   * Get all torrents
   */
  async getTorrents(filters?: TorrentFilters): Promise<Torrent[]> {
    const params: any = {};

    if (filters?.state) {
      if (Array.isArray(filters.state)) {
        params.filter = filters.state.join('|');
      } else {
        params.filter = filters.state;
      }
    }

    if (filters?.category) {
      params.category = filters.category;
    }

    if (filters?.tag) {
      params.tag = filters.tag;
    }

    if (filters?.hashes) {
      params.hashes = filters.hashes.map(normalizeTorrentHash).join('|');
    }

    if (filters?.sort) {
      params.sort = filters.sort;
    }

    if (filters?.reverse) {
      params.reverse = filters.reverse;
    }

    if (filters?.limit) {
      params.limit = filters.limit;
    }

    if (filters?.offset) {
      params.offset = filters.offset;
    }

    const data = await this.request({
      method: 'GET',
      url: '/api/v2/torrents/info',
      params,
    });

    return data.map((torrent: any) => this.mapTorrentData(torrent));
  }

  /**
   * Get torrent by hash
   */
  async getTorrent(hash: string): Promise<Torrent | null> {
    if (!isValidTorrentHash(hash)) {
      throw new Error('Invalid torrent hash format');
    }

    const torrents = await this.getTorrents({ hashes: [hash] });
    return torrents.length > 0 ? torrents[0] : null;
  }

  /**
   * Add torrent
   */
  async addTorrent(options: AddTorrentOptions): Promise<void> {
    const formData = new FormData();

    if (options.urls) {
      formData.append('urls', options.urls.join('\n'));
    }

    if (options.torrents) {
      options.torrents.forEach((torrent, index) => {
        formData.append('torrents', new Blob([torrent]), `torrent_${index}.torrent`);
      });
    }

    if (options.savePath) {
      formData.append('savepath', options.savePath);
    }

    if (options.category) {
      formData.append('category', options.category);
    }

    if (options.tags) {
      formData.append('tags', options.tags.join(','));
    }

    if (options.paused !== undefined) {
      formData.append('paused', options.paused.toString());
    }

    if (options.skipChecking !== undefined) {
      formData.append('skip_checking', options.skipChecking.toString());
    }

    if (options.priority !== undefined) {
      formData.append('priority', options.priority.toString());
    }

    if (options.rootFolder !== undefined) {
      formData.append('root_folder', options.rootFolder.toString());
    }

    if (options.rename) {
      formData.append('rename', options.rename);
    }

    if (options.uploadLimit !== undefined) {
      formData.append('upLimit', options.uploadLimit.toString());
    }

    if (options.downloadLimit !== undefined) {
      formData.append('dlLimit', options.downloadLimit.toString());
    }

    if (options.ratioLimit !== undefined) {
      formData.append('ratioLimit', options.ratioLimit.toString());
    }

    if (options.seedingTimeLimit !== undefined) {
      formData.append('seedingTimeLimit', options.seedingTimeLimit.toString());
    }

    if (options.autoTMM !== undefined) {
      formData.append('autoTMM', options.autoTMM.toString());
    }

    if (options.sequentialDownload !== undefined) {
      formData.append('sequentialDownload', options.sequentialDownload.toString());
    }

    if (options.firstLastPiecePriority !== undefined) {
      formData.append('firstLastPiecePrio', options.firstLastPiecePriority.toString());
    }

    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/add',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Delete torrents
   */
  async deleteTorrents(hashes: string[], deleteFiles = false): Promise<void> {
    const normalizedHashes = hashes.map(normalizeTorrentHash);
    
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/delete',
      data: new URLSearchParams({
        hashes: normalizedHashes.join('|'),
        deleteFiles: deleteFiles.toString(),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Pause torrents
   */
  async pauseTorrents(hashes: string[]): Promise<void> {
    const normalizedHashes = hashes.map(normalizeTorrentHash);
    
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/pause',
      data: new URLSearchParams({
        hashes: normalizedHashes.join('|'),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Resume torrents
   */
  async resumeTorrents(hashes: string[]): Promise<void> {
    const normalizedHashes = hashes.map(normalizeTorrentHash);
    
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/resume',
      data: new URLSearchParams({
        hashes: normalizedHashes.join('|'),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Recheck torrents
   */
  async recheckTorrents(hashes: string[]): Promise<void> {
    const normalizedHashes = hashes.map(normalizeTorrentHash);
    
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/recheck',
      data: new URLSearchParams({
        hashes: normalizedHashes.join('|'),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Set torrent priority
   */
  async setTorrentPriority(hashes: string[], priority: 'increase' | 'decrease' | 'maxPrio' | 'minPrio'): Promise<void> {
    const normalizedHashes = hashes.map(normalizeTorrentHash);
    
    await this.request({
      method: 'POST',
      url: `/api/v2/torrents/${priority}`,
      data: new URLSearchParams({
        hashes: normalizedHashes.join('|'),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<Record<string, DownloadClientCategory>> {
    return this.request({
      method: 'GET',
      url: '/api/v2/torrents/categories',
    });
  }

  /**
   * Create category
   */
  async createCategory(name: string, savePath: string): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/createCategory',
      data: new URLSearchParams({
        category: name,
        savePath,
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Delete categories
   */
  async deleteCategories(categories: string[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/removeCategories',
      data: new URLSearchParams({
        categories: categories.join('\n'),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Get tags
   */
  async getTags(): Promise<string[]> {
    return this.request({
      method: 'GET',
      url: '/api/v2/torrents/tags',
    });
  }

  /**
   * Create tags
   */
  async createTags(tags: string[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/createTags',
      data: new URLSearchParams({
        tags: tags.join(','),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Delete tags
   */
  async deleteTags(tags: string[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v2/torrents/deleteTags',
      data: new URLSearchParams({
        tags: tags.join(','),
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Map qBittorrent torrent data to standard format
   */
  private mapTorrentData(data: any): Torrent {
    return {
      hash: data.hash,
      name: data.name,
      size: data.size,
      progress: data.progress,
      downloadSpeed: data.dlspeed,
      uploadSpeed: data.upspeed,
      priority: data.priority,
      eta: data.eta,
      state: normalizeTorrentState(data.state, 'qbittorrent'),
      ratio: data.ratio,
      seedingTime: data.seeding_time,
      category: data.category,
      tags: data.tags ? data.tags.split(', ').filter(Boolean) : [],
      addedOn: data.added_on,
      completedOn: data.completed_on,
      lastActivity: data.last_activity,
      savePath: data.save_path,
      downloadPath: data.download_path,
      contentPath: data.content_path,
      downloaded: data.downloaded,
      uploaded: data.uploaded,
      downloadLimit: data.dl_limit,
      uploadLimit: data.up_limit,
      seeders: data.num_seeds,
      leechers: data.num_leechs,
      totalSeeds: data.num_complete,
      totalLeechers: data.num_incomplete,
      availability: data.availability,
      forceStart: data.force_start,
      sequentialDownload: data.seq_dl,
      firstLastPiecePriority: data.f_l_piece_prio,
      autopimm: data.auto_tmm,
      dlLimit: data.dl_limit,
      upLimit: data.up_limit,
      maxRatio: data.max_ratio,
      maxSeedingTime: data.max_seeding_time,
      ratioLimit: data.ratio_limit,
      seedingTimeLimit: data.seeding_time_limit,
      seenComplete: data.seen_complete,
      lastActivityTime: data.last_activity,
      completionOn: data.completion_on,
      tracker: data.tracker,
    };
  }

  /**
   * Get client information
   */
  getClientInfo(): { name: string; baseUrl: string } {
    return {
      name: 'qBittorrent',
      baseUrl: buildClientUrl(this.config.host, this.config.port, this.config.useSsl, this.config.urlBase),
    };
  }

  /**
   * Check if the client is configured
   */
  isConfigured(): boolean {
    return !!(this.config.host && this.config.port);
  }
}