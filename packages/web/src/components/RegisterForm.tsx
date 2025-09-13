import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './FormStyles.css';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register, error, isLoading, clearError } = useAuthStore();
  
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    
    // Clear validation error for this field
    if (validationErrors[e.target.name]) {
      setValidationErrors({
        ...validationErrors,
        [e.target.name]: '',
      });
    }
    
    if (error) clearError();
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Invalid email address';
    }

    // Username validation
    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      errors.username = 'Username can only contain letters, numbers, hyphens, and underscores';
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const registerData: any = {
        email: formData.email,
        username: formData.username,
        password: formData.password,
      };
      
      if (formData.firstName) {
        registerData.firstName = formData.firstName;
      }
      
      if (formData.lastName) {
        registerData.lastName = formData.lastName;
      }
      
      await register(registerData);
      navigate('/dashboard');
    } catch (error) {
      // Error is handled in the store
      console.error('Registration failed:', error);
    }
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <div className="form-header">
          <h2 className="form-title">
            Create your account
          </h2>
          <p className="form-subtitle">
            Or{' '}
            <Link
              to="/login"
              className="form-link"
            >
              sign in to your existing account
            </Link>
          </p>
        </div>
        
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="firstName" className="form-label">
                First Name
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={formData.firstName}
                onChange={handleChange}
                className="form-input"
                placeholder="John"
                disabled={isLoading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName" className="form-label">
                Last Name
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                autoComplete="family-name"
                value={formData.lastName}
                onChange={handleChange}
                className="form-input"
                placeholder="Doe"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="form-required">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${validationErrors.email ? 'error' : ''}`}
              placeholder="john@example.com"
              disabled={isLoading}
            />
            {validationErrors.email && (
              <p className="form-field-error">{validationErrors.email}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username <span className="form-required">*</span>
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${validationErrors.username ? 'error' : ''}`}
              placeholder="johndoe"
              disabled={isLoading}
            />
            {validationErrors.username && (
              <p className="form-field-error">{validationErrors.username}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password <span className="form-required">*</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${validationErrors.password ? 'error' : ''}`}
              placeholder="Min. 8 characters"
              disabled={isLoading}
            />
            {validationErrors.password && (
              <p className="form-field-error">{validationErrors.password}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password <span className="form-required">*</span>
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`form-input ${validationErrors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter password"
              disabled={isLoading}
            />
            {validationErrors.confirmPassword && (
              <p className="form-field-error">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {error && (
            <div className="form-error">
              <h3 className="form-error-title">
                Registration failed
              </h3>
              <div className="form-error-message">
                <p>{error}</p>
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="form-submit"
            >
              {isLoading ? (
                <span className="form-submit-loading">
                  <div className="form-submit-spinner"></div>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          <div className="form-footer">
            By creating an account, you agree to our{' '}
            <a href="#" className="form-link">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="form-link">
              Privacy Policy
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}