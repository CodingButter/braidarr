import { useState } from "react";
import { MdAdd, MdEdit, MdDelete, MdCheckCircle, MdError, MdRefresh, MdSync } from "react-icons/md";
import "./CommonPage.css";

interface Integration {
  id: string;
  name: string;
  type: "sonarr" | "radarr";
  url: string;
  status: "connected" | "error" | "testing";
  version: string;
  lastSync: string;
  apiKeyConfigured: boolean;
  syncEnabled: boolean;
}

export default function IntegrationsPage() {
  const [integrations] = useState<Integration[]>([
    {
      id: "1",
      name: "Main Sonarr Instance",
      type: "sonarr",
      url: "http://localhost:8989",
      status: "connected",
      version: "v4.0.1.929",
      lastSync: "15 minutes ago",
      apiKeyConfigured: true,
      syncEnabled: true
    },
    {
      id: "2",
      name: "4K Radarr Instance",
      type: "radarr",
      url: "http://localhost:7878",
      status: "connected",
      version: "v5.2.6.8376",
      lastSync: "1 hour ago",
      apiKeyConfigured: true,
      syncEnabled: true
    },
    {
      id: "3",
      name: "Remote Sonarr",
      type: "sonarr",
      url: "http://192.168.1.100:8989",
      status: "error",
      version: "Unknown",
      lastSync: "2 days ago",
      apiKeyConfigured: false,
      syncEnabled: false
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <MdCheckCircle className="status-icon success" size={20} />;
      case "error":
        return <MdError className="status-icon error" size={20} />;
      case "testing":
        return <MdRefresh className="status-icon testing" size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "connected":
        return "Connected";
      case "error":
        return "Connection Error";
      case "testing":
        return "Testing Connection";
      default:
        return "Unknown";
    }
  };

  const getTypeIcon = (type: string) => {
    return type === "sonarr" ? "📺" : "🎬";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Integrations</h1>
          <p className="page-subtitle">
            Connect and manage your Sonarr and Radarr instances. Import lists will be automatically synced to these applications.
          </p>
        </div>
        <button className="btn-primary">
          <MdAdd size={20} />
          Add Integration
        </button>
      </div>

      <div className="page-content">
        <div className="sync-overview">
          <div className="sync-stats">
            <div className="stat-card">
              <h3>Connected Instances</h3>
              <div className="stat-number">
                {integrations.filter(i => i.status === "connected").length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Active Syncs</h3>
              <div className="stat-number">
                {integrations.filter(i => i.syncEnabled).length}
              </div>
            </div>
            <div className="stat-card">
              <h3>Last Sync</h3>
              <div className="stat-text">15 minutes ago</div>
            </div>
          </div>
          <button className="btn-secondary">
            <MdSync size={20} />
            Sync All Now
          </button>
        </div>

        <div className="integrations-grid">
          {integrations.map((integration) => (
            <div key={integration.id} className="integration-card">
              <div className="integration-card-header">
                <div className="integration-info">
                  <div className="integration-type">
                    <span className="type-icon">{getTypeIcon(integration.type)}</span>
                    <div>
                      <h3 className="integration-name">{integration.name}</h3>
                      <p className="integration-url">{integration.url}</p>
                    </div>
                  </div>
                </div>
                <div className="integration-actions">
                  <button className="btn-icon" title="Sync Now">
                    <MdSync size={18} />
                  </button>
                  <button className="btn-icon" title="Test Connection">
                    <MdRefresh size={18} />
                  </button>
                  <button className="btn-icon" title="Edit">
                    <MdEdit size={18} />
                  </button>
                  <button className="btn-icon btn-danger" title="Delete">
                    <MdDelete size={18} />
                  </button>
                </div>
              </div>
              
              <div className="integration-status-section">
                <div className="status-row">
                  <div className="status-item">
                    {getStatusIcon(integration.status)}
                    <span className={`status-text ${integration.status}`}>
                      {getStatusText(integration.status)}
                    </span>
                  </div>
                  <span className="version-info">
                    {integration.version}
                  </span>
                </div>
              </div>

              <div className="integration-details">
                <div className="detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{integration.type.toUpperCase()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">API Key:</span>
                  <span className={`detail-value ${integration.apiKeyConfigured ? 'configured' : 'missing'}`}>
                    {integration.apiKeyConfigured ? 'Configured' : 'Not Configured'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Auto Sync:</span>
                  <span className={`detail-value ${integration.syncEnabled ? 'enabled' : 'disabled'}`}>
                    {integration.syncEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Last Sync:</span>
                  <span className="detail-value">{integration.lastSync}</span>
                </div>
              </div>

              {integration.status === "error" && (
                <div className="error-message">
                  <MdError size={16} />
                  {integration.apiKeyConfigured ? 
                    "Cannot connect to instance. Check URL and network connectivity." :
                    "API key required. Click Edit to configure."
                  }
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="help-section">
          <h3>Integration Setup</h3>
          <div className="setup-steps">
            <div className="step-card">
              <h4>1. Add Your Instance</h4>
              <p>Enter the URL and API key for your Sonarr or Radarr instance.</p>
            </div>
            <div className="step-card">
              <h4>2. Test Connection</h4>
              <p>Verify that Braidarr can communicate with your instance.</p>
            </div>
            <div className="step-card">
              <h4>3. Enable Auto-Sync</h4>
              <p>Let Braidarr automatically push import lists to your applications.</p>
            </div>
            <div className="step-card">
              <h4>4. Monitor Activity</h4>
              <p>Check the Activity page to see sync logs and troubleshoot issues.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}