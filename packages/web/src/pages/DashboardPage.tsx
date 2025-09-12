import { useAppStore } from "../stores/appStore";
import "./DashboardPage.css";

export default function DashboardPage() {
  const { user, setUser } = useAppStore();

  const handleLogin = () => {
    setUser({
      id: "1",
      name: "Demo User",
      email: "demo@braidarr.com",
    });
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      {user ? (
        <div className="user-section">
          <h2>Welcome back, {user.name}!</h2>
          <p>Email: {user.email}</p>
          <button onClick={handleLogout}>Logout</button>

          <div className="stats-grid">
            <div className="stat-card">
              <h3>Media Items</h3>
              <p className="stat-value">1,234</p>
              <p>Total items in library</p>
            </div>
            <div className="stat-card">
              <h3>Collections</h3>
              <p className="stat-value">56</p>
              <p>Organized collections</p>
            </div>
            <div className="stat-card">
              <h3>Processing</h3>
              <p className="stat-value">3</p>
              <p>Items being processed</p>
            </div>
            <div className="stat-card">
              <h3>Health Score</h3>
              <p className="stat-value">98%</p>
              <p>Library health status</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="login-section">
          <h2>Please Login</h2>
          <p>Login to access your dashboard</p>
          <button onClick={handleLogin}>Login as Demo User</button>
        </div>
      )}
    </div>
  );
}
