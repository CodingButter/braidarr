import { BiCalendarEvent } from "react-icons/bi";
import { MdToday, MdEvent } from "react-icons/md";
import "./CommonPage.css";

export default function CalendarPage() {
  const today = new Date().toLocaleDateString();

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <BiCalendarEvent className="page-icon" size={32} />
          <h1>Calendar</h1>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary">
            <MdToday size={20} />
            Today
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="stats-bar">
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">Today</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">This Week</span>
          </div>
          <div className="stat">
            <span className="stat-value">0</span>
            <span className="stat-label">This Month</span>
          </div>
        </div>

        <div className="content-area">
          <div className="calendar-container">
            <div className="calendar-header">
              <h3>Upcoming Releases</h3>
              <p className="calendar-date">Today: {today}</p>
            </div>
            
            <div className="empty-state">
              <MdEvent size={64} className="empty-icon" />
              <h3>No upcoming releases</h3>
              <p>Your calendar will show upcoming movie releases and TV show episodes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}