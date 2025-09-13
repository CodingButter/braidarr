import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface PlexAuthState {
  pinId: number;
  pinCode: string;
  clientIdentifier: string;
  expiresAt: string;
  qrUrl: string;
  linkUrl: string;
}

interface PlexUser {
  id: number;
  uuid: string;
  username: string;
  email: string;
  thumb: string;
}

interface PlexAuthCardProps {
  onSuccess: (authToken: string, user: PlexUser) => void;
  onError: (error: string) => void;
  apiBaseUrl?: string;
}

const PlexAuthCard: React.FC<PlexAuthCardProps> = ({ 
  onSuccess, 
  onError, 
  apiBaseUrl = 'http://localhost:3401' 
}) => {
  const [authState, setAuthState] = useState<PlexAuthState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);

  // Start PIN authentication
  const initiatePinAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post<PlexAuthState>(
        `${apiBaseUrl}/api/v1/plex/auth/pin`
      );
      setAuthState(response.data);
      startPolling(response.data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to initiate Plex authentication';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for PIN status
  const startPolling = (state: PlexAuthState) => {
    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(
          `${apiBaseUrl}/api/v1/plex/auth/pin/${state.pinId}/status`,
          {
            params: { clientIdentifier: state.clientIdentifier }
          }
        );

        if (response.data.authenticated && response.data.authToken) {
          clearInterval(pollInterval);
          setIsPolling(false);
          onSuccess(response.data.authToken, response.data.user);
        }
      } catch (err: any) {
        if (err.response?.status === 404) {
          // Session expired
          clearInterval(pollInterval);
          setIsPolling(false);
          setError('Authentication session expired');
        }
      }
    }, 2000); // Poll every 2 seconds

    // Auto-cleanup after 10 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
      setIsPolling(false);
      if (authState) {
        setError('Authentication timeout');
      }
    }, 10 * 60 * 1000);
  };

  // Cancel authentication
  const cancelAuth = async () => {
    if (!authState) return;

    try {
      await axios.delete(
        `${apiBaseUrl}/api/v1/plex/auth/pin/${authState.clientIdentifier}`
      );
    } catch (err) {
      console.error('Failed to cancel auth:', err);
    }

    setAuthState(null);
    setIsPolling(false);
    setError(null);
  };

  // Format expiry time
  const formatExpiryTime = (expiresAt: string) => {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const minutes = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 60000));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="plex-auth-card">
      <div className="card">
        <div className="card-header">
          <h3>Connect to Plex</h3>
          <p>Authenticate with your Plex account to discover servers</p>
        </div>

        <div className="card-content">
          {error && (
            <div className="alert alert-error">
              <p>{error}</p>
              <button onClick={() => setError(null)} className="btn-close">×</button>
            </div>
          )}

          {!authState ? (
            <div className="auth-start">
              <p>Click the button below to start the authentication process.</p>
              <button 
                onClick={initiatePinAuth} 
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? 'Starting...' : 'Authenticate with Plex'}
              </button>
            </div>
          ) : (
            <div className="auth-progress">
              <div className="pin-display">
                <h4>Enter this PIN in Plex:</h4>
                <div className="pin-code">{authState.pinCode}</div>
                <p className="pin-expiry">
                  Expires in {formatExpiryTime(authState.expiresAt)}
                </p>
              </div>

              <div className="auth-options">
                <a 
                  href={authState.linkUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open Plex Link
                </a>

                <button 
                  onClick={() => setShowQR(!showQR)} 
                  className="btn btn-secondary"
                >
                  {showQR ? 'Hide' : 'Show'} QR Code
                </button>

                <button 
                  onClick={cancelAuth} 
                  disabled={isPolling}
                  className="btn btn-danger"
                >
                  Cancel
                </button>
              </div>

              {showQR && (
                <div className="qr-code">
                  <img 
                    src={authState.qrUrl} 
                    alt="Plex Authentication QR Code"
                    className="qr-image"
                  />
                </div>
              )}

              {isPolling && (
                <div className="polling-status">
                  <div className="spinner"></div>
                  <p>Waiting for authentication...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .plex-auth-card {
          max-width: 500px;
          margin: 0 auto;
        }

        .card {
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          background: white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .card-header {
          padding: 20px;
          border-bottom: 1px solid #e1e5e9;
          text-align: center;
        }

        .card-header h3 {
          margin: 0 0 8px 0;
          color: #2d3748;
        }

        .card-header p {
          margin: 0;
          color: #718096;
        }

        .card-content {
          padding: 20px;
        }

        .alert {
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 20px;
          position: relative;
        }

        .alert-error {
          background: #fed7d7;
          border: 1px solid #f56565;
          color: #c53030;
        }

        .btn-close {
          position: absolute;
          top: 8px;
          right: 12px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: inherit;
        }

        .auth-start {
          text-align: center;
        }

        .auth-start p {
          margin-bottom: 20px;
          color: #4a5568;
        }

        .pin-display {
          text-align: center;
          margin-bottom: 24px;
        }

        .pin-display h4 {
          margin: 0 0 12px 0;
          color: #2d3748;
        }

        .pin-code {
          font-size: 28px;
          font-weight: bold;
          color: #e53e3e;
          background: #fed7d7;
          padding: 16px 24px;
          border-radius: 8px;
          margin: 12px 0;
          letter-spacing: 2px;
          border: 2px solid #f56565;
        }

        .pin-expiry {
          color: #718096;
          font-size: 14px;
          margin: 8px 0 0 0;
        }

        .auth-options {
          display: flex;
          gap: 12px;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }

        .btn {
          padding: 10px 16px;
          border-radius: 6px;
          font-weight: 500;
          text-decoration: none;
          display: inline-block;
          cursor: pointer;
          border: none;
          font-size: 14px;
          transition: all 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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

        .btn-danger {
          background: #e53e3e;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c53030;
        }

        .qr-code {
          text-align: center;
          margin: 20px 0;
        }

        .qr-image {
          max-width: 200px;
          height: auto;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
        }

        .polling-status {
          text-align: center;
          padding: 20px;
        }

        .spinner {
          border: 3px solid #e2e8f0;
          border-top: 3px solid #3182ce;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          animation: spin 1s linear infinite;
          margin: 0 auto 12px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .polling-status p {
          margin: 0;
          color: #4a5568;
        }
      `}</style>
    </div>
  );
};

export default PlexAuthCard;