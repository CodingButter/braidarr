import React, { useState, useEffect } from 'react';
import { 
  MdCheckCircle, 
  MdError, 
  MdWarning, 
  MdInfo,
  MdRefresh,
  MdUploadFile,
  MdLock,
  MdLockOpen
} from 'react-icons/md';
import { SiImdb, SiTrakt, SiThemoviedatabase } from 'react-icons/si';
import { Source, SourceType, SyncFrequency } from '../../types/sources';

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

// IMDb List Modal
export function ImdbListModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    url: editingSource?.config?.url || '',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!formData.url) {
      setTestResult({
        status: 'error',
        message: 'Please enter a valid IMDb list URL'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'testing', message: 'Testing connection...' });

    // Simulate API call
    setTimeout(() => {
      if (formData.url.includes('imdb.com/list/')) {
        setTestResult({
          status: 'success',
          message: 'Connection successful! Found 142 items in list.',
          details: { itemCount: 142, listTitle: 'My Favorite Movies' }
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Invalid IMDb list URL. Please check the URL and try again.'
        });
      }
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'imdb_list',
      syncFrequency: formData.syncFrequency,
      config: { url: formData.url }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SiImdb size={24} style={{ color: '#f5c518' }} />
            <h4>{editingSource ? 'Edit IMDb List' : 'Add IMDb List'}</h4>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My IMDb List"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>IMDb List URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://www.imdb.com/list/ls123456789/"
                value={formData.url}
                onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
                required
              />
              <div className="form-help">
                Enter the full URL of a public IMDb list. You can find this in your browser's address bar when viewing the list.
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
                disabled={isTestingConnection || !formData.url}
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
                    List: {testResult.details.listTitle} ({testResult.details.itemCount} items)
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

// IMDb Watchlist Modal
export function ImdbWatchlistModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    username: editingSource?.config?.username || '',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!formData.username) {
      setTestResult({
        status: 'error',
        message: 'Please enter your IMDb username'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'testing', message: 'Testing connection...' });

    // Simulate API call
    setTimeout(() => {
      if (formData.username.startsWith('ur')) {
        setTestResult({
          status: 'success',
          message: 'Connection successful! Found 89 items in watchlist.',
          details: { itemCount: 89, username: formData.username }
        });
      } else {
        setTestResult({
          status: 'error',
          message: 'Invalid username format. IMDb usernames start with "ur" followed by numbers.'
        });
      }
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'imdb_watchlist',
      syncFrequency: formData.syncFrequency,
      config: { username: formData.username }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SiImdb size={24} style={{ color: '#f5c518' }} />
            <h4>{editingSource ? 'Edit IMDb Watchlist' : 'Add IMDb Watchlist'}</h4>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My IMDb Watchlist"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>IMDb Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="ur123456789"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
              <div className="form-help">
                Your IMDb user ID can be found in your profile URL. It starts with "ur" followed by numbers.
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
                disabled={isTestingConnection || !formData.username}
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

// Trakt Modal (handles both lists and collections)
export function TraktModal({ isOpen, onClose, onSubmit, editingSource, sourceType }: BaseModalProps & { sourceType: 'trakt_list' | 'trakt_collection' }) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    username: editingSource?.config?.username || '',
    listSlug: editingSource?.config?.listSlug || '',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [oauthStatus, setOauthStatus] = useState<'not_connected' | 'connecting' | 'connected' | 'error'>('not_connected');
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const handleOAuthConnect = async () => {
    setOauthStatus('connecting');
    
    // Simulate OAuth flow
    setTimeout(() => {
      setOauthStatus('connected');
      setTestResult({
        status: 'success',
        message: 'Successfully connected to Trakt! You can now configure your source.'
      });
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: sourceType,
      syncFrequency: formData.syncFrequency,
      config: { 
        username: formData.username,
        ...(sourceType === 'trakt_list' && { listSlug: formData.listSlug })
      }
    });
  };

  if (!isOpen) return null;

  const isCollection = sourceType === 'trakt_collection';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SiTrakt size={24} style={{ color: '#ed1c24' }} />
            <h4>{editingSource ? `Edit Trakt ${isCollection ? 'Collection' : 'List'}` : `Add Trakt ${isCollection ? 'Collection' : 'List'}`}</h4>
          </div>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {oauthStatus === 'not_connected' && (
              <div className="form-group">
                <div className="warning-box">
                  <MdWarning size={20} />
                  <p>You need to connect your Trakt account to use this source. This will allow Braidarr to access your lists and collections.</p>
                </div>
                <button
                  type="button"
                  className={`oauth-button ${oauthStatus === 'connecting' ? 'disabled' : ''}`}
                  onClick={handleOAuthConnect}
                  disabled={oauthStatus === 'connecting'}
                >
                  {oauthStatus === 'connecting' ? (
                    <>
                      <MdRefresh size={16} />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MdLockOpen size={16} />
                      Connect to Trakt
                    </>
                  )}
                </button>
              </div>
            )}

            {oauthStatus === 'connected' && (
              <>
                <div className="form-group">
                  <div className="success-message">
                    <MdCheckCircle size={16} />
                    Successfully connected to Trakt account
                  </div>
                </div>

                <div className="form-group">
                  <label>Source Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`My Trakt ${isCollection ? 'Collection' : 'List'}`}
                    value={formData.name}
                    onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Trakt Username</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="username"
                    value={formData.username}
                    onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                  />
                </div>

                {!isCollection && (
                  <div className="form-group">
                    <label>List Slug</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="my-favorite-movies"
                      value={formData.listSlug}
                      onChange={e => setFormData(prev => ({ ...prev, listSlug: e.target.value }))}
                      required
                    />
                    <div className="form-help">
                      The list slug can be found in the URL of your Trakt list (e.g., trakt.tv/users/username/lists/list-slug)
                    </div>
                  </div>
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
              </>
            )}

            {testResult && (
              <div className={`test-result ${testResult.status}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {testResult.status === 'success' && <MdCheckCircle />}
                  {testResult.status === 'error' && <MdError />}
                  <span>{testResult.message}</span>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={oauthStatus !== 'connected'}
            >
              {editingSource ? 'Update Source' : 'Add Source'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Letterboxd Modal
export function LetterboxdModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    username: editingSource?.config?.username || '',
    listSlug: editingSource?.config?.listSlug || '',
    syncFrequency: editingSource?.syncFrequency || 'daily' as SyncFrequency
  });
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  const handleTestConnection = async () => {
    if (!formData.username || !formData.listSlug) {
      setTestResult({
        status: 'error',
        message: 'Please enter both username and list slug'
      });
      return;
    }

    setIsTestingConnection(true);
    setTestResult({ status: 'testing', message: 'Testing connection...' });

    // Simulate API call
    setTimeout(() => {
      setTestResult({
        status: 'success',
        message: 'Connection successful! Found 76 movies in list.',
        details: { itemCount: 76, listTitle: 'Favorites 2024' }
      });
      setIsTestingConnection(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'letterboxd_list',
      syncFrequency: formData.syncFrequency,
      config: { 
        username: formData.username,
        listSlug: formData.listSlug
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{editingSource ? 'Edit Letterboxd List' : 'Add Letterboxd List'}</h4>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="info-box">
              <MdInfo size={20} />
              <div>
                <p>Letterboxd lists must be public to be imported. Private lists cannot be accessed.</p>
              </div>
            </div>

            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My Letterboxd List"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>Letterboxd Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="username"
                value={formData.username}
                onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>List Slug</label>
              <input
                type="text"
                className="form-input"
                placeholder="favorites-2024"
                value={formData.listSlug}
                onChange={e => setFormData(prev => ({ ...prev, listSlug: e.target.value }))}
                required
              />
              <div className="form-help">
                The list slug can be found in the URL of your list (e.g., letterboxd.com/username/list/list-slug/)
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
                disabled={isTestingConnection || !formData.username || !formData.listSlug}
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
                    List: {testResult.details.listTitle} ({testResult.details.itemCount} movies)
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

// CSV Upload Modal
export function CsvUploadModal({ isOpen, onClose, onSubmit, editingSource }: BaseModalProps) {
  const [formData, setFormData] = useState({
    name: editingSource?.name || '',
    syncFrequency: editingSource?.syncFrequency || 'manual' as SyncFrequency
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [columnMapping, setColumnMapping] = useState({
    title: '',
    year: '',
    type: ''
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Simulate parsing CSV for preview
      setTimeout(() => {
        setPreviewData([
          { title: 'The Matrix', year: '1999', type: 'movie' },
          { title: 'Breaking Bad', year: '2008', type: 'tv' },
          { title: 'Inception', year: '2010', type: 'movie' }
        ]);
      }, 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      type: 'csv_upload',
      syncFrequency: formData.syncFrequency,
      config: { 
        fileName: selectedFile?.name,
        columnMapping,
        uploadDate: new Date().toISOString()
      }
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h4>{editingSource ? 'Edit CSV Upload' : 'Add CSV Upload'}</h4>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Source Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="My CSV Import"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>CSV File</label>
              <div className="file-input-container">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  required={!editingSource}
                />
                <button type="button" className="btn btn-secondary file-select-btn">
                  <MdUploadFile size={16} />
                </button>
              </div>
              <div className="form-help">
                Upload a CSV file with movie/TV show data. Supported columns: title, year, type, imdb_id
              </div>
            </div>

            {previewData && (
              <div className="form-group">
                <label>Column Mapping</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <select
                    className="form-select"
                    value={columnMapping.title}
                    onChange={e => setColumnMapping(prev => ({ ...prev, title: e.target.value }))}
                  >
                    <option value="">Select Title Column</option>
                    <option value="title">title</option>
                    <option value="name">name</option>
                  </select>
                  <select
                    className="form-select"
                    value={columnMapping.year}
                    onChange={e => setColumnMapping(prev => ({ ...prev, year: e.target.value }))}
                  >
                    <option value="">Select Year Column</option>
                    <option value="year">year</option>
                    <option value="date">date</option>
                  </select>
                  <select
                    className="form-select"
                    value={columnMapping.type}
                    onChange={e => setColumnMapping(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="">Select Type Column</option>
                    <option value="type">type</option>
                    <option value="category">category</option>
                  </select>
                </div>
                
                <div style={{ marginTop: '1rem' }}>
                  <strong>Preview:</strong>
                  <div style={{ 
                    background: 'var(--color-background)', 
                    border: '1px solid var(--color-border)', 
                    borderRadius: '4px', 
                    padding: '0.5rem', 
                    marginTop: '0.5rem',
                    fontSize: '0.75rem'
                  }}>
                    {previewData.slice(0, 3).map((row, index) => (
                      <div key={index} style={{ marginBottom: '0.25rem' }}>
                        {row.title} ({row.year}) - {row.type}
                      </div>
                    ))}
                    <div style={{ color: 'var(--color-text-secondary)', fontStyle: 'italic' }}>
                      Found {previewData.length} items total
                    </div>
                  </div>
                </div>
              </div>
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
                <option value="manual">Manual Only</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <div className="form-help">
                CSV uploads are typically set to manual sync. Data will be imported immediately upon creation.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={!selectedFile && !editingSource}
            >
              {editingSource ? 'Update Source' : 'Import CSV'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}