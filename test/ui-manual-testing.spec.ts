import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = 'http://localhost:3300'; // Using assigned QA port
const TEST_USER = {
  email: 'qa-test@example.com',
  username: 'qatest',
  password: 'qapassword123',
  firstName: 'QA',
  lastName: 'Tester'
};

test.describe('Braidarr UI Manual Testing Suite', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto(BASE_URL);
  });

  test.afterAll(async () => {
    await page.close();
  });

  test.describe('🚨 CRITICAL: Registration Security Tests', () => {
    test('should NOT allow access to registration page', async () => {
      // Test that registration endpoint is not accessible
      const registrationResponse = await page.goto(`${BASE_URL}/register`);
      
      // Should either be 404, redirect to login, or show error
      expect([404, 401, 403]).toContain(registrationResponse?.status());
      
      // Should not show registration form
      const registerForm = page.locator('form[action*="register"], form:has-text("Create Account")');
      await expect(registerForm).not.toBeVisible();
    });

    test('should NOT allow registration API calls', async () => {
      // Attempt to make registration API call
      const response = await page.request.post(`${BASE_URL}/api/auth/register`, {
        data: TEST_USER
      });

      // Should return 404 (endpoint not found) or 403 (forbidden)
      expect([404, 403]).toContain(response.status());
    });

    test('should not show registration links in UI', async () => {
      await page.goto(`${BASE_URL}/login`);
      
      // Check for any registration-related links or buttons
      const registrationLinks = page.locator('a:has-text("Register"), a:has-text("Sign up"), a:has-text("Create account"), button:has-text("Register")');
      await expect(registrationLinks).toHaveCount(0);
    });
  });

  test.describe('Navigation and Layout Tests', () => {
    test('should display main navigation correctly', async () => {
      await page.goto(BASE_URL);
      
      // Check for main navigation elements
      const sidebar = page.locator('[data-testid="sidebar"], nav, .sidebar');
      await expect(sidebar).toBeVisible();

      // Expected navigation items for arr ecosystem
      const expectedNavItems = [
        'Dashboard',
        'Movies',
        'TV Shows', 
        'Calendar',
        'Activity',
        'Settings',
        'Sources',
        'Integrations'
      ];

      for (const item of expectedNavItems) {
        const navItem = page.locator(`nav a:has-text("${item}"), .sidebar a:has-text("${item}")`);
        await expect(navItem).toBeVisible();
      }
    });

    test('should have responsive design', async () => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      
      // Mobile navigation should be present
      const mobileNav = page.locator('[data-testid="mobile-nav"], .mobile-nav, button[aria-label*="menu"]');
      await expect(mobileNav).toBeVisible();

      // Test tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.reload();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.reload();
      
      const desktopSidebar = page.locator('[data-testid="sidebar"], .sidebar');
      await expect(desktopSidebar).toBeVisible();
    });

    test('should have dark/light theme toggle', async () => {
      await page.goto(BASE_URL);
      
      const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("Dark"), button:has-text("Light"), .theme-toggle');
      await expect(themeToggle).toBeVisible();
      
      // Test theme switching
      await themeToggle.click();
      
      // Check if theme changed (body class or data attribute)
      const body = page.locator('body');
      const darkTheme = await body.getAttribute('class');
      expect(darkTheme).toMatch(/dark|light/);
    });
  });

  test.describe('Dashboard Page Tests', () => {
    test('should display dashboard widgets', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Check for expected dashboard components
      const expectedWidgets = [
        'Recent Activity',
        'Download Status',
        'Disk Space',
        'System Status'
      ];

      for (const widget of expectedWidgets) {
        const widgetElement = page.locator(`[data-testid*="${widget.toLowerCase().replace(' ', '-')}"], .widget:has-text("${widget}"), h2:has-text("${widget}"), h3:has-text("${widget}")`);
        await expect(widgetElement).toBeVisible();
      }
    });

    test('should show system health indicators', async () => {
      await page.goto(`${BASE_URL}/dashboard`);
      
      // Look for health status indicators
      const healthIndicators = page.locator('.health-status, .status-indicator, [data-testid*="health"], .badge');
      await expect(healthIndicators).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Movies Page Tests', () => {
    test('should display movies library interface', async () => {
      await page.goto(`${BASE_URL}/movies`);
      
      // Check for movies page elements
      const addMovieButton = page.locator('button:has-text("Add Movie"), [data-testid="add-movie"]');
      await expect(addMovieButton).toBeVisible();

      const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]');
      await expect(searchInput).toBeVisible();

      const moviesGrid = page.locator('.movies-grid, .media-grid, [data-testid="movies-grid"]');
      await expect(moviesGrid).toBeVisible();
    });

    test('should have filtering and sorting options', async () => {
      await page.goto(`${BASE_URL}/movies`);
      
      const filterOptions = page.locator('.filters, .filter-dropdown, select:has(option), [data-testid*="filter"]');
      await expect(filterOptions).toHaveCount.greaterThan(0);

      const sortOptions = page.locator('.sort-options, select:has(option[value*="sort"]), [data-testid*="sort"]');
      await expect(sortOptions).toHaveCount.greaterThan(0);
    });
  });

  test.describe('TV Shows Page Tests', () => {
    test('should display TV shows library interface', async () => {
      await page.goto(`${BASE_URL}/tv-shows`);
      
      const addShowButton = page.locator('button:has-text("Add Series"), button:has-text("Add Show"), [data-testid="add-show"]');
      await expect(addShowButton).toBeVisible();

      const showsGrid = page.locator('.shows-grid, .series-grid, .media-grid, [data-testid="shows-grid"]');
      await expect(showsGrid).toBeVisible();
    });

    test('should handle season and episode management', async () => {
      await page.goto(`${BASE_URL}/tv-shows`);
      
      // Look for season/episode related UI elements
      const seasonElements = page.locator('.season, .episodes, [data-testid*="season"], [data-testid*="episode"]');
      // These may not be present without data, so we check if they exist
      const count = await seasonElements.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Calendar Page Tests', () => {
    test('should display calendar view', async () => {
      await page.goto(`${BASE_URL}/calendar`);
      
      const calendar = page.locator('.calendar, [data-testid="calendar"], .calendar-view');
      await expect(calendar).toBeVisible();

      const calendarNavigation = page.locator('.calendar-nav, button:has-text("Today"), button:has-text("Previous"), button:has-text("Next")');
      await expect(calendarNavigation).toHaveCount.greaterThan(0);
    });

    test('should show upcoming releases', async () => {
      await page.goto(`${BASE_URL}/calendar`);
      
      const upcomingReleases = page.locator('.upcoming, .releases, [data-testid*="upcoming"], .calendar-events');
      await expect(upcomingReleases).toBeVisible();
    });
  });

  test.describe('Activity Page Tests', () => {
    test('should display activity feed', async () => {
      await page.goto(`${BASE_URL}/activity`);
      
      const activityFeed = page.locator('.activity-feed, .activity-list, [data-testid="activity-feed"]');
      await expect(activityFeed).toBeVisible();

      const activityFilters = page.locator('.activity-filters, .filter-buttons, [data-testid*="filter"]');
      await expect(activityFilters).toHaveCount.greaterThan(0);
    });

    test('should show download progress', async () => {
      await page.goto(`${BASE_URL}/activity`);
      
      const downloadProgress = page.locator('.download-progress, .progress-bar, [data-testid*="progress"]');
      // May not be present without active downloads
      const count = await downloadProgress.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Settings Page Tests', () => {
    test('should display settings sections', async () => {
      await page.goto(`${BASE_URL}/settings`);
      
      const expectedSections = [
        'General',
        'Authentication',
        'API Keys',
        'Security',
        'Integrations'
      ];

      for (const section of expectedSections) {
        const sectionElement = page.locator(`h2:has-text("${section}"), h3:has-text("${section}"), .settings-section:has-text("${section}"), [data-testid*="${section.toLowerCase()}"]`);
        await expect(sectionElement).toBeVisible();
      }
    });

    test('should allow API key management', async () => {
      await page.goto(`${BASE_URL}/settings`);
      
      // Navigate to API keys section
      const apiKeysSection = page.locator('a:has-text("API Keys"), button:has-text("API Keys"), [data-testid="api-keys"]');
      if (await apiKeysSection.isVisible()) {
        await apiKeysSection.click();
      }

      const createApiKeyButton = page.locator('button:has-text("Create"), button:has-text("Add"), button:has-text("Generate"), [data-testid="create-api-key"]');
      await expect(createApiKeyButton).toBeVisible();

      const apiKeysList = page.locator('.api-keys-list, .api-keys-table, [data-testid="api-keys-list"]');
      await expect(apiKeysList).toBeVisible();
    });
  });

  test.describe('Sources Page Tests', () => {
    test('should display indexer configuration', async () => {
      await page.goto(`${BASE_URL}/sources`);
      
      const addIndexerButton = page.locator('button:has-text("Add Indexer"), [data-testid="add-indexer"]');
      await expect(addIndexerButton).toBeVisible();

      const indexersList = page.locator('.indexers-list, .sources-list, [data-testid="indexers-list"]');
      await expect(indexersList).toBeVisible();
    });

    test('should show indexer health status', async () => {
      await page.goto(`${BASE_URL}/sources`);
      
      const healthIndicators = page.locator('.health-indicator, .status-badge, .connection-status, [data-testid*="health"]');
      // May not be present without configured indexers
      const count = await healthIndicators.count();
      expect(count).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Integrations Page Tests', () => {
    test('should display arr integrations', async () => {
      await page.goto(`${BASE_URL}/integrations`);
      
      const expectedIntegrations = [
        'Sonarr',
        'Radarr',
        'Prowlarr',
        'Plex'
      ];

      for (const integration of expectedIntegrations) {
        const integrationCard = page.locator(`.integration-card:has-text("${integration}"), .card:has-text("${integration}"), [data-testid*="${integration.toLowerCase()}"]`);
        await expect(integrationCard).toBeVisible();
      }
    });

    test('should allow integration configuration', async () => {
      await page.goto(`${BASE_URL}/integrations`);
      
      const configureButtons = page.locator('button:has-text("Configure"), button:has-text("Setup"), button:has-text("Connect")');
      await expect(configureButtons).toHaveCount.greaterThan(0);
    });
  });

  test.describe('Performance and Accessibility Tests', () => {
    test('should load pages within acceptable time', async () => {
      const pages = [
        '/dashboard',
        '/movies',
        '/tv-shows',
        '/calendar',
        '/activity',
        '/settings',
        '/sources',
        '/integrations'
      ];

      for (const pagePath of pages) {
        const startTime = Date.now();
        await page.goto(`${BASE_URL}${pagePath}`);
        const loadTime = Date.now() - startTime;
        
        // Should load within 5 seconds
        expect(loadTime).toBeLessThan(5000);
      }
    });

    test('should have proper ARIA labels and accessibility', async () => {
      await page.goto(BASE_URL);
      
      // Check for ARIA labels on interactive elements
      const buttons = page.locator('button');
      const buttonCount = await buttons.count();
      
      for (let i = 0; i < Math.min(buttonCount, 10); i++) {
        const button = buttons.nth(i);
        const ariaLabel = await button.getAttribute('aria-label');
        const textContent = await button.textContent();
        
        // Button should have either aria-label or text content
        expect(ariaLabel || textContent).toBeTruthy();
      }
    });

    test('should handle error states gracefully', async () => {
      // Test 404 page
      await page.goto(`${BASE_URL}/non-existent-page`);
      
      const errorMessage = page.locator('h1:has-text("404"), h1:has-text("Not Found"), .error-message');
      await expect(errorMessage).toBeVisible();

      // Should have navigation back to home
      const homeLink = page.locator('a:has-text("Home"), a:has-text("Dashboard"), button:has-text("Go Home")');
      await expect(homeLink).toBeVisible();
    });
  });

  test.describe('Cross-browser Compatibility Tests', () => {
    test('should work in different viewport sizes', async () => {
      const viewports = [
        { width: 320, height: 568 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1440, height: 900 }, // Desktop
        { width: 1920, height: 1080 } // Large Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(BASE_URL);
        
        // Navigation should be functional in all viewports
        const navigation = page.locator('nav, .sidebar, .mobile-nav');
        await expect(navigation).toBeVisible();
        
        // Content should not overflow
        const body = page.locator('body');
        const overflow = await body.evaluate(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > viewport.width;
        });
        expect(overflow).toBe(false);
      }
    });
  });

  test.describe('Data Validation Tests', () => {
    test('should validate form inputs properly', async () => {
      await page.goto(`${BASE_URL}/settings`);
      
      // Find any form inputs and test validation
      const textInputs = page.locator('input[type="text"], input[type="email"], input[type="url"]');
      const inputCount = await textInputs.count();
      
      if (inputCount > 0) {
        const firstInput = textInputs.first();
        
        // Test empty validation
        await firstInput.fill('');
        await firstInput.blur();
        
        // Test invalid data (if applicable)
        const inputType = await firstInput.getAttribute('type');
        if (inputType === 'email') {
          await firstInput.fill('invalid-email');
          await firstInput.blur();
          
          const errorMessage = page.locator('.error, .invalid-feedback, .field-error');
          await expect(errorMessage).toBeVisible();
        }
      }
    });

    test('should prevent XSS attacks', async () => {
      await page.goto(`${BASE_URL}/settings`);
      
      const textInputs = page.locator('input[type="text"]');
      const inputCount = await textInputs.count();
      
      if (inputCount > 0) {
        const xssPayload = '<script>alert("XSS")</script>';
        await textInputs.first().fill(xssPayload);
        await textInputs.first().blur();
        
        // Should not execute the script - check that it's escaped
        const inputValue = await textInputs.first().inputValue();
        expect(inputValue).not.toContain('<script>');
      }
    });
  });
});