import { SiImdb, SiTrakt, SiThemoviedatabase } from 'react-icons/si';
import { MdList, MdApi } from 'react-icons/md';
import { RiRssFill, RiFileDownloadFill } from 'react-icons/ri';

// Core source types (defined here to avoid circular imports)
export type SourceType = 
  | 'imdb_list' 
  | 'imdb_watchlist' 
  | 'trakt_list' 
  | 'trakt_collection' 
  | 'letterboxd_list' 
  | 'tmdb_list' 
  | 'custom_rss' 
  | 'json_api' 
  | 'csv_upload';

export type SourceStatus = 'connected' | 'error' | 'syncing' | 'not_connected';
export type SyncFrequency = 'hourly' | 'daily' | 'weekly' | 'manual';

export interface SourceConfig {
  [key: string]: any;
}

export interface Source {
  id: string;
  name: string;
  type: SourceType;
  status: SourceStatus;
  lastSync: Date | null;
  itemsImported: number;
  config: SourceConfig;
  enabled: boolean;
  syncFrequency: SyncFrequency;
  healthScore: number;
}

// Extended source configuration interfaces
export interface ImdbListConfig {
  url: string;
  listId?: string;
}

export interface ImdbWatchlistConfig {
  username: string;
  userId?: string;
}

export interface TraktListConfig {
  username: string;
  listSlug: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface TraktCollectionConfig {
  username: string;
  accessToken?: string;
  refreshToken?: string;
  includeWatched?: boolean;
  includeCollection?: boolean;
}

export interface LetterboxdListConfig {
  username: string;
  listSlug: string;
  isPublic: boolean;
}

export interface TmdbListConfig {
  listId: string;
  apiKey: string;
  accountId?: string;
}

export interface CustomRssConfig {
  url: string;
  titleField: string;
  descriptionField: string;
  linkField: string;
  dateField?: string;
  customFields?: Record<string, string>;
}

export interface JsonApiConfig {
  url: string;
  headers?: Record<string, string>;
  authType: 'none' | 'bearer' | 'api_key' | 'custom';
  apiKey?: string;
  authHeader?: string;
  dataPath?: string;
  titleField: string;
  yearField?: string;
  typeField?: string;
  imdbIdField?: string;
  tmdbIdField?: string;
}

export interface CsvUploadConfig {
  fileName: string;
  columnMapping: {
    title: string;
    year?: string;
    type?: string;
    imdbId?: string;
    tmdbId?: string;
  };
  uploadDate: string;
  hasHeaders?: boolean;
  delimiter?: string;
}

// Source type metadata
export interface SourceTypeMetadata {
  type: SourceType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  category: 'streaming' | 'database' | 'custom' | 'manual';
  requiresAuth: boolean;
  supportsRealtime: boolean;
  maxSyncFrequency: SyncFrequency;
  configSchema: any; // Could be a JSON Schema or Zod schema
  exampleConfig: any;
}

// Source type configurations
export const sourceTypeMetadata: Record<SourceType, SourceTypeMetadata> = {
  imdb_list: {
    type: 'imdb_list',
    title: 'IMDb List',
    description: 'Import movies and TV shows from public IMDb lists',
    icon: SiImdb,
    category: 'database',
    requiresAuth: false,
    supportsRealtime: false,
    maxSyncFrequency: 'hourly',
    configSchema: {
      url: { type: 'string', format: 'uri', required: true }
    },
    exampleConfig: {
      url: 'https://www.imdb.com/list/ls123456789/'
    }
  },
  imdb_watchlist: {
    type: 'imdb_watchlist',
    title: 'IMDb Watchlist',
    description: 'Sync your personal IMDb watchlist',
    icon: SiImdb,
    category: 'streaming',
    requiresAuth: false,
    supportsRealtime: false,
    maxSyncFrequency: 'hourly',
    configSchema: {
      username: { type: 'string', required: true, pattern: '^ur\\d+$' }
    },
    exampleConfig: {
      username: 'ur123456789'
    }
  },
  trakt_list: {
    type: 'trakt_list',
    title: 'Trakt List',
    description: 'Import from Trakt.tv lists and collections',
    icon: SiTrakt,
    category: 'streaming',
    requiresAuth: true,
    supportsRealtime: true,
    maxSyncFrequency: 'hourly',
    configSchema: {
      username: { type: 'string', required: true },
      listSlug: { type: 'string', required: true }
    },
    exampleConfig: {
      username: 'myusername',
      listSlug: 'my-favorite-movies'
    }
  },
  trakt_collection: {
    type: 'trakt_collection',
    title: 'Trakt Collection',
    description: 'Sync your Trakt collection and watched items',
    icon: SiTrakt,
    category: 'streaming',
    requiresAuth: true,
    supportsRealtime: true,
    maxSyncFrequency: 'hourly',
    configSchema: {
      username: { type: 'string', required: true }
    },
    exampleConfig: {
      username: 'myusername',
      includeWatched: true,
      includeCollection: true
    }
  },
  letterboxd_list: {
    type: 'letterboxd_list',
    title: 'Letterboxd List',
    description: 'Import movies from Letterboxd lists',
    icon: MdList,
    category: 'streaming',
    requiresAuth: false,
    supportsRealtime: false,
    maxSyncFrequency: 'daily',
    configSchema: {
      username: { type: 'string', required: true },
      listSlug: { type: 'string', required: true }
    },
    exampleConfig: {
      username: 'cinephile',
      listSlug: 'favorites-2024'
    }
  },
  tmdb_list: {
    type: 'tmdb_list',
    title: 'TMDb List',
    description: 'Import from The Movie Database lists',
    icon: SiThemoviedatabase,
    category: 'database',
    requiresAuth: true,
    supportsRealtime: false,
    maxSyncFrequency: 'hourly',
    configSchema: {
      listId: { type: 'string', required: true },
      apiKey: { type: 'string', required: true, sensitive: true }
    },
    exampleConfig: {
      listId: '123456',
      apiKey: 'your-tmdb-api-key'
    }
  },
  custom_rss: {
    type: 'custom_rss',
    title: 'RSS Feed',
    description: 'Custom RSS feeds with media information',
    icon: RiRssFill,
    category: 'custom',
    requiresAuth: false,
    supportsRealtime: false,
    maxSyncFrequency: 'hourly',
    configSchema: {
      url: { type: 'string', format: 'uri', required: true },
      titleField: { type: 'string', default: 'title' },
      descriptionField: { type: 'string', default: 'description' }
    },
    exampleConfig: {
      url: 'https://example.com/feed.xml',
      titleField: 'title',
      descriptionField: 'description'
    }
  },
  json_api: {
    type: 'json_api',
    title: 'JSON API',
    description: 'Custom JSON API endpoints',
    icon: MdApi,
    category: 'custom',
    requiresAuth: false,
    supportsRealtime: true,
    maxSyncFrequency: 'hourly',
    configSchema: {
      url: { type: 'string', format: 'uri', required: true },
      titleField: { type: 'string', required: true },
      authType: { type: 'string', enum: ['none', 'bearer', 'api_key', 'custom'] }
    },
    exampleConfig: {
      url: 'https://api.example.com/media',
      titleField: 'title',
      authType: 'none'
    }
  },
  csv_upload: {
    type: 'csv_upload',
    title: 'CSV Upload',
    description: 'Manual CSV file uploads',
    icon: RiFileDownloadFill,
    category: 'manual',
    requiresAuth: false,
    supportsRealtime: false,
    maxSyncFrequency: 'manual',
    configSchema: {
      fileName: { type: 'string', required: true },
      columnMapping: { 
        type: 'object',
        required: true,
        properties: {
          title: { type: 'string', required: true }
        }
      }
    },
    exampleConfig: {
      fileName: 'my-movies.csv',
      columnMapping: {
        title: 'Title',
        year: 'Year',
        type: 'Type'
      }
    }
  }
};

// Utility functions
export function getSourceTypeMetadata(type: SourceType): SourceTypeMetadata {
  return sourceTypeMetadata[type];
}

export function getSourceTypesForCategory(category: SourceTypeMetadata['category']): SourceTypeMetadata[] {
  return Object.values(sourceTypeMetadata).filter(meta => meta.category === category);
}

export function validateSourceConfig(type: SourceType, config: any): { valid: boolean; errors: string[] } {
  const metadata = getSourceTypeMetadata(type);
  const schema = metadata.configSchema;
  const errors: string[] = [];

  // Basic validation - in a real app, you'd use a proper schema validator like Zod or Ajv
  Object.entries(schema).forEach(([key, rules]: [string, any]) => {
    if (rules.required && !config[key]) {
      errors.push(`${key} is required`);
    }

    if (config[key] && rules.pattern && !new RegExp(rules.pattern).test(config[key])) {
      errors.push(`${key} format is invalid`);
    }

    if (config[key] && rules.format === 'uri') {
      try {
        new URL(config[key]);
      } catch {
        errors.push(`${key} must be a valid URL`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function isSourceConfigComplete(type: SourceType, config: any): boolean {
  const { valid } = validateSourceConfig(type, config);
  return valid;
}

export function getSourceDisplayName(source: { type: SourceType; name?: string }): string {
  if (source.name) return source.name;
  return getSourceTypeMetadata(source.type).title;
}

export function canSourceSyncAtFrequency(type: SourceType, frequency: SyncFrequency): boolean {
  const metadata = getSourceTypeMetadata(type);
  const frequencyOrder: SyncFrequency[] = ['manual', 'weekly', 'daily', 'hourly'];
  
  const typeMaxIndex = frequencyOrder.indexOf(metadata.maxSyncFrequency);
  const requestedIndex = frequencyOrder.indexOf(frequency);
  
  return requestedIndex <= typeMaxIndex;
}

// Source status helpers
export function getSourceStatusColor(status: SourceStatus): string {
  switch (status) {
    case 'connected': return '#10b981';
    case 'error': return '#ef4444';
    case 'syncing': return '#f59e0b';
    case 'not_connected': return '#6b7280';
    default: return '#6b7280';
  }
}

export function getSourceStatusDescription(status: SourceStatus): string {
  switch (status) {
    case 'connected': return 'Source is connected and functioning normally';
    case 'error': return 'Source has encountered an error and cannot sync';
    case 'syncing': return 'Source is currently syncing data';
    case 'not_connected': return 'Source is not connected or configured';
    default: return 'Unknown status';
  }
}

// Health score calculations
export function calculateHealthScore(metrics: {
  connectionStability: number;
  dataQuality: number;
  syncReliability: number;
  responseTime: number;
}): number {
  const weights = {
    connectionStability: 0.3,
    dataQuality: 0.25,
    syncReliability: 0.3,
    responseTime: 0.15
  };

  return Math.round(
    metrics.connectionStability * weights.connectionStability +
    metrics.dataQuality * weights.dataQuality +
    metrics.syncReliability * weights.syncReliability +
    metrics.responseTime * weights.responseTime
  );
}

export function getHealthScoreLevel(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 90) return 'excellent';
  if (score >= 70) return 'good';
  if (score >= 50) return 'fair';
  return 'poor';
}

// Sync frequency helpers
export function getSyncFrequencyInMs(frequency: SyncFrequency): number | null {
  switch (frequency) {
    case 'hourly': return 60 * 60 * 1000;
    case 'daily': return 24 * 60 * 60 * 1000;
    case 'weekly': return 7 * 24 * 60 * 60 * 1000;
    case 'manual': return null;
    default: return null;
  }
}

export function getNextSyncTime(lastSync: Date | null, frequency: SyncFrequency): Date | null {
  if (frequency === 'manual' || !lastSync) return null;
  
  const intervalMs = getSyncFrequencyInMs(frequency);
  if (!intervalMs) return null;
  
  return new Date(lastSync.getTime() + intervalMs);
}

export function formatSyncFrequency(frequency: SyncFrequency): string {
  switch (frequency) {
    case 'hourly': return 'Every Hour';
    case 'daily': return 'Daily';
    case 'weekly': return 'Weekly';
    case 'manual': return 'Manual Only';
    default: return frequency;
  }
}

// URL and connection helpers
export function extractImdbListId(url: string): string | null {
  const match = url.match(/\/list\/(ls\d+)/);
  return match?.[1] ?? null;
}

export function extractImdbUserId(input: string): string | null {
  // Handle both direct user ID and profile URL
  if (input.startsWith('ur')) return input;
  
  const match = input.match(/\/user\/(ur\d+)/);
  return match?.[1] ?? null;
}

export function extractTmdbListId(url: string): string | null {
  const match = url.match(/\/list\/(\d+)/);
  return match?.[1] ?? null;
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Error handling
export class SourceConfigurationError extends Error {
  constructor(
    message: string,
    public sourceType: SourceType,
    public field?: string
  ) {
    super(message);
    this.name = 'SourceConfigurationError';
  }
}

export class SourceConnectionError extends Error {
  constructor(
    message: string,
    public sourceId: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'SourceConnectionError';
  }
}