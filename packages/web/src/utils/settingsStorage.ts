import { Settings, AuthenticationMethod, LogLevel, ValidationError, SettingsValidation } from '../types/settings';

const SETTINGS_STORAGE_KEY = 'braidarr_settings';

// Default settings following *arr application patterns
export const defaultSettings: Settings = {
  application: {
    applicationName: 'Braidarr',
    port: 3100,
    logLevel: LogLevel.INFO,
    autoUpdate: true,
    enableAuthentication: false,
    urlBase: '',
    enableSSL: false,
    enableProxy: false,
    proxySubdirectory: ''
  },
  authentication: {
    enabled: false,
    username: '',
    password: '',
    method: AuthenticationMethod.FORMS,
    sessionTimeout: 120, // 2 hours in minutes
    requiresAuthentication: false,
    formsAuth: true,
    basicAuth: false
  },
  security: {
    enableHTTPS: false,
    certificatePath: '',
    certificatePassword: '',
    enableCertificateValidation: true,
    authenticationRequired: false
  },
  apiKey: {
    apiKey: generateApiKey(),
    regenerateOnSave: false,
    enableApiKeyAuth: true
  }
};

// Generate a random API key
function generateApiKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Load settings from localStorage
export function loadSettings(): Settings {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to ensure all properties exist
      return mergeWithDefaults(parsed);
    }
  } catch (error) {
    console.error('Failed to load settings:', error);
  }
  return { ...defaultSettings };
}

// Save settings to localStorage
export function saveSettings(settings: Settings): boolean {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
}

// Merge loaded settings with defaults to handle missing properties
function mergeWithDefaults(loaded: any): Settings {
  return {
    application: { ...defaultSettings.application, ...loaded.application },
    authentication: { ...defaultSettings.authentication, ...loaded.authentication },
    security: { ...defaultSettings.security, ...loaded.security },
    apiKey: { ...defaultSettings.apiKey, ...loaded.apiKey }
  };
}

// Reset settings to defaults
export function resetSettings(): Settings {
  const fresh = { ...defaultSettings };
  fresh.apiKey.apiKey = generateApiKey(); // Generate new API key
  saveSettings(fresh);
  return fresh;
}

// Validate settings
export function validateSettings(settings: Settings): SettingsValidation {
  const errors: ValidationError[] = [];

  // Validate application settings
  if (!settings.application.applicationName.trim()) {
    errors.push({ field: 'applicationName', message: 'Application name is required' });
  }

  if (settings.application.port < 1 || settings.application.port > 65535) {
    errors.push({ field: 'port', message: 'Port must be between 1 and 65535' });
  }

  // Validate authentication settings
  if (settings.authentication.enabled) {
    if (!settings.authentication.username.trim()) {
      errors.push({ field: 'username', message: 'Username is required when authentication is enabled' });
    } else if (settings.authentication.username.length < 3) {
      errors.push({ field: 'username', message: 'Username must be at least 3 characters long' });
    }

    if (!settings.authentication.password) {
      errors.push({ field: 'password', message: 'Password is required when authentication is enabled' });
    } else if (settings.authentication.password.length < 6) {
      errors.push({ field: 'password', message: 'Password must be at least 6 characters long' });
    }

    if (settings.authentication.sessionTimeout < 1) {
      errors.push({ field: 'sessionTimeout', message: 'Session timeout must be at least 1 minute' });
    }
  }

  // Validate security settings
  if (settings.security.enableHTTPS && !settings.security.certificatePath.trim()) {
    errors.push({ field: 'certificatePath', message: 'Certificate path is required when HTTPS is enabled' });
  }

  // Validate API key
  if (settings.apiKey.enableApiKeyAuth && !settings.apiKey.apiKey.trim()) {
    errors.push({ field: 'apiKey', message: 'API key cannot be empty' });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Generate new API key
export function regenerateApiKey(): string {
  return generateApiKey();
}

// Export settings to JSON file
export function exportSettings(settings: Settings): void {
  const dataStr = JSON.stringify(settings, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'braidarr-settings.json';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import settings from JSON file
export function importSettings(file: File): Promise<Settings> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result as string;
        const parsed = JSON.parse(result);
        const merged = mergeWithDefaults(parsed);
        resolve(merged);
      } catch (error) {
        reject(new Error('Invalid settings file format'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}