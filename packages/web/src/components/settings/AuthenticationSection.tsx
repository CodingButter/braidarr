import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdRefresh, MdContentCopy } from 'react-icons/md';
import { AuthenticationSettings, AuthenticationMethod, ValidationError } from '../../types/settings';
import { regenerateApiKey } from '../../utils/settingsStorage';

interface AuthenticationSectionProps {
  settings: AuthenticationSettings;
  apiKey: string;
  validationErrors: ValidationError[];
  onChange: (settings: AuthenticationSettings) => void;
  onApiKeyChange: (apiKey: string) => void;
}

export function AuthenticationSection({
  settings,
  apiKey,
  validationErrors,
  onChange,
  onApiKeyChange
}: AuthenticationSectionProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const handleToggleAuth = (enabled: boolean) => {
    onChange({
      ...settings,
      enabled,
      requiresAuthentication: enabled
    });
  };

  const handleMethodChange = (method: AuthenticationMethod) => {
    onChange({
      ...settings,
      method,
      formsAuth: method === AuthenticationMethod.FORMS,
      basicAuth: method === AuthenticationMethod.BASIC
    });
  };

  const handleRegenerateApiKey = () => {
    const newApiKey = regenerateApiKey();
    onApiKeyChange(newApiKey);
  };

  const handleCopyApiKey = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy API key:', error);
    }
  };

  return (
    <div className="settings-section">
      <h3>Authentication</h3>
      <div className="settings-form">
        {/* Enable Authentication Toggle */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => handleToggleAuth(e.target.checked)}
            />
            <span className="checkbox-text">Enable Authentication</span>
          </label>
          <div className="form-help">
            Require username and password to access Braidarr
          </div>
        </div>

        {/* Authentication Settings - Only shown when enabled */}
        {settings.enabled && (
          <>
            {/* Authentication Method */}
            <div className="form-group">
              <label htmlFor="auth-method">Authentication Method</label>
              <select
                id="auth-method"
                className="form-select"
                value={settings.method}
                onChange={(e) => handleMethodChange(e.target.value as AuthenticationMethod)}
              >
                <option value={AuthenticationMethod.FORMS}>Forms Authentication</option>
                <option value={AuthenticationMethod.BASIC}>Basic Authentication</option>
                <option value={AuthenticationMethod.EXTERNAL}>External Authentication</option>
              </select>
              <div className="form-help">
                {settings.method === AuthenticationMethod.FORMS && 'Standard web form login'}
                {settings.method === AuthenticationMethod.BASIC && 'HTTP Basic authentication'}
                {settings.method === AuthenticationMethod.EXTERNAL && 'External authentication provider'}
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                className={`form-input ${getError('username') ? 'error' : ''}`}
                value={settings.username}
                onChange={(e) => onChange({ ...settings, username: e.target.value })}
                placeholder="Enter username"
              />
              {getError('username') && (
                <div className="form-error">{getError('username')}</div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className={`form-input ${getError('password') ? 'error' : ''}`}
                  value={settings.password}
                  onChange={(e) => onChange({ ...settings, password: e.target.value })}
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
              {getError('password') && (
                <div className="form-error">{getError('password')}</div>
              )}
            </div>

            {/* Session Timeout */}
            <div className="form-group">
              <label htmlFor="session-timeout">Session Timeout (minutes)</label>
              <input
                type="number"
                id="session-timeout"
                className={`form-input ${getError('sessionTimeout') ? 'error' : ''}`}
                value={settings.sessionTimeout}
                onChange={(e) => onChange({ ...settings, sessionTimeout: parseInt(e.target.value) || 0 })}
                min="1"
                max="10080"
              />
              {getError('sessionTimeout') && (
                <div className="form-error">{getError('sessionTimeout')}</div>
              )}
              <div className="form-help">
                Time in minutes before user is automatically logged out (1-10080 minutes)
              </div>
            </div>
          </>
        )}

        {/* API Key Section */}
        <div className="form-section-divider"></div>
        <h4>API Key</h4>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={true} // Always enabled for now
              disabled
            />
            <span className="checkbox-text">Enable API Key Authentication</span>
          </label>
          <div className="form-help">
            Allow external applications to authenticate using API key
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="api-key">API Key</label>
          <div className="api-key-container">
            <input
              type={showApiKey ? 'text' : 'password'}
              id="api-key"
              className="form-input api-key-input"
              value={apiKey}
              readOnly
            />
            <div className="api-key-actions">
              <button
                type="button"
                className="btn-icon"
                onClick={() => setShowApiKey(!showApiKey)}
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={handleCopyApiKey}
                title="Copy API key"
              >
                <MdContentCopy size={18} />
              </button>
              <button
                type="button"
                className="btn-icon"
                onClick={handleRegenerateApiKey}
                title="Regenerate API key"
              >
                <MdRefresh size={18} />
              </button>
            </div>
          </div>
          {apiKeyCopied && (
            <div className="form-success">API key copied to clipboard!</div>
          )}
          <div className="form-help">
            Use this key for API authentication. Keep it secure and regenerate if compromised.
          </div>
        </div>

        {/* Additional Security Options */}
        <div className="form-section-divider"></div>
        <h4>Additional Options</h4>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.formsAuth}
              onChange={(e) => onChange({ ...settings, formsAuth: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span className="checkbox-text">Enable Forms Authentication</span>
          </label>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.basicAuth}
              onChange={(e) => onChange({ ...settings, basicAuth: e.target.checked })}
              disabled={!settings.enabled}
            />
            <span className="checkbox-text">Enable Basic Authentication</span>
          </label>
        </div>
      </div>
    </div>
  );
}