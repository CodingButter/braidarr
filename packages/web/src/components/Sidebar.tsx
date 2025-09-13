import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MdDashboard,
  MdList,
  MdSource,
  MdIntegrationInstructions,
  MdHistory,
  MdSettings,
  MdMenu,
  MdClose
} from "react-icons/md";
import "./Sidebar.css";

interface NavigationItem {
  path: string;
  label: string;
  icon: React.ComponentType<any>;
}

const navigationItems: NavigationItem[] = [
  { path: "/dashboard", label: "Dashboard", icon: MdDashboard },
  { path: "/lists", label: "Lists", icon: MdList },
  { path: "/sources", label: "Sources", icon: MdSource },
  { path: "/integrations", label: "Integrations", icon: MdIntegrationInstructions },
  { path: "/activity", label: "Activity", icon: MdHistory },
  { path: "/settings", label: "Settings", icon: MdSettings },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const closeMobile = () => {
    setIsMobileOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/" || location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile menu button */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleMobile}
        aria-label="Toggle navigation menu"
      >
        {isMobileOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
      </button>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div className="mobile-overlay" onClick={closeMobile} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo" onClick={closeMobile}>
            <span className="logo-text">Braidarr</span>
          </Link>
          <button 
            className="collapse-toggle desktop-only"
            onClick={toggleCollapse}
            aria-label="Toggle sidebar"
          >
            <MdMenu size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul className="nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <li key={item.path} className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`nav-link ${active ? 'active' : ''}`}
                    onClick={closeMobile}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="nav-icon" size={20} />
                    <span className="nav-label">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>
    </>
  );
}