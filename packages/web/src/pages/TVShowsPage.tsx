import { MdTv, MdAdd, MdSearch } from "react-icons/md";
import "./CommonPage.css";

export default function TVShowsPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <MdTv className="page-icon" size={32} />
          <h1>TV Shows</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <MdAdd size={20} />
            Add Series
          </button>
          <button className="btn btn-secondary">
            <MdSearch size={20} />
            Search
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Total Series</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Episodes</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Missing</span>
          </div>
        </div>

        <div className="content-area">
          <div className="empty-state">
            <MdTv size={64} className="empty-icon" />
            <h3>No TV shows found</h3>
            <p>Add your first TV series to start tracking episodes and seasons.</p>
            <button className="btn btn-primary">
              <MdAdd size={20} />
              Add Series
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}