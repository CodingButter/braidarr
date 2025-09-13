/**
 * Shared types for Arr ecosystem integrations
 */

export interface ArrConfig {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ArrConnectionTest {
  connected: boolean;
  version?: string;
  error?: string;
  details?: {
    instanceName?: string;
    osName?: string;
    osVersion?: string;
    isNetCore?: boolean;
    isMono?: boolean;
    isLinux?: boolean;
    isOsx?: boolean;
    isWindows?: boolean;
    branch?: string;
    authentication?: string;
    sqliteVersion?: string;
    urlBase?: string;
    runtimeVersion?: string;
    runtimeName?: string;
  };
}

export interface ArrHealthCheck {
  source: string;
  type: 'ok' | 'notice' | 'warning' | 'error';
  message: string;
  wikiUrl?: string;
}

export interface ArrQualityProfile {
  id: number;
  name: string;
  upgradeAllowed: boolean;
  cutoff: number;
  items: ArrQualityItem[];
}

export interface ArrQualityItem {
  id?: number;
  quality?: {
    id: number;
    name: string;
    source: string;
    resolution: number;
  };
  items?: ArrQualityItem[];
  allowed: boolean;
}

export interface ArrRootFolder {
  id: number;
  path: string;
  accessible: boolean;
  freeSpace: number;
  unmappedFolders?: Array<{
    name: string;
    path: string;
  }>;
}

export interface ArrTag {
  id: number;
  label: string;
}

export interface ArrDownloadClient {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  infoLink: string;
  priority: number;
  enable: boolean;
  supportsOnUpgrade: boolean;
  supportsRemoveCompletedDownloads: boolean;
  supportsRemoveFailedDownloads: boolean;
  protocol: 'torrent' | 'usenet';
  fields: ArrField[];
  tags: number[];
}

export interface ArrIndexer {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  infoLink: string;
  priority: number;
  enable: boolean;
  redirect: boolean;
  supportsRss: boolean;
  supportsSearch: boolean;
  protocol: 'torrent' | 'usenet';
  fields: ArrField[];
  tags: number[];
}

export interface ArrField {
  order: number;
  name: string;
  label: string;
  value?: any;
  type: string;
  advanced: boolean;
  selectOptions?: Array<{
    value: any;
    name: string;
    order: number;
  }>;
  helpText?: string;
  helpLink?: string;
}

export interface ArrWebhookPayload {
  eventType: string;
  instanceName: string;
  applicationUrl: string;
  [key: string]: any;
}

// Sonarr specific types
export interface SonarrSeries {
  id: number;
  title: string;
  alternateTitles: Array<{
    title: string;
    sceneSeasonNumber?: number;
  }>;
  sortTitle: string;
  status: 'continuing' | 'ended' | 'upcoming' | 'deleted';
  ended: boolean;
  overview: string;
  previousAiring?: string;
  nextAiring?: string;
  network: string;
  airTime: string;
  images: Array<{
    coverType: string;
    url: string;
    remoteUrl: string;
  }>;
  seasons: SonarrSeason[];
  year: number;
  path: string;
  qualityProfileId: number;
  languageProfileId: number;
  seasonFolder: boolean;
  monitored: boolean;
  useSceneNumbering: boolean;
  runtime: number;
  tvdbId: number;
  tvRageId: number;
  tvMazeId: number;
  firstAired: string;
  seriesType: 'standard' | 'daily' | 'anime';
  cleanTitle: string;
  imdbId: string;
  titleSlug: string;
  rootFolderPath: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
  ratings: {
    votes: number;
    value: number;
  };
  statistics: {
    seasonCount: number;
    episodeFileCount: number;
    episodeCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
}

export interface SonarrSeason {
  seasonNumber: number;
  monitored: boolean;
  statistics: {
    previousAiring?: string;
    episodeFileCount: number;
    episodeCount: number;
    totalEpisodeCount: number;
    sizeOnDisk: number;
    percentOfEpisodes: number;
  };
}

export interface SonarrEpisode {
  id: number;
  seriesId: number;
  tvdbId: number;
  episodeFileId: number;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  airDate: string;
  airDateUtc: string;
  overview: string;
  episodeFile?: {
    id: number;
    seriesId: number;
    seasonNumber: number;
    relativePath: string;
    path: string;
    size: number;
    dateAdded: string;
    quality: {
      quality: {
        id: number;
        name: string;
        source: string;
        resolution: number;
      };
      revision: {
        version: number;
        real: number;
        isRepack: boolean;
      };
    };
    mediaInfo: {
      audioChannels: number;
      audioCodec: string;
      videoCodec: string;
    };
    originalFilePath: string;
    qualityCutoffNotMet: boolean;
    languageCutoffNotMet: boolean;
  };
  hasFile: boolean;
  monitored: boolean;
  unverifiedSceneNumbering: boolean;
  endTime?: string;
  grabDate?: string;
  seriesTitle: string;
  series: SonarrSeries;
}

// Radarr specific types
export interface RadarrMovie {
  id: number;
  title: string;
  originalTitle: string;
  originalLanguage: {
    id: number;
    name: string;
  };
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
    id: number;
  }>;
  secondaryYearSourceId: number;
  sortTitle: string;
  sizeOnDisk: number;
  status: 'tba' | 'announced' | 'inCinemas' | 'released' | 'deleted';
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
  hasFile: boolean;
  youTubeTrailerId: string;
  studio: string;
  path: string;
  qualityProfileId: number;
  monitored: boolean;
  minimumAvailability: 'tba' | 'announced' | 'inCinemas' | 'released';
  isAvailable: boolean;
  folderName: string;
  runtime: number;
  cleanTitle: string;
  imdbId: string;
  tmdbId: number;
  titleSlug: string;
  rootFolderPath: string;
  certification: string;
  genres: string[];
  tags: number[];
  added: string;
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
  movieFile?: {
    id: number;
    movieId: number;
    relativePath: string;
    path: string;
    size: number;
    dateAdded: string;
    quality: {
      quality: {
        id: number;
        name: string;
        source: string;
        resolution: number;
      };
      revision: {
        version: number;
        real: number;
        isRepack: boolean;
      };
    };
    mediaInfo: {
      containerFormat: string;
      videoFormat: string;
      videoCodecID: string;
      videoProfile: string;
      videoCodecLibrary: string;
      videoBitrate: number;
      videoBitDepth: number;
      videoMultiViewCount: number;
      videoColourPrimaries: string;
      videoTransferCharacteristics: string;
      width: number;
      height: number;
      audioFormat: string;
      audioCodecID: string;
      audioCodecLibrary: string;
      audioAdditionalFeatures: string;
      audioBitrate: number;
      runTime: string;
      audioStreamCount: number;
      audioChannels: number;
      audioChannelPositions: string;
      audioChannelPositionsText: string;
      audioProfile: string;
      videoFps: number;
      audioLanguages: string;
      subtitles: string;
      scanType: string;
      schemaRevision: number;
    };
    originalFilePath: string;
    qualityCutoffNotMet: boolean;
    languageCutoffNotMet: boolean;
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

// Prowlarr specific types
export interface ProwlarrIndexer {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  infoLink: string;
  definitionName: string;
  description: string;
  encoding: string;
  language: string;
  priority: number;
  enable: boolean;
  redirect: boolean;
  supportsRss: boolean;
  supportsSearch: boolean;
  supportsRedirect: boolean;
  appProfileId: number;
  protocol: 'torrent' | 'usenet';
  privacy: 'public' | 'semiPrivate' | 'private';
  capabilities: {
    supportsRawSearch: boolean;
    searchParams: Array<{
      type: string;
      supportedParams: string[];
    }>;
    tvSearchParams: Array<{
      type: string;
      supportedParams: string[];
    }>;
    movieSearchParams: Array<{
      type: string;
      supportedParams: string[];
    }>;
    musicSearchParams: Array<{
      type: string;
      supportedParams: string[];
    }>;
    bookSearchParams: Array<{
      type: string;
      supportedParams: string[];
    }>;
    categories: Array<{
      id: number;
      name: string;
      subCategories: Array<{
        id: number;
        name: string;
      }>;
    }>;
  };
  fields: ArrField[];
  tags: number[];
}

export interface ProwlarrApplication {
  id: number;
  name: string;
  implementation: string;
  implementationName: string;
  infoLink: string;
  fields: ArrField[];
  syncProfile: {
    id: number;
    name: string;
  };
  tags: number[];
}

export interface ArrError extends Error {
  status?: number;
  response?: {
    status: number;
    statusText: string;
    data?: any;
  };
}

export interface ArrRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}