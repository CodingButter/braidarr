import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdTestTube,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdDownload,
  MdCloudDownload,
  MdPause,
  MdPlayArrow,
  MdRefresh,
  MdSettings
} from 'react-icons/md';

// Types
interface DownloadClientCapabilities {
  supportsCategories: boolean;
  supportsPriorities: boolean;
  supportsCompletedDownloadHandling: boolean;
  supportsFailedDownloadHandling: boolean;
  supportsSeeding: boolean;
}

interface DownloadClientStats {
  activeDownloads: number;
  completedDownloads: number;
  failedDownloads: number;
  totalDownloaded: number; // bytes
  uploadRatio: number;
  seedingTorrents: number;
  downloadSpeed: number; // bytes/sec
  uploadSpeed: number; // bytes/sec
}

interface DownloadClient {
  id: string;
  name: string;
  implementation: string;
  protocol: 'torrent' | 'usenet';
  host: string;
  port: number;
  username?: string;
  password?: string;
  category?: string;
  priority: number;
  isEnabled: boolean;
  capabilities: DownloadClientCapabilities;
  stats: DownloadClientStats;
  lastTest: {
    status: 'success' | 'error' | 'warning' | 'testing' | 'never';
    message?: string;
    timestamp?: Date;
  };
  settings: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

interface DownloadClientImplementation {
  name: string;
  protocol: 'torrent' | 'usenet';
  description: string;
  configFields: DownloadClientConfigField[];
  supportsTest: boolean;
}

interface DownloadClientConfigField {
  name: string;
  label: string;
  type: 'text' | 'password' | 'number' | 'select' | 'checkbox' | 'url';
  required: boolean;
  defaultValue?: any;
  helpText?: string;
  selectOptions?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface DownloadClientsSectionProps {
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function DownloadClientsSection({ onMessage }: DownloadClientsSectionProps) {
  const [downloadClients, setDownloadClients] = useState<DownloadClient[]>([]);
  const [implementations, setImplementations] = useState<DownloadClientImplementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClient, setEditingClient] = useState<DownloadClient | null>(null);
  const [selectedImplementation, setSelectedImplementation] = useState<string>('');
  const [testingClient, setTestingClient] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({
    name: '',
    implementation: '',
    priority: 1,
    isEnabled: true,
    category: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadDownloadClients();
    loadImplementations();
  }, []);

  const loadDownloadClients = async () => {
    try {
      const response = await fetch('/api/v1/download-clients', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setDownloadClients(data.downloadClients);
      } else {
        onMessage('Failed to load download clients', 'error');
      }
    } catch (error) {
      onMessage('Error loading download clients: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadImplementations = async () => {
    try {
      const response = await fetch('/api/v1/download-clients/implementations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setImplementations(data.implementations);
      }
    } catch (error) {
      console.error('Error loading implementations:', error);
    }
  };

  const handleTestClient = async (clientId: string) => {
    setTestingClient(clientId);
    
    try {
      const response = await fetch(`/api/v1/download-clients/${clientId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        onMessage('Download client test successful', 'success');
        loadDownloadClients(); // Refresh to get updated test status
      } else {
        const error = await response.json();
        onMessage('Download client test failed: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error testing download client: ' + (error as Error).message, 'error');
    } finally {
      setTestingClient(null);
    }
  };

  const handleCreateClient = async () => {
    try {
      const response = await fetch('/api/v1/download-clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onMessage('Download client created successfully', 'success');
        resetForm();
        setShowCreateForm(false);
        setSelectedImplementation('');
        loadDownloadClients();
      } else {
        const error = await response.json();
        onMessage('Failed to create download client: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error creating download client: ' + (error as Error).message, 'error');
    }
  };

  const handleUpdateClient = async (id: string, updates: Partial<DownloadClient>) => {
    try {
      const response = await fetch(`/api/v1/download-clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        onMessage('Download client updated successfully', 'success');
        setEditingClient(null);
        loadDownloadClients();
      } else {
        const error = await response.json();
        onMessage('Failed to update download client: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error updating download client: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteClient = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the download client "${name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/v1/download-clients/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          onMessage('Download client deleted successfully', 'success');
          loadDownloadClients();
        } else {
          const error = await response.json();
          onMessage('Failed to delete download client: ' + error.message, 'error');
        }
      } catch (error) {
        onMessage('Error deleting download client: ' + (error as Error).message, 'error');
      }
    }
  };

  const toggleClientStatus = async (id: string, isEnabled: boolean) => {
    await handleUpdateClient(id, { isEnabled: !isEnabled });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      implementation: '',
      priority: 1,
      isEnabled: true,
      category: '',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <MdCheckCircle className="status-icon success" size={16} />;
      case 'error':
        return <MdError className="status-icon error" size={16} />;
      case 'warning':
        return <MdWarning className="status-icon warning" size={16} />;
      case 'testing':
        return <MdRefresh className="status-icon testing" size={16} />;
      default:
        return <MdInfo className="status-icon" size={16} />;
    }
  };

  const getProtocolIcon = (protocol: string) => {
    switch (protocol) {
      case 'torrent':
        return <MdCloudDownload className="protocol-icon torrent" size={20} />;
      case 'usenet':
        return <MdDownload className="protocol-icon usenet" size={20} />;
      default:
        return <MdDownload className="protocol-icon" size={20} />;
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSec: number) => {
    return formatBytes(bytesPerSec) + '/s';
  };

  const selectedImpl = implementations.find(impl => impl.name === selectedImplementation);

  const renderConfigForm = () => {
    if (!selectedImpl) return null;

    return (
      <div className="config-form">
        <div className="form-group">
          <label htmlFor="client-name">Name</label>
          <input
            type="text"
            id="client-name"
            className="form-input"
            placeholder="e.g., qBittorrent, SABnzbd, Transmission"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="client-priority">Priority</label>
          <input
            type="number"
            id="client-priority"
            className="form-input"
            min="1"
            max="50"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
          />
          <div className="form-help">Lower numbers have higher priority (1 = highest, 50 = lowest)</div>
        </div>

        {selectedImpl.configFields.map((field) => (
          <div key={field.name} className="form-group">
            <label htmlFor={`field-${field.name}`}>
              {field.label}
              {field.required && <span className="form-required"> *</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                id={`field-${field.name}`}
                className="form-input"
                placeholder={field.defaultValue}
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
              />
            )}
            
            {field.type === 'password' && (
              <input
                type="password"
                id={`field-${field.name}`}
                className="form-input"
                placeholder="Enter password or API key"
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
              />
            )}
            
            {field.type === 'url' && (
              <input
                type="url"
                id={`field-${field.name}`}
                className="form-input"
                placeholder="http://localhost:8080"
                value={formData[field.name] || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
              />
            )}
            
            {field.type === 'number' && (
              <input
                type="number"
                id={`field-${field.name}`}
                className="form-input"
                min={field.validation?.min}
                max={field.validation?.max}
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: parseFloat(e.target.value) })}
                required={field.required}
              />
            )}
            
            {field.type === 'select' && (
              <select
                id={`field-${field.name}`}
                className="form-select"
                value={formData[field.name] || field.defaultValue || ''}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                required={field.required}
              >
                <option value="">Select an option</option>
                {field.selectOptions?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'checkbox' && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData[field.name] ?? field.defaultValue ?? false}
                  onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                />
                <span className="checkbox-text">{field.label}</span>
              </label>
            )}
            
            {field.helpText && (
              <div className="form-help">{field.helpText}</div>
            )}
          </div>
        ))}

        <div className="form-group">
          <label htmlFor="client-category">Category</label>
          <input
            type="text"
            id="client-category"
            className="form-input"
            placeholder="e.g., tv, movies, braidarr"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          />
          <div className="form-help">Optional category for organizing downloads</div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
            />
            <span className="checkbox-text">Enable download client</span>
          </label>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="settings-section">
        <h3>Download Clients</h3>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <h3>Download Clients</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <MdAdd size={20} />
          Add Download Client
        </button>
      </div>

      <div className="download-clients-info">
        <div className="info-box">
          <MdInfo size={20} />
          <div>
            <p>Download clients handle the actual downloading of your media files. Configure multiple clients for redundancy and load balancing.</p>
            <p><strong>Priority:</strong> Lower numbers are preferred. Use different priorities to create fallback clients.</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {downloadClients.length > 0 && (
        <div className="download-clients-overview">
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-value">{downloadClients.length}</div>
              <div className="stat-label">Total Clients</div>
            </div>
            <div className="stat">
              <div className="stat-value">{downloadClients.filter(c => c.isEnabled).length}</div>
              <div className="stat-label">Enabled</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {downloadClients.reduce((sum, c) => sum + c.stats.activeDownloads, 0)}
              </div>
              <div className="stat-label">Active Downloads</div>
            </div>
            <div className="stat">
              <div className="stat-value">
                {formatSpeed(downloadClients.reduce((sum, c) => sum + c.stats.downloadSpeed, 0))}
              </div>
              <div className="stat-label">Download Speed</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Add Download Client</h4>
              <button 
                className="btn-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {!selectedImplementation ? (
                <div className="implementation-selector">
                  <div className="form-group">
                    <label>Select Download Client Type</label>
                    <div className="implementations-grid">
                      {implementations.map((impl) => (
                        <div
                          key={impl.name}
                          className="implementation-card"
                          onClick={() => {
                            setSelectedImplementation(impl.name);
                            setFormData({ ...formData, implementation: impl.name });
                          }}
                        >
                          <div className="impl-header">
                            {getProtocolIcon(impl.protocol)}
                            <strong>{impl.name}</strong>
                          </div>
                          <div className="impl-protocol">{impl.protocol.toUpperCase()}</div>
                          <p>{impl.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="selected-implementation">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setSelectedImplementation('');
                        resetForm();
                      }}
                    >
                      ← Back to Selection
                    </button>
                    <div className="impl-info">
                      {getProtocolIcon(selectedImpl!.protocol)}
                      <strong>{selectedImpl!.name}</strong> - {selectedImpl!.protocol.toUpperCase()}
                    </div>
                  </div>
                  {renderConfigForm()}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setSelectedImplementation('');
                  resetForm();
                }}
              >
                Cancel
              </button>
              {selectedImplementation && (
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateClient}
                  disabled={!formData.name || !formData.implementation}
                >
                  Add Download Client
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Download Clients List */}
      <div className="download-clients-list">
        {downloadClients.length === 0 ? (
          <div className="empty-state">
            <p>No download clients configured yet.</p>
            <p>Add your first download client to start downloading content.</p>
          </div>
        ) : (
          <div className="clients-table">
            <div className="table-header">
              <div>Name</div>
              <div>Type</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Activity</div>
              <div>Speed</div>
              <div>Actions</div>
            </div>
            
            {downloadClients
              .sort((a, b) => a.priority - b.priority)
              .map((client) => (
                <div key={client.id} className="table-row">
                  <div className="client-name">
                    <div className="name-info">
                      {getProtocolIcon(client.protocol)}
                      <div>
                        <strong>{client.name}</strong>
                        <div className="client-host">{client.host}:{client.port}</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="client-type">
                    <div>{client.implementation}</div>
                    <div className="protocol">{client.protocol.toUpperCase()}</div>
                  </div>
                  
                  <div className="client-status">
                    {client.isEnabled ? (
                      <span className="status enabled">
                        <MdPlayArrow size={16} />
                        Enabled
                      </span>
                    ) : (
                      <span className="status disabled">
                        <MdPause size={16} />
                        Disabled
                      </span>
                    )}
                    <div className="test-status">
                      {getStatusIcon(client.lastTest.status)}
                      <span className={`status-text ${client.lastTest.status}`}>
                        {client.lastTest.status === 'never' ? 'Never tested' : 
                         client.lastTest.status === 'testing' ? 'Testing...' : 
                         client.lastTest.status}
                      </span>
                    </div>
                  </div>
                  
                  <div className="client-priority">
                    <span className="priority-value">{client.priority}</span>
                  </div>
                  
                  <div className="client-activity">
                    <div className="activity-row">
                      <span>Active: {client.stats.activeDownloads}</span>
                    </div>
                    <div className="activity-row">
                      <span>Completed: {client.stats.completedDownloads}</span>
                    </div>
                    {client.protocol === 'torrent' && (
                      <div className="activity-row">
                        <span>Seeding: {client.stats.seedingTorrents}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="client-speed">
                    <div className="speed-row">
                      <span>↓ {formatSpeed(client.stats.downloadSpeed)}</span>
                    </div>
                    <div className="speed-row">
                      <span>↑ {formatSpeed(client.stats.uploadSpeed)}</span>
                    </div>
                    {client.protocol === 'torrent' && (
                      <div className="speed-row">
                        <span>Ratio: {client.stats.uploadRatio.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="client-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleTestClient(client.id)}
                      disabled={testingClient === client.id}
                      title="Test download client"
                    >
                      {testingClient === client.id ? (
                        <MdRefresh className="spinning" size={16} />
                      ) : (
                        <MdTestTube size={16} />
                      )}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => toggleClientStatus(client.id, client.isEnabled)}
                      title={client.isEnabled ? 'Disable client' : 'Enable client'}
                    >
                      {client.isEnabled ? (
                        <MdPause size={16} />
                      ) : (
                        <MdPlayArrow size={16} />
                      )}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setEditingClient(client)}
                      title="Edit download client"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteClient(client.id, client.name)}
                      title="Delete download client"
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}