import { useState } from "react";
import { MdRefresh, MdCheckCircle, MdError, MdWarning, MdInfo, MdSync, MdList, MdIntegrationInstructions } from "react-icons/md";
import "./CommonPage.css";

interface ActivityLog {
  id: string;
  timestamp: string;
  type: "sync" | "list_update" | "integration" | "error" | "info";
  title: string;
  description: string;
  details?: string;
  source?: string;
  status: "success" | "error" | "warning" | "info";
}

export default function ActivityPage() {
  const [logs] = useState<ActivityLog[]>([
    {
      id: "1",
      timestamp: "2024-01-15 14:30:25",
      type: "sync",
      title: "List sync completed",
      description: "Successfully synced 'IMDb Top 250 Movies' to Radarr",
      details: "Added 15 new movies, updated 3 existing entries",
      source: "IMDb Top 250 Movies → 4K Radarr Instance",
      status: "success"
    },
    {
      id: "2",
      timestamp: "2024-01-15 14:15:10",
      type: "list_update",
      title: "List updated from source",
      description: "Refreshed 'Trakt Popular TV Shows' from Trakt API",
      details: "Found 5 new shows, removed 2 ended series",
      source: "Trakt Popular TV Shows",
      status: "success"
    },
    {
      id: "3",
      timestamp: "2024-01-15 13:45:33",
      type: "error",
      title: "Sync failed",
      description: "Failed to sync 'My IMDb Watchlist' to Sonarr",
      details: "Connection timeout to Remote Sonarr instance",
      source: "My IMDb Watchlist → Remote Sonarr",
      status: "error"
    },
    {
      id: "4",
      timestamp: "2024-01-15 13:30:15",
      type: "integration",
      title: "Integration test successful",
      description: "Connection test passed for Main Sonarr Instance",
      details: "API key valid, version v4.0.1.929 detected",
      source: "Main Sonarr Instance",
      status: "success"
    },
    {
      id: "5",
      timestamp: "2024-01-15 12:00:00",
      type: "sync",
      title: "Scheduled sync started",
      description: "Beginning hourly sync of all enabled lists",
      details: "Processing 3 active lists across 2 integrations",
      status: "info"
    },
    {
      id: "6",
      timestamp: "2024-01-15 11:45:20",
      type: "list_update",
      title: "Source connection warning",
      description: "TMDB API rate limit approaching",
      details: "429 responses received, implementing backoff strategy",
      source: "The Movie Database",
      status: "warning"
    }
  ]);

  const [filterType, setFilterType] = useState<"all" | "sync" | "list_update" | "integration" | "error">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "error" | "warning" | "info">("all");

  const filteredLogs = logs.filter(log => {
    const typeMatch = filterType === "all" || log.type === filterType;
    const statusMatch = filterStatus === "all" || log.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sync":
        return <MdSync size={20} />;
      case "list_update":
        return <MdList size={20} />;
      case "integration":
        return <MdIntegrationInstructions size={20} />;
      case "error":
        return <MdError size={20} />;
      default:
        return <MdInfo size={20} />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <MdCheckCircle className="status-icon success" size={16} />;
      case "error":
        return <MdError className="status-icon error" size={16} />;
      case "warning":
        return <MdWarning className="status-icon warning" size={16} />;
      default:
        return <MdInfo className="status-icon info" size={16} />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-section">
          <h1 className="page-title">Activity</h1>
          <p className="page-subtitle">
            Monitor recent syncs, updates, and system activity. Track the health of your list management operations.
          </p>
        </div>
        <button className="btn-secondary">
          <MdRefresh size={20} />
          Refresh
        </button>
      </div>

      <div className="page-content">
        <div className="activity-summary">
          <div className="summary-stats">
            <div className="stat-item success">
              <MdCheckCircle size={24} />
              <div>
                <span className="stat-number">{logs.filter(l => l.status === "success").length}</span>
                <span className="stat-label">Successful</span>
              </div>
            </div>
            <div className="stat-item error">
              <MdError size={24} />
              <div>
                <span className="stat-number">{logs.filter(l => l.status === "error").length}</span>
                <span className="stat-label">Errors</span>
              </div>
            </div>
            <div className="stat-item warning">
              <MdWarning size={24} />
              <div>
                <span className="stat-number">{logs.filter(l => l.status === "warning").length}</span>
                <span className="stat-label">Warnings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="filters-section">
          <div className="filter-group">
            <label>Type:</label>
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Types</option>
              <option value="sync">Sync Events</option>
              <option value="list_update">List Updates</option>
              <option value="integration">Integration Events</option>
              <option value="error">Errors</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>

        <div className="activity-log">
          {filteredLogs.map((log) => (
            <div key={log.id} className={`log-entry ${log.status}`}>
              <div className="log-header">
                <div className="log-type-icon">
                  {getTypeIcon(log.type)}
                </div>
                <div className="log-info">
                  <h4 className="log-title">{log.title}</h4>
                  <p className="log-description">{log.description}</p>
                  {log.source && (
                    <p className="log-source">Source: {log.source}</p>
                  )}
                </div>
                <div className="log-meta">
                  <div className="log-status">
                    {getStatusIcon(log.status)}
                  </div>
                  <span className="log-timestamp">
                    {formatTimestamp(log.timestamp)}
                  </span>
                </div>
              </div>
              {log.details && (
                <div className="log-details">
                  <p>{log.details}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredLogs.length === 0 && (
          <div className="empty-state">
            <h3>No activity found</h3>
            <p>No activity matches your current filters. Try adjusting the filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}