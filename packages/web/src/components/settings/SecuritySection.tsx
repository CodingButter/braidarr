import React, { useState } from 'react';
import { MdVisibility, MdVisibilityOff, MdFolderOpen } from 'react-icons/md';
import { SecuritySettings, ValidationError } from '../../types/settings';

interface SecuritySectionProps {
  settings: SecuritySettings;
  validationErrors: ValidationError[];
  onChange: (settings: SecuritySettings) => void;
}

export function SecuritySection({
  settings,
  validationErrors,
  onChange
}: SecuritySectionProps) {
  const [showCertPassword, setShowCertPassword] = useState(false);

  const getError = (field: string) => {
    return validationErrors.find(error => error.field === field)?.message;
  };

  const handleFileSelect = () => {
    // In a real implementation, this would open a file dialog
    // For now, we'll just show a placeholder
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pfx,.p12,.pem,.crt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        onChange({ ...settings, certificatePath: file.name });
      }
    };
    input.click();
  };

  return (
    <div className="settings-section">
      <h3>Security</h3>
      <div className="settings-form">
        {/* HTTPS Configuration */}
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.enableHTTPS}
              onChange={(e) => onChange({ ...settings, enableHTTPS: e.target.checked })}
            />
            <span className="checkbox-text">Enable HTTPS</span>
          </label>
          <div className="form-help">
            Enable HTTPS for secure communication. Requires SSL certificate.
          </div>
        </div>

        {/* Certificate Settings - Only shown when HTTPS is enabled */}
        {settings.enableHTTPS && (
          <>
            <div className="form-group">
              <label htmlFor="certificate-path">SSL Certificate Path</label>
              <div className="file-input-container">
                <input
                  type="text"
                  id="certificate-path"
                  className={`form-input ${getError('certificatePath') ? 'error' : ''}`}
                  value={settings.certificatePath}
                  onChange={(e) => onChange({ ...settings, certificatePath: e.target.value })}
                  placeholder="/path/to/certificate.pfx"
                />
                <button
                  type="button"
                  className="btn-icon file-select-btn"
                  onClick={handleFileSelect}
                  title="Select certificate file"
                >
                  <MdFolderOpen size={18} />
                </button>
              </div>
              {getError('certificatePath') && (
                <div className="form-error">{getError('certificatePath')}</div>
              )}
              <div className="form-help">
                Path to SSL certificate file (.pfx, .p12, .pem, or .crt)
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="certificate-password">Certificate Password</label>
              <div className="password-input-container">
                <input
                  type={showCertPassword ? 'text' : 'password'}
                  id="certificate-password"
                  className="form-input"
                  value={settings.certificatePassword}
                  onChange={(e) => onChange({ ...settings, certificatePassword: e.target.value })}
                  placeholder="Enter certificate password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowCertPassword(!showCertPassword)}
                  title={showCertPassword ? 'Hide password' : 'Show password'}
                >
                  {showCertPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
              <div className="form-help">
                Password for the SSL certificate (leave empty if not required)
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={settings.enableCertificateValidation}
                  onChange={(e) => onChange({ ...settings, enableCertificateValidation: e.target.checked })}
                />
                <span className="checkbox-text">Enable Certificate Validation</span>
              </label>
              <div className="form-help">
                Validate SSL certificates for external connections
              </div>
            </div>
          </>
        )}

        {/* Authentication Required */}
        <div className="form-section-divider"></div>
        <h4>Access Control</h4>
        
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.authenticationRequired}
              onChange={(e) => onChange({ ...settings, authenticationRequired: e.target.checked })}
            />
            <span className="checkbox-text">Authentication Required</span>
          </label>
          <div className="form-help">
            Require authentication for all access to the application
          </div>
        </div>

        {/* Security Headers */}
        <div className="form-section-divider"></div>
        <h4>Security Headers</h4>
        
        <div className="security-info">
          <p>The following security headers are automatically enabled:</p>
          <ul>
            <li><strong>X-Content-Type-Options:</strong> nosniff</li>
            <li><strong>X-Frame-Options:</strong> DENY</li>
            <li><strong>X-XSS-Protection:</strong> 1; mode=block</li>
            <li><strong>Referrer-Policy:</strong> strict-origin-when-cross-origin</li>
            <li><strong>Content-Security-Policy:</strong> Configured for application security</li>
          </ul>
        </div>

        {/* Additional Security Notes */}
        <div className="form-section-divider"></div>
        <div className="security-warning">
          <h4>Security Best Practices</h4>
          <ul>
            <li>Always use HTTPS in production environments</li>
            <li>Use strong passwords with mixed case, numbers, and symbols</li>
            <li>Regularly rotate API keys and passwords</li>
            <li>Keep SSL certificates up to date</li>
            <li>Monitor access logs for suspicious activity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}