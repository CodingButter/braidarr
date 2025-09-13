import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdContentCopy, 
  MdDelete, 
  MdEdit, 
  MdVisibility, 
  MdVisibilityOff,
  MdSettings,
  MdInfo,
  MdWarning,
  MdCheckCircle
} from 'react-icons/md';

// Types
interface ApiKeyScope {
  resource: string;
  actions: string[];
}

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: ApiKeyScope[];
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ApiKeyUsageStats {
  totalRequests: number;
  lastUsed: Date | null;
  requestsToday: number;
  requestsThisMonth: number;
}

interface AvailableScope {
  resource: string;
  actions: string[];
  description: string;
}

interface ApiKeySectionProps {
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function ApiKeysSection({ onMessage }: ApiKeySectionProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [availableScopes, setAvailableScopes] = useState<AvailableScope[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [selectedKeyUsage, setSelectedKeyUsage] = useState<{ keyId: string; stats: ApiKeyUsageStats } | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    scopes: [] as ApiKeyScope[],
    expiresAt: '',
    isActive: true
  });
  
  const [showFullKey, setShowFullKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Load data on component mount
  useEffect(() => {
    loadApiKeys();
    loadAvailableScopes();
  }, []);

  const loadApiKeys = async () => {
    try {
      const response = await fetch('/api/v1/api-keys', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys);
      } else {
        onMessage('Failed to load API keys', 'error');
      }
    } catch (error) {
      onMessage('Error loading API keys: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableScopes = async () => {
    try {
      const response = await fetch('/api/v1/api-keys/scopes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setAvailableScopes(data.scopes);
      }
    } catch (error) {
      console.error('Error loading scopes:', error);
    }
  };

  const loadKeyUsage = async (keyId: string) => {
    try {
      const response = await fetch(`/api/v1/api-keys/${keyId}/usage`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSelectedKeyUsage({ keyId, stats: data.usage });
      }
    } catch (error) {
      console.error('Error loading key usage:', error);
    }
  };

  const handleCreateApiKey = async () => {
    try {
      const payload = {
        name: formData.name,
        scopes: formData.scopes,
        expiresAt: formData.expiresAt || undefined,
      };

      const response = await fetch('/api/v1/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Show the full API key in a popup
        setShowFullKey(data.key);
        onMessage('API key created successfully! Copy and store it securely.', 'success');
        
        // Reset form and reload keys
        setFormData({ name: '', scopes: [], expiresAt: '', isActive: true });
        setShowCreateForm(false);
        loadApiKeys();
      } else {
        const error = await response.json();
        onMessage('Failed to create API key: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error creating API key: ' + (error as Error).message, 'error');
    }
  };

  const handleUpdateApiKey = async (id: string, updates: Partial<ApiKey>) => {
    try {
      const response = await fetch(`/api/v1/api-keys/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        onMessage('API key updated successfully', 'success');
        setEditingKey(null);
        loadApiKeys();
      } else {
        const error = await response.json();
        onMessage('Failed to update API key: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error updating API key: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteApiKey = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the API key "${name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/v1/api-keys/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          onMessage('API key deleted successfully', 'success');
          loadApiKeys();
        } else {
          const error = await response.json();
          onMessage('Failed to delete API key: ' + error.message, 'error');
        }
      } catch (error) {
        onMessage('Error deleting API key: ' + (error as Error).message, 'error');
      }
    }
  };

  const copyToClipboard = async (text: string, keyId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKeyId(keyId);
      setTimeout(() => setCopiedKeyId(null), 2000);
    } catch (error) {
      onMessage('Failed to copy to clipboard', 'error');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  const isExpired = (expiresAt: string | null) => {
    return expiresAt && new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <div className="settings-section">
        <h3>API Keys</h3>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <h3>API Keys</h3>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          <MdAdd size={20} />
          Create API Key
        </button>
      </div>

      <div className="api-keys-info">
        <div className="info-box">
          <MdInfo size={20} />
          <div>
            <p>API keys allow external applications to authenticate with Braidarr. Each key can have specific permissions (scopes) to limit what actions it can perform.</p>
            <p><strong>Important:</strong> API keys are only shown once when created. Store them securely.</p>
          </div>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Create API Key</h4>
              <button 
                className="btn-close"
                onClick={() => setShowCreateForm(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="key-name">Name</label>
                <input
                  type="text"
                  id="key-name"
                  className="form-input"
                  placeholder="e.g., Mobile App, Automation Script"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expires-at">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  id="expires-at"
                  className="form-input"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Permissions (Scopes)</label>
                <div className="scopes-list">
                  {availableScopes.map((scope) => (
                    <div key={scope.resource} className="scope-item">
                      <div className="scope-header">
                        <strong>{scope.resource === '*' ? 'All Resources' : scope.resource}</strong>
                        <span className="scope-description">{scope.description}</span>
                      </div>
                      <div className="actions-list">
                        {scope.actions.map((action) => (
                          <label key={`${scope.resource}-${action}`} className="checkbox-label">
                            <input
                              type="checkbox"
                              checked={formData.scopes.some(s => 
                                s.resource === scope.resource && s.actions.includes(action)
                              )}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  const existingScopeIndex = formData.scopes.findIndex(s => s.resource === scope.resource);
                                  if (existingScopeIndex >= 0) {
                                    const updatedScopes = [...formData.scopes];
                                    updatedScopes[existingScopeIndex].actions.push(action);
                                    setFormData({ ...formData, scopes: updatedScopes });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      scopes: [...formData.scopes, { resource: scope.resource, actions: [action] }]
                                    });
                                  }
                                } else {
                                  const updatedScopes = formData.scopes.map(s => {
                                    if (s.resource === scope.resource) {
                                      return { ...s, actions: s.actions.filter(a => a !== action) };
                                    }
                                    return s;
                                  }).filter(s => s.actions.length > 0);
                                  setFormData({ ...formData, scopes: updatedScopes });
                                }
                              }}
                            />
                            <span className="checkbox-text">{action === '*' ? 'All Actions' : action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleCreateApiKey}
                disabled={!formData.name || formData.scopes.length === 0}
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Key Display Modal */}
      {showFullKey && (
        <div className="modal-overlay" onClick={() => setShowFullKey(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>API Key Created</h4>
              <button 
                className="btn-close"
                onClick={() => setShowFullKey(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="warning-box">
                <MdWarning size={20} />
                <div>
                  <p><strong>Important:</strong> This is the only time you will see the full API key. Copy and store it securely.</p>
                </div>
              </div>
              
              <div className="api-key-display">
                <label>API Key</label>
                <div className="api-key-container">
                  <input
                    type="text"
                    className="form-input"
                    value={showFullKey}
                    readOnly
                  />
                  <button
                    className="btn-icon"
                    onClick={() => copyToClipboard(showFullKey, 'new-key')}
                    title="Copy API key"
                  >
                    <MdContentCopy size={18} />
                  </button>
                </div>
                {copiedKeyId === 'new-key' && (
                  <div className="form-success">API key copied to clipboard!</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-primary"
                onClick={() => setShowFullKey(null)}
              >
                I've Saved the Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="api-keys-list">
        {apiKeys.length === 0 ? (
          <div className="empty-state">
            <p>No API keys created yet.</p>
            <p>Create your first API key to allow external applications to access Braidarr.</p>
          </div>
        ) : (
          <div className="keys-table">
            <div className="table-header">
              <div>Name</div>
              <div>Key Prefix</div>
              <div>Status</div>
              <div>Last Used</div>
              <div>Expires</div>
              <div>Actions</div>
            </div>
            
            {apiKeys.map((key) => (
              <div key={key.id} className="table-row">
                <div className="key-name">
                  <strong>{key.name}</strong>
                  <div className="scopes-preview">
                    {key.scopes.slice(0, 2).map(scope => 
                      `${scope.resource}:${scope.actions.join(',')}`
                    ).join(', ')}
                    {key.scopes.length > 2 && ` +${key.scopes.length - 2} more`}
                  </div>
                </div>
                
                <div className="key-prefix">
                  <code>{key.keyPrefix}...</code>
                </div>
                
                <div className="key-status">
                  {!key.isActive ? (
                    <span className="status disabled">Disabled</span>
                  ) : isExpired(key.expiresAt) ? (
                    <span className="status expired">Expired</span>
                  ) : (
                    <span className="status active">
                      <MdCheckCircle size={16} />
                      Active
                    </span>
                  )}
                </div>
                
                <div className="last-used">
                  {formatDate(key.lastUsedAt)}
                  {key.lastUsedIp && (
                    <div className="ip-address">{key.lastUsedIp}</div>
                  )}
                </div>
                
                <div className="expires-at">
                  {formatDate(key.expiresAt)}
                </div>
                
                <div className="key-actions">
                  <button
                    className="btn-icon"
                    onClick={() => loadKeyUsage(key.id)}
                    title="View usage statistics"
                  >
                    <MdInfo size={16} />
                  </button>
                  <button
                    className="btn-icon"
                    onClick={() => setEditingKey(key)}
                    title="Edit API key"
                  >
                    <MdEdit size={16} />
                  </button>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDeleteApiKey(key.id, key.name)}
                    title="Delete API key"
                  >
                    <MdDelete size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Usage Stats Modal */}
      {selectedKeyUsage && (
        <div className="modal-overlay" onClick={() => setSelectedKeyUsage(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>Usage Statistics</h4>
              <button 
                className="btn-close"
                onClick={() => setSelectedKeyUsage(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="usage-stats">
                <div className="stat-item">
                  <label>Total Requests</label>
                  <span>{selectedKeyUsage.stats.totalRequests}</span>
                </div>
                <div className="stat-item">
                  <label>Requests Today</label>
                  <span>{selectedKeyUsage.stats.requestsToday}</span>
                </div>
                <div className="stat-item">
                  <label>Requests This Month</label>
                  <span>{selectedKeyUsage.stats.requestsThisMonth}</span>
                </div>
                <div className="stat-item">
                  <label>Last Used</label>
                  <span>{selectedKeyUsage.stats.lastUsed ? new Date(selectedKeyUsage.stats.lastUsed).toLocaleString() : 'Never'}</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedKeyUsage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}