import { useState, useEffect, useCallback } from 'react';
import { DataTable } from '../components/DataTable/DataTable';
import { ImportList, ListFilters, ListStatus, ListType } from '../types/lists';
import { BulkActionConfig, ColumnConfig } from '../components/DataTable/types';
import { 
  MdAdd, 
  MdPlayArrow, 
  MdStop, 
  MdSync, 
  MdUpload, 
  MdEdit, 
  MdDelete,
  MdVisibility,
  MdMovie,
  MdTv
} from 'react-icons/md';
import ListModal from '../components/lists/ListModal';
import ListDetailModal from '../components/lists/ListDetailModal';
import './ListsPage.css';

// Mock data for development
const generateMockLists = (): ImportList[] => [
  {
    id: '1',
    name: 'Popular Movies 2024',
    description: 'Top rated movies from 2024',
    type: 'movies' as ListType,
    status: 'active' as ListStatus,
    sources: [
      {
        id: 'tmdb1',
        name: 'TMDB Popular',
        type: 'tmdb',
        enabled: true,
        config: { listId: 'popular', minRating: 7.0 }
      }
    ],
    filterRules: [
      {
        id: 'year1',
        type: 'year',
        operator: 'equals',
        value: 2024
      },
      {
        id: 'rating1',
        type: 'rating',
        operator: 'greater_than',
        value: 7.0
      }
    ],
    syncFrequency: 'daily',
    lastSync: new Date('2024-01-15T10:30:00Z'),
    nextSync: new Date('2024-01-16T10:30:00Z'),
    autoSync: true,
    exportTargets: [
      {
        id: 'radarr1',
        name: 'Radarr Main',
        type: 'radarr',
        url: 'http://radarr:7878',
        apiKey: 'abc123',
        enabled: true,
        lastExport: new Date('2024-01-15T10:35:00Z'),
        status: 'success'
      }
    ],
    autoExport: true,
    itemCount: 156,
    totalItems: 200,
    lastSyncDuration: 30,
    items: [],
    syncLogs: [],
    exportLogs: [],
    createdAt: new Date('2024-01-01T00:00:00Z'),
    updatedAt: new Date('2024-01-15T10:35:00Z'),
    createdBy: 'admin'
  },
  {
    id: '2',
    name: 'Trending TV Shows',
    description: 'Currently trending TV series',
    type: 'tv' as ListType,
    status: 'syncing' as ListStatus,
    sources: [
      {
        id: 'trakt1',
        name: 'Trakt Trending',
        type: 'trakt',
        enabled: true,
        config: { period: 'weekly' }
      }
    ],
    filterRules: [],
    syncFrequency: 'hourly',
    lastSync: new Date('2024-01-15T09:00:00Z'),
    nextSync: new Date('2024-01-15T10:00:00Z'),
    autoSync: true,
    exportTargets: [
      {
        id: 'sonarr1',
        name: 'Sonarr Main',
        type: 'sonarr',
        url: 'http://sonarr:8989',
        apiKey: 'def456',
        enabled: true,
        lastExport: new Date('2024-01-15T09:05:00Z'),
        status: 'success'
      }
    ],
    autoExport: true,
    itemCount: 42,
    totalItems: 50,
    lastSyncDuration: 15,
    items: [],
    syncLogs: [],
    exportLogs: [],
    createdAt: new Date('2024-01-10T00:00:00Z'),
    updatedAt: new Date('2024-01-15T09:05:00Z'),
    createdBy: 'admin'
  },
  {
    id: '3',
    name: 'My Watchlist',
    description: 'Personal watchlist from various sources',
    type: 'movies' as ListType,
    status: 'inactive' as ListStatus,
    sources: [
      {
        id: 'imdb1',
        name: 'IMDB Watchlist',
        type: 'imdb',
        enabled: false,
        config: { userId: 'ur12345678' }
      }
    ],
    filterRules: [],
    syncFrequency: 'manual',
    autoSync: false,
    exportTargets: [],
    autoExport: false,
    itemCount: 0,
    totalItems: 0,
    items: [],
    syncLogs: [],
    exportLogs: [],
    createdAt: new Date('2024-01-05T00:00:00Z'),
    updatedAt: new Date('2024-01-05T00:00:00Z'),
    createdBy: 'admin'
  }
];

const ListsPage: React.FC = () => {
  const [lists, setLists] = useState<ImportList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ListFilters>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingList, setEditingList] = useState<ImportList | null>(null);
  const [viewingList, setViewingList] = useState<ImportList | null>(null);

  // Load lists data
  useEffect(() => {
    const loadLists = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLists(generateMockLists());
      } catch (err) {
        setError('Failed to load lists');
      } finally {
        setLoading(false);
      }
    };

    loadLists();
  }, []);

  // Calculate statistics
  const statistics = {
    totalLists: lists.length,
    activeLists: lists.filter(list => list.status === 'active').length,
    totalItems: lists.reduce((sum, list) => sum + list.itemCount, 0),
    lastSyncTime: lists.reduce((latest, list) => {
      if (!list.lastSync) return latest;
      return !latest || list.lastSync > latest ? list.lastSync : latest;
    }, null as Date | null)
  };

  // Status badge renderer
  const renderStatus = (status: ListStatus) => {
    const statusConfig = {
      active: { label: 'Active', className: 'status-badge status-badge--success' },
      inactive: { label: 'Inactive', className: 'status-badge status-badge--secondary' },
      syncing: { label: 'Syncing', className: 'status-badge status-badge--warning' },
      error: { label: 'Error', className: 'status-badge status-badge--danger' }
    };

    const config = statusConfig[status];
    return <span className={config.className}>{config.label}</span>;
  };

  // Type badge renderer
  const renderType = (type: ListType) => {
    const Icon = type === 'movies' ? MdMovie : MdTv;
    const label = type === 'movies' ? 'Movies' : 'TV Shows';
    return (
      <div className="type-badge">
        <Icon size={16} />
        <span>{label}</span>
      </div>
    );
  };

  // Date formatter
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Export targets renderer
  const renderExportTargets = (targets: ImportList['exportTargets']) => {
    if (targets.length === 0) return 'None';
    return targets.map(target => target.name).join(', ');
  };

  // Define table columns
  const columns: ColumnConfig<ImportList>[] = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (value, list) => (
        <div className="list-name-cell">
          <div className="list-name">{value}</div>
          {list.description && <div className="list-description">{list.description}</div>}
        </div>
      )
    },
    {
      key: 'type',
      title: 'Type',
      sortable: true,
      render: (value) => renderType(value as ListType)
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => renderStatus(value as ListStatus)
    },
    {
      key: 'itemCount',
      title: 'Items',
      sortable: true,
      align: 'center',
      render: (value, list) => (
        <div className="item-count">
          <span className="count-current">{value}</span>
          {list.totalItems > 0 && (
            <span className="count-total">/ {list.totalItems}</span>
          )}
        </div>
      )
    },
    {
      key: 'lastSync',
      title: 'Last Sync',
      sortable: true,
      render: (value) => formatDate(value)
    },
    {
      key: 'exportTargets',
      title: 'Export To',
      render: (value) => renderExportTargets(value)
    },
    {
      key: 'actions',
      title: 'Actions',
      width: 120,
      render: (_, list) => (
        <div className="action-buttons">
          <button
            className="btn btn--icon btn--small"
            onClick={(e) => {
              e.stopPropagation();
              handleViewList(list);
            }}
            title="View Details"
          >
            <MdVisibility size={16} />
          </button>
          <button
            className="btn btn--icon btn--small"
            onClick={(e) => {
              e.stopPropagation();
              handleEditList(list);
            }}
            title="Edit List"
          >
            <MdEdit size={16} />
          </button>
          <button
            className="btn btn--icon btn--small"
            onClick={(e) => {
              e.stopPropagation();
              handleSyncList(list.id);
            }}
            title="Sync Now"
            disabled={list.status === 'syncing'}
          >
            <MdSync size={16} />
          </button>
        </div>
      )
    }
  ];

  // Bulk actions configuration
  const bulkActions: BulkActionConfig<ImportList>[] = [
    {
      id: 'sync',
      label: 'Sync Selected',
      icon: MdSync,
      action: (selectedData) => handleBulkSync(selectedData.map(item => item.id)),
      variant: 'primary'
    },
    {
      id: 'export',
      label: 'Export Selected',
      icon: MdUpload,
      action: (selectedData) => handleBulkExport(selectedData.map(item => item.id)),
      variant: 'secondary'
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: MdPlayArrow,
      action: (selectedData) => handleBulkStatusChange(selectedData.map(item => item.id), 'active'),
      variant: 'secondary'
    },
    {
      id: 'deactivate',
      label: 'Deactivate',
      icon: MdStop,
      action: (selectedData) => handleBulkStatusChange(selectedData.map(item => item.id), 'inactive'),
      variant: 'secondary'
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: MdDelete,
      action: (selectedData) => handleBulkDelete(selectedData.map(item => item.id)),
      variant: 'danger',
      requireConfirmation: true,
      confirmationMessage: 'Are you sure you want to delete the selected lists? This action cannot be undone.'
    }
  ];

  // Action handlers
  const handleCreateList = () => {
    setEditingList(null);
    setIsCreateModalOpen(true);
  };

  const handleEditList = (list: ImportList) => {
    setEditingList(list);
    setIsCreateModalOpen(true);
  };

  const handleViewList = (list: ImportList) => {
    setViewingList(list);
    setIsDetailModalOpen(true);
  };

  const handleSyncList = async (listId: string) => {
    // Implement sync logic
    console.log('Syncing list:', listId);
  };

  const handleBulkSync = async (listIds: string[]) => {
    console.log('Bulk syncing lists:', listIds);
  };

  const handleBulkExport = async (listIds: string[]) => {
    console.log('Bulk exporting lists:', listIds);
  };

  const handleBulkStatusChange = async (listIds: string[], status: ListStatus) => {
    console.log('Bulk status change:', listIds, status);
  };

  const handleBulkDelete = async (listIds: string[]) => {
    console.log('Bulk delete lists:', listIds);
  };

  const handleRowClick = (list: ImportList) => {
    handleViewList(list);
  };

  const handleSaveList = async (listData: any) => {
    try {
      // Implement save logic
      console.log('Saving list:', listData);
      setIsCreateModalOpen(false);
      setEditingList(null);
    } catch (error) {
      console.error('Failed to save list:', error);
    }
  };

  return (
    <div className="lists-page">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Import Lists</h1>
          <p className="page-subtitle">
            Manage lists that automatically import content into Sonarr and Radarr
          </p>
        </div>
        <div className="page-actions">
          <button 
            className="btn btn--primary"
            onClick={handleCreateList}
          >
            <MdAdd size={20} />
            Create List
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Lists</div>
          <div className="stat-value">{statistics.totalLists}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Active Lists</div>
          <div className="stat-value">{statistics.activeLists}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Items</div>
          <div className="stat-value">{statistics.totalItems.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Last Sync</div>
          <div className="stat-value">
            {statistics.lastSyncTime ? formatDate(statistics.lastSyncTime) : 'Never'}
          </div>
        </div>
      </div>

      {/* Lists Table */}
      <div className="lists-table-container">
        <DataTable
          data={lists}
          columns={columns}
          loading={loading}
          error={error}
          emptyMessage="No import lists found. Create your first list to get started."
          
          // Selection
          selectable={true}
          selectedRows={selectedRows}
          onSelectionChange={(newSelection) => setSelectedRows(newSelection)}
          getRowId={(row) => row.id}
          
          // Bulk actions
          bulkActions={bulkActions}
          
          // Interaction
          onRowClick={handleRowClick}
          
          // Export
          exportable={true}
          exportOptions={{
            formats: ['csv', 'json'],
            filename: 'import-lists'
          }}
          
          className="lists-table"
        />
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <ListModal
          list={editingList}
          onSave={handleSaveList}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingList(null);
          }}
        />
      )}

      {isDetailModalOpen && viewingList && (
        <ListDetailModal
          list={viewingList}
          onEdit={(list) => {
            setIsDetailModalOpen(false);
            handleEditList(list);
          }}
          onClose={() => {
            setIsDetailModalOpen(false);
            setViewingList(null);
          }}
        />
      )}
    </div>
  );
};

export default ListsPage;