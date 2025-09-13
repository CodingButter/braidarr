# Authentication Settings Implementation

This document describes the comprehensive authentication settings system implemented for Braidarr, following the *arr application pattern (Sonarr, Radarr, Prowlarr).

## Overview

The authentication settings system provides a complete interface for configuring authentication, security, and API access controls in Braidarr. It includes multiple settings sections accessible from the main Settings page.

## Features Implemented

### 1. Settings Navigation
- **Location**: `/settings` page with tabbed navigation
- **Sections**:
  - General (application configuration)
  - Authentication (user authentication settings)
  - Security (SSL/TLS and security options)
  - Media Management (placeholder)
  - Download Clients (placeholder)
  - Indexers (placeholder)
  - Notifications (placeholder)

### 2. Authentication Section
- **Enable/Disable Authentication**: Toggle for requiring authentication
- **Authentication Methods**:
  - Forms Authentication (web-based login)
  - Basic Authentication (HTTP Basic Auth)
  - External Authentication (for future integration)
- **User Credentials**:
  - Username/password configuration
  - Password visibility toggle
  - Form validation with error display
- **Session Management**:
  - Configurable session timeout (1-10080 minutes)
- **API Key Management**:
  - Auto-generated 32-character API key
  - Copy to clipboard functionality
  - Regenerate API key option
  - Show/hide API key toggle

### 3. Security Section
- **HTTPS Configuration**:
  - Enable HTTPS toggle
  - SSL certificate path selection
  - Certificate password (with visibility toggle)
  - Certificate validation options
- **Security Headers**: Automatic security headers
- **Access Control**: Authentication requirement settings
- **Security Best Practices**: Built-in guidance

### 4. General Section
- **Application Settings**:
  - Application name customization
  - Port configuration (1-65535)
  - URL base for reverse proxy setups
  - Log level selection (Trace to Fatal)
  - Auto-update toggle
- **SSL/Proxy Support**:
  - SSL enablement
  - Reverse proxy support
  - Proxy subdirectory configuration
- **Application Information**: Version, build date, platform

## Implementation Details

### File Structure
```
packages/web/src/
├── types/
│   └── settings.ts                    # TypeScript interfaces
├── utils/
│   └── settingsStorage.ts            # localStorage management
├── components/settings/
│   ├── index.ts                      # Component exports
│   ├── GeneralSection.tsx            # General settings
│   ├── AuthenticationSection.tsx     # Authentication settings
│   └── SecuritySection.tsx           # Security settings
└── pages/
    ├── SettingsPage.tsx              # Main settings page
    └── CommonPage.css                # Enhanced styling
```

### Key Components

#### 1. Settings Storage (`settingsStorage.ts`)
- **localStorage Integration**: Persistent settings storage
- **Default Configuration**: Sensible defaults following *arr patterns
- **Validation System**: Comprehensive form validation
- **Import/Export**: JSON settings backup/restore
- **API Key Generation**: Secure random key generation

#### 2. Type System (`settings.ts`)
- **Strong Typing**: Complete TypeScript interfaces
- **Enums**: Authentication methods, log levels
- **Validation**: Error handling and validation types
- **State Management**: Settings state interface

#### 3. UI Components
- **Responsive Design**: Mobile-friendly layouts
- ***arr Styling**: Consistent with Sonarr/Radarr aesthetics
- **Form Validation**: Real-time error display
- **Interactive Elements**: Toggle switches, password visibility
- **Help Text**: Contextual guidance for each setting

### Settings Schema

#### Authentication Settings
```typescript
interface AuthenticationSettings {
  enabled: boolean;
  username: string;
  password: string;
  method: AuthenticationMethod;
  sessionTimeout: number;
  requiresAuthentication: boolean;
  formsAuth: boolean;
  basicAuth: boolean;
}
```

#### Security Settings
```typescript
interface SecuritySettings {
  enableHTTPS: boolean;
  certificatePath: string;
  certificatePassword: string;
  enableCertificateValidation: boolean;
  authenticationRequired: boolean;
}
```

#### API Key Settings
```typescript
interface ApiKeySettings {
  apiKey: string;
  regenerateOnSave: boolean;
  enableApiKeyAuth: boolean;
}
```

## Usage

### Accessing Settings
1. Navigate to `/settings` in the application
2. Use the sidebar navigation to switch between sections
3. Configure desired settings in each section
4. Click "Save Changes" to persist settings

### Authentication Setup
1. Go to Authentication section
2. Enable "Enable Authentication" toggle
3. Choose authentication method (Forms recommended)
4. Set username and password
5. Configure session timeout as needed
6. Copy API key for external applications
7. Save changes

### Security Configuration
1. Navigate to Security section
2. Enable HTTPS if desired
3. Provide SSL certificate path and password
4. Configure additional security options
5. Save changes

## Validation Rules

### Authentication
- Username: Minimum 3 characters when authentication enabled
- Password: Minimum 6 characters when authentication enabled
- Session Timeout: 1-10080 minutes (1 week maximum)

### General Settings
- Application Name: Required, non-empty
- Port: Valid range 1-65535
- SSL Certificate: Required path when HTTPS enabled

### Security
- Certificate Path: Required when HTTPS enabled
- All other settings have sensible defaults

## Storage Format

Settings are stored in localStorage as JSON:
```json
{
  "application": { /* ApplicationSettings */ },
  "authentication": { /* AuthenticationSettings */ },
  "security": { /* SecuritySettings */ },
  "apiKey": { /* ApiKeySettings */ }
}
```

## Styling

The implementation uses CSS classes that follow the existing *arr pattern:
- Consistent color scheme with CSS variables
- Responsive grid layouts
- Proper form styling with validation states
- Mobile-optimized responsive design
- Accessibility considerations

## Future Enhancements

The system is designed for extensibility:
- Additional authentication providers (OAuth, LDAP)
- Advanced security options
- Audit logging for settings changes
- Role-based access control
- Settings versioning and rollback

## Integration Notes

This authentication settings system integrates with:
- **Frontend**: React components with TypeScript
- **Storage**: Browser localStorage (future: backend API)
- **Styling**: Existing CSS framework and variables
- **Validation**: Client-side validation with error handling

The implementation follows modern React patterns with hooks and functional components, ensuring maintainability and performance.