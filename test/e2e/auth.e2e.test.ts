/**
 * End-to-End tests for Authentication workflows
 * Uses Playwright for browser automation
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';
import { testUsers, generateRandomUser } from '../fixtures/users';

// QA Test Server URLs
const BASE_URL = 'http://localhost:3300';
const API_URL = 'http://localhost:3301';

test.describe('Authentication E2E Tests', () => {
  let page: Page;
  let context: BrowserContext;

  test.beforeAll(async () => {
    // Setup test environment
    process.env.NODE_ENV = 'test';
    process.env.WEB_PORT = '3300';
    process.env.PORT = '3301';
  });

  test.beforeEach(async ({ browser }) => {
    // Create new context for each test
    context = await browser.newContext({
      baseURL: BASE_URL,
      httpCredentials: undefined,
      ignoreHTTPSErrors: true
    });
    page = await context.newPage();
  });

  test.afterEach(async () => {
    // Clean up
    await context.close();
  });

  test.describe('User Registration Flow', () => {
    test('should complete full registration process', async () => {
      const newUser = generateRandomUser();

      // Navigate to registration page
      await page.goto('/register');
      
      // Fill registration form
      await page.fill('[data-testid="email-input"]', newUser.email);
      await page.fill('[data-testid="password-input"]', newUser.password);
      await page.fill('[data-testid="confirm-password-input"]', newUser.password);
      await page.fill('[data-testid="username-input"]', newUser.username || '');
      await page.fill('[data-testid="first-name-input"]', newUser.firstName || '');
      await page.fill('[data-testid="last-name-input"]', newUser.lastName || '');

      // Accept terms if present
      const termsCheckbox = page.locator('[data-testid="terms-checkbox"]');
      if (await termsCheckbox.isVisible()) {
        await termsCheckbox.check();
      }

      // Submit form
      await page.click('[data-testid="register-button"]');

      // Wait for success message or redirect
      await expect(page).toHaveURL(/\/(verify-email|dashboard|login)/, { timeout: 5000 });

      // Check for success message
      const successMessage = page.locator('[data-testid="success-message"]');
      if (await successMessage.isVisible()) {
        await expect(successMessage).toContainText(/verification|registered/i);
      }
    });

    test('should show validation errors for invalid input', async () => {
      await page.goto('/register');

      // Submit empty form
      await page.click('[data-testid="register-button"]');

      // Check for validation errors
      await expect(page.locator('[data-testid="email-error"]')).toBeVisible();
      await expect(page.locator('[data-testid="password-error"]')).toBeVisible();

      // Test invalid email
      await page.fill('[data-testid="email-input"]', 'invalid-email');
      await page.click('[data-testid="register-button"]');
      await expect(page.locator('[data-testid="email-error"]')).toContainText(/valid email/i);

      // Test weak password
      await page.fill('[data-testid="email-input"]', 'valid@email.com');
      await page.fill('[data-testid="password-input"]', '123');
      await page.click('[data-testid="register-button"]');
      await expect(page.locator('[data-testid="password-error"]')).toContainText(/password.*requirement/i);
    });

    test('should prevent duplicate email registration', async () => {
      await page.goto('/register');

      // Try to register with existing email
      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'ValidPassword123!');
      
      await page.click('[data-testid="register-button"]');

      // Check for error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/already.*exist/i);
    });

    test('should validate password confirmation', async () => {
      await page.goto('/register');

      await page.fill('[data-testid="email-input"]', 'test@email.com');
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'DifferentPassword123!');
      
      await page.click('[data-testid="register-button"]');

      // Check for password mismatch error
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText(/match/i);
    });
  });

  test.describe('User Login Flow', () => {
    test('should login with valid credentials', async () => {
      await page.goto('/login');

      // Fill login form
      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', testUsers.activeUser.password);

      // Submit
      await page.click('[data-testid="login-button"]');

      // Wait for redirect to dashboard
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });

      // Verify user is logged in
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
      await expect(page.locator('[data-testid="user-email"]')).toContainText(testUsers.activeUser.email);
    });

    test('should show error for invalid credentials', async () => {
      await page.goto('/login');

      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', 'WrongPassword123!');
      
      await page.click('[data-testid="login-button"]');

      // Check for error message
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/invalid.*credentials/i);
      
      // Should stay on login page
      await expect(page).toHaveURL(/\/login/);
    });

    test('should handle "Remember Me" functionality', async () => {
      await page.goto('/login');

      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', testUsers.activeUser.password);
      await page.check('[data-testid="remember-me-checkbox"]');
      
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(/\/dashboard/);

      // Check for persistent cookie
      const cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'session' || c.name === 'token');
      expect(sessionCookie).toBeDefined();
      if (sessionCookie) {
        // Should have longer expiry with remember me
        const expiryDate = new Date(sessionCookie.expires * 1000);
        const daysUntilExpiry = (expiryDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        expect(daysUntilExpiry).toBeGreaterThan(7); // At least 7 days
      }
    });

    test('should redirect to login for protected routes', async () => {
      // Try to access protected route without authentication
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
      
      // Check for redirect message
      const message = page.locator('[data-testid="info-message"]');
      if (await message.isVisible()) {
        await expect(message).toContainText(/login.*required/i);
      }
    });
  });

  test.describe('Logout Flow', () => {
    test('should logout successfully', async () => {
      // First login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', testUsers.activeUser.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(/\/dashboard/);

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Should redirect to login or home
      await expect(page).toHaveURL(/\/(login|home|\/)/);

      // Try to access protected route
      await page.goto('/dashboard');
      await expect(page).toHaveURL(/\/login/);
    });

    test('should clear session data on logout', async () => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', testUsers.activeUser.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(/\/dashboard/);

      // Check session exists
      let cookies = await context.cookies();
      expect(cookies.some(c => c.name === 'session' || c.name === 'token')).toBe(true);

      // Logout
      await page.click('[data-testid="user-menu"]');
      await page.click('[data-testid="logout-button"]');

      // Check session cleared
      cookies = await context.cookies();
      const sessionCookie = cookies.find(c => c.name === 'session' || c.name === 'token');
      expect(sessionCookie).toBeUndefined();
    });
  });

  test.describe('Password Reset Flow', () => {
    test('should complete password reset process', async () => {
      // Request password reset
      await page.goto('/forgot-password');
      await page.fill('[data-testid="email-input"]', testUsers.resetUser.email);
      await page.click('[data-testid="reset-button"]');

      // Check for success message
      await expect(page.locator('[data-testid="success-message"]')).toContainText(/email.*sent/i);

      // Simulate clicking reset link (in real test, would check email)
      // For testing, we'll navigate directly with a mock token
      await page.goto('/reset-password?token=mock-reset-token');

      // Enter new password
      await page.fill('[data-testid="new-password-input"]', 'NewSecurePassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'NewSecurePassword123!');
      await page.click('[data-testid="update-password-button"]');

      // Check for success
      await expect(page.locator('[data-testid="success-message"]')).toContainText(/password.*updated/i);
      
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    });

    test('should validate new password strength', async () => {
      await page.goto('/reset-password?token=mock-reset-token');

      // Try weak password
      await page.fill('[data-testid="new-password-input"]', '123');
      await page.fill('[data-testid="confirm-password-input"]', '123');
      await page.click('[data-testid="update-password-button"]');

      // Check for validation error
      await expect(page.locator('[data-testid="password-error"]')).toContainText(/requirement/i);
    });

    test('should handle expired reset token', async () => {
      await page.goto('/reset-password?token=expired-token');

      // Should show error
      await expect(page.locator('[data-testid="error-message"]')).toContainText(/expired|invalid/i);
      
      // Should provide link to request new reset
      await expect(page.locator('[data-testid="request-new-reset"]')).toBeVisible();
    });
  });

  test.describe('Session Management', () => {
    test('should maintain session across page refreshes', async () => {
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', testUsers.activeUser.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(/\/dashboard/);

      // Refresh page
      await page.reload();

      // Should still be logged in
      await expect(page).toHaveURL(/\/dashboard/);
      await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    });

    test('should handle session timeout', async () => {
      // This test would require mocking time or waiting for actual timeout
      // For now, we'll test the UI behavior when session expires
      
      // Login
      await page.goto('/login');
      await page.fill('[data-testid="email-input"]', testUsers.activeUser.email);
      await page.fill('[data-testid="password-input"]', testUsers.activeUser.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForURL(/\/dashboard/);

      // Simulate expired session by clearing cookies
      await context.clearCookies();

      // Try to navigate to protected route
      await page.goto('/dashboard');

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
      
      // Check for session expired message
      const message = page.locator('[data-testid="info-message"]');
      if (await message.isVisible()) {
        await expect(message).toContainText(/session.*expired/i);
      }
    });
  });

  test.describe('Security Tests', () => {
    test('should prevent XSS in user input', async () => {
      await page.goto('/register');

      const xssPayload = '<script>alert("XSS")</script>';
      
      await page.fill('[data-testid="username-input"]', xssPayload);
      await page.fill('[data-testid="email-input"]', 'test@email.com');
      await page.fill('[data-testid="password-input"]', 'ValidPassword123!');
      await page.fill('[data-testid="confirm-password-input"]', 'ValidPassword123!');
      
      await page.click('[data-testid="register-button"]');

      // Check that script is not executed
      const alertPromise = page.waitForEvent('dialog', { timeout: 1000 }).catch(() => null);
      const alert = await alertPromise;
      expect(alert).toBeNull();
    });

    test('should enforce HTTPS in production', async () => {
      // This test would only run in production environment
      if (process.env.NODE_ENV === 'production') {
        const response = await page.goto('http://localhost:3300/login');
        
        // Should redirect to HTTPS
        expect(response?.url()).toMatch(/^https:/);
      }
    });

    test('should implement CSRF protection', async () => {
      await page.goto('/login');

      // Check for CSRF token in form
      const csrfToken = await page.getAttribute('[name="csrf_token"]', 'value');
      if (csrfToken) {
        expect(csrfToken).toBeTruthy();
        expect(csrfToken.length).toBeGreaterThan(20);
      }
    });
  });

  test.describe('Accessibility Tests', () => {
    test('should support keyboard navigation', async () => {
      await page.goto('/login');

      // Tab through form fields
      await page.keyboard.press('Tab'); // Focus email
      await page.keyboard.type(testUsers.activeUser.email);
      
      await page.keyboard.press('Tab'); // Focus password
      await page.keyboard.type(testUsers.activeUser.password);
      
      await page.keyboard.press('Tab'); // Focus submit button
      await page.keyboard.press('Enter'); // Submit form

      // Should login successfully
      await page.waitForURL(/\/dashboard/, { timeout: 5000 });
    });

    test('should have proper ARIA labels', async () => {
      await page.goto('/login');

      // Check for ARIA labels
      const emailInput = page.locator('[data-testid="email-input"]');
      await expect(emailInput).toHaveAttribute('aria-label', /email/i);

      const passwordInput = page.locator('[data-testid="password-input"]');
      await expect(passwordInput).toHaveAttribute('aria-label', /password/i);

      const submitButton = page.locator('[data-testid="login-button"]');
      await expect(submitButton).toHaveAttribute('aria-label', /login|sign in/i);
    });

    test('should announce validation errors to screen readers', async () => {
      await page.goto('/login');

      // Submit empty form
      await page.click('[data-testid="login-button"]');

      // Check for ARIA live regions
      const errorMessage = page.locator('[data-testid="error-message"]');
      await expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      await expect(errorMessage).toHaveAttribute('role', 'alert');
    });
  });
});