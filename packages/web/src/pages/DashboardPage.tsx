import { useAuthStore } from "../stores/authStore";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Braidarr Dashboard</h1>
        <p className="dashboard-subtitle">Import List Management for Sonarr & Radarr</p>
      </div>

      <div className="dashboard-content">
        {isAuthenticated && user ? (
          <div className="user-welcome">
            <h2>Welcome back, {user.firstName || user.username || user.email}!</h2>
            <p>Manage your import lists and keep your media libraries up to date</p>
          </div>
        ) : (
          <div className="guest-welcome">
            <h2>Welcome to Braidarr</h2>
            <p>Automated import list management for Sonarr and Radarr. All features available without login.</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="action-btn primary">Create New List</button>
            <button className="action-btn secondary">Connect Source</button>
            <button className="action-btn tertiary">Sync All Lists</button>
            <button className="action-btn tertiary">Test Connections</button>
          </div>
        </div>

        {/* List Statistics */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Active Lists</h3>
            <p className="stat-value">24</p>
            <p>Movie and TV show lists</p>
          </div>
          <div className="stat-card">
            <h3>Connected Sources</h3>
            <p className="stat-value">7</p>
            <p>IMDb, Trakt, Letterboxd, etc.</p>
          </div>
          <div className="stat-card">
            <h3>Pending Updates</h3>
            <p className="stat-value">142</p>
            <p>Items waiting to sync</p>
          </div>
          <div className="stat-card">
            <h3>Sync Success Rate</h3>
            <p className="stat-value">98.5%</p>
            <p>Last 24 hours</p>
          </div>
        </div>

        {/* Integration Status */}
        <div className="integration-status">
          <h3>Integration Health</h3>
          <div className="integration-grid">
            <div className="integration-card">
              <div className="integration-header">
                <h4>Sonarr</h4>
                <span className="status-indicator healthy">Healthy</span>
              </div>
              <p>Connected to 3 instances</p>
              <p className="last-sync">Last sync: 5 minutes ago</p>
            </div>
            <div className="integration-card">
              <div className="integration-header">
                <h4>Radarr</h4>
                <span className="status-indicator healthy">Healthy</span>
              </div>
              <p>Connected to 2 instances</p>
              <p className="last-sync">Last sync: 3 minutes ago</p>
            </div>
          </div>
        </div>

        {/* Active Lists Overview */}
        <div className="active-lists">
          <h3>Active Lists</h3>
          <div className="lists-grid">
            <div className="list-card movie-list">
              <div className="list-header">
                <h4>IMDb Top 250</h4>
                <span className="list-type">Movies</span>
              </div>
              <div className="list-stats">
                <span className="item-count">250 items</span>
                <span className="sync-status synced">Synced</span>
              </div>
              <p className="last-update">Last updated: 2 hours ago</p>
            </div>
            <div className="list-card tv-list">
              <div className="list-header">
                <h4>Trakt Trending TV</h4>
                <span className="list-type">TV Shows</span>
              </div>
              <div className="list-stats">
                <span className="item-count">45 items</span>
                <span className="sync-status pending">Pending</span>
              </div>
              <p className="last-update">Last updated: 12 minutes ago</p>
            </div>
            <div className="list-card movie-list">
              <div className="list-header">
                <h4>Letterboxd Watchlist</h4>
                <span className="list-type">Movies</span>
              </div>
              <div className="list-stats">
                <span className="item-count">89 items</span>
                <span className="sync-status synced">Synced</span>
              </div>
              <p className="last-update">Last updated: 1 hour ago</p>
            </div>
            <div className="list-card tv-list">
              <div className="list-header">
                <h4>Custom Sci-Fi List</h4>
                <span className="list-type">Mixed</span>
              </div>
              <div className="list-stats">
                <span className="item-count">127 items</span>
                <span className="sync-status error">Error</span>
              </div>
              <p className="last-update">Failed: API limit exceeded</p>
            </div>
          </div>
        </div>

        {/* Connected Sources */}
        <div className="connected-sources">
          <h3>Connected Sources</h3>
          <div className="sources-grid">
            <div className="source-card connected">
              <h4>IMDb</h4>
              <span className="connection-status">Connected</span>
              <p>3 active lists</p>
            </div>
            <div className="source-card connected">
              <h4>Trakt</h4>
              <span className="connection-status">Connected</span>
              <p>5 active lists</p>
            </div>
            <div className="source-card connected">
              <h4>Letterboxd</h4>
              <span className="connection-status">Connected</span>
              <p>2 active lists</p>
            </div>
            <div className="source-card disconnected">
              <h4>TMDb</h4>
              <span className="connection-status">Disconnected</span>
              <p>0 active lists</p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <h3>Recent Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">5 minutes ago</span>
              <span className="activity-text">Synced "IMDb Top 250" - 3 new movies added to Radarr</span>
              <span className="activity-type sync">Sync</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">12 minutes ago</span>
              <span className="activity-text">Updated "Trakt Trending TV" - 8 shows pending import</span>
              <span className="activity-type update">Update</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 hour ago</span>
              <span className="activity-text">Created new list "Horror Collection" from Letterboxd</span>
              <span className="activity-type create">Create</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">2 hours ago</span>
              <span className="activity-text">Connection test failed for TMDb API - rate limit exceeded</span>
              <span className="activity-type error">Error</span>
            </div>
            <div className="activity-item">
              <span className="activity-time">3 hours ago</span>
              <span className="activity-text">Sonarr instance #2 successfully imported 12 TV shows</span>
              <span className="activity-type import">Import</span>
            </div>
          </div>
        </div>

        {/* Export Status */}
        <div className="export-status">
          <h3>Export Status</h3>
          <div className="export-grid">
            <div className="export-card">
              <h4>Sonarr Exports</h4>
              <div className="export-stats">
                <div className="export-stat">
                  <span className="stat-label">Last Sync</span>
                  <span className="stat-value">5 min ago</span>
                </div>
                <div className="export-stat">
                  <span className="stat-label">Success Rate</span>
                  <span className="stat-value">100%</span>
                </div>
                <div className="export-stat">
                  <span className="stat-label">Items Exported</span>
                  <span className="stat-value">89 today</span>
                </div>
              </div>
            </div>
            <div className="export-card">
              <h4>Radarr Exports</h4>
              <div className="export-stats">
                <div className="export-stat">
                  <span className="stat-label">Last Sync</span>
                  <span className="stat-value">3 min ago</span>
                </div>
                <div className="export-stat">
                  <span className="stat-label">Success Rate</span>
                  <span className="stat-value">97.2%</span>
                </div>
                <div className="export-stat">
                  <span className="stat-label">Items Exported</span>
                  <span className="stat-value">156 today</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
