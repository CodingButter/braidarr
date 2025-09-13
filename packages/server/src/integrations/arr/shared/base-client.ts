/**
 * Base client for Arr ecosystem integrations
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { 
  ArrConfig, 
  ArrConnectionTest, 
  ArrHealthCheck,
  ArrRetryOptions,
  ArrQualityProfile,
  ArrRootFolder,
  ArrTag,
  ArrDownloadClient,
  ArrIndexer,
} from './types.js';
import { 
  retryWithBackoff, 
  buildArrHeaders, 
  normalizeUrl, 
  isValidApiKey,
  formatArrError,
  extractVersion,
  sanitizeUrlForLogging,
} from './utils.js';

export abstract class BaseArrClient {
  protected readonly api: AxiosInstance;
  protected readonly config: Required<ArrConfig>;
  protected readonly appName: string;

  constructor(config: ArrConfig, appName: string) {
    // Validate configuration
    if (!config.baseUrl) {
      throw new Error(`${appName} base URL is required`);
    }
    
    if (!config.apiKey || !isValidApiKey(config.apiKey)) {
      throw new Error(`Valid ${appName} API key is required`);
    }

    this.appName = appName;
    this.config = {
      baseUrl: normalizeUrl(config.baseUrl),
      apiKey: config.apiKey,
      timeout: config.timeout || 30000,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000,
    };

    // Create axios instance
    this.api = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: buildArrHeaders(this.config.apiKey),
    });

    // Add request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.debug(`${this.appName} API Request:`, {
          method: config.method?.toUpperCase(),
          url: sanitizeUrlForLogging(`${config.baseURL}${config.url}`),
        });
        return config;
      },
      (error) => {
        console.error(`${this.appName} API Request Error:`, error.message);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.api.interceptors.response.use(
      (response) => {
        console.debug(`${this.appName} API Response:`, {
          status: response.status,
          url: sanitizeUrlForLogging(response.config.url || ''),
        });
        return response;
      },
      (error) => {
        console.error(`${this.appName} API Error:`, {
          status: error.response?.status,
          url: sanitizeUrlForLogging(error.config?.url || ''),
          message: error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Make a request with retry logic
   */
  protected async request<T>(
    config: AxiosRequestConfig,
    retryOptions?: ArrRetryOptions
  ): Promise<T> {
    return retryWithBackoff(async () => {
      try {
        const response = await this.api.request<T>(config);
        return response.data;
      } catch (error) {
        throw formatArrError(error);
      }
    }, retryOptions);
  }

  /**
   * Test connection to the Arr application
   */
  async testConnection(): Promise<ArrConnectionTest> {
    try {
      const systemStatus = await this.getSystemStatus();
      
      return {
        connected: true,
        version: extractVersion(systemStatus),
        details: {
          instanceName: systemStatus.instanceName || systemStatus.InstanceName,
          osName: systemStatus.osName || systemStatus.OsName,
          osVersion: systemStatus.osVersion || systemStatus.OsVersion,
          isNetCore: systemStatus.isNetCore || systemStatus.IsNetCore,
          isMono: systemStatus.isMono || systemStatus.IsMono,
          isLinux: systemStatus.isLinux || systemStatus.IsLinux,
          isOsx: systemStatus.isOsx || systemStatus.IsOsx,
          isWindows: systemStatus.isWindows || systemStatus.IsWindows,
          branch: systemStatus.branch || systemStatus.Branch,
          authentication: systemStatus.authentication || systemStatus.Authentication,
          sqliteVersion: systemStatus.sqliteVersion || systemStatus.SqliteVersion,
          urlBase: systemStatus.urlBase || systemStatus.UrlBase,
          runtimeVersion: systemStatus.runtimeVersion || systemStatus.RuntimeVersion,
          runtimeName: systemStatus.runtimeName || systemStatus.RuntimeName,
        },
      };
    } catch (error) {
      const arrError = formatArrError(error);
      return {
        connected: false,
        error: arrError.message,
      };
    }
  }

  /**
   * Get system status
   */
  async getSystemStatus(): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v3/system/status',
    });
  }

  /**
   * Get health information
   */
  async getHealth(): Promise<ArrHealthCheck[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/health',
    });
  }

  /**
   * Get quality profiles
   */
  async getQualityProfiles(): Promise<ArrQualityProfile[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/qualityprofile',
    });
  }

  /**
   * Get root folders
   */
  async getRootFolders(): Promise<ArrRootFolder[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/rootfolder',
    });
  }

  /**
   * Get tags
   */
  async getTags(): Promise<ArrTag[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/tag',
    });
  }

  /**
   * Create a new tag
   */
  async createTag(label: string): Promise<ArrTag> {
    return this.request({
      method: 'POST',
      url: '/api/v3/tag',
      data: { label },
    });
  }

  /**
   * Get download clients
   */
  async getDownloadClients(): Promise<ArrDownloadClient[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/downloadclient',
    });
  }

  /**
   * Get indexers
   */
  async getIndexers(): Promise<ArrIndexer[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/indexer',
    });
  }

  /**
   * Get logs
   */
  async getLogs(page = 1, pageSize = 50, sortKey = 'time', sortDirection = 'descending'): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v3/log',
      params: {
        page,
        pageSize,
        sortKey,
        sortDirection,
      },
    });
  }

  /**
   * Clear logs
   */
  async clearLogs(): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: '/api/v3/log',
    });
  }

  /**
   * Get application information
   */
  getApplicationInfo(): { name: string; baseUrl: string; version?: string } {
    return {
      name: this.appName,
      baseUrl: this.config.baseUrl,
    };
  }

  /**
   * Check if the client is configured
   */
  isConfigured(): boolean {
    return !!(this.config.baseUrl && this.config.apiKey);
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<ArrConfig>): void {
    if (newConfig.baseUrl) {
      this.config.baseUrl = normalizeUrl(newConfig.baseUrl);
      this.api.defaults.baseURL = this.config.baseUrl;
    }

    if (newConfig.apiKey) {
      if (!isValidApiKey(newConfig.apiKey)) {
        throw new Error(`Invalid ${this.appName} API key format`);
      }
      this.config.apiKey = newConfig.apiKey;
      this.api.defaults.headers = {
        ...this.api.defaults.headers,
        ...buildArrHeaders(newConfig.apiKey),
      };
    }

    if (newConfig.timeout) {
      this.config.timeout = newConfig.timeout;
      this.api.defaults.timeout = newConfig.timeout;
    }

    if (newConfig.retryAttempts !== undefined) {
      this.config.retryAttempts = newConfig.retryAttempts;
    }

    if (newConfig.retryDelay !== undefined) {
      this.config.retryDelay = newConfig.retryDelay;
    }
  }
}