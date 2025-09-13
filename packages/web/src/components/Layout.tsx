import { ReactNode } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
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
      <header className="header">
        <nav className="nav">
          <Link to="/" className="logo">
            Braidarr
          </Link>
          <ul className="nav-links">
            <li>
              <Link to="/">Home</Link>
            </li>
            {isAuthenticated && (
              <li>
                <Link to="/dashboard">Dashboard</Link>
              </li>
            )}
          </ul>
          <div className="auth-section">
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
                <Link to="/register" className="register-btn">Sign Up</Link>
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
  );
}
