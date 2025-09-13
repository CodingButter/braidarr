import React, { useState, useEffect } from 'react';
import { 
  MdAdd, 
  MdEdit, 
  MdDelete, 
  MdDragIndicator,
  MdCheckCircle,
  MdCancel,
  MdInfo,
  MdWarning,
  MdArrowUpward,
  MdArrowDownward,
  MdContentCopy
} from 'react-icons/md';

// Types
interface QualityDefinition {
  id: string;
  name: string;
  title: string;
  resolution?: string;
  source?: string;
  modifier?: string;
  minSize?: number; // in MB
  maxSize?: number; // in MB
  preferred?: boolean;
}

interface QualityProfileItem {
  quality: QualityDefinition;
  allowed: boolean;
}

interface QualityProfile {
  id: string;
  name: string;
  upgradeAllowed: boolean;
  cutoff: string; // quality ID
  items: QualityProfileItem[];
  language?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface QualityProfilesSectionProps {
  onMessage: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function QualityProfilesSection({ onMessage }: QualityProfilesSectionProps) {
  const [profiles, setProfiles] = useState<QualityProfile[]>([]);
  const [qualities, setQualities] = useState<QualityDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProfile, setEditingProfile] = useState<QualityProfile | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    upgradeAllowed: boolean;
    cutoff: string;
    items: QualityProfileItem[];
    language: string;
  }>({
    name: '',
    upgradeAllowed: true,
    cutoff: '',
    items: [],
    language: 'en',
  });

  // Load data on component mount
  useEffect(() => {
    loadProfiles();
    loadQualities();
  }, []);

  const loadProfiles = async () => {
    try {
      const response = await fetch('/api/v1/quality-profiles', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfiles(data.profiles);
      } else {
        onMessage('Failed to load quality profiles', 'error');
      }
    } catch (error) {
      onMessage('Error loading quality profiles: ' + (error as Error).message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadQualities = async () => {
    try {
      const response = await fetch('/api/v1/quality-definitions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setQualities(data.qualities);
      }
    } catch (error) {
      console.error('Error loading qualities:', error);
    }
  };

  const handleCreateProfile = async () => {
    try {
      const response = await fetch('/api/v1/quality-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        onMessage('Quality profile created successfully', 'success');
        resetForm();
        setShowCreateForm(false);
        loadProfiles();
      } else {
        const error = await response.json();
        onMessage('Failed to create quality profile: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error creating quality profile: ' + (error as Error).message, 'error');
    }
  };

  const handleUpdateProfile = async (id: string, updates: Partial<QualityProfile>) => {
    try {
      const response = await fetch(`/api/v1/quality-profiles/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(updates),
      });
      
      if (response.ok) {
        onMessage('Quality profile updated successfully', 'success');
        setEditingProfile(null);
        loadProfiles();
      } else {
        const error = await response.json();
        onMessage('Failed to update quality profile: ' + error.message, 'error');
      }
    } catch (error) {
      onMessage('Error updating quality profile: ' + (error as Error).message, 'error');
    }
  };

  const handleDeleteProfile = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the quality profile "${name}"? This action cannot be undone.`)) {
      try {
        const response = await fetch(`/api/v1/quality-profiles/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        
        if (response.ok) {
          onMessage('Quality profile deleted successfully', 'success');
          loadProfiles();
        } else {
          const error = await response.json();
          onMessage('Failed to delete quality profile: ' + error.message, 'error');
        }
      } catch (error) {
        onMessage('Error deleting quality profile: ' + (error as Error).message, 'error');
      }
    }
  };

  const handleCloneProfile = (profile: QualityProfile) => {
    setFormData({
      name: `${profile.name} (Copy)`,
      upgradeAllowed: profile.upgradeAllowed,
      cutoff: profile.cutoff,
      items: profile.items,
      language: profile.language || 'en',
    });
    setShowCreateForm(true);
  };

  const toggleQualityAllowed = (qualityId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.quality.id === qualityId 
          ? { ...item, allowed: !item.allowed }
          : item
      )
    }));
  };

  const moveQuality = (qualityId: string, direction: 'up' | 'down') => {
    setFormData(prev => {
      const items = [...prev.items];
      const index = items.findIndex(item => item.quality.id === qualityId);
      
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= items.length) return prev;
      
      // Swap items
      [items[index], items[newIndex]] = [items[newIndex], items[index]];
      
      return { ...prev, items };
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      upgradeAllowed: true,
      cutoff: '',
      items: qualities.map(quality => ({
        quality,
        allowed: false
      })),
      language: 'en',
    });
  };

  const initializeForm = () => {
    if (qualities.length > 0 && formData.items.length === 0) {
      resetForm();
    }
  };

  useEffect(() => {
    initializeForm();
  }, [qualities]);

  const getQualityName = (qualityId: string) => {
    const quality = qualities.find(q => q.id === qualityId);
    return quality ? quality.title : qualityId;
  };

  const formatFileSize = (sizeInMB?: number) => {
    if (!sizeInMB) return 'Unlimited';
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(1)} GB`;
    }
    return `${sizeInMB} MB`;
  };

  if (loading) {
    return (
      <div className="settings-section">
        <h3>Quality Profiles</h3>
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-section">
      <div className="section-header">
        <h3>Quality Profiles</h3>
        <button 
          className="btn btn-primary"
          onClick={() => {
            resetForm();
            setShowCreateForm(true);
          }}
        >
          <MdAdd size={20} />
          Add Profile
        </button>
      </div>

      <div className="quality-profiles-info">
        <div className="info-box">
          <MdInfo size={20} />
          <div>
            <p>Quality profiles define which qualities are acceptable for your media and in what order they should be preferred.</p>
            <p><strong>Cutoff:</strong> Once this quality is reached, no further upgrades will be attempted.</p>
            <p><strong>Order:</strong> Higher items in the list are preferred over lower items.</p>
          </div>
        </div>
      </div>

      {/* Create/Edit Form Modal */}
      {(showCreateForm || editingProfile) && (
        <div className="modal-overlay" onClick={() => {
          setShowCreateForm(false);
          setEditingProfile(null);
        }}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4>{editingProfile ? 'Edit Quality Profile' : 'Add Quality Profile'}</h4>
              <button 
                className="btn-close"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingProfile(null);
                }}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label htmlFor="profile-name">Name</label>
                <input
                  type="text"
                  id="profile-name"
                  className="form-input"
                  placeholder="e.g., HD, Ultra HD, Any"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.upgradeAllowed}
                    onChange={(e) => setFormData({ ...formData, upgradeAllowed: e.target.checked })}
                  />
                  <span className="checkbox-text">Upgrade Allowed</span>
                </label>
                <div className="form-help">Allow upgrades to better quality when available</div>
              </div>

              <div className="form-group">
                <label htmlFor="cutoff-quality">Cutoff Quality</label>
                <select
                  id="cutoff-quality"
                  className="form-select"
                  value={formData.cutoff}
                  onChange={(e) => setFormData({ ...formData, cutoff: e.target.value })}
                >
                  <option value="">Select cutoff quality</option>
                  {formData.items
                    .filter(item => item.allowed)
                    .map((item) => (
                      <option key={item.quality.id} value={item.quality.id}>
                        {item.quality.title}
                      </option>
                    ))}
                </select>
                <div className="form-help">Stop upgrading once this quality is reached</div>
              </div>

              <div className="form-group">
                <label>Allowed Qualities</label>
                <div className="qualities-list">
                  <div className="qualities-header">
                    <span>Quality</span>
                    <span>Resolution</span>
                    <span>Size Range</span>
                    <span>Allowed</span>
                    <span>Order</span>
                  </div>
                  
                  {formData.items.map((item, index) => (
                    <div key={item.quality.id} className="quality-item">
                      <div className="quality-info">
                        <strong>{item.quality.title}</strong>
                        <div className="quality-subtitle">{item.quality.source}</div>
                      </div>
                      
                      <div className="quality-resolution">
                        {item.quality.resolution || 'Any'}
                      </div>
                      
                      <div className="quality-size">
                        {formatFileSize(item.quality.minSize)} - {formatFileSize(item.quality.maxSize)}
                      </div>
                      
                      <div className="quality-allowed">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={item.allowed}
                            onChange={() => toggleQualityAllowed(item.quality.id)}
                          />
                          <span className="checkbox-text sr-only">Allow</span>
                        </label>
                      </div>
                      
                      <div className="quality-order">
                        {item.allowed && (
                          <div className="order-controls">
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => moveQuality(item.quality.id, 'up')}
                              disabled={index === 0}
                              title="Move up"
                            >
                              <MdArrowUpward size={14} />
                            </button>
                            <button
                              type="button"
                              className="btn-icon"
                              onClick={() => moveQuality(item.quality.id, 'down')}
                              disabled={index === formData.items.length - 1}
                              title="Move down"
                            >
                              <MdArrowDownward size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setEditingProfile(null);
                }}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  if (editingProfile) {
                    handleUpdateProfile(editingProfile.id, formData);
                  } else {
                    handleCreateProfile();
                  }
                }}
                disabled={!formData.name || !formData.cutoff || formData.items.filter(i => i.allowed).length === 0}
              >
                {editingProfile ? 'Update Profile' : 'Create Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profiles List */}
      <div className="quality-profiles-list">
        {profiles.length === 0 ? (
          <div className="empty-state">
            <p>No quality profiles configured yet.</p>
            <p>Create your first quality profile to define acceptable quality standards.</p>
          </div>
        ) : (
          <div className="profiles-grid">
            {profiles.map((profile) => (
              <div key={profile.id} className="profile-card">
                <div className="profile-header">
                  <div className="profile-info">
                    <h4 className="profile-name">
                      {profile.name}
                      {profile.isDefault && (
                        <span className="default-badge">Default</span>
                      )}
                    </h4>
                    <div className="profile-language">Language: {profile.language || 'English'}</div>
                  </div>
                  
                  <div className="profile-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleCloneProfile(profile)}
                      title="Clone profile"
                    >
                      <MdContentCopy size={16} />
                    </button>
                    <button
                      className="btn-icon"
                      onClick={() => {
                        setEditingProfile(profile);
                        setFormData({
                          name: profile.name,
                          upgradeAllowed: profile.upgradeAllowed,
                          cutoff: profile.cutoff,
                          items: profile.items,
                          language: profile.language || 'en',
                        });
                      }}
                      title="Edit profile"
                    >
                      <MdEdit size={16} />
                    </button>
                    {!profile.isDefault && (
                      <button
                        className="btn-icon danger"
                        onClick={() => handleDeleteProfile(profile.id, profile.name)}
                        title="Delete profile"
                      >
                        <MdDelete size={16} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="profile-settings">
                  <div className="setting-row">
                    <span className="setting-label">Upgrades:</span>
                    <span className={`setting-value ${profile.upgradeAllowed ? 'enabled' : 'disabled'}`}>
                      {profile.upgradeAllowed ? (
                        <>
                          <MdCheckCircle size={14} />
                          Enabled
                        </>
                      ) : (
                        <>
                          <MdCancel size={14} />
                          Disabled
                        </>
                      )}
                    </span>
                  </div>
                  
                  <div className="setting-row">
                    <span className="setting-label">Cutoff:</span>
                    <span className="setting-value">
                      {getQualityName(profile.cutoff)}
                    </span>
                  </div>
                  
                  <div className="setting-row">
                    <span className="setting-label">Qualities:</span>
                    <span className="setting-value">
                      {profile.items.filter(item => item.allowed).length} allowed
                    </span>
                  </div>
                </div>
                
                <div className="profile-qualities">
                  <div className="qualities-preview">
                    {profile.items
                      .filter(item => item.allowed)
                      .slice(0, 4)
                      .map((item, index) => (
                        <div key={item.quality.id} className="quality-tag">
                          {item.quality.title}
                        </div>
                      ))}
                    {profile.items.filter(item => item.allowed).length > 4 && (
                      <div className="quality-tag more">
                        +{profile.items.filter(item => item.allowed).length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}