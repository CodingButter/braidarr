export interface AuthenticationSettings {
  enabled: boolean;
  username: string;
  password: string;
  method: AuthenticationMethod;
  sessionTimeout: number;
  requiresAuthentication: boolean;
  formsAuth: boolean;
  basicAuth: boolean;
}

export interface SecuritySettings {
  enableHTTPS: boolean;
  certificatePath: string;
  certificatePassword: string;
  enableCertificateValidation: boolean;
  authenticationRequired: boolean;
}

export interface ApiKeySettings {
  apiKey: string;
  regenerateOnSave: boolean;
  enableApiKeyAuth: boolean;
}

export interface ApplicationSettings {
  applicationName: string;
  port: number;
  logLevel: LogLevel;
  autoUpdate: boolean;
  enableAuthentication: boolean;
  urlBase: string;
  enableSSL: boolean;
  enableProxy: boolean;
  proxySubdirectory: string;
}

export enum AuthenticationMethod {
  FORMS = 'forms',
  BASIC = 'basic',
  EXTERNAL = 'external'
}

export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface Settings {
  application: ApplicationSettings;
  authentication: AuthenticationSettings;
  security: SecuritySettings;
  apiKey: ApiKeySettings;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface SettingsValidation {
  isValid: boolean;
  errors: ValidationError[];
}

export interface SettingsState {
  settings: Settings;
  isLoading: boolean;
  hasChanges: boolean;
  validationErrors: ValidationError[];
  lastSaved: Date | null;
}