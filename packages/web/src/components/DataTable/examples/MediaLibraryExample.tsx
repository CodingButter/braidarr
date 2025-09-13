import React, { useState, useMemo } from 'react';
import { DataTable, CellRenderers, TableColumn, BulkAction, ProgressBar } from '../index';
import '../DataTable.css';

// Mock data structure similar to Sonarr/Radarr
interface MediaItem {
  id: number;
  title: string;
  year: number;
  status: 'Downloaded' | 'Wanted' | 'Missing' | 'Monitored' | 'Unmonitored';
  quality: string;
  size: number; // in GB
  dateAdded: Date;
  lastUpdated: Date;
  genres: string[];
  rating: number;
  progress: number; // download progress 0-100
  poster: string;
  monitored: boolean;
}

// Generate mock data
const generateMockData = (): MediaItem[] => {
  const statuses: MediaItem['status'][] = ['Downloaded', 'Wanted', 'Missing', 'Monitored', 'Unmonitored'];
  const qualities = ['1080p', '720p', '4K', '2160p', 'DVD'];
  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Sci-Fi', 'Thriller', 'Romance', 'Animation'];
  
  return Array.from({ length: 150 }, (_, i) => ({
    id: i + 1,
    title: `Movie Title ${i + 1}`,
    year: 1990 + Math.floor(Math.random() * 34),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    quality: qualities[Math.floor(Math.random() * qualities.length)],
    size: Math.round(Math.random() * 50 * 100) / 100,
    dateAdded: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    genres: genres.sort(() => 0.5 - Math.random()).slice(0, Math.ceil(Math.random() * 3)),
    rating: Math.round(Math.random() * 100) / 10,
    progress: Math.floor(Math.random() * 101),
    poster: `https://via.placeholder.com/64x96/666/fff?text=M${i + 1}`,
    monitored: Math.random() > 0.3
  }));
};

const MediaLibraryExample: React.FC = () => {
  const [mockData] = useState<MediaItem[]>(generateMockData());
  const [loading, setLoading] = useState(false);

  // Column definitions
  const columns: TableColumn<MediaItem>[] = useMemo(() => [
    {
      key: 'poster',
      label: '',
      sortable: false,
      width: 80,
      render: CellRenderers.image({ width: 48, height: 72, alt: 'Movie poster' })
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{value}</div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>({row.year})</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: CellRenderers.status({
        Downloaded: { variant: 'success' },
        Wanted: { variant: 'info' },
        Missing: { variant: 'warning' },
        Monitored: { variant: 'default' },
        Unmonitored: { variant: 'error' }
      })
    },
    {
      key: 'quality',
      label: 'Quality',
      sortable: true,
      align: 'center'
    },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      align: 'right',
      render: CellRenderers.number({ decimals: 2, suffix: ' GB' })
    },
    {
      key: 'progress',
      label: 'Progress',
      sortable: true,
      render: ({ value, row }) => {
        if (row.status !== 'Downloaded' && row.status !== 'Wanted') {
          return '-';
        }
        return (
          <ProgressBar 
            value={value} 
            variant={value === 100 ? 'success' : 'default'}
            showText={true}
          />
        );
      }
    },
    {
      key: 'rating',
      label: 'Rating',
      sortable: true,
      align: 'center',
      render: (value) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
          <span>{value}/10</span>
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M6 1l1.545 3.13L11 4.635l-2.5 2.435L9 10 6 8.315 3 10l.5-2.93L1 4.635l3.455-.505L6 1z"
              fill={value >= 7 ? '#fbbf24' : '#d1d5db'}
            />
          </svg>
        </div>
      )
    },
    {
      key: 'monitored',
      label: 'Monitored',
      sortable: true,
      align: 'center',
      render: CellRenderers.boolean({ showIcon: true })
    },
    {
      key: 'genres',
      label: 'Genres',
      sortable: false,
      render: CellRenderers.tags({ 
        maxVisible: 2,
        colorMap: {
          'Action': '#ef4444',
          'Comedy': '#f97316',
          'Drama': '#3b82f6',
          'Horror': '#7c2d12',
          'Sci-Fi': '#059669',
          'Thriller': '#7c3aed',
          'Romance': '#ec4899',
          'Animation': '#06b6d4'
        }
      })
    },
    {
      key: 'dateAdded',
      label: 'Date Added',
      sortable: true,
      render: CellRenderers.date()
    }
  ], []);

  // Bulk actions
  const bulkActions: BulkAction[] = useMemo(() => [
    {
      id: 'monitor',
      label: 'Monitor',
      color: 'success',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 1L2 6h3v8h6V6h3L8 1z" fill="currentColor" />
        </svg>
      ),
      onClick: (selectedData) => {
        console.log('Monitor selected items:', selectedData);
        alert(`Monitoring ${selectedData.length} items`);
      }
    },
    {
      id: 'unmonitor',
      label: 'Unmonitor',
      color: 'warning',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M8 15L2 10h3V2h6v8h3L8 15z" fill="currentColor" />
        </svg>
      ),
      onClick: (selectedData) => {
        console.log('Unmonitor selected items:', selectedData);
        alert(`Unmonitoring ${selectedData.length} items`);
      }
    },
    {
      id: 'search',
      label: 'Search',
      color: 'primary',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="6.5" cy="6.5" r="5.5" stroke="currentColor" fill="none" strokeWidth="1.5" />
          <path d="M11.5 11.5L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      ),
      onClick: (selectedData) => {
        console.log('Search for selected items:', selectedData);
        alert(`Searching for ${selectedData.length} items`);
      }
    },
    {
      id: 'delete',
      label: 'Delete',
      color: 'danger',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path 
            d="M6 2V1h4v1h4v1.5H2V2h4zM3.5 4h9l-.5 10H4L3.5 4z" 
            fill="currentColor" 
          />
        </svg>
      ),
      onClick: (selectedData) => {
        if (confirm(`Are you sure you want to delete ${selectedData.length} items?`)) {
          console.log('Delete selected items:', selectedData);
          alert(`Deleted ${selectedData.length} items`);
        }
      }
    }
  ], []);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <div style={{ padding: '24px', maxWidth: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
          Media Library
        </h1>
        <p style={{ color: '#6b7280' }}>
          Manage your movie collection with advanced filtering, sorting, and bulk actions.
        </p>
        <div style={{ marginTop: '16px' }}>
          <button
            onClick={handleRefresh}
            style={{
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh Library
          </button>
        </div>
      </div>

      <DataTable
        data={mockData}
        columns={columns}
        loading={loading}
        emptyMessage="No movies in your library"
        
        // Enable all features
        sortable={true}
        filterable={true}
        pagination={true}
        selectable={true}
        exportable={true}
        
        // Selection
        selectionMode="multiple"
        bulkActions={bulkActions}
        
        // Export
        exportOptions={{
          formats: ['csv', 'json', 'excel'],
          filename: 'media-library',
          includeHeaders: true,
          selectedOnly: false
        }}
        
        // Responsive
        responsive={true}
        breakpoint="md"
        
        // Callbacks
        onRowClick={(row) => {
          console.log('Row clicked:', row);
        }}
        onRowDoubleClick={(row) => {
          console.log('Row double-clicked:', row);
        }}
        
        rowClassName={(row) => {
          return row.monitored ? '' : 'opacity-50';
        }}
        
        className="media-library-table"
      />

      {/* Additional styles */}
      <style>{`
        .media-library-table .data-table__row.opacity-50 {
          opacity: 0.6;
        }
        
        .tag-list {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        
        .tag-list__tag {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
          color: white;
          background: #6b7280;
        }
        
        .tag-list__more {
          font-size: 11px;
          color: #6b7280;
        }
        
        .boolean-cell {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
        }
        
        .boolean-cell--true {
          color: #059669;
        }
        
        .boolean-cell--false {
          color: #dc2626;
        }
        
        .cell-image {
          border-radius: 4px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default MediaLibraryExample;