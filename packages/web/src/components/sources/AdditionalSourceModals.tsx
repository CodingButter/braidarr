import React, { useState } from 'react';
import { 
  MdCheckCircle, 
  MdError, 
  MdRefresh,
  MdApi,
  MdInfo,
  MdWarning,
  MdRssFeed,
  MdMovie
} from 'react-icons/md';
import { Source, SyncFrequency } from '../../types/sources';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (source: Partial<Source>) => void;
  editingSource?: Source | undefined;
}

interface TestResult {
  status: 'testing' | 'success' | 'error';
  message: string;
  details?: any;
}

// TMDb List Modal
export function TmdbListModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    listId: editingSource?.config?.listId || '',
    apiKey: editingSource?.config?.apiKey || '',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!formData.listId || !formData.apiKey) {
      setTestResult({
        status: 'error',
        message: 'Please enter both list ID and API key'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'testing', message: 'Testing connection...' });

    // Simulate API call
    setTimeout(() => {
      if (formData.apiKey.length >= 20) {
        setTestResult({
          status: 'success',
          message: 'Connection successful! Found 234 items in list.',
          details: { itemCount: 234, listName: 'Top Rated Movies' }
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Invalid API key. Please check your TMDb API key and try again.'
        });
      }
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'tmdb_list',
      syncFrequency: formData.syncFrequency,
      config: { 
        listId: formData.listId,
        apiKey: formData.apiKey
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdMovie size={24} style={{ color: '#01b4e4' }} />
            <h4>{editingSource ? 'Edit TMDb List' : 'Add TMDb List'}</h4>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="info-box">
              <MdInfo size={20} />
              <div>
                <p>You need a TMDb API key to import lists. Get one free at <strong>themoviedb.org/settings/api</strong></p>
              </div>
            </div>

            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My TMDb List"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>TMDb List ID</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                value={formData.listId}
                onChange={e => setFormData(prev => ({ ...prev, listId: e.target.value }))}
                required
              />
              <div className="form-help">
                The list ID can be found in the URL of the TMDb list (e.g., themoviedb.org/list/123456)
              </div>
            </div>

            <div className="form-group">
              <label>TMDb API Key</label>
              <input
                type="password"
                className="form-input"
                placeholder="Your TMDb API key"
                value={formData.apiKey}
                onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                required
              />
              <div className="form-help">
                Your API key will be encrypted and stored securely. It's only used to fetch list data.
              </div>
            </div>

            <div className="form-group">
              <label>Sync Frequency</label>
              <select
                className="form-select"
                value={formData.syncFrequency}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  syncFrequency: e.target.value as SyncFrequency 
                }))}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>

            <div className="form-group">
              <button
                type="button"
                className={`btn btn-secondary ${isTestingConnection ? 'disabled' : ''}`}
                onClick={handleTestConnection}
                disabled={isTestingConnection || !formData.listId || !formData.apiKey}
              >
                <MdRefresh size={16} />
                Test Connection
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.status}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {testResult.status === 'success' && <MdCheckCircle />}
                  {testResult.status === 'error' && <MdError />}
                  {testResult.status === 'testing' && <MdRefresh />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.details && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    List: {testResult.details.listName} ({testResult.details.itemCount} items)
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSource ? 'Update Source' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Custom RSS Feed Modal
export function CustomRssModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    url: editingSource?.config?.url || '',
    titleField: editingSource?.config?.titleField || 'title',
    descriptionField: editingSource?.config?.descriptionField || 'description',
    linkField: editingSource?.config?.linkField || 'link',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTestConnection = async () => {
    if (!formData.url) {
      setTestResult({
        status: 'error',
        message: 'Please enter a valid RSS feed URL'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'testing', message: 'Testing RSS feed...' });

    // Simulate API call
    setTimeout(() => {
      if (formData.url.includes('rss') || formData.url.includes('feed')) {
        setTestResult({
          status: 'success',
          message: 'RSS feed is valid! Found 15 items.',
          details: { itemCount: 15, feedTitle: 'Movie News Feed' }
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Invalid RSS feed URL. Please check the URL and try again.'
        });
      }
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'custom_rss',
      syncFrequency: formData.syncFrequency,
      config: { 
        url: formData.url,
        titleField: formData.titleField,
        descriptionField: formData.descriptionField,
        linkField: formData.linkField
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdRssFeed size={24} style={{ color: '#ff6600' }} />
            <h4>{editingSource ? 'Edit RSS Feed' : 'Add RSS Feed'}</h4>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="warning-box">
              <MdWarning size={20} />
              <p>RSS feeds should contain media information in their titles or descriptions. Standard news feeds may not provide useful data for Braidarr.</p>
            </div>

            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My RSS Feed"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>RSS Feed URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://example.com/rss.xml"
                value={formData.url}
                onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
              <div className="form-help">
                Enter the full URL to the RSS feed
              </div>
            </div>

            <div className="form-group">
              <label>Sync Frequency</label>
              <select
                className="form-select"
                value={formData.syncFrequency}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  syncFrequency: e.target.value as SyncFrequency 
                }))}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>

            <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              <span>Advanced Configuration</span>
              <span>{showAdvanced ? '−' : '+'}</span>
            </div>

            {showAdvanced && (
              <div className="advanced-content">
                <div className="form-group">
                  <label>Title Field</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="title"
                    value={formData.titleField}
                    onChange={e => setFormData(prev => ({ ...prev, titleField: e.target.value }))}
                  />
                  <div className="form-help">
                    XML field name for the item title
                  </div>
                </div>

                <div className="form-group">
                  <label>Description Field</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="description"
                    value={formData.descriptionField}
                    onChange={e => setFormData(prev => ({ ...prev, descriptionField: e.target.value }))}
                  />
                  <div className="form-help">
                    XML field name for the item description
                  </div>
                </div>

                <div className="form-group">
                  <label>Link Field</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="link"
                    value={formData.linkField}
                    onChange={e => setFormData(prev => ({ ...prev, linkField: e.target.value }))}
                  />
                  <div className="form-help">
                    XML field name for the item link
                  </div>
                </div>
              </div>
            )}

            <div className="form-group">
              <button
                type="button"
                className={`btn btn-secondary ${isTestingConnection ? 'disabled' : ''}`}
                onClick={handleTestConnection}
                disabled={isTestingConnection || !formData.url}
              >
                <MdRefresh size={16} />
                Test Feed
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.status}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {testResult.status === 'success' && <MdCheckCircle />}
                  {testResult.status === 'error' && <MdError />}
                  {testResult.status === 'testing' && <MdRefresh />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.details && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    Feed: {testResult.details.feedTitle} ({testResult.details.itemCount} items)
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSource ? 'Update Source' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// JSON API Modal
export function JsonApiModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    url: editingSource?.config?.url || '',
    headers: editingSource?.config?.headers || {},
    authType: editingSource?.config?.authType || 'none',
    apiKey: editingSource?.config?.apiKey || '',
    authHeader: editingSource?.config?.authHeader || 'Authorization',
    dataPath: editingSource?.config?.dataPath || '',
    titleField: editingSource?.config?.titleField || 'title',
    yearField: editingSource?.config?.yearField || 'year',
    typeField: editingSource?.config?.typeField || 'type',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleTestConnection = async () => {
    if (!formData.url) {
      setTestResult({
        status: 'error',
        message: 'Please enter a valid JSON API URL'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'testing', message: 'Testing JSON API...' });

    // Simulate API call
    setTimeout(() => {
      setTestResult({
        status: 'success',
        message: 'API connection successful! Found 42 media items.',
        details: { itemCount: 42, apiVersion: '1.0' }
      });
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'json_api',
      syncFrequency: formData.syncFrequency,
      config: {
        url: formData.url,
        headers: formData.headers,
        authType: formData.authType,
        ...(formData.authType !== 'none' && { 
          apiKey: formData.apiKey,
          authHeader: formData.authHeader 
        }),
        dataPath: formData.dataPath,
        titleField: formData.titleField,
        yearField: formData.yearField,
        typeField: formData.typeField
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MdApi size={24} style={{ color: '#3366cc' }} />
            <h4>{editingSource ? 'Edit JSON API' : 'Add JSON API'}</h4>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="info-box">
              <MdInfo size={20} />
              <div>
                <p>JSON API should return an array of media objects with title, year, and type fields.</p>
              </div>
            </div>

            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My JSON API"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>API URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://api.example.com/media"
                value={formData.url}
                onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Authentication</label>
              <select
                className="form-select"
                value={formData.authType}
                onChange={e => setFormData(prev => ({ ...prev, authType: e.target.value }))}
              >
                <option value="none">None</option>
                <option value="bearer">Bearer Token</option>
                <option value="api_key">API Key</option>
                <option value="custom">Custom Header</option>
              </select>
            </div>

            {formData.authType !== 'none' && (
              <>
                <div className="form-group">
                  <label>API Key / Token</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Your API key or token"
                    value={formData.apiKey}
                    onChange={e => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    required
                  />
                </div>

                {formData.authType === 'custom' && (
                  <div className="form-group">
                    <label>Authorization Header</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="X-API-Key"
                      value={formData.authHeader}
                      onChange={e => setFormData(prev => ({ ...prev, authHeader: e.target.value }))}
                    />
                  </div>
                )}
              </>
            )}

            <div className="form-group">
              <label>Sync Frequency</label>
              <select
                className="form-select"
                value={formData.syncFrequency}
                onChange={e => setFormData(prev => ({ 
                  ...prev, 
                  syncFrequency: e.target.value as SyncFrequency 
                }))}
              >
                <option value="hourly">Every Hour</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="manual">Manual Only</option>
              </select>
            </div>

            <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
              <span>Field Mapping</span>
              <span>{showAdvanced ? '−' : '+'}</span>
            </div>

            {showAdvanced && (
              <div className="advanced-content">
                <div className="form-group">
                  <label>Data Path</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="data.items (leave empty if array is at root)"
                    value={formData.dataPath}
                    onChange={e => setFormData(prev => ({ ...prev, dataPath: e.target.value }))}
                  />
                  <div className="form-help">
                    Path to the array of media items in the JSON response
                  </div>
                </div>

                <div className="form-group">
                  <label>Title Field</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="title"
                    value={formData.titleField}
                    onChange={e => setFormData(prev => ({ ...prev, titleField: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Year Field</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="year"
                    value={formData.yearField}
                    onChange={e => setFormData(prev => ({ ...prev, yearField: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Type Field</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="type"
                    value={formData.typeField}
                    onChange={e => setFormData(prev => ({ ...prev, typeField: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <button
                type="button"
                className={`btn btn-secondary ${isTestingConnection ? 'disabled' : ''}`}
                onClick={handleTestConnection}
                disabled={isTestingConnection || !formData.url}
              >
                <MdRefresh size={16} />
                Test API
              </button>
            </div>

            {testResult && (
              <div className={`test-result ${testResult.status}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {testResult.status === 'success' && <MdCheckCircle />}
                  {testResult.status === 'error' && <MdError />}
                  {testResult.status === 'testing' && <MdRefresh />}
                  <span>{testResult.message}</span>
                </div>
                {testResult.details && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem' }}>
                    API Version: {testResult.details.apiVersion} ({testResult.details.itemCount} items found)
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSource ? 'Update Source' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}