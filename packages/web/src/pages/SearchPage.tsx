import { useState } from "react";
import { MdSearch, MdFilterList } from "react-icons/md";
import "./CommonPage.css";

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log("Searching for:", searchQuery, "Type:", searchType);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <MdSearch className="page-icon" size={32} />
          <h1>Search</h1>
        </div>
      </div>

      <div className="page-content">
        <div className="search-form-container">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for movies, TV shows, or collections..."
                className="search-input"
              />
              <button type="submit" className="search-btn">
                <MdSearch size={20} />
              </button>
            </div>
            
            <div className="search-filters">
              <div className="filter-group">
                <MdFilterList size={20} />
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All</option>
                  <option value="movies">Movies</option>
                  <option value="tv">TV Shows</option>
                  <option value="collections">Collections</option>
                </select>
              </div>
            </div>
          </form>
        </div>

        <div className="content-area">
          {!searchQuery ? (
            <div className="empty-state">
              <MdSearch size={64} className="empty-icon" />
              <h3>Start searching</h3>
              <p>Enter a search term above to find movies, TV shows, and collections.</p>
              <div className="search-tips">
                <h4>Search Tips:</h4>
                <ul>
                  <li>Use specific titles for better results</li>
                  <li>Try searching by year (e.g., "Movie 2023")</li>
                  <li>Use filters to narrow down results</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="search-results">
              <div className="results-header">
                <h3>Search Results for "{searchQuery}"</h3>
                <span className="results-count">0 results found</span>
              </div>
              <div className="empty-state">
                <MdSearch size={48} className="empty-icon" />
                <p>No results found. Try adjusting your search terms.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}