import { useState, useCallback } from 'react';
import { FilterConfig, TableColumn } from '../types';

interface FilterBarProps<T> {
  filters: FilterConfig;
  onFilterChange: (filters: FilterConfig) => void;
  columns?: TableColumn<T>[];
  statusOptions?: { value: string; label: string }[];
  showDateRange?: boolean;
  showSearch?: boolean;
  showStatus?: boolean;
  className?: string;
}

export function FilterBar<T>({
  filters,
  onFilterChange,
  columns = [],
  statusOptions = [],
  showDateRange = true,
  showSearch = true,
  showStatus = true,
  className = ''
}: FilterBarProps<T>) {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      onFilterChange({
        ...filters,
        search: value || undefined
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [filters, onFilterChange]);

  const handleDateRangeChange = useCallback((field: 'start' | 'end', value: string) => {
    const dateValue = value ? new Date(value) : undefined;
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: dateValue
      }
    });
  }, [filters, onFilterChange]);

  const handleStatusChange = useCallback((status: string, checked: boolean) => {
    const currentStatus = filters.status || [];
    let newStatus: string[];

    if (checked) {
      newStatus = [...currentStatus, status];
    } else {
      newStatus = currentStatus.filter(s => s !== status);
    }

    onFilterChange({
      ...filters,
      status: newStatus.length > 0 ? newStatus : undefined
    });
  }, [filters, onFilterChange]);

  const handleClearFilters = useCallback(() => {
    setSearchValue('');
    onFilterChange({});
  }, [onFilterChange]);

  const hasActiveFilters = !!(
    filters.search ||
    filters.dateRange?.start ||
    filters.dateRange?.end ||
    (filters.status && filters.status.length > 0) ||
    (filters.custom && Object.keys(filters.custom).length > 0)
  );

  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-bar__content">
        {/* Search */}
        {showSearch && (
          <div className="filter-bar__section">
            <div className="search-input">
              <svg className="search-input__icon" width="16" height="16" viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                  fill="currentColor"
                />
              </svg>
              <input
                type="text"
                className="search-input__field"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchValue && (
                <button
                  type="button"
                  className="search-input__clear"
                  onClick={() => handleSearchChange('')}
                  aria-label="Clear search"
                >
                  <svg width="12" height="12" viewBox="0 0 12 12">
                    <path
                      d="M6 4.586L10.293.293a1 1 0 1 1 1.414 1.414L7.414 6l4.293 4.293a1 1 0 0 1-1.414 1.414L6 7.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L4.586 6 .293 1.707A1 1 0 0 1 1.707.293L6 4.586z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Date Range */}
        {showDateRange && (
          <div className="filter-bar__section">
            <div className="date-range-filter">
              <label className="date-range-filter__label">Date Range:</label>
              <div className="date-range-filter__inputs">
                <input
                  type="date"
                  className="date-range-filter__input"
                  value={filters.dateRange?.start ? filters.dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  placeholder="Start date"
                />
                <span className="date-range-filter__separator">to</span>
                <input
                  type="date"
                  className="date-range-filter__input"
                  value={filters.dateRange?.end ? filters.dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => handleDateRangeChange('end', e.target.value)}
                  placeholder="End date"
                />
              </div>
            </div>
          </div>
        )}

        {/* Status Filter */}
        {showStatus && statusOptions.length > 0 && (
          <div className="filter-bar__section">
            <div className="status-filter">
              <label className="status-filter__label">Status:</label>
              <div className="status-filter__options">
                {statusOptions.map(option => (
                  <label key={option.value} className="status-filter__option">
                    <input
                      type="checkbox"
                      className="status-filter__checkbox"
                      checked={filters.status?.includes(option.value) || false}
                      onChange={(e) => handleStatusChange(option.value, e.target.checked)}
                    />
                    <span className="status-filter__option-label">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="filter-bar__actions">
        {hasActiveFilters && (
          <button
            type="button"
            className="filter-bar__clear-btn"
            onClick={handleClearFilters}
          >
            Clear Filters
          </button>
        )}
        
        <div className="filter-bar__active-count">
          {hasActiveFilters && (
            <span className="filter-bar__active-count-text">
              {[
                filters.search && 'Search',
                filters.dateRange?.start && 'Start Date',
                filters.dateRange?.end && 'End Date',
                filters.status?.length && `Status (${filters.status.length})`
              ].filter(Boolean).join(', ')} active
            </span>
          )}
        </div>
      </div>
    </div>
  );
}