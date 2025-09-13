import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import Layout from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import ListsPage from "./pages/ListsPage";
import SourcesPage from "./pages/SourcesPage";
import IntegrationsPage from "./pages/IntegrationsPage";
import ActivityPage from "./pages/ActivityPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { useAuthStore } from "./stores/authStore";

function App() {
  const { isAuthenticated, fetchCsrfToken } = useAuthStore();

  useEffect(() => {
    // Fetch CSRF token on app load if authenticated
    if (isAuthenticated) {
      fetchCsrfToken();
    }
  }, [isAuthenticated, fetchCsrfToken]);

  return (
    <Routes>
      {/* Routes with layout - all now publicly accessible */}
      <Route element={<Layout />}>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lists" element={<ListsPage />} />
        <Route path="/sources" element={<SourcesPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/activity" element={<ActivityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Auth routes accessible from settings or direct navigation */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
    </Routes>
  );
}

export default App;
