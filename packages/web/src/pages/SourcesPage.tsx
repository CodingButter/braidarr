import React, { useState } from "react";
import { 
  MdAdd, 
  MdSync, 
  MdSettings, 
  MdList,
  MdStorage,
  MdApi
} from "react-icons/md";
import { BiImport } from "react-icons/bi";
import { SiImdb, SiTrakt, SiThemoviedatabase } from "react-icons/si";
import { RiRssFill, RiFileDownloadFill } from "react-icons/ri";
import { 
  ImdbListModal, 
  ImdbWatchlistModal, 
  TraktModal, 
  LetterboxdModal, 
  CsvUploadModal 
} from "../components/sources/SourceModals";
import { 
  TmdbListModal, 
  CustomRssModal, 
  JsonApiModal 
} from "../components/sources/AdditionalSourceModals";
import { SourceHealthMonitor, ConnectionStatusBadge, HealthScoreIndicator } from "../components/sources/SourceHealthMonitor";
import { Source, SourceType, SourceStatus } from "../types/sources";
import "./CommonPage.css";
import "./SourcesPage.css";

interface SourceTypeCardProps {
  type: SourceType;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  onSelect: (type: SourceType) => void;
}

// Mock data for demonstration
const mockSources: Source[] = [
  {
    id: '1',
    name: 'My IMDb Watchlist',
    type: 'imdb_watchlist',
    status: 'connected',
    lastSync: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    itemsImported: 142,
    config: { username: 'user123', listId: 'ls123456789' },
    enabled: true,
    syncFrequency: 'daily',
    healthScore: 98
  },
  {
    id: '2',
    name: 'Trakt Horror Collection',
    type: 'trakt_collection',
    status: 'syncing',
    lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    itemsImported: 87,
    config: { clientId: 'xyz789', collection: 'horror-movies' },
    enabled: true,
    syncFrequency: 'weekly',
    healthScore: 85
  },
  {
    id: '3',
    name: 'Letterboxd Favorites',
    type: 'letterboxd_list',
    status: 'error',
    lastSync: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    itemsImported: 0,
    config: { username: 'cinephile', listSlug: 'favorites' },
    enabled: false,
    syncFrequency: 'daily',
    healthScore: 12
  }
];

const sourceTypeConfigs = [
  {
    type: 'imdb_list' as SourceType,
    title: 'IMDb List',
    description: 'Import movies and TV shows from public IMDb lists',
    icon: SiImdb
  },
  {
    type: 'imdb_watchlist' as SourceType,
    title: 'IMDb Watchlist',
    description: 'Sync your personal IMDb watchlist',
    icon: SiImdb
  },
  {
    type: 'trakt_list' as SourceType,
    title: 'Trakt List',
    description: 'Import from Trakt.tv lists and collections',
    icon: SiTrakt
  },
  {
    type: 'trakt_collection' as SourceType,
    title: 'Trakt Collection',
    description: 'Sync your Trakt collection and watched items',
    icon: SiTrakt
  },
  {
    type: 'letterboxd_list' as SourceType,
    title: 'Letterboxd List',
    description: 'Import movies from Letterboxd lists',
    icon: MdList
  },
  {
    type: 'tmdb_list' as SourceType,
    title: 'TMDb List',
    description: 'Import from The Movie Database lists',
    icon: SiThemoviedatabase
  },
  {
    type: 'custom_rss' as SourceType,
    title: 'RSS Feed',
    description: 'Custom RSS feeds with media information',
    icon: RiRssFill
  },
  {
    type: 'json_api' as SourceType,
    title: 'JSON API',
    description: 'Custom JSON API endpoints',
    icon: MdApi
  },
  {
    type: 'csv_upload' as SourceType,
    title: 'CSV Upload',
    description: 'Manual CSV file uploads',
    icon: RiFileDownloadFill
  }
];

function SourceTypeCard({ type, title, description, icon: Icon, onSelect }: SourceTypeCardProps) {
  return (
    <div className="source-type-card" onClick={() => onSelect(type)}>
      <div className="source-type-icon">
        <Icon size={32} />
      </div>
      <div className="source-type-content">
        <h4>{title}</h4>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SourceCard({ source, onEdit, onTest, onSync, onViewHealth }: { 
  source: Source; 
  onEdit: (source: Source) => void;
  onTest: (source: Source) => void;
  onSync: (source: Source) => void;
  onViewHealth: (source: Source) => void;
}) {

  const getSourceTypeConfig = () => {
    return sourceTypeConfigs.find(config => config.type === source.type);
  };

  const typeConfig = getSourceTypeConfig();
  const Icon = typeConfig?.icon || MdStorage;

  return (
    <div className={`source-card ${source.enabled ? '' : 'disabled'}`}>
      <div className="source-card-header">
        <div className="source-info">
          <div className="source-icon">
            <Icon size={24} />
          </div>
          <div className="source-details">
            <h4>{source.name}</h4>
            <p>{typeConfig?.title || source.type}</p>
          </div>
        </div>
        <div className="source-status">
          <ConnectionStatusBadge status={source.status} />
        </div>
      </div>

      <div className="source-stats">
        <div className="stat">
          <span className="stat-value">{source.itemsImported}</span>
          <span className="stat-label">Items Imported</span>
        </div>
        <div className="stat">
          <HealthScoreIndicator score={source.healthScore} />
        </div>
        <div className="stat">
          <span className="stat-value">{source.syncFrequency}</span>
          <span className="stat-label">Sync Frequency</span>
        </div>
      </div>

      <div className="source-last-sync">
        <span>Last sync: </span>
        <span className="sync-time">
          {source.lastSync 
            ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                Math.floor((source.lastSync.getTime() - Date.now()) / (1000 * 60)), 
                'minute'
              )
            : 'Never'
          }
        </span>
      </div>

      <div className="source-actions">
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onTest(source)}
          disabled={source.status === 'syncing'}
        >
          Test Connection
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onSync(source)}
          disabled={source.status === 'syncing' || !source.enabled}
        >
          <MdSync size={16} />
          Sync Now
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onViewHealth(source)}
        >
          Health
        </button>
        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onEdit(source)}
        >
          <MdSettings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
}

export default function SourcesPage() {
  const [sources, setSources] = useState<Source[]>(mockSources);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSourceTypeSelector, setShowSourceTypeSelector] = useState(false);
  const [selectedSourceType, setSelectedSourceType] = useState<SourceType | null>(null);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [viewingHealthSource, setViewingHealthSource] = useState<Source | null>(null);
  const [syncingAll, setSyncingAll] = useState(false);

  const handleAddSource = () => {
    setShowSourceTypeSelector(true);
  };

  const handleSourceTypeSelect = (type: SourceType) => {
    setSelectedSourceType(type);
    setShowSourceTypeSelector(false);
    setShowAddModal(true);
  };

  const handleSubmitSource = (sourceData: Partial<Source>) => {
    if (editingSource) {
      // Update existing source
      setSources(prev => prev.map(s => 
        s.id === editingSource.id ? { ...s, ...sourceData } : s
      ));
    } else {
      // Add new source
      const newSource: Source = {
        id: Date.now().toString(),
        name: sourceData.name || 'New Source',
        type: selectedSourceType!,
        status: 'not_connected',
        lastSync: null,
        itemsImported: 0,
        config: sourceData.config || {},
        enabled: true,
        syncFrequency: sourceData.syncFrequency || 'daily',
        healthScore: 0
      };
      setSources(prev => [...prev, newSource]);
    }
    
    setShowAddModal(false);
    setEditingSource(null);
    setSelectedSourceType(null);
  };

  const handleEditSource = (source: Source) => {
    setEditingSource(source);
    setSelectedSourceType(source.type);
    setShowAddModal(true);
  };

  const handleTestConnection = async (source: Source) => {
    // Simulate testing connection
    console.log('Testing connection for:', source.name);
    // In real implementation, this would make an API call
  };

  const handleSyncSource = async (source: Source) => {
    // Update source status to syncing
    setSources(prev => prev.map(s => 
      s.id === source.id ? { ...s, status: 'syncing' as SourceStatus } : s
    ));

    // Simulate sync process
    setTimeout(() => {
      setSources(prev => prev.map(s => 
        s.id === source.id 
          ? { 
              ...s, 
              status: 'connected' as SourceStatus, 
              lastSync: new Date(),
              itemsImported: s.itemsImported + Math.floor(Math.random() * 10)
            } 
          : s
      ));
    }, 3000);
  };

  const handleViewHealth = (source: Source) => {
    setViewingHealthSource(source);
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    const connectedSources = sources.filter(s => s.status === 'connected' && s.enabled);
    
    for (const source of connectedSources) {
      await handleSyncSource(source);
    }
    
    setSyncingAll(false);
  };

  const connectedSources = sources.filter(s => s.status === 'connected').length;
  const totalItems = sources.reduce((sum, s) => sum + s.itemsImported, 0);
  const averageHealth = sources.length > 0 
    ? Math.round(sources.reduce((sum, s) => sum + s.healthScore, 0) / sources.length)
    : 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <MdStorage className="page-icon" size={32} />
          <h1>Sources</h1>
        </div>
        <div className="page-actions">
          <button 
            className={`btn btn-secondary ${syncingAll ? 'disabled' : ''}`}
            onClick={handleSyncAll}
            disabled={syncingAll}
          >
            <MdSync size={20} />
            {syncingAll ? 'Syncing All...' : 'Sync All'}
          </button>
          <button className="btn btn-primary" onClick={handleAddSource}>
            <MdAdd size={20} />
            Add Source
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-value">{sources.length}</div>
            <div className="stat-label">Total Sources</div>
          </div>
          <div className="stat">
            <div className="stat-value">{connectedSources}</div>
            <div className="stat-label">Connected</div>
          </div>
          <div className="stat">
            <div className="stat-value">{totalItems}</div>
            <div className="stat-label">Items Imported</div>
          </div>
          <div className="stat">
            <div className="stat-value">{averageHealth}%</div>
            <div className="stat-label">Avg Health</div>
          </div>
        </div>

        <div className="sources-info-box">
          <div className="info-box">
            <BiImport size={20} />
            <div>
              <p><strong>Sources feed data INTO lists</strong>, which then export TO Sonarr/Radarr.</p>
              <p>Configure your external list sources here to automatically import movies and TV shows into your Braidarr lists.</p>
            </div>
          </div>
        </div>

        <div className="content-area">
          {sources.length === 0 ? (
            <div className="empty-state">
              <MdStorage className="empty-icon" size={64} />
              <h3>No sources configured</h3>
              <p>Connect to external services like IMDb, Trakt, or Letterboxd to automatically import your lists and watchlists.</p>
              <button className="btn btn-primary" onClick={handleAddSource}>
                <MdAdd size={20} />
                Add Your First Source
              </button>
            </div>
          ) : (
            <div className="sources-grid">
              {sources.map(source => (
                <SourceCard
                  key={source.id}
                  source={source}
                  onEdit={handleEditSource}
                  onTest={handleTestConnection}
                  onSync={handleSyncSource}
                  onViewHealth={handleViewHealth}
                />
              ))}
            </div>
          )}
        </div>

        {/* Health Monitor */}
        {viewingHealthSource && (
          <div className="health-monitor-overlay">
            <div className="health-monitor-modal">
              <div className="modal-header">
                <h4>Health Monitor - {viewingHealthSource.name}</h4>
                <button 
                  className="btn-close"
                  onClick={() => setViewingHealthSource(null)}
                >
                  ×
                </button>
              </div>
              <div className="modal-body">
                <SourceHealthMonitor 
                  source={viewingHealthSource}
                  onHealthUpdate={(sourceId, healthScore) => {
                    setSources(prev => prev.map(s => 
                      s.id === sourceId ? { ...s, healthScore } : s
                    ));
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source Type Selector Modal */}
      {showSourceTypeSelector && (
        <div className="modal-overlay" onClick={() => setShowSourceTypeSelector(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Select Source Type</h4>
              <button 
                className="btn-close"
                onClick={() => setShowSourceTypeSelector(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="source-types-grid">
                {sourceTypeConfigs.map(config => (
                  <SourceTypeCard
                    key={config.type}
                    type={config.type}
                    title={config.title}
                    description={config.description}
                    icon={config.icon}
                    onSelect={handleSourceTypeSelect}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Source Configuration Modals */}
      {showAddModal && selectedSourceType && (
        <>
          {selectedSourceType === 'imdb_list' && (
            <ImdbListModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
          {selectedSourceType === 'imdb_watchlist' && (
            <ImdbWatchlistModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
          {(selectedSourceType === 'trakt_list' || selectedSourceType === 'trakt_collection') && (
            <TraktModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
              sourceType={selectedSourceType}
            />
          )}
          {selectedSourceType === 'letterboxd_list' && (
            <LetterboxdModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
          {selectedSourceType === 'tmdb_list' && (
            <TmdbListModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
          {selectedSourceType === 'custom_rss' && (
            <CustomRssModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
          {selectedSourceType === 'json_api' && (
            <JsonApiModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
          {selectedSourceType === 'csv_upload' && (
            <CsvUploadModal
              isOpen={showAddModal}
              onClose={() => {
                setShowAddModal(false);
                setEditingSource(null);
                setSelectedSourceType(null);
              }}
              onSubmit={handleSubmitSource}
              editingSource={editingSource || undefined}
            />
          )}
        </>
      )}
    </div>
  );
}