import { useState } from 'react';
import { TableColumn, ExportOptions } from '../types';
import { exportData, getTimestampedFilename, validateExportOptions } from '../utils/exportUtils';

interface ExportButtonProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  selectedData?: T[];
  exportOptions: ExportOptions;
  className?: string;
  disabled?: boolean;
}

export function ExportButton<T>({
  data,
  columns,
  selectedData = [],
  exportOptions,
  className = '',
  disabled = false
}: ExportButtonProps<T>) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: 'csv' | 'json' | 'excel') => {
    if (isExporting || disabled) return;

    setIsExporting(true);
    setIsDropdownOpen(false);

    try {
      // Validate export options
      const errors = validateExportOptions(exportOptions);
      if (errors.length > 0) {
        console.error('Export validation errors:', errors);
        return;
      }

      // Determine data to export
      const dataToExport = exportOptions.selectedOnly && selectedData.length > 0 
        ? selectedData 
        : data;

      if (dataToExport.length === 0) {
        alert('No data to export');
        return;
      }

      // Generate filename with timestamp
      const baseFilename = exportOptions.filename || 'table-export';
      const extension = format === 'excel' ? 'xlsx' : format;
      const filename = getTimestampedFilename(baseFilename, extension);

      // Export data
      exportData(format, {
        data: dataToExport,
        columns,
        options: {
          ...exportOptions,
          filename
        }
      });

    } catch (error) {
      console.error('Export error:', error);
      alert('An error occurred during export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const availableFormats = exportOptions.formats || ['csv', 'json'];
  const hasSelection = selectedData.length > 0;

  if (availableFormats.length === 0) {
    return null;
  }

  // Single format - show as direct button
  if (availableFormats.length === 1) {
    const format = availableFormats[0];
    const formatLabels = {
      csv: 'Export CSV',
      json: 'Export JSON', 
      excel: 'Export Excel'
    };

    return (
      <button
        type="button"
        className={`export-button ${className} ${isExporting ? 'export-button--loading' : ''}`}
        onClick={() => handleExport(format)}
        disabled={disabled || isExporting}
      >
        <svg className="export-button__icon" width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M8 1v10M4 7l4 4 4-4M2 13h12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isExporting ? 'Exporting...' : formatLabels[format]}
      </button>
    );
  }

  // Multiple formats - show dropdown
  return (
    <div className={`export-dropdown ${className}`}>
      <button
        type="button"
        className={`export-dropdown__trigger ${isExporting ? 'export-dropdown__trigger--loading' : ''}`}
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={disabled || isExporting}
        aria-haspopup="true"
        aria-expanded={isDropdownOpen}
      >
        <svg className="export-dropdown__icon" width="16" height="16" viewBox="0 0 16 16">
          <path
            d="M8 1v10M4 7l4 4 4-4M2 13h12"
            stroke="currentColor"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {isExporting ? 'Exporting...' : 'Export'}
        <svg
          className={`export-dropdown__arrow ${isDropdownOpen ? 'export-dropdown__arrow--open' : ''}`}
          width="12"
          height="12"
          viewBox="0 0 12 12"
        >
          <path d="M6 8L2 4h8L6 8z" fill="currentColor" />
        </svg>
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="export-dropdown__backdrop"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="export-dropdown__menu">
            {availableFormats.map(format => {
              const formatInfo = {
                csv: { label: 'Export as CSV', icon: '📊' },
                json: { label: 'Export as JSON', icon: '📄' },
                excel: { label: 'Export as Excel', icon: '📈' }
              };

              return (
                <button
                  key={format}
                  type="button"
                  className="export-dropdown__item"
                  onClick={() => handleExport(format)}
                  disabled={isExporting}
                >
                  <span className="export-dropdown__item-icon">
                    {formatInfo[format].icon}
                  </span>
                  <div className="export-dropdown__item-content">
                    <div className="export-dropdown__item-label">
                      {formatInfo[format].label}
                    </div>
                    <div className="export-dropdown__item-desc">
                      {format === 'csv' && 'Comma-separated values file'}
                      {format === 'json' && 'JavaScript Object Notation file'}
                      {format === 'excel' && 'Microsoft Excel spreadsheet'}
                    </div>
                  </div>
                </button>
              );
            })}

            {exportOptions.selectedOnly && (
              <div className="export-dropdown__separator" />
            )}

            {exportOptions.selectedOnly && hasSelection && (
              <div className="export-dropdown__section">
                <div className="export-dropdown__section-title">
                  Export Options
                </div>
                <div className="export-dropdown__section-note">
                  Selected rows only ({selectedData.length} items)
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}