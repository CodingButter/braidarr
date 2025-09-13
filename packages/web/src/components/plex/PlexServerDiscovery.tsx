import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PlexConnection {
  protocol: string;
  address: string;
  port: number;
  uri: string;
  local: boolean;
  relay: boolean;
  IPv6: boolean;
}

interface PlexServer {
  name: string;
  product: string;
  productVersion: string;
  platform: string;
  platformVersion: string;
  device: string;
  clientIdentifier: string;
  createdAt: string;
  lastSeenAt: string;
  provides: string;
  ownerId: number;
  sourceTitle: string;
  publicAddress: string;
  accessToken: string;
  owned: boolean;
  home: boolean;
  synced: boolean;
  relay: boolean;
  presence: boolean;
  httpsRequired: boolean;
  publicAddressMatches: boolean;
  dnsRebindingProtection: boolean;
  natLoopbackSupported: boolean;
  connections: PlexConnection[];
}

interface ServerConnectionTest {
  connected: boolean;
  details?: {
    machineIdentifier?: string;
    version?: string;
    platform?: string;
    platformVersion?: string;
  };
  error?: string;
}

interface PlexServerDiscoveryProps {
  authToken: string;
  onServerSelect: (server: PlexServer, connectionUri: string) => void;
  onError: (error: string) => void;
  apiBaseUrl?: string;
}

const PlexServerDiscovery: React.FC<PlexServerDiscoveryProps> = ({
  authToken,
  onServerSelect,
  onError,
  apiBaseUrl = 'http://localhost:3401'
}) => {
  const [servers, setServers] = useState<PlexServer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionTests, setConnectionTests] = useState<Map<string, ServerConnectionTest>>(new Map());
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Load servers on mount
  useEffect(() => {
    loadServers();
  }, [authToken]);

  const loadServers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<PlexServer[]>(
        `${apiBaseUrl}/api/v1/plex/servers`,
        {
          headers: {
            'X-Plex-Token': authToken
          }
        }
      );
      setServers(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load Plex servers';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection to server
  const testServerConnection = async (server: PlexServer, connectionUri: string) => {
    const testKey = `${server.clientIdentifier}-${connectionUri}`;
    setTestingConnections(prev => new Set(prev).add(testKey));

    try {
      const response = await axios.post<{ connected: boolean; details?: any; error?: string; serverUrl: string }>(
        `${apiBaseUrl}/api/v1/plex/servers/test`,
        {
          serverUrl: connectionUri,
          serverToken: server.accessToken
        }
      );

      setConnectionTests(prev => new Map(prev).set(testKey, {
        connected: response.data.connected,
        details: response.data.details,
        error: response.data.error
      }));

      return response.data.connected;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Connection test failed';
      setConnectionTests(prev => new Map(prev).set(testKey, {
        connected: false,
        error: errorMessage
      }));
      return false;
    } finally {
      setTestingConnections(prev => {
        const next = new Set(prev);
        next.delete(testKey);
        return next;
      });
    }
  };

  // Get the best connection for a server
  const getBestConnection = (server: PlexServer): PlexConnection | null => {
    if (!server.connections?.length) return null;

    // Prefer local HTTPS, then local HTTP, then remote HTTPS, then remote HTTP
    const priorities = [
      (conn: PlexConnection) => conn.local && conn.protocol === 'https',
      (conn: PlexConnection) => conn.local && conn.protocol === 'http',
      (conn: PlexConnection) => !conn.local && conn.protocol === 'https',
      (conn: PlexConnection) => !conn.local && conn.protocol === 'http',
    ];

    for (const priority of priorities) {
      const connection = server.connections.find(priority);
      if (connection) return connection;
    }

    return server.connections[0];
  };

  // Handle server selection
  const selectServer = async (server: PlexServer, connectionUri: string) => {
    const isConnected = await testServerConnection(server, connectionUri);
    if (isConnected) {
      onServerSelect(server, connectionUri);
    }
  };

  // Format last seen time
  const formatLastSeen = (lastSeenAt: string) => {
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  if (isLoading) {
    return (
      <div className="server-discovery">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading Plex servers...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="server-discovery">
        <div className="alert alert-error">
          <p>{error}</p>
          <button onClick={loadServers} className="btn btn-sm">Retry</button>
        </div>
      </div>
    );
  }

  if (servers.length === 0) {
    return (
      <div className="server-discovery">
        <div className="no-servers">
          <h3>No Plex servers found</h3>
          <p>Make sure you have access to at least one Plex Media Server.</p>
          <button onClick={loadServers} className="btn btn-primary">Refresh</button>
        </div>
      </div>
    );
  }

  return (
    <div className="server-discovery">
      <div className="header">
        <h3>Select a Plex Server</h3>
        <button onClick={loadServers} className="btn btn-secondary btn-sm">Refresh</button>
      </div>

      <div className="servers-list">
        {servers.map(server => {
          const bestConnection = getBestConnection(server);
          const connectionUri = bestConnection?.uri || '';
          const testKey = `${server.clientIdentifier}-${connectionUri}`;
          const connectionTest = connectionTests.get(testKey);
          const isTesting = testingConnections.has(testKey);

          return (
            <div key={server.clientIdentifier} className="server-card">
              <div className="server-info">
                <div className="server-name">
                  <h4>{server.name}</h4>
                  <div className="server-badges">
                    {server.owned && <span className="badge badge-owner">Owner</span>}
                    {server.home && <span className="badge badge-home">Home</span>}
                    {server.presence && <span className="badge badge-online">Online</span>}
                  </div>
                </div>
                
                <div className="server-details">
                  <p><strong>Version:</strong> {server.productVersion}</p>
                  <p><strong>Platform:</strong> {server.platform} {server.platformVersion}</p>
                  <p><strong>Last seen:</strong> {formatLastSeen(server.lastSeenAt)}</p>
                  {bestConnection && (
                    <p><strong>Connection:</strong> {bestConnection.protocol}://{bestConnection.address}:{bestConnection.port} 
                      ({bestConnection.local ? 'local' : 'remote'})</p>
                  )}
                </div>
              </div>

              <div className="server-actions">
                {connectionTest && (
                  <div className={`connection-status ${connectionTest.connected ? 'success' : 'error'}`}>
                    {connectionTest.connected ? (
                      <div>
                        <span className="status-icon">✓</span>
                        <span>Connected</span>
                        {connectionTest.details?.version && (
                          <small>Server v{connectionTest.details.version}</small>
                        )}
                      </div>
                    ) : (
                      <div>
                        <span className="status-icon">✗</span>
                        <span>Failed</span>
                        {connectionTest.error && <small>{connectionTest.error}</small>}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={() => selectServer(server, connectionUri)}
                  disabled={!bestConnection || isTesting}
                  className={`btn ${connectionTest?.connected ? 'btn-success' : 'btn-primary'}`}
                >
                  {isTesting ? 'Testing...' : 
                   connectionTest?.connected ? 'Select Server' : 'Test & Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .server-discovery {
          max-width: 800px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header h3 {
          margin: 0;
          color: #2d3748;
        }

        .loading {
          text-align: center;
          padding: 40px;
        }

        .spinner {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3182ce;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-error {
          background: #fed7d7;
          border: 1px solid #f56565;
          color: #c53030;
        }

        .no-servers {
          text-align: center;
          padding: 40px;
        }

        .no-servers h3 {
          margin: 0 0 12px 0;
          color: #2d3748;
        }

        .no-servers p {
          margin: 0 0 20px 0;
          color: #4a5568;
        }

        .servers-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .server-card {
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          background: white;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .server-info {
          flex: 1;
        }

        .server-name {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .server-name h4 {
          margin: 0;
          color: #2d3748;
        }

        .server-badges {
          display: flex;
          gap: 6px;
        }

        .badge {
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .badge-owner {
          background: #bee3f8;
          color: #2c5aa0;
        }

        .badge-home {
          background: #c6f6d5;
          color: #276749;
        }

        .badge-online {
          background: #9ae6b4;
          color: #22543d;
        }

        .server-details p {
          margin: 4px 0;
          color: #4a5568;
          font-size: 14px;
        }

        .server-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: flex-end;
        }

        .connection-status {
          padding: 8px 12px;
          border-radius: 6px;
          font-size: 14px;
          text-align: center;
          min-width: 120px;
        }

        .connection-status.success {
          background: #c6f6d5;
          color: #22543d;
        }

        .connection-status.error {
          background: #fed7d7;
          color: #c53030;
        }

        .status-icon {
          margin-right: 6px;
          font-weight: bold;
        }

        .connection-status small {
          display: block;
          font-size: 12px;
          opacity: 0.8;
          margin-top: 2px;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          font-size: 14px;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-primary {
          background: #3182ce;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2c5aa0;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #cbd5e0;
        }

        .btn-success {
          background: #38a169;
          color: white;
        }

        .btn-success:hover:not(:disabled) {
          background: #2f855a;
        }
      `}</style>
    </div>
  );
};

export default PlexServerDiscovery;