/**
 * Radarr API Client
 * Handles all interactions with Radarr for movie management
 */

import { BaseArrClient } from '../shared/base-client.js';
import { ArrConfig, RadarrMovie } from '../shared/types.js';

export interface RadarrAddMovieOptions {
  tmdbId: number;
  title: string;
  titleSlug: string;
  qualityProfileId: number;
  rootFolderPath: string;
  monitored?: boolean;
  minimumAvailability?: 'tba' | 'announced' | 'inCinemas' | 'released';
  searchForMovie?: boolean;
  tags?: number[];
  addOptions?: {
    ignoreEpisodesWithFiles?: boolean;
    ignoreEpisodesWithoutFiles?: boolean;
    searchForMovie?: boolean;
  };
}

export interface RadarrUpdateMovieOptions {
  id: number;
  title?: string;
  qualityProfileId?: number;
  rootFolderPath?: string;
  monitored?: boolean;
  minimumAvailability?: 'tba' | 'announced' | 'inCinemas' | 'released';
  tags?: number[];
}

export interface RadarrMovieLookup {
  title: string;
  originalTitle: string;
  alternateTitles: Array<{
    sourceType: string;
    movieId: number;
    title: string;
    sourceId: number;
    votes: number;
    voteCount: number;
    language: {
      id: number;
      name: string;
    };
  }>;
  sortTitle: string;
  status: string;
  overview: string;
  inCinemas: string;
  physicalRelease: string;
  digitalRelease: string;
  images: Array<{
    coverType: string;
    url: string;
    remoteUrl: string;
  }>;
  website: string;
  year: number;
  youTubeTrailerId: string;
  studio: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  certification: string;
  genres: string[];
  ratings: {
    imdb?: {
      votes: number;
      value: number;
      type: string;
    };
    tmdb?: {
      votes: number;
      value: number;
      type: string;
    };
    metacritic?: {
      votes: number;
      value: number;
      type: string;
    };
    rottenTomatoes?: {
      votes: number;
      value: number;
      type: string;
    };
  };
  collection?: {
    name: string;
    tmdbId: number;
    images: Array<{
      coverType: string;
      url: string;
      remoteUrl: string;
    }>;
  };
}

export interface RadarrCalendarOptions {
  start?: string; // ISO date string
  end?: string;   // ISO date string
  unmonitored?: boolean;
  includeMoved?: boolean;
}

export interface RadarrQueueOptions {
  page?: number;
  pageSize?: number;
  sortKey?: 'timeleft' | 'estimatedCompletionTime' | 'protocol' | 'indexer' | 'downloadClient' | 'quality' | 'status';
  sortDirection?: 'ascending' | 'descending';
  includeUnknownMovieItems?: boolean;
}

export interface RadarrHistoryOptions {
  page?: number;
  pageSize?: number;
  sortKey?: 'date' | 'eventType' | 'sourceTitle';
  sortDirection?: 'ascending' | 'descending';
  movieId?: number;
  eventType?: number;
  includeMovie?: boolean;
}

export interface RadarrBlocklistOptions {
  page?: number;
  pageSize?: number;
  sortKey?: 'date' | 'sourceTitle' | 'language' | 'quality';
  sortDirection?: 'ascending' | 'descending';
}

export interface RadarrMovieFileOptions {
  movieId: number;
  movieFileIds: number[];
}

export class RadarrClient extends BaseArrClient {
  constructor(config: ArrConfig) {
    super(config, 'Radarr');
  }

  /**
   * Search for movies
   */
  async searchMovies(term: string): Promise<RadarrMovieLookup[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/movie/lookup',
      params: { term },
    });
  }

  /**
   * Search for movies by IMDb ID
   */
  async searchMoviesByImdb(imdbId: string): Promise<RadarrMovieLookup[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/movie/lookup/imdb',
      params: { imdbId },
    });
  }

  /**
   * Search for movies by TMDb ID
   */
  async searchMoviesByTmdb(tmdbId: number): Promise<RadarrMovieLookup[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/movie/lookup/tmdb',
      params: { tmdbId },
    });
  }

  /**
   * Get all movies
   */
  async getMovies(): Promise<RadarrMovie[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/movie',
    });
  }

  /**
   * Get movie by ID
   */
  async getMovieById(id: number): Promise<RadarrMovie> {
    return this.request({
      method: 'GET',
      url: `/api/v3/movie/${id}`,
    });
  }

  /**
   * Get movie by TMDb ID
   */
  async getMovieByTmdbId(tmdbId: number): Promise<RadarrMovie> {
    const movies = await this.getMovies();
    const movie = movies.find(m => m.tmdbId === tmdbId);
    
    if (!movie) {
      throw new Error(`Movie with TMDb ID ${tmdbId} not found`);
    }
    
    return movie;
  }

  /**
   * Add a new movie
   */
  async addMovie(options: RadarrAddMovieOptions): Promise<RadarrMovie> {
    const movieData = {
      tmdbId: options.tmdbId,
      title: options.title,
      titleSlug: options.titleSlug,
      qualityProfileId: options.qualityProfileId,
      rootFolderPath: options.rootFolderPath,
      monitored: options.monitored !== false,
      minimumAvailability: options.minimumAvailability || 'announced',
      tags: options.tags || [],
      addOptions: {
        searchForMovie: options.searchForMovie !== false,
      },
    };

    return this.request({
      method: 'POST',
      url: '/api/v3/movie',
      data: movieData,
    });
  }

  /**
   * Update movie
   */
  async updateMovie(options: RadarrUpdateMovieOptions): Promise<RadarrMovie> {
    // First get the current movie data
    const currentMovie = await this.getMovieById(options.id);

    // Merge with updates
    const updatedMovie = {
      ...currentMovie,
      ...options,
    };

    return this.request({
      method: 'PUT',
      url: `/api/v3/movie/${options.id}`,
      data: updatedMovie,
    });
  }

  /**
   * Delete movie
   */
  async deleteMovie(id: number, deleteFiles = false, addImportListExclusion = false): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v3/movie/${id}`,
      params: {
        deleteFiles,
        addImportListExclusion,
      },
    });
  }

  /**
   * Get calendar (upcoming movies)
   */
  async getCalendar(options: RadarrCalendarOptions = {}): Promise<RadarrMovie[]> {
    const params: any = {
      unmonitored: options.unmonitored || false,
      includeMoved: options.includeMoved || false,
    };

    if (options.start) {
      params.start = options.start;
    }

    if (options.end) {
      params.end = options.end;
    }

    return this.request({
      method: 'GET',
      url: '/api/v3/calendar',
      params,
    });
  }

  /**
   * Get wanted/missing movies
   */
  async getWantedMissing(page = 1, pageSize = 20, sortKey = 'title', sortDirection = 'ascending', includeMovie = false): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v3/wanted/missing',
      params: {
        page,
        pageSize,
        sortKey,
        sortDirection,
        includeMovie,
      },
    });
  }

  /**
   * Get wanted/cutoff unmet movies
   */
  async getWantedCutoffUnmet(page = 1, pageSize = 20, sortKey = 'title', sortDirection = 'ascending', includeMovie = false): Promise<any> {
    return this.request({
      method: 'GET',
      url: '/api/v3/wanted/cutoff',
      params: {
        page,
        pageSize,
        sortKey,
        sortDirection,
        includeMovie,
      },
    });
  }

  /**
   * Get queue
   */
  async getQueue(options: RadarrQueueOptions = {}): Promise<any> {
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sortKey: options.sortKey || 'timeleft',
      sortDirection: options.sortDirection || 'ascending',
      includeUnknownMovieItems: options.includeUnknownMovieItems || false,
    };

    return this.request({
      method: 'GET',
      url: '/api/v3/queue',
      params,
    });
  }

  /**
   * Remove item from queue
   */
  async removeFromQueue(id: number, removeFromClient = true, blocklist = false): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v3/queue/${id}`,
      params: {
        removeFromClient,
        blocklist,
      },
    });
  }

  /**
   * Get history
   */
  async getHistory(options: RadarrHistoryOptions = {}): Promise<any> {
    const params: any = {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sortKey: options.sortKey || 'date',
      sortDirection: options.sortDirection || 'descending',
      includeMovie: options.includeMovie || false,
    };

    if (options.movieId) {
      params.movieId = options.movieId;
    }

    if (options.eventType) {
      params.eventType = options.eventType;
    }

    return this.request({
      method: 'GET',
      url: '/api/v3/history',
      params,
    });
  }

  /**
   * Get blocklist
   */
  async getBlocklist(options: RadarrBlocklistOptions = {}): Promise<any> {
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sortKey: options.sortKey || 'date',
      sortDirection: options.sortDirection || 'descending',
    };

    return this.request({
      method: 'GET',
      url: '/api/v3/blocklist',
      params,
    });
  }

  /**
   * Remove from blocklist
   */
  async removeFromBlocklist(id: number): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v3/blocklist/${id}`,
    });
  }

  /**
   * Search for movie
   */
  async searchForMovie(movieId: number): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'MoviesSearch',
        movieIds: [movieId],
      },
    });
  }

  /**
   * Search for multiple movies
   */
  async searchForMovies(movieIds: number[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'MoviesSearch',
        movieIds,
      },
    });
  }

  /**
   * Rescan movie
   */
  async rescanMovie(movieId?: number): Promise<void> {
    const commandData: any = {
      name: 'RescanMovie',
    };

    if (movieId) {
      commandData.movieId = movieId;
    }

    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: commandData,
    });
  }

  /**
   * Refresh movie info
   */
  async refreshMovie(movieId?: number): Promise<void> {
    const commandData: any = {
      name: 'RefreshMovie',
    };

    if (movieId) {
      commandData.movieId = movieId;
    }

    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: commandData,
    });
  }

  /**
   * Rename movie files
   */
  async renameMovies(movieIds: number[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'RenameMovie',
        movieIds,
      },
    });
  }

  /**
   * Get movie files
   */
  async getMovieFiles(movieId: number): Promise<any[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/moviefile',
      params: { movieId },
    });
  }

  /**
   * Get movie file by ID
   */
  async getMovieFileById(id: number): Promise<any> {
    return this.request({
      method: 'GET',
      url: `/api/v3/moviefile/${id}`,
    });
  }

  /**
   * Delete movie files
   */
  async deleteMovieFiles(movieFileIds: number[]): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: '/api/v3/moviefile/bulk',
      data: {
        movieFileIds,
      },
    });
  }

  /**
   * Update movie file quality
   */
  async updateMovieFileQuality(movieFileId: number, quality: any): Promise<any> {
    return this.request({
      method: 'PUT',
      url: `/api/v3/moviefile/${movieFileId}`,
      data: { quality },
    });
  }

  /**
   * Get import lists
   */
  async getImportLists(): Promise<any[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/importlist',
    });
  }

  /**
   * Test import list
   */
  async testImportList(importList: any): Promise<any> {
    return this.request({
      method: 'POST',
      url: '/api/v3/importlist/test',
      data: importList,
    });
  }

  /**
   * Get collections
   */
  async getCollections(): Promise<any[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/collection',
    });
  }

  /**
   * Update collection
   */
  async updateCollection(collection: any): Promise<any> {
    return this.request({
      method: 'PUT',
      url: `/api/v3/collection/${collection.id}`,
      data: collection,
    });
  }
}