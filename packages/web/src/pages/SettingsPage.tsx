import { useState, useEffect } from "react";
import { MdSettings, MdSave, MdRestore, MdFileUpload, MdFileDownload } from "react-icons/md";
import { Settings, SettingsState } from "../types/settings";
import { 
  loadSettings, 
  saveSettings, 
  resetSettings, 
  validateSettings,
  exportSettings,
  importSettings
} from "../utils/settingsStorage";
import { GeneralSection } from "../components/settings/GeneralSection";
import { AuthenticationSection } from "../components/settings/AuthenticationSection";
import { SecuritySection } from "../components/settings/SecuritySection";
import { ApiKeysSection } from "../components/settings/ApiKeysSection";
import "./CommonPage.css";

type SettingsSection = 'general' | 'authentication' | 'security' | 'api-keys' | 'media' | 'downloads' | 'indexers' | 'notifications';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>('general');
  const [settingsState, setSettingsState] = useState<SettingsState>({
    settings: loadSettings(),
    isLoading: false,
    hasChanges: false,
    validationErrors: [],
    lastSaved: null
  });
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [showSaveMessage, setShowSaveMessage] = useState(false);

  useEffect(() => {
    const loaded = loadSettings();
    setSettingsState(prev => ({
      ...prev,
      settings: loaded
    }));
  }, []);

  const handleSettingsChange = (newSettings: Partial<Settings>) => {
    const updated = { ...settingsState.settings, ...newSettings };
    const validation = validateSettings(updated);
    
    setSettingsState(prev => ({
      ...prev,
      settings: updated,
      hasChanges: true,
      validationErrors: validation.errors
    }));
  };

  const handleMessage = (message: string, type: 'success' | 'error' | 'info') => {
    setSaveMessage(message);
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleSave = () => {
    const validation = validateSettings(settingsState.settings);
    
    if (!validation.isValid) {
      setSettingsState(prev => ({
        ...prev,
        validationErrors: validation.errors
      }));
      setSaveMessage('Please fix validation errors before saving');
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
      return;
    }

    const success = saveSettings(settingsState.settings);
    
    if (success) {
      setSettingsState(prev => ({
        ...prev,
        hasChanges: false,
        validationErrors: [],
        lastSaved: new Date()
      }));
      setSaveMessage('Settings saved successfully');
    } else {
      setSaveMessage('Failed to save settings');
    }
    
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      const fresh = resetSettings();
      setSettingsState(prev => ({
        ...prev,
        settings: fresh,
        hasChanges: false,
        validationErrors: [],
        lastSaved: new Date()
      }));
      setSaveMessage('Settings reset to defaults');
      setShowSaveMessage(true);
      setTimeout(() => setShowSaveMessage(false), 3000);
    }
  };

  const handleExport = () => {
    exportSettings(settingsState.settings);
    setSaveMessage('Settings exported successfully');
    setShowSaveMessage(true);
    setTimeout(() => setShowSaveMessage(false), 3000);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          const imported = await importSettings(file);
          setSettingsState(prev => ({
            ...prev,
            settings: imported,
            hasChanges: true,
            validationErrors: []
          }));
          setSaveMessage('Settings imported successfully');
        } catch (error) {
          setSaveMessage('Failed to import settings: ' + (error as Error).message);
        }
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);
      }
    };
    input.click();
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'general':
        return (
          <GeneralSection
            settings={settingsState.settings.application}
            validationErrors={settingsState.validationErrors}
            onChange={(applicationSettings) => 
              handleSettingsChange({ application: applicationSettings })
            }
          />
        );
      case 'authentication':
        return (
          <AuthenticationSection
            settings={settingsState.settings.authentication}
            apiKey={settingsState.settings.apiKey.apiKey}
            validationErrors={settingsState.validationErrors}
            onChange={(authenticationSettings) => 
              handleSettingsChange({ authentication: authenticationSettings })
            }
            onApiKeyChange={(apiKey) => 
              handleSettingsChange({ apiKey: { ...settingsState.settings.apiKey, apiKey } })
            }
          />
        );
      case 'security':
        return (
          <SecuritySection
            settings={settingsState.settings.security}
            validationErrors={settingsState.validationErrors}
            onChange={(securitySettings) => 
              handleSettingsChange({ security: securitySettings })
            }
          />
        );
      case 'api-keys':
        return (
          <ApiKeysSection
            onMessage={handleMessage}
          />
        );
      case 'media':
        return (
          <div className="settings-section">
            <h3>Media Management</h3>
            <div className="placeholder-section">
              <p>Media management settings will be implemented here.</p>
            </div>
          </div>
        );
      case 'downloads':
        return (
          <div className="settings-section">
            <h3>Download Clients</h3>
            <div className="placeholder-section">
              <p>Download client configuration will be implemented here.</p>
            </div>
          </div>
        );
      case 'indexers':
        return (
          <div className="settings-section">
            <h3>Indexers</h3>
            <div className="placeholder-section">
              <p>Indexer configuration will be implemented here.</p>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="settings-section">
            <h3>Notifications</h3>
            <div className="placeholder-section">
              <p>Notification settings will be implemented here.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title">
          <MdSettings className="page-icon" size={32} />
          <h1>Settings</h1>
        </div>
        <div className="page-actions">
          {showSaveMessage && (
            <div className={`save-message ${settingsState.validationErrors.length > 0 ? 'error' : 'success'}`}>
              {saveMessage}
            </div>
          )}
          <button className="btn btn-secondary" onClick={handleImport}>
            <MdFileUpload size={20} />
            Import
          </button>
          <button className="btn btn-secondary" onClick={handleExport}>
            <MdFileDownload size={20} />
            Export
          </button>
          <button className="btn btn-secondary" onClick={handleReset}>
            <MdRestore size={20} />
            Reset
          </button>
          <button 
            className={`btn btn-primary ${!settingsState.hasChanges ? 'disabled' : ''}`}
            onClick={handleSave}
            disabled={!settingsState.hasChanges}
          >
            <MdSave size={20} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="settings-container">
          <div className="settings-nav">
            <ul className="settings-menu">
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'general' ? 'active' : ''}`}
                  onClick={() => setActiveSection('general')}
                >
                  General
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'authentication' ? 'active' : ''}`}
                  onClick={() => setActiveSection('authentication')}
                >
                  Authentication
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveSection('security')}
                >
                  Security
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'api-keys' ? 'active' : ''}`}
                  onClick={() => setActiveSection('api-keys')}
                >
                  API Keys
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'media' ? 'active' : ''}`}
                  onClick={() => setActiveSection('media')}
                >
                  Media Management
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'downloads' ? 'active' : ''}`}
                  onClick={() => setActiveSection('downloads')}
                >
                  Download Clients
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'indexers' ? 'active' : ''}`}
                  onClick={() => setActiveSection('indexers')}
                >
                  Indexers
                </button>
              </li>
              <li>
                <button 
                  className={`settings-menu-item ${activeSection === 'notifications' ? 'active' : ''}`}
                  onClick={() => setActiveSection('notifications')}
                >
                  Notifications
                </button>
              </li>
            </ul>
          </div>

          <div className="settings-content">
            {renderActiveSection()}
          </div>
        </div>
      </div>
    </div>
  );
}