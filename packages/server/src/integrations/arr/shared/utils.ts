/**
 * Shared utilities for Arr ecosystem integrations
 */

import { AxiosError } from 'axios';
import { ArrError, ArrRetryOptions } from './types.js';

/**
 * Default retry configuration
 */
export const DEFAULT_RETRY_OPTIONS: Required<ArrRetryOptions> = {
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
  options: ArrRetryOptions = {}
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
          throw formatArrError(error);
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

      console.warn(`Arr API request failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${Math.round(delay)}ms:`, error.message);
      await sleep(delay);
    }
  }

  throw formatArrError(lastError);
}

/**
 * Format Arr API errors with useful information
 */
export function formatArrError(error: unknown): ArrError {
  if (isAxiosError(error)) {
    const arrError = new Error() as ArrError;
    arrError.name = 'ArrError';
    arrError.status = error.response?.status;
    arrError.response = error.response;

    if (error.response) {
      const { status, statusText, data } = error.response;
      
      // Handle specific error cases
      switch (status) {
        case 401:
          arrError.message = 'Authentication failed. Please check your API key.';
          break;
        case 403:
          arrError.message = 'Access forbidden. Please check your API key permissions.';
          break;
        case 404:
          arrError.message = data?.message || 'Resource not found.';
          break;
        case 429:
          arrError.message = 'Rate limit exceeded. Please try again later.';
          break;
        case 500:
          arrError.message = 'Internal server error. The Arr application may be experiencing issues.';
          break;
        case 502:
        case 503:
        case 504:
          arrError.message = 'Service unavailable. The Arr application may be down or unreachable.';
          break;
        default:
          if (data?.message) {
            arrError.message = data.message;
          } else if (data && typeof data === 'string') {
            arrError.message = data;
          } else {
            arrError.message = `HTTP ${status}: ${statusText}`;
          }
      }
    } else if (error.request) {
      arrError.message = 'No response received from Arr application. Please check the URL and network connectivity.';
    } else {
      arrError.message = error.message || 'Unknown error occurred.';
    }

    return arrError;
  }

  if (error instanceof Error) {
    const arrError = new Error(error.message) as ArrError;
    arrError.name = 'ArrError';
    return arrError;
  }

  const arrError = new Error('Unknown error occurred') as ArrError;
  arrError.name = 'ArrError';
  return arrError;
}

/**
 * Check if an error is an Axios error
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return error !== null && typeof error === 'object' && 'isAxiosError' in error;
}

/**
 * Check if a server is unavailable based on error
 */
export function isServerUnavailable(error: unknown): boolean {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    return !status || status >= 500 || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND';
  }
  return false;
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
 * Normalize URL by removing trailing slashes and ensuring proper format
 */
export function normalizeUrl(url: string): string {
  if (!url) return '';
  
  // Remove trailing slashes
  let normalized = url.replace(/\/+$/, '');
  
  // Ensure protocol is present
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = `http://${normalized}`;
  }
  
  return normalized;
}

/**
 * Validate API key format (basic validation)
 */
export function isValidApiKey(apiKey: string): boolean {
  return typeof apiKey === 'string' && apiKey.length >= 10 && /^[a-zA-Z0-9]+$/.test(apiKey);
}

/**
 * Build API headers for Arr applications
 */
export function buildArrHeaders(apiKey: string): Record<string, string> {
  return {
    'X-Api-Key': apiKey,
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'User-Agent': 'Braidarr/1.0.0',
  };
}

/**
 * Sanitize URL for logging (removes sensitive information)
 */
export function sanitizeUrlForLogging(url: string): string {
  try {
    const parsed = new URL(url);
    return `${parsed.protocol}//${parsed.hostname}:${parsed.port || (parsed.protocol === 'https:' ? '443' : '80')}${parsed.pathname}`;
  } catch {
    return '[invalid URL]';
  }
}

/**
 * Parse webhook payload and validate event type
 */
export function parseWebhookPayload(payload: any): { eventType: string; data: any } | null {
  try {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const eventType = payload.eventType || payload.EventType;
    if (!eventType || typeof eventType !== 'string') {
      return null;
    }

    return {
      eventType,
      data: payload,
    };
  } catch {
    return null;
  }
}

/**
 * Convert file size to human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Convert duration in minutes to human readable format
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
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

/**
 * Extract version from system status response
 */
export function extractVersion(systemStatus: any): string | undefined {
  return systemStatus?.version || systemStatus?.Version;
}

/**
 * Check if arr instance supports a specific feature based on version
 */
export function supportsFeature(version: string | undefined, minVersion: string): boolean {
  if (!version) return false;
  
  try {
    const current = version.split('.').map(Number);
    const min = minVersion.split('.').map(Number);
    
    for (let i = 0; i < Math.max(current.length, min.length); i++) {
      const currentPart = current[i] || 0;
      const minPart = min[i] || 0;
      
      if (currentPart > minPart) return true;
      if (currentPart < minPart) return false;
    }
    
    return true;
  } catch {
    return false;
  }
}