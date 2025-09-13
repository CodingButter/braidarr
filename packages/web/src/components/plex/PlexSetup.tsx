import React, { useState } from 'react';
import PlexAuthCard from './PlexAuthCard';
import PlexServerDiscovery from './PlexServerDiscovery';
import PlexLibrarySelection from './PlexLibrarySelection';

interface PlexUser {
  id: number;
  uuid: string;
  username: string;
  email: string;
  thumb: string;
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
  connections: any[];
}

interface PlexLibrary {
  allowSync: boolean;
  art: string;
  composite: string;
  filters: boolean;
  refreshing: boolean;
  thumb: string;
  key: string;
  type: 'movie' | 'show' | 'artist' | 'photo' | 'mixed';
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
  location: any[];
}

interface PlexSetupProps {
  onComplete: (config: {
    user: PlexUser;
    authToken: string;
    server: PlexServer;
    serverUrl: string;
    libraries: PlexLibrary[];
  }) => void;
  onError: (error: string) => void;
  apiBaseUrl?: string;
}

type SetupStep = 'auth' | 'server' | 'libraries';

const PlexSetup: React.FC<PlexSetupProps> = ({ onComplete, onError, apiBaseUrl }) => {
  const [currentStep, setCurrentStep] = useState<SetupStep>('auth');
  const [user, setUser] = useState<PlexUser | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [selectedServer, setSelectedServer] = useState<PlexServer | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle successful authentication
  const handleAuthSuccess = (token: string, userData: PlexUser) => {
    setAuthToken(token);
    setUser(userData);
    setCurrentStep('server');
    setError(null);
  };

  // Handle server selection
  const handleServerSelect = (server: PlexServer, connectionUri: string) => {
    setSelectedServer(server);
    setServerUrl(connectionUri);
    setCurrentStep('libraries');
    setError(null);
  };

  // Handle library selection
  const handleLibrariesSelect = (libraries: PlexLibrary[]) => {
    if (user && authToken && selectedServer && serverUrl) {
      onComplete({
        user,
        authToken,
        server: selectedServer,
        serverUrl,
        libraries,
      });
    }
  };

  // Handle errors
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    onError(errorMessage);
  };

  // Navigate back to previous step
  const goBack = () => {
    setError(null);
    switch (currentStep) {
      case 'server':
        setCurrentStep('auth');
        setAuthToken(null);
        setUser(null);
        break;
      case 'libraries':
        setCurrentStep('server');
        setSelectedServer(null);
        setServerUrl(null);
        break;
    }
  };

  return (
    <div className="plex-setup">
      <div className="setup-header">
        <h2>Plex Integration Setup</h2>
        <div className="progress-indicators">
          <div className={`step ${currentStep === 'auth' ? 'active' : currentStep !== 'auth' ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <span>Authentication</span>
          </div>
          <div className={`step ${currentStep === 'server' ? 'active' : currentStep === 'libraries' ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <span>Server Selection</span>
          </div>
          <div className={`step ${currentStep === 'libraries' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <span>Library Selection</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="global-error">
          <div className="alert alert-error">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)} className="btn-close">×</button>
          </div>
        </div>
      )}

      <div className="setup-content">
        {currentStep === 'auth' && (
          <div className="step-content">
            <PlexAuthCard
              onSuccess={handleAuthSuccess}
              onError={handleError}
              apiBaseUrl={apiBaseUrl}
            />
          </div>
        )}

        {currentStep === 'server' && authToken && (
          <div className="step-content">
            <div className="step-header">
              <div className="user-info">
                <img 
                  src={user?.thumb || '/default-avatar.png'} 
                  alt={user?.username || 'User'} 
                  className="user-avatar"
                />
                <div>
                  <p className="welcome-text">Welcome, {user?.username}!</p>
                  <p className="step-description">Now select a Plex server to connect to.</p>
                </div>
              </div>
            </div>
            <PlexServerDiscovery
              authToken={authToken}
              onServerSelect={handleServerSelect}
              onError={handleError}
              apiBaseUrl={apiBaseUrl}
            />
          </div>
        )}

        {currentStep === 'libraries' && selectedServer && serverUrl && (
          <div className="step-content">
            <div className="step-header">
              <div className="server-info">
                <h4>Connected to {selectedServer.name}</h4>
                <p className="step-description">
                  Select which libraries you want to monitor.
                </p>
              </div>
            </div>
            <PlexLibrarySelection
              server={selectedServer}
              serverUrl={serverUrl}
              onLibrariesSelect={handleLibrariesSelect}
              onBack={goBack}
              onError={handleError}
              apiBaseUrl={apiBaseUrl}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        .plex-setup {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .setup-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .setup-header h2 {
          margin: 0 0 24px 0;
          color: #2d3748;
          font-size: 32px;
        }

        .progress-indicators {
          display: flex;
          justify-content: center;
          gap: 24px;
          align-items: center;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          color: #a0aec0;
          position: relative;
        }

        .step.active {
          color: #3182ce;
        }

        .step.completed {
          color: #38a169;
        }

        .step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s;
        }

        .step.active .step-number {
          background: #3182ce;
          color: white;
        }

        .step.completed .step-number {
          background: #38a169;
          color: white;
        }

        .step span {
          font-size: 14px;
          font-weight: 500;
          white-space: nowrap;
        }

        /* Add connecting lines between steps */
        .step:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 20px;
          left: 100%;
          width: 24px;
          height: 2px;
          background: #e2e8f0;
        }

        .step.completed:not(:last-child)::after {
          background: #38a169;
        }

        .global-error {
          margin-bottom: 24px;
        }

        .alert {
          padding: 16px;
          border-radius: 8px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .alert-error {
          background: #fed7d7;
          border: 1px solid #f56565;
          color: #c53030;
        }

        .btn-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: inherit;
          padding: 0;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .setup-content {
          margin-top: 32px;
        }

        .step-content {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .step-header {
          margin-bottom: 24px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 16px;
          justify-content: center;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .user-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          border: 3px solid #3182ce;
        }

        .welcome-text {
          margin: 0;
          font-size: 18px;
          font-weight: bold;
          color: #2d3748;
        }

        .step-description {
          margin: 4px 0 0 0;
          color: #4a5568;
          font-size: 14px;
        }

        .server-info {
          text-align: center;
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          margin-bottom: 24px;
        }

        .server-info h4 {
          margin: 0 0 8px 0;
          color: #2d3748;
          font-size: 20px;
        }
      `}</style>
    </div>
  );
};

export default PlexSetup;