# Braidarr Arr Ecosystem Architecture Plan

## Overview
Transform Braidarr into a proper arr ecosystem application following Sonarr/Radarr patterns.

## Authentication Architecture

### Current State
- User registration system with JWT tokens
- API key system exists but requires user authentication
- Web-based login forms

### Target State (Arr-style)
- **No user registration** - single admin setup
- **API key primary authentication** for all API access
- **Optional web authentication** using API key or simple auth
- **First-run setup** to configure initial API key

## Core Arr Components to Implement

### 1. Indexer Management
- Support for multiple indexer types (Usenet, Torrent)
- Indexer configuration and testing
- Search capability across indexers
- Results aggregation and ranking

### 2. Quality Profiles
- Define quality preferences (resolution, codec, etc.)
- Quality upgrading logic
- Custom quality definitions

### 3. Root Folder Management
- Media library root paths
- Folder structure conventions
- Disk space monitoring

### 4. Download Client Integration
- Support for multiple download clients
- Download monitoring and management
- Import processing

### 5. Media Management
- Automated organization
- Renaming and sorting
- Metadata enrichment

## Database Schema Changes

### Remove User-centric Models
- Eliminate user registration dependency
- Simplify to single admin context

### Add Arr-specific Models
```prisma
model Indexer {
  id          String   @id @default(uuid())
  name        String
  type        String   // usenet, torrent
  baseUrl     String
  apiKey      String?
  categories  Json     // Array of category IDs
  priority    Int      @default(25)
  isEnabled   Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model QualityProfile {
  id          String   @id @default(uuid())
  name        String   @unique
  cutoff      Int      // Quality ID for cutoff
  items       Json     // Quality items with allowed/upgradeUntil
  isDefault   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model RootFolder {
  id          String   @id @default(uuid())
  path        String   @unique
  name        String?
  isDefault   Boolean  @default(false)
  freeSpace   BigInt?  // Bytes
  totalSpace  BigInt?  // Bytes
  lastScan    DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model DownloadClient {
  id          String   @id @default(uuid())
  name        String
  type        String   // transmission, qbittorrent, nzbget, sabnzbd
  host        String
  port        Int
  username    String?
  password    String?
  category    String?
  isEnabled   Boolean  @default(true)
  priority    Int      @default(1)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Implementation Steps

1. **Setup branch and remove registration**
   - Remove user registration endpoints
   - Remove registration frontend components
   - Simplify authentication to API key only

2. **Implement arr-style setup**
   - First-run setup page
   - Generate initial API key
   - Basic configuration

3. **Add core arr components**
   - Indexer management
   - Quality profiles
   - Root folders
   - Download clients

4. **Database migrations**
   - Create arr-specific tables
   - Remove user dependency
   - Migrate existing data if needed

5. **Frontend transformation**
   - Remove registration flows
   - Add arr-style configuration pages
   - Implement arr dashboard

## API Design (Arr-compatible)

### Authentication
```
GET  /api/v1/system/status     # System info
POST /api/v1/auth/apikey       # Validate API key
```

### Indexers
```
GET    /api/v1/indexer         # List indexers
POST   /api/v1/indexer         # Add indexer
PUT    /api/v1/indexer/{id}    # Update indexer
DELETE /api/v1/indexer/{id}    # Remove indexer
POST   /api/v1/indexer/{id}/test # Test indexer
```

### Quality Profiles
```
GET    /api/v1/qualityprofile  # List profiles
POST   /api/v1/qualityprofile  # Create profile
PUT    /api/v1/qualityprofile/{id} # Update profile
DELETE /api/v1/qualityprofile/{id} # Delete profile
```

### Root Folders
```
GET    /api/v1/rootfolder      # List root folders
POST   /api/v1/rootfolder      # Add root folder
DELETE /api/v1/rootfolder/{id} # Remove root folder
```

### Download Clients
```
GET    /api/v1/downloadclient  # List clients
POST   /api/v1/downloadclient  # Add client
PUT    /api/v1/downloadclient/{id} # Update client
DELETE /api/v1/downloadclient/{id} # Remove client
POST   /api/v1/downloadclient/{id}/test # Test client
```

## Configuration Management

### First-run Setup
- Generate secure API key
- Set basic configuration
- Configure initial root folder
- Skip user registration entirely

### Settings Structure
```json
{
  "general": {
    "instanceName": "Braidarr",
    "port": 3401,
    "urlBase": "/",
    "logLevel": "info"
  },
  "authentication": {
    "required": true,
    "method": "apikey"
  },
  "media": {
    "defaultQualityProfile": "default",
    "defaultRootFolder": "/media"
  }
}
```

This architecture aligns with arr ecosystem patterns while maintaining Braidarr's AI-powered features.