/**
 * Utility functions for Plex integration
 */

import { AxiosError } from 'axios';

export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export const defaultRetryOptions: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
};

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...defaultRetryOptions, ...options };
  let lastError: Error;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry on these conditions
      if (shouldNotRetry(error) || attempt === opts.maxRetries) {
        throw error;
      }
      
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay
      );
      
      console.log(`Plex API attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Check if we should not retry based on the error
 */
function shouldNotRetry(error: any): boolean {
  if (!error) return true;
  
  // Don't retry on client errors (4xx)
  if (error.response?.status >= 400 && error.response?.status < 500) {
    // Except for 429 (rate limit) and 408 (timeout)
    return error.response.status !== 429 && error.response.status !== 408;
  }
  
  // Don't retry on validation errors
  if (error.name === 'ValidationError') {
    return true;
  }
  
  return false;
}

/**
 * Sleep for a given number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if an error is a network/connection error
 */
export function isNetworkError(error: any): boolean {
  if (!error) return false;
  
  return (
    error.code === 'ECONNREFUSED' ||
    error.code === 'ECONNRESET' ||
    error.code === 'ETIMEDOUT' ||
    error.code === 'ENOTFOUND' ||
    error.code === 'EHOSTUNREACH' ||
    error.message?.includes('timeout') ||
    error.message?.includes('ECONNREFUSED')
  );
}

/**
 * Check if an error indicates server unavailability
 */
export function isServerUnavailable(error: any): boolean {
  if (!error) return false;
  
  if (isNetworkError(error)) return true;
  
  return (
    error.response?.status >= 500 ||
    error.response?.status === 429 || // Rate limited
    error.response?.status === 408    // Request timeout
  );
}

/**
 * Format error message for user display
 */
export function formatPlexError(error: any): string {
  if (!error) return 'Unknown error';
  
  if (isNetworkError(error)) {
    return 'Unable to connect to Plex server. Please check your network connection and server availability.';
  }
  
  if (error.response?.status === 401) {
    return 'Authentication failed. Please check your Plex credentials.';
  }
  
  if (error.response?.status === 403) {
    return 'Access denied. You may not have permission to access this Plex server.';
  }
  
  if (error.response?.status === 404) {
    return 'Requested resource not found on the Plex server.';
  }
  
  if (error.response?.status === 429) {
    return 'Too many requests. Please wait before trying again.';
  }
  
  if (error.response?.status >= 500) {
    return 'Plex server error. Please try again later.';
  }
  
  return error.message || 'An error occurred while communicating with Plex.';
}