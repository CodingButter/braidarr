/**
 * Plex API Types
 */

export interface PlexPinRequest {
  strong?: boolean;
}

export interface PlexPinResponse {
  id: number;
  code: string;
  product: string;
  trusted: boolean;
  qr: string;
  clientIdentifier: string;
  location: {
    code: string;
    european_union: boolean;
    continent_code: string;
    country: string;
    city: string;
    time_zone: string;
    postal_code: string;
    in_privacy_restricted_country: boolean;
    subdivisions: string;
    coordinates: string;
  };
  expiresIn: number;
  createdAt: string;
  expiresAt: string;
  authToken: string | null;
  newRegistration: boolean | null;
}

export interface PlexHeaders {
  'X-Plex-Product': string;
  'X-Plex-Version': string;
  'X-Plex-Client-Identifier': string;
  'X-Plex-Platform': string;
  'X-Plex-Platform-Version': string;
  'X-Plex-Device': string;
  'X-Plex-Device-Name': string;
  'X-Plex-Device-Vendor': string;
  'X-Plex-Model': string;
  'Accept': string;
  [key: string]: string;  // Index signature for additional headers
}

export interface PlexUser {
  id: number;
  uuid: string;
  username: string;
  email: string;
  thumb: string;
  authToken: string;
}

export interface PlexServer {
  name: string;
  product: string;
  productVersion: string;
  platform: string;
  platformVersion: string;
  device: string;
  clientIdentifier: string;
  createdAt: string;
  lastSeenAt: string;
  provides: string;
  ownerId: number;
  sourceTitle: string;
  publicAddress: string;
  accessToken: string;
  owned: boolean;
  home: boolean;
  synced: boolean;
  relay: boolean;
  presence: boolean;
  httpsRequired: boolean;
  publicAddressMatches: boolean;
  dnsRebindingProtection: boolean;
  natLoopbackSupported: boolean;
  connections: PlexConnection[];
}

export interface PlexConnection {
  protocol: string;
  address: string;
  port: number;
  uri: string;
  local: boolean;
  relay: boolean;
  IPv6: boolean;
}

export interface PlexLibrary {
  allowSync: boolean;
  art: string;
  composite: string;
  filters: boolean;
  refreshing: boolean;
  thumb: string;
  key: string;
  type: 'movie' | 'show' | 'artist' | 'photo' | 'mixed';
  title: string;
  agent: string;
  scanner: string;
  language: string;
  uuid: string;
  updatedAt: number;
  createdAt: number;
  scannedAt: number;
  content: boolean;
  directory: boolean;
  contentChangedAt: number;
  hidden: number;
  location: PlexLibraryLocation[];
}

export interface PlexLibraryLocation {
  id: number;
  path: string;
}

export interface PlexAuthState {
  pinId: number;
  pinCode: string;
  clientIdentifier: string;
  expiresAt: string;
  qrUrl: string;
}

export interface PlexConfig {
  appName: string;
  appVersion: string;
  platform: string;
  platformVersion: string;
  device: string;
  deviceName: string;
  deviceVendor: string;
  model: string;
  clientIdentifier: string;
}