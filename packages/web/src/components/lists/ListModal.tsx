import { useState, useEffect } from 'react';
import { 
  ImportList, 
  ListType, 
  SyncFrequency, 
  FilterRule, 
  SourceConnection, 
  ExportTarget,
  CreateListRequest 
} from '../../types/lists';
import { 
  MdClose, 
  MdAdd, 
  MdDelete, 
  MdMovie, 
  MdTv,
  MdSource,
  MdIntegrationInstructions
} from 'react-icons/md';
import './ListModal.css';

interface ListModalProps {
  list?: ImportList | null;
  onSave: (listData: CreateListRequest) => Promise<void>;
  onClose: () => void;
}

// Mock data for available sources and export targets
const availableSources: SourceConnection[] = [
  {
    id: 'tmdb1',
    name: 'TMDB Popular Movies',
    type: 'tmdb',
    enabled: true,
    config: { listType: 'popular', mediaType: 'movie' }
  },
  {
    id: 'tmdb2',
    name: 'TMDB Top Rated Movies',
    type: 'tmdb',
    enabled: true,
    config: { listType: 'top_rated', mediaType: 'movie' }
  },
  {
    id: 'tmdb3',
    name: 'TMDB Popular TV Shows',
    type: 'tmdb',
    enabled: true,
    config: { listType: 'popular', mediaType: 'tv' }
  },
  {
    id: 'trakt1',
    name: 'Trakt Trending Movies',
    type: 'trakt',
    enabled: true,
    config: { listType: 'trending', mediaType: 'movies' }
  },
  {
    id: 'trakt2',
    name: 'Trakt Trending TV Shows',
    type: 'trakt',
    enabled: true,
    config: { listType: 'trending', mediaType: 'shows' }
  },
  {
    id: 'imdb1',
    name: 'IMDB Top 250 Movies',
    type: 'imdb',
    enabled: true,
    config: { listType: 'top250' }
  }
];

const availableExportTargets: ExportTarget[] = [
  {
    id: 'radarr1',
    name: 'Radarr Main',
    type: 'radarr',
    url: 'http://radarr:7878',
    apiKey: 'abc123',
    enabled: true,
    status: 'success'
  },
  {
    id: 'radarr2',
    name: 'Radarr 4K',
    type: 'radarr',
    url: 'http://radarr4k:7878',
    apiKey: 'def456',
    enabled: true,
    status: 'success'
  },
  {
    id: 'sonarr1',
    name: 'Sonarr Main',
    type: 'sonarr',
    url: 'http://sonarr:8989',
    apiKey: 'ghi789',
    enabled: true,
    status: 'success'
  },
  {
    id: 'sonarr2',
    name: 'Sonarr Anime',
    type: 'sonarr',
    url: 'http://sonarr-anime:8989',
    apiKey: 'jkl012',
    enabled: true,
    status: 'success'
  }
];

const ListModal: React.FC<ListModalProps> = ({ list, onSave, onClose }) => {
  const isEditing = !!list;
  
  // Form state
  const [formData, setFormData] = useState({
    name: list?.name || '',
    description: list?.description || '',
    type: list?.type || 'movies' as ListType,
    selectedSources: list?.sources.map(s => s.id) || [],
    syncFrequency: list?.syncFrequency || 'daily' as SyncFrequency,
    autoSync: list?.autoSync || true,
    selectedExportTargets: list?.exportTargets.map(t => t.id) || [],
    autoExport: list?.autoExport || true,
    filterRules: list?.filterRules || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Filter available sources based on selected type
  const filteredSources = availableSources.filter(source => {
    if (formData.type === 'movies') {
      return source.config.mediaType === 'movie' || source.config.mediaType === 'movies';
    } else {
      return source.config.mediaType === 'tv' || source.config.mediaType === 'shows';
    }
  });

  // Filter available export targets based on selected type
  const filteredExportTargets = availableExportTargets.filter(target => {
    if (formData.type === 'movies') {
      return target.type === 'radarr';
    } else {
      return target.type === 'sonarr';
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'List name is required';
    }

    if (formData.selectedSources.length === 0) {
      newErrors.sources = 'At least one source must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const listData: CreateListRequest = {
        name: formData.name,
        description: formData.description || undefined,
        type: formData.type,
        sources: formData.selectedSources,
        filterRules: formData.filterRules,
        syncFrequency: formData.syncFrequency,
        autoSync: formData.autoSync,
        exportTargets: formData.selectedExportTargets,
        autoExport: formData.autoExport
      };

      await onSave(listData);
    } catch (error) {
      console.error('Failed to save list:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSourceToggle = (sourceId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSources: prev.selectedSources.includes(sourceId)
        ? prev.selectedSources.filter(id => id !== sourceId)
        : [...prev.selectedSources, sourceId]
    }));
  };

  const handleExportTargetToggle = (targetId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedExportTargets: prev.selectedExportTargets.includes(targetId)
        ? prev.selectedExportTargets.filter(id => id !== targetId)
        : [...prev.selectedExportTargets, targetId]
    }));
  };

  const addFilterRule = () => {
    const newRule: FilterRule = {
      id: Date.now().toString(),
      type: 'genre',
      operator: 'contains',
      value: ''
    };
    setFormData(prev => ({
      ...prev,
      filterRules: [...prev.filterRules, newRule]
    }));
  };

  const updateFilterRule = (ruleId: string, field: keyof FilterRule, value: any) => {
    setFormData(prev => ({
      ...prev,
      filterRules: prev.filterRules.map(rule =>
        rule.id === ruleId ? { ...rule, [field]: value } : rule
      )
    }));
  };

  const removeFilterRule = (ruleId: string) => {
    setFormData(prev => ({
      ...prev,
      filterRules: prev.filterRules.filter(rule => rule.id !== ruleId)
    }));
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditing ? 'Edit Import List' : 'Create Import List'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            <MdClose size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Basic Information */}
          <section className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  List Name *
                </label>
                <input
                  type="text"
                  className={`form-input ${errors.name ? 'form-input--error' : ''}`}
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter list name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this list"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  List Type *
                </label>
                <div className="type-selector">
                  <button
                    type="button"
                    className={`type-option ${formData.type === 'movies' ? 'type-option--active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'movies', selectedSources: [], selectedExportTargets: [] }))}
                  >
                    <MdMovie size={20} />
                    Movies
                  </button>
                  <button
                    type="button"
                    className={`type-option ${formData.type === 'tv' ? 'type-option--active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, type: 'tv', selectedSources: [], selectedExportTargets: [] }))}
                  >
                    <MdTv size={20} />
                    TV Shows
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sources */}
          <section className="form-section">
            <h3 className="section-title">
              <MdSource size={20} />
              Content Sources *
            </h3>
            {errors.sources && <span className="form-error">{errors.sources}</span>}
            
            <div className="source-grid">
              {filteredSources.map(source => (
                <div
                  key={source.id}
                  className={`source-card ${formData.selectedSources.includes(source.id) ? 'source-card--selected' : ''}`}
                  onClick={() => handleSourceToggle(source.id)}
                >
                  <div className="source-info">
                    <div className="source-name">{source.name}</div>
                    <div className="source-type">{source.type.toUpperCase()}</div>
                  </div>
                  <div className="source-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.selectedSources.includes(source.id)}
                      onChange={() => handleSourceToggle(source.id)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sync Settings */}
          <section className="form-section">
            <h3 className="section-title">Sync Settings</h3>
            
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">
                  Sync Frequency
                </label>
                <select
                  className="form-select"
                  value={formData.syncFrequency}
                  onChange={(e) => setFormData(prev => ({ ...prev, syncFrequency: e.target.value as SyncFrequency }))}
                >
                  <option value="manual">Manual Only</option>
                  <option value="hourly">Every Hour</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.autoSync}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoSync: e.target.checked }))}
                  />
                  <span className="checkbox-label">Enable automatic sync</span>
                </label>
              </div>
            </div>
          </section>

          {/* Export Targets */}
          <section className="form-section">
            <h3 className="section-title">
              <MdIntegrationInstructions size={20} />
              Export to {formData.type === 'movies' ? 'Radarr' : 'Sonarr'}
            </h3>
            
            <div className="export-grid">
              {filteredExportTargets.map(target => (
                <div
                  key={target.id}
                  className={`export-card ${formData.selectedExportTargets.includes(target.id) ? 'export-card--selected' : ''}`}
                  onClick={() => handleExportTargetToggle(target.id)}
                >
                  <div className="export-info">
                    <div className="export-name">{target.name}</div>
                    <div className="export-url">{target.url}</div>
                  </div>
                  <div className="export-checkbox">
                    <input
                      type="checkbox"
                      checked={formData.selectedExportTargets.includes(target.id)}
                      onChange={() => handleExportTargetToggle(target.id)}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.autoExport}
                    onChange={(e) => setFormData(prev => ({ ...prev, autoExport: e.target.checked }))}
                  />
                  <span className="checkbox-label">Automatically export new items</span>
                </label>
              </div>
            </div>
          </section>

          {/* Filter Rules */}
          <section className="form-section">
            <h3 className="section-title">
              Filter Rules
              <button
                type="button"
                className="btn btn--small btn--secondary"
                onClick={addFilterRule}
              >
                <MdAdd size={16} />
                Add Filter
              </button>
            </h3>
            
            {formData.filterRules.length === 0 ? (
              <p className="empty-state">No filters configured. All items from selected sources will be included.</p>
            ) : (
              <div className="filter-rules">
                {formData.filterRules.map((rule) => (
                  <div key={rule.id} className="filter-rule">
                    <select
                      className="form-select form-select--small"
                      value={rule.type}
                      onChange={(e) => updateFilterRule(rule.id, 'type', e.target.value)}
                    >
                      <option value="genre">Genre</option>
                      <option value="rating">Rating</option>
                      <option value="year">Year</option>
                      <option value="language">Language</option>
                      <option value="runtime">Runtime</option>
                    </select>

                    <select
                      className="form-select form-select--small"
                      value={rule.operator}
                      onChange={(e) => updateFilterRule(rule.id, 'operator', e.target.value)}
                    >
                      <option value="equals">Equals</option>
                      <option value="not_equals">Not Equals</option>
                      <option value="greater_than">Greater Than</option>
                      <option value="less_than">Less Than</option>
                      <option value="contains">Contains</option>
                      <option value="not_contains">Not Contains</option>
                    </select>

                    <input
                      type="text"
                      className="form-input form-input--small"
                      value={rule.value as string}
                      onChange={(e) => updateFilterRule(rule.id, 'value', e.target.value)}
                      placeholder="Value"
                    />

                    <button
                      type="button"
                      className="btn btn--icon btn--small btn--danger"
                      onClick={() => removeFilterRule(rule.id)}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </form>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn--primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Saving...' : (isEditing ? 'Update List' : 'Create List')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ListModal;