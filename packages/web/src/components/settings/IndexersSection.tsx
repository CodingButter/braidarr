import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdRefresh, 
  MdBuild,
  MdCheckCircle,
  MdError,
  MdWarning,
  MdInfo,
  MdTune,
  MdSearch,
  MdPause,
  MdPlayArrow
} from 'react-icons/md';

// Types
interface IndexerCategory {
  id: string;
  name: string;
  description: string;
}

interface IndexerCapabilities {
  supportsSearch: boolean;
  supportsRss: boolean;
  supportsTvSearch: boolean;
  supportsMovieSearch: boolean;
  supportsBookSearch: boolean;
  supportsMusicSearch: boolean;
  categories: IndexerCategory[];
}

interface IndexerStats {
  totalQueries: number;
  successfulQueries: number;
  failedQueries: number;
  avgResponseTime: number;
  lastQuery: Date | null;
  grabsToday: number;
  grabsTotal: number;
}

interface Indexer {
  id: string;
  name: string;
  implementation: string;
  protocol: 'torrent' | 'usenet' | 'hybrid';
  url: string;
  apiKey?: string;
  isEnabled: boolean;
  priority: number;
  categories: string[];
  seedRatio?: number;
  seedTime?: number;
  capabilities: IndexerCapabilities;
  stats: IndexerStats;
  lastTest: {
    status: 'success' | 'error' | 'warning' | 'testing' | 'never';
    message?: string;
    timestamp?: Date;
  };
  createdAt: string;
  updatedAt: string;
}

interface IndexerImplementation {
  name: string;
  protocol: 'torrent' | 'usenet' | 'hybrid';
  description: string;
  configFields: IndexerConfigField[];
  supportsTest: boolean;
}

interface IndexerConfigField {
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

interface IndexersSectionProps {
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function IndexersSection({ onMessage }: IndexersSectionProps) {
  const [indexers, setIndexers] = useState<Indexer[]>([]);
  const [implementations, setImplementations] = useState<IndexerImplementation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingIndexer, setEditingIndexer] = useState<Indexer | null>(null);
  const [selectedImplementation, setSelectedImplementation] = useState<string>('');
  const [testingIndexer, setTestingIndexer] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<any>({
    name: '',
    implementation: '',
    priority: 25,
    isEnabled: true,
    categories: [],
  });

  // Load data on component mount
  useEffect(() => {
    loadIndexers();
    loadImplementations();
  }, []);

  const loadIndexers = async () => {
    try {
      const response = await fetch('/api/v1/indexers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setIndexers(data.indexers);
      } else {
        onMessage('Failed to load indexers', 'error');
      }
    } catch (error) {
      onMessage('Error loading indexers: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadImplementations = async () => {
    try {
      const response = await fetch('/api/v1/indexers/implementations', {
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

  const handleTestIndexer = async (indexerId: string) => {
    setTestingIndexer(indexerId);
    
    try {
      const response = await fetch(`/api/v1/indexers/${indexerId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        onMessage('Indexer test successful', 'success');
        loadIndexers(); // Refresh to get updated test status
      } else {
        const error = await response.json();
        onMessage('Indexer test failed: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error testing indexer: ' + (error as Error).message, 'error');
    } finally {
      setTestingIndexer(null);
    }
  };

  const handleCreateIndexer = async () => {
    try {
      const response = await fetch('/api/v1/indexers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onMessage('Indexer created successfully', 'success');
        setFormData({ name: '', implementation: '', priority: 25, isEnabled: true, categories: [] });
        setShowCreateForm(false);
        setSelectedImplementation('');
        loadIndexers();
      } else {
        const error = await response.json();
        onMessage('Failed to create indexer: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error creating indexer: ' + (error as Error).message, 'error');
    }
  };

  const handleUpdateIndexer = async (id: string, updates: Partial<Indexer>) => {
    try {
      const response = await fetch(`/api/v1/indexers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        onMessage('Indexer updated successfully', 'success');
        setEditingIndexer(null);
        loadIndexers();
      } else {
        const error = await response.json();
        onMessage('Failed to update indexer: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error updating indexer: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteIndexer = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the indexer "${name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/v1/indexers/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          onMessage('Indexer deleted successfully', 'success');
          loadIndexers();
        } else {
          const error = await response.json();
          onMessage('Failed to delete indexer: ' + error.message, 'error');
        }
      } catch (error) {
        onMessage('Error deleting indexer: ' + (error as Error).message, 'error');
      }
    }
  };

  const toggleIndexerStatus = async (id: string, isEnabled: boolean) => {
    await handleUpdateIndexer(id, { isEnabled: !isEnabled });
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
        return '🧲';
      case 'usenet':
        return '📰';
      case 'hybrid':
        return '🔗';
      default:
        return '🔍';
    }
  };

  const selectedImpl = implementations.find(impl => impl.name === selectedImplementation);

  const renderConfigForm = () => {
    if (!selectedImpl) return null;

    return (
      <div className="config-form">
        <div className="form-group">
          <label htmlFor="indexer-name">Name</label>
          <input
            type="text"
            id="indexer-name"
            className="form-input"
            placeholder="e.g., Nyaa, 1337x, NZBgeek"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label htmlFor="indexer-priority">Priority</label>
          <input
            type="number"
            id="indexer-priority"
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
                placeholder="Enter API key or password"
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
                placeholder="https://example.com"
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
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isEnabled}
              onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
            />
            <span className="checkbox-text">Enable indexer</span>
          </label>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="settings-section">
        <h3>Indexers</h3>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <h3>Indexers</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <MdAdd size={20} />
          Add Indexer
        </button>
      </div>

      <div className="indexers-info">
        <div className="info-box">
          <MdInfo size={20} />
          <div>
            <p>Indexers are sources where Braidarr searches for content. Configure multiple indexers for better availability and faster searches.</p>
            <p><strong>Priority:</strong> Lower numbers are searched first. Use different priorities to prefer certain indexers.</p>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      {indexers.length > 0 && (
        <div className="indexers-overview">
          <div className="stats-bar">
            <div className="stat">
              <div className="stat-value">{indexers.length}</div>
              <div className="stat-label">Total Indexers</div>
            </div>
            <div className="stat">
              <div className="stat-value">{indexers.filter(i => i.isEnabled).length}</div>
              <div className="stat-label">Enabled</div>
            </div>
            <div className="stat">
              <div className="stat-value">{indexers.filter(i => i.lastTest.status === 'success').length}</div>
              <div className="stat-label">Working</div>
            </div>
            <div className="stat">
              <div className="stat-value">{indexers.reduce((sum, i) => sum + i.stats.grabsTotal, 0)}</div>
              <div className="stat-label">Total Grabs</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Add Indexer</h4>
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
                    <label>Select Indexer Type</label>
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
                            <span className="protocol-icon">{getProtocolIcon(impl.protocol)}</span>
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
                        setFormData({ name: '', implementation: '', priority: 25, isEnabled: true, categories: [] });
                      }}
                    >
                      ← Back to Selection
                    </button>
                    <div className="impl-info">
                      <span className="protocol-icon">{getProtocolIcon(selectedImpl!.protocol)}</span>
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
                  setFormData({ name: '', implementation: '', priority: 25, isEnabled: true, categories: [] });
                }}
              >
                Cancel
              </button>
              {selectedImplementation && (
                <button 
                  className="btn btn-primary"
                  onClick={handleCreateIndexer}
                  disabled={!formData.name || !formData.implementation}
                >
                  Add Indexer
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Indexers List */}
      <div className="indexers-list">
        {indexers.length === 0 ? (
          <div className="empty-state">
            <p>No indexers configured yet.</p>
            <p>Add your first indexer to start searching for content.</p>
          </div>
        ) : (
          <div className="indexers-table">
            <div className="table-header">
              <div>Name</div>
              <div>Type</div>
              <div>Status</div>
              <div>Priority</div>
              <div>Last Test</div>
              <div>Statistics</div>
              <div>Actions</div>
            </div>
            
            {indexers
              .sort((a, b) => a.priority - b.priority)
              .map((indexer) => (
                <div key={indexer.id} className="table-row">
                  <div className="indexer-name">
                    <div className="name-info">
                      <span className="protocol-icon">{getProtocolIcon(indexer.protocol)}</span>
                      <strong>{indexer.name}</strong>
                    </div>
                    <div className="indexer-url">{indexer.url}</div>
                  </div>
                  
                  <div className="indexer-type">
                    <div>{indexer.implementation}</div>
                    <div className="protocol">{indexer.protocol.toUpperCase()}</div>
                  </div>
                  
                  <div className="indexer-status">
                    {indexer.isEnabled ? (
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
                  </div>
                  
                  <div className="indexer-priority">
                    <span className="priority-value">{indexer.priority}</span>
                  </div>
                  
                  <div className="last-test">
                    <div className="test-status">
                      {getStatusIcon(indexer.lastTest.status)}
                      <span className={`status-text ${indexer.lastTest.status}`}>
                        {indexer.lastTest.status === 'never' ? 'Never tested' : 
                         indexer.lastTest.status === 'testing' ? 'Testing...' : 
                         indexer.lastTest.status}
                      </span>
                    </div>
                    {indexer.lastTest.timestamp && (
                      <div className="test-time">
                        {new Date(indexer.lastTest.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="indexer-stats">
                    <div className="stat-row">
                      <span>Queries: {indexer.stats.successfulQueries}/{indexer.stats.totalQueries}</span>
                    </div>
                    <div className="stat-row">
                      <span>Grabs: {indexer.stats.grabsTotal}</span>
                    </div>
                  </div>
                  
                  <div className="indexer-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleTestIndexer(indexer.id)}
                      disabled={testingIndexer === indexer.id}
                      title="Test indexer"
                    >
                      {testingIndexer === indexer.id ? (
                        <MdRefresh className="spinning" size={16} />
                      ) : (
                        <MdBuild size={16} />
                      )}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => toggleIndexerStatus(indexer.id, indexer.isEnabled)}
                      title={indexer.isEnabled ? 'Disable indexer' : 'Enable indexer'}
                    >
                      {indexer.isEnabled ? (
                        <MdPause size={16} />
                      ) : (
                        <MdPlayArrow size={16} />
                      )}
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => setEditingIndexer(indexer)}
                      title="Edit indexer"
                    >
                      <MdEdit size={16} />
                    </button>
                    <button
                      className="btn-icon danger"
                      onClick={() => handleDeleteIndexer(indexer.id, indexer.name)}
                      title="Delete indexer"
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