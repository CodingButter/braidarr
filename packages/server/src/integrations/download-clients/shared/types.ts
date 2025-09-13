/**
 * Shared types for download client integrations
 */

export interface DownloadClientConfig {
  host: string;
  port: number;
  username?: string;
  password?: string;
  useSsl?: boolean;
  urlBase?: string;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface DownloadClientConnectionTest {
  connected: boolean;
  version?: string;
  error?: string;
  details?: {
    [key: string]: any;
  };
}

export interface Torrent {
  hash: string;
  name: string;
  size: number;
  progress: number; // 0-1
  downloadSpeed: number; // bytes/sec
  uploadSpeed: number; // bytes/sec
  priority: number;
  eta: number; // seconds
  state: TorrentState;
  ratio: number;
  seedingTime: number; // seconds
  category?: string;
  tags?: string[];
  addedOn: number; // timestamp
  completedOn?: number; // timestamp
  lastActivity: number; // timestamp
  savePath: string;
  downloadPath?: string;
  contentPath: string;
  downloaded: number; // bytes
  uploaded: number; // bytes
  downloadLimit: number; // bytes/sec, -1 for unlimited
  uploadLimit: number; // bytes/sec, -1 for unlimited
  seeders: number;
  leechers: number;
  totalSeeds: number;
  totalLeechers: number;
  availability: number; // 0-1
  forceStart: boolean;
  sequentialDownload: boolean;
  firstLastPiecePriority: boolean;
  autopimm: boolean;
  dlLimit: number;
  upLimit: number;
  maxRatio: number;
  maxSeedingTime: number; // seconds
  ratioLimit: number;
  seedingTimeLimit: number; // seconds
  seenComplete: number; // timestamp
  lastActivityTime: number; // timestamp
  completionOn: number; // timestamp
  tracker?: string;
  trackers?: TorrentTracker[];
  files?: TorrentFile[];
  peers?: TorrentPeer[];
}

export interface TorrentTracker {
  url: string;
  status: number;
  tier: number;
  numPeers: number;
  numSeeds: number;
  numLeeches: number;
  numDownloaded: number;
  msg: string;
}

export interface TorrentFile {
  index: number;
  name: string;
  size: number;
  progress: number; // 0-1
  priority: number;
  piece_range: [number, number];
  availability: number;
}

export interface TorrentPeer {
  ip: string;
  port: number;
  country: string;
  countryCode: string;
  client: string;
  progress: number; // 0-1
  downloadSpeed: number; // bytes/sec
  uploadSpeed: number; // bytes/sec
  downloaded: number; // bytes
  uploaded: number; // bytes
  connection: string;
  flags: string;
  flagsDescription: string;
  relevance: number;
  files: string;
}

export enum TorrentState {
  // Generic states
  ALLOCATING = 'allocating',
  DOWNLOADING = 'downloading',
  METADATA_DL = 'metaDL',
  PAUSED_DL = 'pausedDL',
  QUEUED_DL = 'queuedDL',
  STALLED_DL = 'stalledDL',
  UPLOADING = 'uploading',
  PAUSED_UP = 'pausedUP',
  QUEUED_UP = 'queuedUP',
  STALLED_UP = 'stalledUP',
  CHECKING_UP = 'checkingUP',
  CHECKING_DL = 'checkingDL',
  CHECKING_RESUME_DATA = 'checkingResumeData',
  ERROR = 'error',
  MISSING_FILES = 'missingFiles',
  UNKNOWN = 'unknown',
  
  // qBittorrent specific
  FORCED_DL = 'forcedDL',
  FORCED_UP = 'forcedUP',
  MOVING = 'moving',
  
  // Transmission specific
  SEEDING = 'seeding',
  STOPPED = 'stopped',
  CHECK_WAIT = 'check_wait',
  CHECK = 'check',
  DOWNLOAD_WAIT = 'download_wait',
  DOWNLOAD = 'download',
  SEED_WAIT = 'seed_wait',
  SEED = 'seed',
}

export interface DownloadClientStats {
  connectionStatus: 'connected' | 'disconnected' | 'error';
  allTimeDownloaded: number; // bytes
  allTimeUploaded: number; // bytes
  downloadSpeed: number; // bytes/sec
  uploadSpeed: number; // bytes/sec
  dlInfoSpeed: number; // bytes/sec
  upInfoSpeed: number; // bytes/sec
  dlInfoData: number; // bytes
  upInfoData: number; // bytes
  dlRateLimit: number; // bytes/sec, 0 for unlimited
  upRateLimit: number; // bytes/sec, 0 for unlimited
  dhtNodes: number;
  freeSpaceOnDisk: number; // bytes
  globalRatio: string;
  queuedIoJobs: number;
  queueing: boolean;
  readCacheHits: string;
  readCacheOverload: string;
  refreshInterval: number; // milliseconds
  totalBuffersSize: number; // bytes
  totalPeerConnections: number;
  totalQueuedSize: number; // bytes
  totalWastedSession: number; // bytes
  useAltSpeedLimits: boolean;
  writeCache: number; // bytes
  writeCacheOverload: string;
}

export interface AddTorrentOptions {
  // Torrent data (either urls or file data)
  urls?: string[];
  torrents?: Buffer[];
  
  // Common options
  savePath?: string;
  category?: string;
  tags?: string[];
  paused?: boolean;
  skipChecking?: boolean;
  priority?: number;
  
  // Advanced options
  rootFolder?: boolean;
  rename?: string;
  uploadLimit?: number; // bytes/sec
  downloadLimit?: number; // bytes/sec
  ratioLimit?: number;
  seedingTimeLimit?: number; // seconds
  autoTMM?: boolean; // automatic torrent management
  sequentialDownload?: boolean;
  firstLastPiecePriority?: boolean;
  
  // File priorities (for multi-file torrents)
  filePriorities?: number[];
}

export interface TorrentFilters {
  state?: TorrentState | TorrentState[];
  category?: string;
  tag?: string;
  hashes?: string[];
  sort?: string;
  reverse?: boolean;
  limit?: number;
  offset?: number;
}

export interface DownloadClientPreferences {
  // Connection
  port: number;
  useRandomPort: boolean;
  upnp: boolean;
  maxConnections: number;
  maxUploads: number;
  maxConnectionsPerTorrent: number;
  maxUploadsPerTorrent: number;
  
  // Speed limits
  altDlLimit: number; // KB/s
  altUpLimit: number; // KB/s
  dlLimit: number; // KB/s
  upLimit: number; // KB/s
  schedulerEnabled: boolean;
  scheduleFromHour: number;
  scheduleFromMin: number;
  scheduleToHour: number;
  scheduleToMin: number;
  schedulerDays: number;
  
  // BitTorrent
  dht: boolean;
  pex: boolean;
  lsd: boolean;
  encryption: number; // 0=prefer, 1=force, 2=disabled
  maxRatio: number;
  maxSeedingTime: number; // minutes
  maxRatioAction: number; // 0=pause, 1=remove
  
  // Downloads
  tempPath: string;
  savePath: string;
  tempPathEnabled: boolean;
  preallocateAll: boolean;
  incompleteFilesExt: boolean;
  autoDeleteMode: number; // 0=never, 1=if ratio reached, 2=if seeding time reached, 3=if inactive
  
  // Web UI
  webUiPort: number;
  webUiUsername: string;
  webUiPassword: string;
  webUiHttpsEnabled: boolean;
  webUiHttpsCertPath: string;
  webUiHttpsKeyPath: string;
  
  // Advanced
  announceToAllTiers: boolean;
  announceToAllTrackers: boolean;
  asyncIoThreads: number;
  bannedIPs: string;
  checkingMemoryUse: number;
  currentInterfaceAddress: string;
  currentNetworkInterface: string;
  diskCache: number; // MB
  diskCacheTtl: number; // seconds
  embeddedTrackerPort: number;
  enableCoalesceReadWrite: boolean;
  enableEmbeddedTracker: boolean;
  enableMultiConnectionsFromSameIp: boolean;
  enableOsCache: boolean;
  enableUploadSuggestions: boolean;
  filePoolSize: number;
  guidedReadCache: boolean;
  ignoreLimitsOnLAN: boolean;
  outgoingPortsMax: number;
  outgoingPortsMin: number;
  recheckCompletedTorrents: boolean;
  resolvePeerCountries: boolean;
  saveResumeDataInterval: number; // minutes
  sendBufferLowWatermark: number; // KB
  sendBufferWatermark: number; // KB
  sendBufferWatermarkFactor: number;
  socketBacklogSize: number;
  uploadChokingAlgorithm: number;
  uploadSlotsBehavior: number;
  upnpLeaseDuration: number; // seconds
  useHttps: boolean;
  utpTcpMixedMode: number;
}

export interface DownloadClientCategory {
  name: string;
  savePath: string;
}

export interface DownloadClientError extends Error {
  status?: number;
  response?: {
    status: number;
    statusText: string;
    data?: any;
  };
}

export interface DownloadClientRetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}