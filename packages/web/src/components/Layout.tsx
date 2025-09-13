import { ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import Sidebar from "./Sidebar";
import ThemeToggle from "./ThemeToggle";
import "./Layout.css";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className="layout-content">
        <header className="header">
          <nav className="nav">
            <div className="nav-spacer"></div>
            <div className="auth-section">
              <ThemeToggle />
              {isAuthenticated ? (
                <div className="user-menu">
                  <span className="user-name">
                    {user?.firstName || user?.username || user?.email}
                  </span>
                  <button 
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="auth-links">
                  <Link to="/login" className="login-link">Login</Link>
                </div>
              )}
            </div>
          </nav>
        </header>
        <main className="main">{children || <Outlet />}</main>
        <footer className="footer">
          <p>&copy; 2025 Braidarr. AI-powered media management.</p>
        </footer>
      </div>
    </div>
  );
}
