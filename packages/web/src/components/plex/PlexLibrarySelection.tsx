import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PlexLibraryLocation {
  id: number;
  path: string;
}

interface PlexLibrary {
  allowSync: boolean;
  art: string;
  composite: string;
  filters: boolean;
  refreshing: boolean;
  thumb: string;
  key: string;
  type: 'movie' | 'show' | 'artist' | 'photo' | 'mixed';
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
  location: PlexLibraryLocation[];
}

interface PlexServer {
  name: string;
  clientIdentifier: string;
  accessToken: string;
}

interface PlexLibrarySelectionProps {
  server: PlexServer;
  serverUrl: string;
  onLibrariesSelect: (libraries: PlexLibrary[]) => void;
  onBack: () => void;
  onError: (error: string) => void;
  apiBaseUrl?: string;
}

const PlexLibrarySelection: React.FC<PlexLibrarySelectionProps> = ({
  server,
  serverUrl,
  onLibrariesSelect,
  onBack,
  onError,
  apiBaseUrl = 'http://localhost:3401'
}) => {
  const [libraries, setLibraries] = useState<PlexLibrary[]>([]);
  const [selectedLibraries, setSelectedLibraries] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load libraries on mount
  useEffect(() => {
    loadLibraries();
  }, [server, serverUrl]);

  const loadLibraries = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<PlexLibrary[]>(
        `${apiBaseUrl}/api/v1/plex/servers/libraries`,
        {
          serverUrl,
          serverToken: server.accessToken
        }
      );
      setLibraries(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load libraries';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle library selection
  const toggleLibrary = (libraryKey: string) => {
    setSelectedLibraries(prev => {
      const next = new Set(prev);
      if (next.has(libraryKey)) {
        next.delete(libraryKey);
      } else {
        next.add(libraryKey);
      }
      return next;
    });
  };

  // Select all libraries of a specific type
  const selectAllOfType = (type: string) => {
    const librariesOfType = libraries
      .filter(lib => lib.type === type)
      .map(lib => lib.key);
    
    setSelectedLibraries(prev => {
      const next = new Set(prev);
      librariesOfType.forEach(key => next.add(key));
      return next;
    });
  };

  // Clear all selections
  const clearAll = () => {
    setSelectedLibraries(new Set());
  };

  // Handle final selection
  const handleConfirm = () => {
    const selectedLibraryObjects = libraries.filter(lib => 
      selectedLibraries.has(lib.key)
    );
    onLibrariesSelect(selectedLibraryObjects);
  };

  // Get library type icon
  const getLibraryIcon = (type: string) => {
    switch (type) {
      case 'movie': return '🎬';
      case 'show': return '📺';
      case 'artist': return '🎵';
      case 'photo': return '📷';
      case 'mixed': return '📁';
      default: return '📂';
    }
  };

  // Get library type display name
  const getLibraryTypeName = (type: string) => {
    switch (type) {
      case 'movie': return 'Movies';
      case 'show': return 'TV Shows';
      case 'artist': return 'Music';
      case 'photo': return 'Photos';
      case 'mixed': return 'Mixed';
      default: return type;
    }
  };

  // Format last updated time
  const formatLastUpdated = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString();
  };

  // Group libraries by type
  const librariesByType = libraries.reduce((acc, library) => {
    if (!acc[library.type]) {
      acc[library.type] = [];
    }
    acc[library.type]!.push(library);
    return acc;
  }, {} as Record<string, PlexLibrary[]>);

  if (isLoading) {
    return (
      <div className="library-selection">
        <div className="header">
          <button onClick={onBack} className="btn btn-secondary">← Back</button>
          <h3>Loading libraries...</h3>
        </div>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading libraries from {server.name}...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-selection">
        <div className="header">
          <button onClick={onBack} className="btn btn-secondary">← Back</button>
          <h3>Error Loading Libraries</h3>
        </div>
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={loadLibraries} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  if (libraries.length === 0) {
    return (
      <div className="library-selection">
        <div className="header">
          <button onClick={onBack} className="btn btn-secondary">← Back</button>
          <h3>No Libraries Found</h3>
        </div>
        <div className="no-libraries">
          <p>No libraries found on {server.name}.</p>
          <p>Make sure your Plex server has libraries configured.</p>
          <button onClick={loadLibraries} className="btn btn-primary">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="library-selection">
      <div className="header">
        <button onClick={onBack} className="btn btn-secondary">← Back</button>
        <div className="title">
          <h3>Select Libraries</h3>
          <p>Choose libraries to monitor from {server.name}</p>
        </div>
      </div>

      <div className="selection-actions">
        <div className="quick-actions">
          {Object.keys(librariesByType).map(type => (
            <button
              key={type}
              onClick={() => selectAllOfType(type)}
              className="btn btn-sm btn-secondary"
            >
              Select All {getLibraryTypeName(type)}
            </button>
          ))}
          <button onClick={clearAll} className="btn btn-sm btn-outline">
            Clear All
          </button>
        </div>
        
        <div className="selection-summary">
          {selectedLibraries.size} of {libraries.length} libraries selected
        </div>
      </div>

      <div className="libraries-list">
        {Object.entries(librariesByType).map(([type, typeLibraries]) => (
          <div key={type} className="library-type-group">
            <h4 className="type-header">
              {getLibraryIcon(type)} {getLibraryTypeName(type)}
              <span className="type-count">({typeLibraries.length})</span>
            </h4>
            
            <div className="libraries-grid">
              {typeLibraries.map(library => (
                <div
                  key={library.key}
                  className={`library-card ${selectedLibraries.has(library.key) ? 'selected' : ''}`}
                  onClick={() => toggleLibrary(library.key)}
                >
                  <div className="library-header">
                    <div className="library-title">
                      <h5>{library.title}</h5>
                      {library.refreshing && <span className="refreshing-badge">Refreshing</span>}
                    </div>
                    <div className="selection-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedLibraries.has(library.key)}
                        onChange={() => toggleLibrary(library.key)}
                      />
                    </div>
                  </div>
                  
                  <div className="library-details">
                    <p><strong>Agent:</strong> {library.agent}</p>
                    <p><strong>Scanner:</strong> {library.scanner}</p>
                    <p><strong>Language:</strong> {library.language}</p>
                    <p><strong>Last Updated:</strong> {formatLastUpdated(library.updatedAt)}</p>
                    {library.location.length > 0 && (
                      <p><strong>Paths:</strong></p>
                    )}
                    {library.location.map(loc => (
                      <p key={loc.id} className="library-path">• {loc.path}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="actions">
        <button onClick={onBack} className="btn btn-secondary">Cancel</button>
        <button
          onClick={handleConfirm}
          disabled={selectedLibraries.size === 0}
          className="btn btn-primary"
        >
          Continue with {selectedLibraries.size} Librar{selectedLibraries.size !== 1 ? 'ies' : 'y'}
        </button>
      </div>

      <style>{`
        .library-selection {
          max-width: 1000px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }

        .title h3 {
          margin: 0;
          color: #2d3748;
        }

        .title p {
          margin: 4px 0 0 0;
          color: #4a5568;
          font-size: 14px;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3182ce;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }

        .alert-error {
          background: #fed7d7;
          border: 1px solid #f56565;
          color: #c53030;
        }

        .no-libraries {
          text-align: center;
          padding: 40px;
        }

        .selection-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding: 16px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .quick-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .selection-summary {
          font-weight: 500;
          color: #2d3748;
        }

        .library-type-group {
          margin-bottom: 32px;
        }

        .type-header {
          margin: 0 0 16px 0;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 8px;
          padding-bottom: 8px;
          border-bottom: 2px solid #e2e8f0;
        }

        .type-count {
          color: #718096;
          font-weight: normal;
          font-size: 14px;
        }

        .libraries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 16px;
        }

        .library-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .library-card:hover {
          border-color: #cbd5e0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .library-card.selected {
          border-color: #3182ce;
          background: #ebf8ff;
          box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .library-title h5 {
          margin: 0;
          color: #2d3748;
          font-size: 16px;
        }

        .refreshing-badge {
          background: #fbb6ce;
          color: #97266d;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
          margin-left: 8px;
        }

        .selection-checkbox input[type="checkbox"] {
          width: 18px;
          height: 18px;
        }

        .library-details p {
          margin: 4px 0;
          color: #4a5568;
          font-size: 14px;
        }

        .library-path {
          font-family: monospace;
          font-size: 12px;
          color: #718096;
          margin: 2px 0 2px 12px;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .btn {
          padding: 10px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-primary {
          background: #3182ce;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2c5aa0;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .btn-outline {
          background: transparent;
          color: #4a5568;
          border: 1px solid #e2e8f0;
        }

        .btn-outline:hover:not(:disabled) {
          background: #f7fafc;
        }
      `}</style>
    </div>
  );
};

export default PlexLibrarySelection;