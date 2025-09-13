import { useState } from 'react';
import { DataTable } from '../DataTable/DataTable';
import { ImportList, ListItem, SyncLog, ExportLog } from '../../types/lists';
import { ColumnConfig } from '../DataTable/types';
import { 
  MdClose, 
  MdEdit, 
  MdSync, 
  MdUpload, 
  MdPlayArrow, 
  MdStop,
  MdHistory,
  MdList,
  MdSettings,
  MdSource,
  MdIntegrationInstructions,
  MdFilterList,
  MdSchedule,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo
} from 'react-icons/md';
import './ListDetailModal.css';

interface ListDetailModalProps {
  list: ImportList;
  onEdit: (list: ImportList) => void;
  onClose: () => void;
}

type TabType = 'overview' | 'items' | 'sync-history' | 'export-history' | 'settings';

// Mock data for list items
const generateMockItems = (): ListItem[] => [
  {
    id: '1',
    externalId: 'tmdb-12345',
    sourceId: 'tmdb1',
    sourceName: 'TMDB Popular',
    title: 'Dune: Part Two',
    year: 2024,
    posterUrl: '/api/placeholder/200/300',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge...',
    genres: ['Action', 'Adventure', 'Drama'],
    rating: 8.8,
    addedAt: new Date('2024-01-10T10:00:00Z'),
    exportedAt: new Date('2024-01-10T10:05:00Z'),
    exportStatus: 'success'
  },
  {
    id: '2',
    externalId: 'tmdb-67890',
    sourceId: 'tmdb1',
    sourceName: 'TMDB Popular',
    title: 'Oppenheimer',
    year: 2023,
    posterUrl: '/api/placeholder/200/300',
    overview: 'The story of American scientist J. Robert Oppenheimer...',
    genres: ['Biography', 'Drama', 'History'],
    rating: 8.3,
    addedAt: new Date('2024-01-08T14:30:00Z'),
    exportedAt: new Date('2024-01-08T14:32:00Z'),
    exportStatus: 'success'
  },
  {
    id: '3',
    externalId: 'tmdb-11111',
    sourceId: 'tmdb1',
    sourceName: 'TMDB Popular',
    title: 'The Batman',
    year: 2022,
    posterUrl: '/api/placeholder/200/300',
    overview: 'Batman ventures into Gotham City\'s underworld...',
    genres: ['Action', 'Crime', 'Drama'],
    rating: 7.8,
    addedAt: new Date('2024-01-05T09:15:00Z'),
    exportStatus: 'pending'
  }
];

// Mock sync logs
const generateMockSyncLogs = (): SyncLog[] => [
  {
    id: '1',
    timestamp: new Date('2024-01-15T10:30:00Z'),
    status: 'success',
    message: 'Successfully synced 25 new items',
    itemsAdded: 25,
    itemsRemoved: 2,
    duration: 30
  },
  {
    id: '2',
    timestamp: new Date('2024-01-14T10:30:00Z'),
    status: 'success',
    message: 'Successfully synced 12 new items',
    itemsAdded: 12,
    itemsRemoved: 0,
    duration: 18
  },
  {
    id: '3',
    timestamp: new Date('2024-01-13T10:30:00Z'),
    status: 'warning',
    message: 'Sync completed with warnings - some items filtered out',
    itemsAdded: 8,
    itemsRemoved: 1,
    duration: 25
  }
];

// Mock export logs
const generateMockExportLogs = (): ExportLog[] => [
  {
    id: '1',
    timestamp: new Date('2024-01-15T10:35:00Z'),
    targetId: 'radarr1',
    targetName: 'Radarr Main',
    status: 'success',
    message: 'Successfully exported 25 items',
    itemsExported: 25,
    duration: 5
  },
  {
    id: '2',
    timestamp: new Date('2024-01-14T10:32:00Z'),
    targetId: 'radarr1',
    targetName: 'Radarr Main',
    status: 'success',
    message: 'Successfully exported 12 items',
    itemsExported: 12,
    duration: 3
  },
  {
    id: '3',
    timestamp: new Date('2024-01-13T10:35:00Z'),
    targetId: 'radarr1',
    targetName: 'Radarr Main',
    status: 'failed',
    message: 'Connection timeout to Radarr instance',
    itemsExported: 0,
    duration: 30
  }
];

const ListDetailModal: React.FC<ListDetailModalProps> = ({ list, onEdit, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [items] = useState<ListItem[]>(generateMockItems());
  const [syncLogs] = useState<SyncLog[]>(generateMockSyncLogs());
  const [exportLogs] = useState<ExportLog[]>(generateMockExportLogs());

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Status badge renderer
  const renderStatusBadge = (status: string) => {
    const statusConfig = {
      success: { label: 'Success', icon: MdCheckCircle, className: 'status-badge--success' },
      warning: { label: 'Warning', icon: MdWarning, className: 'status-badge--warning' },
      error: { label: 'Error', icon: MdError, className: 'status-badge--danger' },
      failed: { label: 'Failed', icon: MdError, className: 'status-badge--danger' },
      pending: { label: 'Pending', icon: MdInfo, className: 'status-badge--secondary' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`status-badge ${config.className}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  // Items table columns
  const itemsColumns: ColumnConfig<ListItem>[] = [
    {
      key: 'title',
      title: 'Title',
      sortable: true,
      render: (value, item) => (
        <div className="item-title-cell">
          <div className="item-poster">
            <img src={item.posterUrl || '/api/placeholder/40/60'} alt={item.title} />
          </div>
          <div className="item-info">
            <div className="item-title">{value}</div>
            <div className="item-year">{item.year}</div>
            <div className="item-source">{item.sourceName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'genres',
      title: 'Genres',
      render: (value) => (value as string[]).join(', ')
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      align: 'center',
      render: (value) => value ? `⭐ ${value}` : '-'
    },
    {
      key: 'addedAt',
      title: 'Added',
      sortable: true,
      render: (value) => formatDate(value as Date)
    },
    {
      key: 'exportStatus',
      title: 'Export Status',
      render: (value) => renderStatusBadge(value as string)
    }
  ];

  // Sync logs columns
  const syncLogsColumns: ColumnConfig<SyncLog>[] = [
    {
      key: 'timestamp',
      title: 'Time',
      sortable: true,
      render: (value) => formatDate(value as Date)
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => renderStatusBadge(value as string)
    },
    {
      key: 'message',
      title: 'Message',
      render: (value) => value as string
    },
    {
      key: 'itemsAdded',
      title: 'Items Added',
      align: 'center',
      render: (value) => value as number
    },
    {
      key: 'itemsRemoved',
      title: 'Items Removed',
      align: 'center',
      render: (value) => value as number
    },
    {
      key: 'duration',
      title: 'Duration',
      align: 'center',
      render: (value) => formatDuration(value as number)
    }
  ];

  // Export logs columns
  const exportLogsColumns: ColumnConfig<ExportLog>[] = [
    {
      key: 'timestamp',
      title: 'Time',
      sortable: true,
      render: (value) => formatDate(value as Date)
    },
    {
      key: 'targetName',
      title: 'Target',
      render: (value) => value as string
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => renderStatusBadge(value as string)
    },
    {
      key: 'message',
      title: 'Message',
      render: (value) => value as string
    },
    {
      key: 'itemsExported',
      title: 'Items Exported',
      align: 'center',
      render: (value) => value as number
    },
    {
      key: 'duration',
      title: 'Duration',
      align: 'center',
      render: (value) => formatDuration(value as number)
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: MdInfo },
    { id: 'items', label: 'Items', icon: MdList },
    { id: 'sync-history', label: 'Sync History', icon: MdHistory },
    { id: 'export-history', label: 'Export History', icon: MdUpload },
    { id: 'settings', label: 'Settings', icon: MdSettings }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="overview-content">
            <div className="overview-grid">
              {/* Basic Info */}
              <div className="info-card">
                <h3 className="info-card-title">
                  <MdList size={20} />
                  Basic Information
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Name</span>
                    <span className="info-value">{list.name}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Type</span>
                    <span className="info-value">{list.type === 'movies' ? 'Movies' : 'TV Shows'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Status</span>
                    {renderStatusBadge(list.status)}
                  </div>
                  <div className="info-item">
                    <span className="info-label">Items</span>
                    <span className="info-value">{list.itemCount}</span>
                  </div>
                  {list.description && (
                    <div className="info-item info-item--full">
                      <span className="info-label">Description</span>
                      <span className="info-value">{list.description}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sources */}
              <div className="info-card">
                <h3 className="info-card-title">
                  <MdSource size={20} />
                  Sources
                </h3>
                <div className="sources-list">
                  {list.sources.map(source => (
                    <div key={source.id} className="source-item">
                      <div className="source-name">{source.name}</div>
                      <div className="source-type">{source.type.toUpperCase()}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Targets */}
              <div className="info-card">
                <h3 className="info-card-title">
                  <MdIntegrationInstructions size={20} />
                  Export Targets
                </h3>
                <div className="targets-list">
                  {list.exportTargets.length === 0 ? (
                    <div className="empty-state">No export targets configured</div>
                  ) : (
                    list.exportTargets.map(target => (
                      <div key={target.id} className="target-item">
                        <div className="target-name">{target.name}</div>
                        <div className="target-status">{renderStatusBadge(target.status)}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Sync Settings */}
              <div className="info-card">
                <h3 className="info-card-title">
                  <MdSchedule size={20} />
                  Sync Settings
                </h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">Frequency</span>
                    <span className="info-value">{list.syncFrequency}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Auto Sync</span>
                    <span className="info-value">{list.autoSync ? 'Enabled' : 'Disabled'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Last Sync</span>
                    <span className="info-value">
                      {list.lastSync ? formatDate(list.lastSync) : 'Never'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Next Sync</span>
                    <span className="info-value">
                      {list.nextSync ? formatDate(list.nextSync) : 'Manual only'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="info-card">
                <h3 className="info-card-title">
                  <MdFilterList size={20} />
                  Filter Rules
                </h3>
                {list.filterRules.length === 0 ? (
                  <div className="empty-state">No filters configured - all items included</div>
                ) : (
                  <div className="filters-list">
                    {list.filterRules.map(rule => (
                      <div key={rule.id} className="filter-item">
                        <span className="filter-type">{rule.type}</span>
                        <span className="filter-operator">{rule.operator.replace('_', ' ')}</span>
                        <span className="filter-value">{rule.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'items':
        return (
          <div className="items-content">
            <DataTable
              data={items}
              columns={itemsColumns}
              emptyMessage="No items found in this list"
              pagination={true}
              pageSize={10}
              exportable={true}
              exportOptions={{
                formats: ['csv', 'json'],
                filename: `${list.name}-items`
              }}
            />
          </div>
        );

      case 'sync-history':
        return (
          <div className="logs-content">
            <DataTable
              data={syncLogs}
              columns={syncLogsColumns}
              emptyMessage="No sync history available"
              pagination={true}
              pageSize={10}
              defaultSort={{ column: 'timestamp', direction: 'desc' }}
            />
          </div>
        );

      case 'export-history':
        return (
          <div className="logs-content">
            <DataTable
              data={exportLogs}
              columns={exportLogsColumns}
              emptyMessage="No export history available"
              pagination={true}
              pageSize={10}
              defaultSort={{ column: 'timestamp', direction: 'desc' }}
            />
          </div>
        );

      case 'settings':
        return (
          <div className="settings-content">
            <div className="settings-actions">
              <button className="btn btn--primary" onClick={() => onEdit(list)}>
                <MdEdit size={16} />
                Edit List Configuration
              </button>
              <button className="btn btn--secondary">
                <MdSync size={16} />
                Sync Now
              </button>
              <button className="btn btn--secondary">
                <MdUpload size={16} />
                Export Now
              </button>
              {list.status === 'active' ? (
                <button className="btn btn--warning">
                  <MdStop size={16} />
                  Deactivate List
                </button>
              ) : (
                <button className="btn btn--success">
                  <MdPlayArrow size={16} />
                  Activate List
                </button>
              )}
              <button className="btn btn--danger">
                <MdClose size={16} />
                Delete List
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-content--large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-section">
            <h2 className="modal-title">{list.name}</h2>
            <div className="modal-subtitle">
              {list.description || `${list.type === 'movies' ? 'Movie' : 'TV Show'} import list`}
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <div className="modal-tabs">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'tab-button--active' : ''}`}
                onClick={() => setActiveTab(tab.id as TabType)}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="modal-body">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ListDetailModal;