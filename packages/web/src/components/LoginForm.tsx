import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './FormStyles.css';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, error, isLoading, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the store
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h2 className="form-title">
            Sign in to your account
          </h2>
          <p className="form-subtitle">
            Welcome to Braidarr
          </p>
        </div>
        
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-input-group">
            <div>
              <label htmlFor="email" className="form-label sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Email address"
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="form-label sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Password"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="form-error">
              <h3 className="form-error-title">
                Login failed
              </h3>
              <div className="form-error-message">
                <p>{error}</p>
              </div>
            </div>
          )}

          <div className="form-actions">
            <div className="form-checkbox-group">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="form-checkbox"
              />
              <label htmlFor="remember-me" className="form-checkbox-label">
                Remember me
              </label>
            </div>

            <div>
              <a href="#" className="form-forgot-link">
                Forgot your password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="form-submit"
            >
              {isLoading ? (
                <span className="form-submit-loading">
                  <div className="form-submit-spinner"></div>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}