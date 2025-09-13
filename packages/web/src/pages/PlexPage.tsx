import React, { useState } from 'react';
import { PlexSetup } from '../components/plex';

interface PlexConfig {
  user: {
    id: number;
    uuid: string;
    username: string;
    email: string;
    thumb: string;
  };
  authToken: string;
  server: {
    name: string;
    clientIdentifier: string;
    accessToken: string;
  };
  serverUrl: string;
  libraries: Array<{
    key: string;
    title: string;
    type: string;
  }>;
}

const PlexPage: React.FC = () => {
  const [plexConfig, setPlexConfig] = useState<PlexConfig | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(true);

  const handleSetupComplete = (config: PlexConfig) => {
    setPlexConfig(config);
    setShowSetup(false);
    setSetupError(null);
    
    // Here you would typically save the config to your app state/backend
    console.log('Plex setup complete:', config);
  };

  const handleSetupError = (error: string) => {
    setSetupError(error);
  };

  const resetSetup = () => {
    setPlexConfig(null);
    setShowSetup(true);
    setSetupError(null);
  };

  const startNewSetup = () => {
    setShowSetup(true);
    setSetupError(null);
  };

  return (
    <div className="plex-page">
      <div className="page-header">
        <h1>Plex Integration</h1>
        <p>Connect your Plex Media Server to Braidarr for intelligent media management</p>
      </div>

      {showSetup ? (
        <PlexSetup
          onComplete={handleSetupComplete}
          onError={handleSetupError}
        />
      ) : plexConfig ? (
        <div className="setup-complete">
          <div className="success-card">
            <div className="success-header">
              <h2>🎉 Plex Integration Complete!</h2>
              <p>Your Plex server is now connected to Braidarr</p>
            </div>

            <div className="config-summary">
              <div className="summary-section">
                <h3>User Account</h3>
                <div className="user-details">
                  <img 
                    src={plexConfig.user.thumb} 
                    alt={plexConfig.user.username}
                    className="user-thumb"
                  />
                  <div>
                    <p><strong>{plexConfig.user.username}</strong></p>
                    <p className="user-email">{plexConfig.user.email}</p>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3>Connected Server</h3>
                <div className="server-details">
                  <p><strong>Name:</strong> {plexConfig.server.name}</p>
                  <p><strong>URL:</strong> {plexConfig.serverUrl}</p>
                  <p><strong>ID:</strong> {plexConfig.server.clientIdentifier}</p>
                </div>
              </div>

              <div className="summary-section">
                <h3>Selected Libraries ({plexConfig.libraries.length})</h3>
                <div className="libraries-list">
                  {plexConfig.libraries.map(library => (
                    <div key={library.key} className="library-item">
                      <span className="library-icon">
                        {library.type === 'movie' ? '🎬' : 
                         library.type === 'show' ? '📺' : 
                         library.type === 'artist' ? '🎵' : 
                         library.type === 'photo' ? '📷' : '📁'}
                      </span>
                      <span className="library-name">{library.title}</span>
                      <span className="library-type">({library.type})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="actions">
              <button onClick={startNewSetup} className="btn btn-secondary">
                Reconfigure
              </button>
              <button className="btn btn-primary">
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="error-state">
          <h2>Setup Incomplete</h2>
          <p>There was an issue completing the Plex setup.</p>
          {setupError && (
            <div className="error-details">
              <p><strong>Error:</strong> {setupError}</p>
            </div>
          )}
          <button onClick={resetSetup} className="btn btn-primary">
            Start Over
          </button>
        </div>
      )}

      <style>{`
        .plex-page {
          min-height: 100vh;
          background: #f7fafc;
          padding: 20px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 40px;
          padding: 40px 20px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .page-header h1 {
          margin: 0 0 12px 0;
          color: #2d3748;
          font-size: 36px;
        }

        .page-header p {
          margin: 0;
          color: #4a5568;
          font-size: 16px;
          max-width: 600px;
          margin: 0 auto;
        }

        .setup-complete {
          max-width: 800px;
          margin: 0 auto;
        }

        .success-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }

        .success-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .success-header h2 {
          margin: 0 0 12px 0;
          color: #2d3748;
          font-size: 28px;
        }

        .success-header p {
          margin: 0;
          color: #4a5568;
          font-size: 16px;
        }

        .config-summary {
          display: grid;
          gap: 24px;
          margin-bottom: 32px;
        }

        .summary-section {
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
        }

        .summary-section h3 {
          margin: 0 0 16px 0;
          color: #2d3748;
          font-size: 18px;
        }

        .user-details {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-thumb {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #3182ce;
        }

        .user-details p {
          margin: 2px 0;
        }

        .user-email {
          color: #4a5568;
          font-size: 14px;
        }

        .server-details p {
          margin: 4px 0;
          color: #4a5568;
        }

        .libraries-list {
          display: grid;
          gap: 8px;
        }

        .library-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: white;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .library-icon {
          font-size: 18px;
        }

        .library-name {
          font-weight: 500;
          color: #2d3748;
          flex: 1;
        }

        .library-type {
          color: #4a5568;
          font-size: 14px;
          text-transform: capitalize;
        }

        .actions {
          display: flex;
          gap: 16px;
          justify-content: center;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
        }

        .error-state {
          text-align: center;
          padding: 40px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          max-width: 600px;
          margin: 0 auto;
        }

        .error-state h2 {
          margin: 0 0 16px 0;
          color: #e53e3e;
        }

        .error-state p {
          margin: 0 0 20px 0;
          color: #4a5568;
        }

        .error-details {
          background: #fed7d7;
          border: 1px solid #f56565;
          color: #c53030;
          padding: 16px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
        }

        .btn {
          padding: 12px 24px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          font-size: 16px;
          transition: all 0.2s;
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary {
          background: #3182ce;
          color: white;
        }

        .btn-primary:hover {
          background: #2c5aa0;
        }

        .btn-secondary {
          background: #e2e8f0;
          color: #4a5568;
        }

        .btn-secondary:hover {
          background: #cbd5e0;
        }
      `}</style>
    </div>
  );
};

export default PlexPage;