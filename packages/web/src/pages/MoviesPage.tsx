import { MdMovie, MdAdd, MdSearch } from "react-icons/md";
import "./CommonPage.css";

export default function MoviesPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <MdMovie className="page-icon" size={32} />
          <h1>Movies</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <MdAdd size={20} />
            Add Movie
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
            <span className="stat-label">Total Movies</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Missing</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Downloading</span>
          </div>
        </div>

        <div className="content-area">
          <div className="empty-state">
            <MdMovie size={64} className="empty-icon" />
            <h3>No movies found</h3>
            <p>Add your first movie to get started with your media collection.</p>
            <button className="btn btn-primary">
              <MdAdd size={20} />
              Add Movie
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}