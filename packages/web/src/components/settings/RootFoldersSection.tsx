import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdFolder,
  MdFolderOpen,
  MdStorage,
  MdInfo,
  MdWarning,
  MdError,
  MdCheckCircle,
  MdRefresh,
  MdSearch
} from 'react-icons/md';

// Types
interface RootFolderStats {
  totalSpace: number; // in bytes
  freeSpace: number; // in bytes
  usedSpace: number; // in bytes
  totalItems: number;
  unmappedFolders: number;
}

interface RootFolder {
  id: string;
  name: string;
  path: string;
  accessible: boolean;
  freeSpace: number; // in bytes
  totalSpace: number; // in bytes
  unmappedFolders: string[]; // folder names that don't match any series/movies
  defaultQualityProfile?: string;
  defaultLanguageProfile?: string;
  monitorNewItems: boolean;
  isDefault: boolean;
  stats: RootFolderStats;
  lastScan: Date | null;
  createdAt: string;
  updatedAt: string;
}

interface UnmappedFolder {
  name: string;
  path: string;
  size: number;
  modified: Date;
}

interface RootFoldersSectionProps {
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function RootFoldersSection({ onMessage }: RootFoldersSectionProps) {
  const [rootFolders, setRootFolders] = useState<RootFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingFolder, setEditingFolder] = useState<RootFolder | null>(null);
  const [scanningFolder, setScanningFolder] = useState<string | null>(null);
  const [selectedFolderUnmapped, setSelectedFolderUnmapped] = useState<{ folderId: string; folders: UnmappedFolder[] } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    monitorNewItems: true,
    defaultQualityProfile: '',
    defaultLanguageProfile: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadRootFolders();
  }, []);

  const loadRootFolders = async () => {
    try {
      const response = await fetch('/api/v1/root-folders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setRootFolders(data.rootFolders);
      } else {
        onMessage('Failed to load root folders', 'error');
      }
    } catch (error) {
      onMessage('Error loading root folders: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRootFolder = async () => {
    try {
      const response = await fetch('/api/v1/root-folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onMessage('Root folder added successfully', 'success');
        resetForm();
        setShowCreateForm(false);
        loadRootFolders();
      } else {
        const error = await response.json();
        onMessage('Failed to add root folder: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error adding root folder: ' + (error as Error).message, 'error');
    }
  };

  const handleUpdateRootFolder = async (id: string, updates: Partial<RootFolder>) => {
    try {
      const response = await fetch(`/api/v1/root-folders/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        onMessage('Root folder updated successfully', 'success');
        setEditingFolder(null);
        loadRootFolders();
      } else {
        const error = await response.json();
        onMessage('Failed to update root folder: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error updating root folder: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteRootFolder = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove the root folder "${name}"? This will not delete any files, but will remove all associated series/movies from Braidarr.`)) {
      try {
        const response = await fetch(`/api/v1/root-folders/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          onMessage('Root folder removed successfully', 'success');
          loadRootFolders();
        } else {
          const error = await response.json();
          onMessage('Failed to remove root folder: ' + error.message, 'error');
        }
      } catch (error) {
        onMessage('Error removing root folder: ' + (error as Error).message, 'error');
      }
    }
  };

  const handleScanRootFolder = async (folderId: string) => {
    setScanningFolder(folderId);
    
    try {
      const response = await fetch(`/api/v1/root-folders/${folderId}/scan`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        onMessage('Root folder scan started', 'info');
        // Refresh folder data after scan
        setTimeout(() => loadRootFolders(), 2000);
      } else {
        const error = await response.json();
        onMessage('Failed to scan root folder: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error scanning root folder: ' + (error as Error).message, 'error');
    } finally {
      setScanningFolder(null);
    }
  };

  const loadUnmappedFolders = async (folderId: string) => {
    try {
      const response = await fetch(`/api/v1/root-folders/${folderId}/unmapped`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedFolderUnmapped({ folderId, folders: data.unmappedFolders });
      } else {
        onMessage('Failed to load unmapped folders', 'error');
      }
    } catch (error) {
      onMessage('Error loading unmapped folders: ' + (error as Error).message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      path: '',
      monitorNewItems: true,
      defaultQualityProfile: '',
      defaultLanguageProfile: '',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getUsagePercentage = (used: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((used / total) * 100);
  };

  const getStatusIcon = (folder: RootFolder) => {
    if (!folder.accessible) {
      return <MdError className="status-icon error" size={16} />;
    }
    
    const freePercent = (folder.freeSpace / folder.totalSpace) * 100;
    if (freePercent < 10) {
      return <MdWarning className="status-icon warning" size={16} />;
    }
    
    return <MdCheckCircle className="status-icon success" size={16} />;
  };

  if (loading) {
    return (
      <div className="settings-section">
        <h3>Root Folders</h3>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <h3>Root Folders</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <MdAdd size={20} />
          Add Root Folder
        </button>
      </div>

      <div className="root-folders-info">
        <div className="info-box">
          <MdInfo size={20} />
          <div>
            <p>Root folders are the base directories where Braidarr will organize your media files. Each root folder can have its own quality and language profiles.</p>
            <p><strong>Important:</strong> Ensure the application has read/write permissions to these directories.</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {rootFolders.length > 0 && (
        <div className="root-folders-overview">
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-value">{rootFolders.length}</div>
              <div className="stat-label">Root Folders</div>
            </div>
            <div className="stat">
              <div className="stat-value">{rootFolders.filter(f => f.accessible).length}</div>
              <div className="stat-label">Accessible</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {formatBytes(rootFolders.reduce((sum, f) => sum + f.totalSpace, 0))}
              </div>
              <div className="stat-label">Total Space</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {formatBytes(rootFolders.reduce((sum, f) => sum + f.freeSpace, 0))}
              </div>
              <div className="stat-label">Free Space</div>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingFolder) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateForm(false);
          setEditingFolder(null);
        }}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{editingFolder ? 'Edit Root Folder' : 'Add Root Folder'}</h4>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingFolder(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="folder-name">Name</label>
                <input
                  type="text"
                  id="folder-name"
                  className="form-input"
                  placeholder="e.g., Movies, TV Shows, Media"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <div className="form-help">A friendly name for this root folder</div>
              </div>

              <div className="form-group">
                <label htmlFor="folder-path">Path</label>
                <input
                  type="text"
                  id="folder-path"
                  className="form-input"
                  placeholder="/media/movies or C:\Media\Movies"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                />
                <div className="form-help">Full path to the root folder on your system</div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.monitorNewItems}
                    onChange={(e) => setFormData({ ...formData, monitorNewItems: e.target.checked })}
                  />
                  <span className="checkbox-text">Monitor new items</span>
                </label>
                <div className="form-help">Automatically monitor new series/movies added to this folder</div>
              </div>

              <div className="form-group">
                <label htmlFor="default-quality">Default Quality Profile</label>
                <select
                  id="default-quality"
                  className="form-select"
                  value={formData.defaultQualityProfile}
                  onChange={(e) => setFormData({ ...formData, defaultQualityProfile: e.target.value })}
                >
                  <option value="">Select quality profile</option>
                  {/* Quality profiles would be loaded from API */}
                  <option value="hd">HD</option>
                  <option value="uhd">Ultra HD</option>
                  <option value="any">Any</option>
                </select>
                <div className="form-help">Default quality profile for new items in this folder</div>
              </div>

              <div className="form-group">
                <label htmlFor="default-language">Default Language Profile</label>
                <select
                  id="default-language"
                  className="form-select"
                  value={formData.defaultLanguageProfile}
                  onChange={(e) => setFormData({ ...formData, defaultLanguageProfile: e.target.value })}
                >
                  <option value="">Select language profile</option>
                  <option value="en">English</option>
                  <option value="multi">Multi-Language</option>
                  <option value="original">Original Language</option>
                </select>
                <div className="form-help">Default language profile for new items in this folder</div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingFolder(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (editingFolder) {
                    handleUpdateRootFolder(editingFolder.id, formData);
                  } else {
                    handleCreateRootFolder();
                  }
                }}
                disabled={!formData.name || !formData.path}
              >
                {editingFolder ? 'Update Folder' : 'Add Folder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unmapped Folders Modal */}
      {selectedFolderUnmapped && (
        <div className="modal-overlay" onClick={() => setSelectedFolderUnmapped(null)}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Unmapped Folders</h4>
              <button 
                className="btn-close"
                onClick={() => setSelectedFolderUnmapped(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {selectedFolderUnmapped.folders.length === 0 ? (
                <div className="empty-state">
                  <p>No unmapped folders found.</p>
                  <p>All folders in this root directory are properly mapped to series or movies.</p>
                </div>
              ) : (
                <div className="unmapped-folders-list">
                  <div className="list-header">
                    <span>Folder Name</span>
                    <span>Size</span>
                    <span>Modified</span>
                    <span>Actions</span>
                  </div>
                  
                  {selectedFolderUnmapped.folders.map((folder) => (
                    <div key={folder.path} className="unmapped-folder-item">
                      <div className="folder-info">
                        <MdFolderOpen className="folder-icon" size={16} />
                        <div>
                          <div className="folder-name">{folder.name}</div>
                          <div className="folder-path">{folder.path}</div>
                        </div>
                      </div>
                      
                      <div className="folder-size">
                        {formatBytes(folder.size)}
                      </div>
                      
                      <div className="folder-modified">
                        {new Date(folder.modified).toLocaleDateString()}
                      </div>
                      
                      <div className="folder-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            // This would open a search/add dialog for this specific folder
                            onMessage(`Would search for: ${folder.name}`, 'info');
                          }}
                        >
                          <MdSearch size={14} />
                          Search & Add
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedFolderUnmapped(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Root Folders List */}
      <div className="root-folders-list">
        {rootFolders.length === 0 ? (
          <div className="empty-state">
            <p>No root folders configured yet.</p>
            <p>Add your first root folder to start organizing your media files.</p>
          </div>
        ) : (
          <div className="folders-grid">
            {rootFolders.map((folder) => (
              <div key={folder.id} className="folder-card">
                <div className="folder-header">
                  <div className="folder-info">
                    <div className="folder-name-row">
                      <MdFolder className="folder-icon" size={20} />
                      <h4 className="folder-name">
                        {folder.name}
                        {folder.isDefault && (
                          <span className="default-badge">Default</span>
                        )}
                      </h4>
                      {getStatusIcon(folder)}
                    </div>
                    <div className="folder-path">{folder.path}</div>
                  </div>
                  
                  <div className="folder-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleScanRootFolder(folder.id)}
                      disabled={scanningFolder === folder.id}
                      title="Scan folder"
                    >
                      {scanningFolder === folder.id ? (
                        <MdRefresh className="spinning" size={16} />
                      ) : (
                        <MdRefresh size={16} />
                      )}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditingFolder(folder);
                        setFormData({
                          name: folder.name,
                          path: folder.path,
                          monitorNewItems: folder.monitorNewItems,
                          defaultQualityProfile: folder.defaultQualityProfile || '',
                          defaultLanguageProfile: folder.defaultLanguageProfile || '',
                        });
                      }}
                      title="Edit folder"
                    >
                      <MdEdit size={16} />
                    </button>
                    {!folder.isDefault && (
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteRootFolder(folder.id, folder.name)}
                        title="Remove folder"
                      >
                        <MdDelete size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="folder-stats">
                  <div className="storage-info">
                    <div className="storage-bar">
                      <div 
                        className="storage-used"
                        style={{ 
                          width: `${getUsagePercentage(folder.totalSpace - folder.freeSpace, folder.totalSpace)}%` 
                        }}
                      ></div>
                    </div>
                    <div className="storage-text">
                      {formatBytes(folder.totalSpace - folder.freeSpace)} used of {formatBytes(folder.totalSpace)}
                    </div>
                  </div>
                  
                  <div className="folder-details">
                    <div className="detail-row">
                      <span className="detail-label">Items:</span>
                      <span className="detail-value">{folder.stats.totalItems}</span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Unmapped:</span>
                      <span className="detail-value">
                        {folder.stats.unmappedFolders > 0 ? (
                          <button
                            className="btn-link"
                            onClick={() => loadUnmappedFolders(folder.id)}
                          >
                            {folder.stats.unmappedFolders} folders
                          </button>
                        ) : (
                          '0 folders'
                        )}
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Last Scan:</span>
                      <span className="detail-value">
                        {folder.lastScan ? 
                          new Date(folder.lastScan).toLocaleDateString() : 
                          'Never'
                        }
                      </span>
                    </div>
                    
                    <div className="detail-row">
                      <span className="detail-label">Monitoring:</span>
                      <span className={`detail-value ${folder.monitorNewItems ? 'enabled' : 'disabled'}`}>
                        {folder.monitorNewItems ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}