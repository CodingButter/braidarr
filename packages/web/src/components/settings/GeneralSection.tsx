import React from 'react';
import { ApplicationSettings, LogLevel, ValidationError } from '../../types/settings';

interface GeneralSectionProps {
  settings: ApplicationSettings;
  validationErrors: ValidationError[];
  onChange: (settings: ApplicationSettings) => void;
}

export function GeneralSection({
  settings,
  validationErrors,
  onChange
}: GeneralSectionProps) {
  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  return (
    <div className="settings-section">
      <h3>General Settings</h3>
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="app-name">Application Name</label>
          <input
            type="text"
            id="app-name"
            className={`form-input ${getError('applicationName') ? 'error' : ''}`}
            value={settings.applicationName}
            onChange={(e) => onChange({ ...settings, applicationName: e.target.value })}
            placeholder="Braidarr"
          />
          {getError('applicationName') && (
            <div className="form-error">{getError('applicationName')}</div>
          )}
          <div className="form-help">
            The name displayed in the browser title and throughout the application
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="port">Port</label>
          <input
            type="number"
            id="port"
            className={`form-input ${getError('port') ? 'error' : ''}`}
            value={settings.port}
            onChange={(e) => onChange({ ...settings, port: parseInt(e.target.value) || 3100 })}
            min="1"
            max="65535"
          />
          {getError('port') && (
            <div className="form-error">{getError('port')}</div>
          )}
          <div className="form-help">
            Port number for the web interface (1-65535). Default: 3100
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="url-base">URL Base</label>
          <input
            type="text"
            id="url-base"
            className="form-input"
            value={settings.urlBase}
            onChange={(e) => onChange({ ...settings, urlBase: e.target.value })}
            placeholder="/braidarr"
          />
          <div className="form-help">
            For reverse proxy subdirectory setups (e.g., /braidarr). Leave empty for root path.
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="log-level">Log Level</label>
          <select 
            id="log-level" 
            className="form-select"
            value={settings.logLevel}
            onChange={(e) => onChange({ ...settings, logLevel: e.target.value as LogLevel })}
          >
            <option value={LogLevel.TRACE}>Trace</option>
            <option value={LogLevel.DEBUG}>Debug</option>
            <option value={LogLevel.INFO}>Info</option>
            <option value={LogLevel.WARN}>Warning</option>
            <option value={LogLevel.ERROR}>Error</option>
            <option value={LogLevel.FATAL}>Fatal</option>
          </select>
          <div className="form-help">
            Level of detail in log files. Higher levels show more information.
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.autoUpdate}
              onChange={(e) => onChange({ ...settings, autoUpdate: e.target.checked })}
            />
            <span className="checkbox-text">Auto Update</span>
          </label>
          <div className="form-help">
            Automatically update to new versions when available
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.enableSSL}
              onChange={(e) => onChange({ ...settings, enableSSL: e.target.checked })}
            />
            <span className="checkbox-text">Enable SSL</span>
          </label>
          <div className="form-help">
            Enable SSL/TLS encryption (requires certificate configuration in Security settings)
          </div>
        </div>

        <div className="form-section-divider"></div>
        <h4>Reverse Proxy Settings</h4>

        <div className="form-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={settings.enableProxy}
              onChange={(e) => onChange({ ...settings, enableProxy: e.target.checked })}
            />
            <span className="checkbox-text">Enable Proxy Support</span>
          </label>
          <div className="form-help">
            Enable if running behind a reverse proxy (nginx, Apache, etc.)
          </div>
        </div>

        {settings.enableProxy && (
          <div className="form-group">
            <label htmlFor="proxy-subdirectory">Proxy Subdirectory</label>
            <input
              type="text"
              id="proxy-subdirectory"
              className="form-input"
              value={settings.proxySubdirectory}
              onChange={(e) => onChange({ ...settings, proxySubdirectory: e.target.value })}
              placeholder="braidarr"
            />
            <div className="form-help">
              Subdirectory when proxied (e.g., 'braidarr' for /braidarr/api routes)
            </div>
          </div>
        )}

        <div className="form-section-divider"></div>
        <div className="app-info">
          <h4>Application Information</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Version:</span>
              <span className="info-value">1.0.0</span>
            </div>
            <div className="info-item">
              <span className="info-label">Build Date:</span>
              <span className="info-value">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Platform:</span>
              <span className="info-value">Web</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}