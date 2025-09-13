import React, { useState, useEffect } from 'react';
import { 
  MdCheckCircle, 
  MdError, 
  MdWarning, 
  MdInfo,
  MdRefresh,
  MdTrendingUp,
  MdTrendingDown,
  MdHistory,
  MdSchedule
} from 'react-icons/md';
import { Source, SourceStatus } from '../../pages/SourcesPage';

interface HealthMetric {
  name: string;
  value: number;
  status: 'good' | 'warning' | 'error';
  description: string;
  lastChecked: Date;
}

interface SyncHistory {
  id: string;
  timestamp: Date;
  status: 'success' | 'error' | 'partial';
  itemsProcessed: number;
  duration: number; // in seconds
  errorMessage?: string;
}

interface SourceHealthMonitorProps {
  source: Source;
  onHealthUpdate?: (sourceId: string, healthScore: number) => void;
}

export function SourceHealthMonitor({ source, onHealthUpdate }: SourceHealthMonitorProps) {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);

  useEffect(() => {
    // Simulate loading health metrics
    loadHealthMetrics();
    loadSyncHistory();
    
    // Set up monitoring interval
    const interval = setInterval(() => {
      if (isMonitoring) {
        updateHealthMetrics();
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [source.id, isMonitoring]);

  const loadHealthMetrics = () => {
    // Simulate API call to get health metrics
    const mockMetrics: HealthMetric[] = [
      {
        name: 'Connection Stability',
        value: 98,
        status: 'good',
        description: 'Source responds consistently within expected timeframes',
        lastChecked: new Date()
      },
      {
        name: 'Data Quality',
        value: 85,
        status: 'good',
        description: 'Items are properly formatted and contain required fields',
        lastChecked: new Date()
      },
      {
        name: 'Sync Reliability',
        value: 92,
        status: 'good',
        description: 'Syncs complete successfully without errors',
        lastChecked: new Date()
      },
      {
        name: 'Response Time',
        value: source.status === 'error' ? 15 : 89,
        status: source.status === 'error' ? 'error' : 'good',
        description: 'Average time to receive data from source',
        lastChecked: new Date()
      }
    ];

    setHealthMetrics(mockMetrics);
    
    // Calculate overall health score
    const overallHealth = Math.round(
      mockMetrics.reduce((sum, metric) => sum + metric.value, 0) / mockMetrics.length
    );
    
    if (onHealthUpdate) {
      onHealthUpdate(source.id, overallHealth);
    }
  };

  const loadSyncHistory = () => {
    // Simulate API call to get sync history
    const mockHistory: SyncHistory[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        status: 'success',
        itemsProcessed: 142,
        duration: 45
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'success',
        itemsProcessed: 140,
        duration: 38
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        status: 'partial',
        itemsProcessed: 89,
        duration: 67,
        errorMessage: '5 items failed validation'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        status: source.status === 'error' ? 'error' : 'success',
        itemsProcessed: source.status === 'error' ? 0 : 138,
        duration: source.status === 'error' ? 5 : 42,
        errorMessage: source.status === 'error' ? 'Source unreachable' : undefined
      }
    ];

    setSyncHistory(mockHistory);
  };

  const updateHealthMetrics = () => {
    setHealthMetrics(prev => prev.map(metric => ({
      ...metric,
      lastChecked: new Date(),
      // Simulate small fluctuations in values
      value: Math.max(0, Math.min(100, metric.value + (Math.random() - 0.5) * 2))
    })));
  };

  const getHealthColor = (value: number) => {
    if (value >= 90) return '#10b981'; // Green
    if (value >= 70) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const getStatusIcon = (status: 'success' | 'error' | 'partial') => {
    switch (status) {
      case 'success':
        return <MdCheckCircle style={{ color: '#10b981' }} />;
      case 'error':
        return <MdError style={{ color: '#ef4444' }} />;
      case 'partial':
        return <MdWarning style={{ color: '#f59e0b' }} />;
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="source-health-monitor">
      <div className="health-header">
        <h4>Health Monitoring</h4>
        <button
          className={`btn btn-sm ${isMonitoring ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setIsMonitoring(!isMonitoring)}
        >
          {isMonitoring ? (
            <>
              <MdCheckCircle size={16} />
              Monitoring Active
            </>
          ) : (
            <>
              <MdRefresh size={16} />
              Start Monitoring
            </>
          )}
        </button>
      </div>

      <div className="health-metrics">
        <h5>Health Metrics</h5>
        <div className="metrics-grid">
          {healthMetrics.map((metric, index) => (
            <div key={index} className="metric-card">
              <div className="metric-header">
                <span className="metric-name">{metric.name}</span>
                <span 
                  className="metric-value"
                  style={{ color: getHealthColor(metric.value) }}
                >
                  {metric.value}%
                </span>
              </div>
              <div className="metric-bar">
                <div 
                  className="metric-fill"
                  style={{ 
                    width: `${metric.value}%`,
                    background: getHealthColor(metric.value)
                  }}
                />
              </div>
              <p className="metric-description">{metric.description}</p>
              <span className="metric-last-checked">
                Last checked: {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                  Math.floor((metric.lastChecked.getTime() - Date.now()) / (1000 * 60)), 
                  'minute'
                )}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="sync-history">
        <h5>
          <MdHistory size={16} />
          Recent Sync History
        </h5>
        <div className="history-list">
          {syncHistory.map(sync => (
            <div key={sync.id} className={`history-item ${sync.status}`}>
              <div className="history-status">
                {getStatusIcon(sync.status)}
              </div>
              <div className="history-details">
                <div className="history-main">
                  <span className="history-time">
                    {new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
                      Math.floor((sync.timestamp.getTime() - Date.now()) / (1000 * 60)), 
                      'minute'
                    )}
                  </span>
                  <span className="history-items">
                    {sync.itemsProcessed} items processed
                  </span>
                  <span className="history-duration">
                    <MdSchedule size={14} />
                    {formatDuration(sync.duration)}
                  </span>
                </div>
                {sync.errorMessage && (
                  <div className="history-error">
                    {sync.errorMessage}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="health-summary">
        <h5>Summary</h5>
        <div className="summary-stats">
          <div className="summary-stat">
            <MdTrendingUp size={20} />
            <div>
              <span className="stat-label">Uptime (7 days)</span>
              <span className="stat-value">99.2%</span>
            </div>
          </div>
          <div className="summary-stat">
            <MdRefresh size={20} />
            <div>
              <span className="stat-label">Successful Syncs</span>
              <span className="stat-value">47/50</span>
            </div>
          </div>
          <div className="summary-stat">
            <MdSchedule size={20} />
            <div>
              <span className="stat-label">Avg Sync Time</span>
              <span className="stat-value">42s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConnectionStatusBadge({ status }: { status: SourceStatus }) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: MdCheckCircle,
          color: '#10b981',
          text: 'Connected',
          bgColor: 'rgba(16, 185, 129, 0.1)'
        };
      case 'error':
        return {
          icon: MdError,
          color: '#ef4444',
          text: 'Error',
          bgColor: 'rgba(239, 68, 68, 0.1)'
        };
      case 'syncing':
        return {
          icon: MdRefresh,
          color: '#f59e0b',
          text: 'Syncing',
          bgColor: 'rgba(245, 158, 11, 0.1)'
        };
      case 'not_connected':
        return {
          icon: MdError,
          color: '#6b7280',
          text: 'Not Connected',
          bgColor: 'rgba(107, 114, 128, 0.1)'
        };
    }
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div 
      className="connection-status-badge"
      style={{ 
        background: config.bgColor,
        color: config.color,
        border: `1px solid ${config.color}33`
      }}
    >
      <Icon size={16} />
      <span>{config.text}</span>
    </div>
  );
}

export function HealthScoreIndicator({ score }: { score: number }) {
  const getHealthLevel = () => {
    if (score >= 90) return { level: 'excellent', color: '#10b981' };
    if (score >= 70) return { level: 'good', color: '#84cc16' };
    if (score >= 50) return { level: 'fair', color: '#f59e0b' };
    return { level: 'poor', color: '#ef4444' };
  };

  const health = getHealthLevel();

  return (
    <div className="health-score-indicator">
      <div className="health-score-circle">
        <svg viewBox="0 0 36 36" className="health-score-svg">
          <path
            className="health-score-bg"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="2"
          />
          <path
            className="health-score-fill"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            fill="none"
            stroke={health.color}
            strokeWidth="2"
            strokeDasharray={`${score}, 100`}
          />
        </svg>
        <div className="health-score-text">
          <span className="health-score-number">{score}</span>
        </div>
      </div>
      <span className="health-score-label">{health.level}</span>
    </div>
  );
}