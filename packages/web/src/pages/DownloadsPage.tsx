import { RiDownloadLine } from "react-icons/ri";
import { MdPause, MdPlayArrow, MdStop, MdRefresh } from "react-icons/md";
import "./CommonPage.css";

export default function DownloadsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <RiDownloadLine className="page-icon" size={32} />
          <h1>Downloads</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary">
            <MdRefresh size={20} />
            Refresh
          </button>
          <button className="btn btn-primary">
            <MdPlayArrow size={20} />
            Resume All
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Active</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Paused</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat">
            <span className="stat-value">0 KB/s</span>
            <span className="stat-label">Speed</span>
          </div>
        </div>

        <div className="content-area">
          <div className="downloads-container">
            <div className="downloads-tabs">
              <button className="tab active">Queue</button>
              <button className="tab">History</button>
            </div>
            
            <div className="empty-state">
              <RiDownloadLine size={64} className="empty-icon" />
              <h3>No active downloads</h3>
              <p>Your download queue is empty. Downloads will appear here when you add movies or TV shows.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}