/**
 * Sonarr API Client
 * Handles all interactions with Sonarr for TV series management
 */

import { BaseArrClient } from '../shared/base-client.js';
import { ArrConfig, SonarrSeries, SonarrEpisode, SonarrSeason } from '../shared/types.js';

export interface SonarrAddSeriesOptions {
  tvdbId: number;
  title: string;
  titleSlug: string;
  qualityProfileId: number;
  languageProfileId?: number;
  rootFolderPath: string;
  monitored?: boolean;
  seasonFolder?: boolean;
  searchForMissingEpisodes?: boolean;
  searchForCutoffUnmetEpisodes?: boolean;
  seriesType?: 'standard' | 'daily' | 'anime';
  tags?: number[];
  addOptions?: {
    ignoreEpisodesWithFiles?: boolean;
    ignoreEpisodesWithoutFiles?: boolean;
    searchForMissingEpisodes?: boolean;
  };
}

export interface SonarrUpdateSeriesOptions {
  id: number;
  title?: string;
  qualityProfileId?: number;
  languageProfileId?: number;
  rootFolderPath?: string;
  monitored?: boolean;
  seasonFolder?: boolean;
  seriesType?: 'standard' | 'daily' | 'anime';
  tags?: number[];
  seasons?: Array<{
    seasonNumber: number;
    monitored: boolean;
  }>;
}

export interface SonarrSeriesLookup {
  title: string;
  sortTitle: string;
  status: string;
  overview: string;
  network: string;
  airTime: string;
  images: Array<{
    coverType: string;
    url: string;
    remoteUrl: string;
  }>;
  remotePoster: string;
  year: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  imdbId: string;
  titleSlug: string;
  firstAired: string;
  lastInfoSync: string;
  seriesType: string;
  cleanTitle: string;
  profileId: number;
  seasonCount: number;
  episodeCount: number;
  episodeFileCount: number;
  ended: boolean;
  genres: string[];
  ratings: {
    votes: number;
    value: number;
  };
  certification: string;
}

export interface SonarrEpisodeFileOptions {
  seriesId: number;
  episodeFileIds: number[];
}

export interface SonarrLanguageProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: {
    id: number;
    name: string;
  };
  languages: Array<{
    language: {
      id: number;
      name: string;
    };
    allowed: boolean;
  }>;
}

export interface SonarrCalendarOptions {
  start?: string; // ISO date string
  end?: string;   // ISO date string
  unmonitored?: boolean;
  includeSeries?: boolean;
  includeEpisodeFile?: boolean;
  includeEpisodeImages?: boolean;
}

export interface SonarrWantedOptions {
  page?: number;
  pageSize?: number;
  sortKey?: 'airDateUtc' | 'series.title' | 'episodeNumber';
  sortDirection?: 'ascending' | 'descending';
  includeEpisode?: boolean;
  includeSeries?: boolean;
  monitored?: boolean;
}

export class SonarrClient extends BaseArrClient {
  constructor(config: ArrConfig) {
    super(config, 'Sonarr');
  }

  /**
   * Search for series
   */
  async searchSeries(term: string): Promise<SonarrSeriesLookup[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/series/lookup',
      params: { term },
    });
  }

  /**
   * Get all series
   */
  async getSeries(includeSeasonImages = false): Promise<SonarrSeries[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/series',
      params: { includeSeasonImages },
    });
  }

  /**
   * Get series by ID
   */
  async getSeriesById(id: number, includeSeasonImages = false): Promise<SonarrSeries> {
    return this.request({
      method: 'GET',
      url: `/api/v3/series/${id}`,
      params: { includeSeasonImages },
    });
  }

  /**
   * Add a new series
   */
  async addSeries(options: SonarrAddSeriesOptions): Promise<SonarrSeries> {
    const seriesData = {
      tvdbId: options.tvdbId,
      title: options.title,
      titleSlug: options.titleSlug,
      qualityProfileId: options.qualityProfileId,
      languageProfileId: options.languageProfileId || 1,
      rootFolderPath: options.rootFolderPath,
      monitored: options.monitored !== false,
      seasonFolder: options.seasonFolder !== false,
      seriesType: options.seriesType || 'standard',
      tags: options.tags || [],
      addOptions: {
        ignoreEpisodesWithFiles: options.addOptions?.ignoreEpisodesWithFiles || false,
        ignoreEpisodesWithoutFiles: options.addOptions?.ignoreEpisodesWithoutFiles || false,
        searchForMissingEpisodes: options.searchForMissingEpisodes !== false,
      },
    };

    return this.request({
      method: 'POST',
      url: '/api/v3/series',
      data: seriesData,
    });
  }

  /**
   * Update series
   */
  async updateSeries(options: SonarrUpdateSeriesOptions): Promise<SonarrSeries> {
    // First get the current series data
    const currentSeries = await this.getSeriesById(options.id);

    // Merge with updates
    const updatedSeries = {
      ...currentSeries,
      ...options,
    };

    return this.request({
      method: 'PUT',
      url: `/api/v3/series/${options.id}`,
      data: updatedSeries,
    });
  }

  /**
   * Delete series
   */
  async deleteSeries(id: number, deleteFiles = false, addImportListExclusion = false): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: `/api/v3/series/${id}`,
      params: {
        deleteFiles,
        addImportListExclusion,
      },
    });
  }

  /**
   * Get episodes for a series
   */
  async getEpisodes(seriesId: number, seasonNumber?: number, includeImages = false): Promise<SonarrEpisode[]> {
    const params: any = {
      seriesId,
      includeImages,
    };

    if (seasonNumber !== undefined) {
      params.seasonNumber = seasonNumber;
    }

    return this.request({
      method: 'GET',
      url: '/api/v3/episode',
      params,
    });
  }

  /**
   * Get episode by ID
   */
  async getEpisodeById(id: number): Promise<SonarrEpisode> {
    return this.request({
      method: 'GET',
      url: `/api/v3/episode/${id}`,
    });
  }

  /**
   * Update episode
   */
  async updateEpisode(episode: Partial<SonarrEpisode> & { id: number }): Promise<SonarrEpisode> {
    return this.request({
      method: 'PUT',
      url: `/api/v3/episode/${episode.id}`,
      data: episode,
    });
  }

  /**
   * Monitor/unmonitor episodes
   */
  async setEpisodeMonitored(episodeIds: number[], monitored: boolean): Promise<void> {
    await this.request({
      method: 'PUT',
      url: '/api/v3/episode/monitor',
      data: {
        episodeIds,
        monitored,
      },
    });
  }

  /**
   * Get language profiles
   */
  async getLanguageProfiles(): Promise<SonarrLanguageProfile[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/languageprofile',
    });
  }

  /**
   * Get calendar (upcoming episodes)
   */
  async getCalendar(options: SonarrCalendarOptions = {}): Promise<SonarrEpisode[]> {
    const params: any = {
      unmonitored: options.unmonitored || false,
      includeSeries: options.includeSeries || false,
      includeEpisodeFile: options.includeEpisodeFile || false,
      includeEpisodeImages: options.includeEpisodeImages || false,
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
   * Get wanted/missing episodes
   */
  async getWantedMissing(options: SonarrWantedOptions = {}): Promise<any> {
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sortKey: options.sortKey || 'airDateUtc',
      sortDirection: options.sortDirection || 'descending',
      includeEpisode: options.includeEpisode || false,
      includeSeries: options.includeSeries || false,
      monitored: options.monitored !== false,
    };

    return this.request({
      method: 'GET',
      url: '/api/v3/wanted/missing',
      params,
    });
  }

  /**
   * Get wanted/cutoff unmet episodes
   */
  async getWantedCutoffUnmet(options: SonarrWantedOptions = {}): Promise<any> {
    const params = {
      page: options.page || 1,
      pageSize: options.pageSize || 20,
      sortKey: options.sortKey || 'airDateUtc',
      sortDirection: options.sortDirection || 'descending',
      includeEpisode: options.includeEpisode || false,
      includeSeries: options.includeSeries || false,
      monitored: options.monitored !== false,
    };

    return this.request({
      method: 'GET',
      url: '/api/v3/wanted/cutoff',
      params,
    });
  }

  /**
   * Search for series
   */
  async searchForSeries(seriesId: number): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'SeriesSearch',
        seriesId,
      },
    });
  }

  /**
   * Search for season
   */
  async searchForSeason(seriesId: number, seasonNumber: number): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'SeasonSearch',
        seriesId,
        seasonNumber,
      },
    });
  }

  /**
   * Search for episode
   */
  async searchForEpisode(episodeIds: number[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'EpisodeSearch',
        episodeIds,
      },
    });
  }

  /**
   * Rescan series
   */
  async rescanSeries(seriesId?: number): Promise<void> {
    const commandData: any = {
      name: 'RescanSeries',
    };

    if (seriesId) {
      commandData.seriesId = seriesId;
    }

    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: commandData,
    });
  }

  /**
   * Refresh series info
   */
  async refreshSeries(seriesId?: number): Promise<void> {
    const commandData: any = {
      name: 'RefreshSeries',
    };

    if (seriesId) {
      commandData.seriesId = seriesId;
    }

    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: commandData,
    });
  }

  /**
   * Rename series files
   */
  async renameSeries(seriesIds: number[]): Promise<void> {
    await this.request({
      method: 'POST',
      url: '/api/v3/command',
      data: {
        name: 'RenameSeries',
        seriesIds,
      },
    });
  }

  /**
   * Delete episode files
   */
  async deleteEpisodeFiles(episodeFileIds: number[]): Promise<void> {
    await this.request({
      method: 'DELETE',
      url: '/api/v3/episodefile/bulk',
      data: {
        episodeFileIds,
      },
    });
  }

  /**
   * Get episode files
   */
  async getEpisodeFiles(seriesId: number): Promise<any[]> {
    return this.request({
      method: 'GET',
      url: '/api/v3/episodefile',
      params: { seriesId },
    });
  }

  /**
   * Update episode file quality
   */
  async updateEpisodeFileQuality(episodeFileId: number, quality: any): Promise<any> {
    return this.request({
      method: 'PUT',
      url: `/api/v3/episodefile/${episodeFileId}`,
      data: { quality },
    });
  }
}