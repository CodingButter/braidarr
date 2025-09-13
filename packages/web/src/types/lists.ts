export type ListType = 'movies' | 'tv';

export type ListStatus = 'active' | 'inactive' | 'syncing' | 'error';

export type SyncFrequency = 'manual' | 'hourly' | 'daily' | 'weekly';

export type ExportStatus = 'pending' | 'exporting' | 'success' | 'failed';

export interface FilterRule {
  id: string;
  type: 'genre' | 'rating' | 'year' | 'language' | 'runtime';
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
  value: string | number | string[];
}

export interface SourceConnection {
  id: string;
  name: string;
  type: 'tmdb' | 'trakt' | 'imdb' | 'letterboxd' | 'plex';
  enabled: boolean;
  config: Record<string, any>;
}

export interface ExportTarget {
  id: string;
  name: string;
  type: 'sonarr' | 'radarr';
  url: string;
  apiKey: string;
  enabled: boolean;
  lastExport?: Date;
  status: ExportStatus;
}

export interface ListItem {
  id: string;
  externalId: string;
  sourceId: string;
  sourceName: string;
  title: string;
  year: number;
  posterUrl?: string;
  overview?: string;
  genres: string[];
  rating?: number;
  addedAt: Date;
  exportedAt?: Date;
  exportStatus: ExportStatus;
}

export interface SyncLog {
  id: string;
  timestamp: Date;
  status: 'success' | 'warning' | 'error';
  message: string;
  itemsAdded: number;
  itemsRemoved: number;
  duration: number;
}

export interface ExportLog {
  id: string;
  timestamp: Date;
  targetId: string;
  targetName: string;
  status: ExportStatus;
  message?: string;
  itemsExported: number;
  duration: number;
}

export interface ImportList {
  id: string;
  name: string;
  description?: string;
  type: ListType;
  status: ListStatus;
  
  // Source configuration
  sources: SourceConnection[];
  
  // Filtering
  filterRules: FilterRule[];
  
  // Sync settings
  syncFrequency: SyncFrequency;
  lastSync?: Date;
  nextSync?: Date;
  autoSync: boolean;
  
  // Export configuration
  exportTargets: ExportTarget[];
  autoExport: boolean;
  
  // Statistics
  itemCount: number;
  totalItems: number;
  lastSyncDuration?: number;
  
  // Items and logs
  items: ListItem[];
  syncLogs: SyncLog[];
  exportLogs: ExportLog[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ListsPageData {
  lists: ImportList[];
  totalLists: number;
  activeLists: number;
  totalItems: number;
  lastSyncTime?: Date;
}

export interface CreateListRequest {
  name: string;
  description?: string;
  type: ListType;
  sources: string[]; // Source IDs
  filterRules?: FilterRule[];
  syncFrequency: SyncFrequency;
  autoSync: boolean;
  exportTargets?: string[]; // Export target IDs
  autoExport: boolean;
}

export interface UpdateListRequest extends Partial<CreateListRequest> {
  id: string;
}

export interface ListFilters {
  search?: string;
  type?: ListType[];
  status?: ListStatus[];
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}

export interface BulkListAction {
  action: 'sync' | 'export' | 'activate' | 'deactivate' | 'delete';
  listIds: string[];
}