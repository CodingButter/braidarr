# Braidarr Arr Ecosystem Integrations

This document describes the comprehensive integration system that connects Braidarr to the *arr ecosystem (Sonarr, Radarr, Prowlarr, etc.) and download clients.

## Overview

The integration system provides seamless connectivity between Braidarr and popular media management applications, enabling automated media requests, downloads, and management through a unified interface.

## Supported Applications

### Arr Applications
- **Sonarr** - TV series management
- **Radarr** - Movie management  
- **Prowlarr** - Indexer management
- **Lidarr** - Music management (planned)
- **Readarr** - Book management (planned)
- **Whisparr** - Adult content management (planned)

### Download Clients
- **qBittorrent** - BitTorrent client
- **Transmission** - BitTorrent client (planned)
- **Deluge** - BitTorrent client (planned)
- **SABnzbd** - Usenet client (planned)
- **NZBGet** - Usenet client (planned)

## Architecture

### Core Components

1. **Client Libraries** (`/src/integrations/arr/`)
   - Individual client implementations for each arr application
   - Standardized API interfaces with comprehensive error handling
   - Automatic retry logic with exponential backoff
   - Connection testing and health monitoring

2. **Download Client Integration** (`/src/integrations/download-clients/`)
   - Support for multiple torrent and usenet clients
   - Unified interface for torrent management
   - Real-time status monitoring and statistics

3. **Webhook System** (`/src/routes/arr/webhooks.routes.ts`)
   - Receives notifications from arr applications
   - Processes events for download completion, upgrades, health issues
   - Triggers AI analysis and user notifications

4. **Configuration Management** (`/src/routes/arr/integrations.routes.ts`)
   - CRUD operations for arr instances and download clients
   - Connection testing and validation
   - Encrypted credential storage

5. **Service Layer** (`/src/services/arr-integration.service.ts`)
   - High-level operations and orchestration
   - Cross-application media search and management
   - Centralized client management

### Database Schema

The integration system extends the database with comprehensive models:

- `ArrInstance` - Configuration for arr applications
- `QualityProfile` - Quality settings from arr apps
- `DownloadClient` - Download client configurations
- `Indexer` - Indexer configurations from Prowlarr
- `WebhookEvent` - Webhook event processing
- `MediaRequest` - User media requests and status

## API Endpoints

### Arr Instance Management
```
GET    /api/v1/arr/integrations/instances          # List all instances
POST   /api/v1/arr/integrations/instances          # Create new instance
GET    /api/v1/arr/integrations/instances/:id      # Get instance details
PUT    /api/v1/arr/integrations/instances/:id      # Update instance
DELETE /api/v1/arr/integrations/instances/:id      # Delete instance
POST   /api/v1/arr/integrations/instances/:id/test # Test connection
```

### Download Client Management
```
GET    /api/v1/arr/integrations/download-clients          # List clients
POST   /api/v1/arr/integrations/download-clients          # Create client
POST   /api/v1/arr/integrations/download-clients/:id/test # Test connection
```

### Webhook Endpoints
```
POST   /api/v1/arr/webhooks/sonarr    # Sonarr notifications
POST   /api/v1/arr/webhooks/radarr    # Radarr notifications
POST   /api/v1/arr/webhooks/prowlarr  # Prowlarr notifications
POST   /api/v1/arr/webhooks/generic   # Generic arr notifications
POST   /api/v1/arr/webhooks/test      # Test webhook endpoint
```

## Setup Guide

### 1. Configure Arr Applications

Each arr application needs to be configured in Braidarr:

```json
{
  "name": "My Sonarr",
  "type": "SONARR",
  "baseUrl": "http://localhost:8989",
  "apiKey": "your-api-key-here",
  "isEnabled": true,
  "settings": {
    "defaultQualityProfile": 1,
    "defaultRootFolder": "/tv"
  }
}
```

### 2. Configure Download Clients

Add download clients for automatic torrent management:

```json
{
  "name": "qBittorrent",
  "type": "QBITTORRENT", 
  "host": "localhost",
  "port": 8080,
  "username": "admin",
  "password": "password",
  "category": "braidarr",
  "priority": 1,
  "isEnabled": true
}
```

### 3. Setup Webhooks

Configure webhooks in your arr applications to notify Braidarr:

**Sonarr Webhook URL:**
```
http://braidarr-host:3401/api/v1/arr/webhooks/sonarr
```

**Radarr Webhook URL:**
```
http://braidarr-host:3401/api/v1/arr/webhooks/radarr
```

## Usage Examples

### Search for Media
```typescript
import { ArrIntegrationService } from './services/arr-integration.service.js';

const service = new ArrIntegrationService();

// Search across all configured arr instances
const results = await service.searchMedia({
  query: 'Breaking Bad',
  type: 'tv'
});

console.log(`Found ${results.series.length} TV series`);
```

### Add Series to Sonarr
```typescript
const series = await service.addSeries('sonarr-instance-id', {
  tvdbId: 81189,
  title: 'Breaking Bad',
  titleSlug: 'breaking-bad',
  qualityProfileId: 1,
  rootFolderPath: '/tv',
  monitored: true,
  searchOnAdd: true
});
```

### Monitor Download Progress
```typescript
const torrents = await service.getTorrents('qbittorrent-client-id');

for (const torrent of torrents) {
  console.log(`${torrent.name}: ${(torrent.progress * 100).toFixed(1)}%`);
}
```

## Error Handling

The integration system includes comprehensive error handling:

- **Connection Errors**: Automatic retry with exponential backoff
- **Authentication Errors**: Clear error messages and credential validation
- **Rate Limiting**: Respect for arr application rate limits
- **Network Issues**: Graceful degradation and status reporting

## Security

- **API Key Encryption**: All API keys are encrypted in the database
- **Input Validation**: Comprehensive validation using Zod schemas
- **CSRF Protection**: All endpoints protected against CSRF attacks
- **Rate Limiting**: Prevents abuse and ensures system stability

## Monitoring and Health Checks

### Connection Monitoring
- Regular health checks for all configured instances
- Automatic reconnection on network issues
- Status reporting in the admin interface

### Webhook Processing
- Event logging and processing status
- Retry mechanism for failed webhook processing
- Metrics on webhook processing performance

## Testing

Comprehensive test suite covers:

- Unit tests for all client libraries
- Integration tests for arr applications
- Mock servers for testing without real arr instances
- Webhook payload validation and processing

Run tests:
```bash
npm run test
```

## Configuration Examples

### Complete Sonarr Configuration
```json
{
  "name": "Sonarr Main",
  "type": "SONARR",
  "baseUrl": "http://sonarr.local:8989",
  "apiKey": "abcdef1234567890abcdef1234567890",
  "isEnabled": true,
  "settings": {
    "defaultQualityProfile": 1,
    "defaultLanguageProfile": 1,
    "defaultRootFolder": "/data/tv",
    "seasonFolders": true,
    "useSceneNumbering": false,
    "monitorNewSeasons": true
  }
}
```

### Complete qBittorrent Configuration
```json
{
  "name": "qBittorrent Main",
  "type": "QBITTORRENT",
  "host": "192.168.1.100",
  "port": 8080,
  "username": "admin",
  "password": "strongpassword123",
  "category": "braidarr-downloads",
  "priority": 1,
  "isEnabled": true,
  "settings": {
    "useSsl": false,
    "urlBase": "",
    "defaultSavePath": "/data/downloads",
    "removeCompletedDownloads": false,
    "removeFailedDownloads": true
  }
}
```

## Troubleshooting

### Common Issues

1. **Connection Failed**
   - Verify arr application is running and accessible
   - Check API key is valid and has proper permissions
   - Ensure firewall allows connections

2. **Webhook Not Received**
   - Verify webhook URL is correctly configured in arr app
   - Check Braidarr server is accessible from arr application
   - Review webhook logs in arr application

3. **Downloads Not Starting**
   - Verify download client is configured and running
   - Check download client credentials and permissions
   - Ensure sufficient disk space available

### Debug Mode

Enable debug logging for detailed troubleshooting:

```bash
NODE_ENV=development DEBUG=braidarr:arr npm start
```

## Future Enhancements

- **Custom Scripts**: Support for custom post-processing scripts
- **Notification Integration**: Discord, Telegram, email notifications
- **Advanced Filtering**: Custom quality and release filtering
- **Statistics Dashboard**: Comprehensive download and media statistics
- **Multi-Instance Support**: Load balancing across multiple arr instances

## Contributing

When contributing to the arr integration system:

1. Follow the established patterns for client implementations
2. Include comprehensive error handling and logging
3. Add tests for all new functionality
4. Update documentation for new features
5. Ensure proper TypeScript typing

For detailed development guidelines, see the main CONTRIBUTING.md file.