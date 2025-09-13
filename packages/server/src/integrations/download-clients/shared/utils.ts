/**
 * Shared utilities for download client integrations
 */

import { AxiosError } from 'axios';
import { DownloadClientError, DownloadClientRetryOptions, TorrentState } from './types.js';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_OPTIONS: Required<DownloadClientRetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2,
};

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: DownloadClientRetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: Error;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors or client errors (4xx)
      if (isAxiosError(error)) {
        const status = error.response?.status;
        if (status && (status === 401 || status === 403 || (status >= 400 && status < 500 && status !== 429))) {
          throw formatDownloadClientError(error);
        }
      }

      // Don't retry on the last attempt
      if (attempt === config.maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff and jitter
      const baseDelay = Math.min(
        config.baseDelay * Math.pow(config.backoffFactor, attempt),
        config.maxDelay
      );
      const jitter = Math.random() * 0.1 * baseDelay;
      const delay = baseDelay + jitter;

      console.warn(`Download client request failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${Math.round(delay)}ms:`, error.message);
      await sleep(delay);
    }
  }

  throw formatDownloadClientError(lastError);
}

/**
 * Format download client errors with useful information
 */
export function formatDownloadClientError(error: unknown): DownloadClientError {
  if (isAxiosError(error)) {
    const dlError = new Error() as DownloadClientError;
    dlError.name = 'DownloadClientError';
    dlError.status = error.response?.status;
    dlError.response = error.response;

    if (error.response) {
      const { status, statusText, data } = error.response;
      
      // Handle specific error cases
      switch (status) {
        case 401:
          dlError.message = 'Authentication failed. Please check your username and password.';
          break;
        case 403:
          dlError.message = 'Access forbidden. Please check your credentials and permissions.';
          break;
        case 404:
          dlError.message = 'Endpoint not found. The download client may not support this operation.';
          break;
        case 409:
          dlError.message = 'Conflict. The torrent may already exist.';
          break;
        case 415:
          dlError.message = 'Unsupported media type. Invalid torrent data.';
          break;
        case 500:
          dlError.message = 'Internal server error. The download client may be experiencing issues.';
          break;
        case 502:
        case 503:
        case 504:
          dlError.message = 'Service unavailable. The download client may be down or unreachable.';
          break;
        default:
          if (data?.error) {
            dlError.message = data.error;
          } else if (data && typeof data === 'string') {
            dlError.message = data;
          } else {
            dlError.message = `HTTP ${status}: ${statusText}`;
          }
      }
    } else if (error.request) {
      dlError.message = 'No response received from download client. Please check the URL and network connectivity.';
    } else {
      dlError.message = error.message || 'Unknown error occurred.';
    }

    return dlError;
  }

  if (error instanceof Error) {
    const dlError = new Error(error.message) as DownloadClientError;
    dlError.name = 'DownloadClientError';
    return dlError;
  }

  const dlError = new Error('Unknown error occurred') as DownloadClientError;
  dlError.name = 'DownloadClientError';
  return dlError;
}

/**
 * Check if an error is an Axios error
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && typeof error === 'object' && 'isAxiosError' in error;
}

/**
 * Sleep utility for delays
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Build download client URL
 */
export function buildClientUrl(host: string, port: number, useSsl = false, urlBase = ''): string {
  const protocol = useSsl ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}:${port}`;
  
  if (urlBase) {
    const cleanBase = urlBase.replace(/^\/+|\/+$/g, ''); // Remove leading/trailing slashes
    return `${baseUrl}/${cleanBase}`;
  }
  
  return baseUrl;
}

/**
 * Convert bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Convert bytes per second to human readable format
 */
export function formatSpeed(bytesPerSec: number): string {
  if (bytesPerSec === 0) return '0 B/s';
  
  const k = 1024;
  const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const i = Math.floor(Math.log(bytesPerSec) / Math.log(k));
  
  return `${(bytesPerSec / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Format ETA (seconds) to human readable format
 */
export function formatETA(seconds: number): string {
  if (seconds === 0 || seconds === Infinity) return '∞';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}

/**
 * Format progress (0-1) to percentage
 */
export function formatProgress(progress: number): string {
  return `${(progress * 100).toFixed(1)}%`;
}

/**
 * Format ratio to string
 */
export function formatRatio(ratio: number): string {
  if (ratio === -1 || ratio === Infinity) return '∞';
  return ratio.toFixed(2);
}

/**
 * Convert timestamp to ISO string
 */
export function formatTimestamp(timestamp: number): string {
  if (timestamp === 0) return '';
  return new Date(timestamp * 1000).toISOString();
}

/**
 * Normalize torrent hash (uppercase, 40 chars for SHA-1)
 */
export function normalizeTorrentHash(hash: string): string {
  return hash.toLowerCase().trim();
}

/**
 * Validate torrent hash format
 */
export function isValidTorrentHash(hash: string): boolean {
  return /^[a-fA-F0-9]{40}$/.test(hash);
}

/**
 * Convert torrent state to standardized format
 */
export function normalizeTorrentState(state: string, client: 'qbittorrent' | 'transmission'): TorrentState {
  const stateMap: Record<string, Record<string, TorrentState>> = {
    qbittorrent: {
      'allocating': TorrentState.ALLOCATING,
      'downloading': TorrentState.DOWNLOADING,
      'metaDL': TorrentState.METADATA_DL,
      'pausedDL': TorrentState.PAUSED_DL,
      'queuedDL': TorrentState.QUEUED_DL,
      'stalledDL': TorrentState.STALLED_DL,
      'uploading': TorrentState.UPLOADING,
      'pausedUP': TorrentState.PAUSED_UP,
      'queuedUP': TorrentState.QUEUED_UP,
      'stalledUP': TorrentState.STALLED_UP,
      'checkingUP': TorrentState.CHECKING_UP,
      'checkingDL': TorrentState.CHECKING_DL,
      'checkingResumeData': TorrentState.CHECKING_RESUME_DATA,
      'error': TorrentState.ERROR,
      'missingFiles': TorrentState.MISSING_FILES,
      'forcedDL': TorrentState.FORCED_DL,
      'forcedUP': TorrentState.FORCED_UP,
      'moving': TorrentState.MOVING,
    },
    transmission: {
      '0': TorrentState.STOPPED,
      '1': TorrentState.CHECK_WAIT,
      '2': TorrentState.CHECK,
      '3': TorrentState.DOWNLOAD_WAIT,
      '4': TorrentState.DOWNLOAD,
      '5': TorrentState.SEED_WAIT,
      '6': TorrentState.SEED,
      'stopped': TorrentState.STOPPED,
      'check pending': TorrentState.CHECK_WAIT,
      'checking': TorrentState.CHECK,
      'download pending': TorrentState.DOWNLOAD_WAIT,
      'downloading': TorrentState.DOWNLOAD,
      'seed pending': TorrentState.SEED_WAIT,
      'seeding': TorrentState.SEED,
    },
  };

  return stateMap[client]?.[state.toLowerCase()] || TorrentState.UNKNOWN;
}

/**
 * Check if torrent is actively downloading
 */
export function isTorrentDownloading(state: TorrentState): boolean {
  return [
    TorrentState.ALLOCATING,
    TorrentState.DOWNLOADING,
    TorrentState.METADATA_DL,
    TorrentState.FORCED_DL,
    TorrentState.DOWNLOAD,
  ].includes(state);
}

/**
 * Check if torrent is actively uploading/seeding
 */
export function isTorrentSeeding(state: TorrentState): boolean {
  return [
    TorrentState.UPLOADING,
    TorrentState.FORCED_UP,
    TorrentState.SEEDING,
    TorrentState.SEED,
  ].includes(state);
}

/**
 * Check if torrent is paused
 */
export function isTorrentPaused(state: TorrentState): boolean {
  return [
    TorrentState.PAUSED_DL,
    TorrentState.PAUSED_UP,
    TorrentState.STOPPED,
  ].includes(state);
}

/**
 * Check if torrent has an error
 */
export function isTorrentErrored(state: TorrentState): boolean {
  return [
    TorrentState.ERROR,
    TorrentState.MISSING_FILES,
  ].includes(state);
}

/**
 * Check if torrent is completed
 */
export function isTorrentCompleted(progress: number): boolean {
  return progress >= 1.0;
}

/**
 * Calculate download/upload rates from byte counts over time
 */
export function calculateRate(currentBytes: number, previousBytes: number, timeInterval: number): number {
  if (timeInterval <= 0) return 0;
  return Math.max(0, (currentBytes - previousBytes) / timeInterval);
}

/**
 * Parse magnet link to extract info hash
 */
export function parseMagnetHash(magnetUrl: string): string | null {
  try {
    const url = new URL(magnetUrl);
    const xtParam = url.searchParams.get('xt');
    if (xtParam && xtParam.startsWith('urn:btih:')) {
      return xtParam.substring(9).toLowerCase();
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Validate magnet URL format
 */
export function isValidMagnetUrl(url: string): boolean {
  return url.startsWith('magnet:?') && url.includes('xt=urn:btih:');
}

/**
 * Convert priority number to human readable string
 */
export function formatPriority(priority: number): string {
  const priorityMap: Record<number, string> = {
    0: 'Do not download',
    1: 'Low',
    2: 'Low',
    3: 'Low',
    4: 'Normal',
    5: 'Normal',
    6: 'High',
    7: 'Maximum',
  };
  
  return priorityMap[priority] || 'Normal';
}

/**
 * Sanitize category name
 */
export function sanitizeCategoryName(name: string): string {
  return name.replace(/[^\w\-_]/g, '_').substring(0, 50);
}

/**
 * Deep merge objects
 */
export function deepMerge(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}