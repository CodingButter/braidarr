import { TableColumn, ExportOptions } from '../types';

export interface ExportData {
  data: any[];
  columns: TableColumn[];
  options: ExportOptions;
  selectedOnly?: boolean;
  selectedData?: any[];
}

// Convert data to CSV format
export function exportToCSV({ data, columns, options }: ExportData): void {
  const exportData = options.selectedOnly && options.selectedOnly ? data : data;
  const filename = options.filename || 'export.csv';
  
  // Get visible columns only
  const visibleColumns = columns.filter(col => !col.hidden);
  
  // Create CSV content
  let csvContent = '';
  
  // Add headers if requested
  if (options.includeHeaders !== false) {
    const headers = visibleColumns.map(col => `"${col.label}"`);
    csvContent += headers.join(',') + '\n';
  }
  
  // Add data rows
  exportData.forEach(row => {
    const values = visibleColumns.map(col => {
      let value = row[col.key];
      
      // Handle different data types
      if (value === null || value === undefined) {
        return '""';
      }
      
      if (typeof value === 'object') {
        if (value instanceof Date) {
          value = value.toISOString();
        } else if (Array.isArray(value)) {
          value = value.join('; ');
        } else {
          value = JSON.stringify(value);
        }
      }
      
      // Escape quotes and wrap in quotes
      return `"${String(value).replace(/"/g, '""')}"`;
    });
    
    csvContent += values.join(',') + '\n';
  });
  
  // Download file
  downloadFile(csvContent, filename, 'text/csv');
}

// Convert data to JSON format
export function exportToJSON({ data, columns, options }: ExportData): void {
  const exportData = options.selectedOnly ? data : data;
  const filename = options.filename || 'export.json';
  
  // Get visible columns only
  const visibleColumns = columns.filter(col => !col.hidden);
  
  // Create filtered data with only visible columns
  const filteredData = exportData.map(row => {
    const filteredRow: any = {};
    visibleColumns.forEach(col => {
      filteredRow[col.key] = row[col.key];
    });
    return filteredRow;
  });
  
  const jsonContent = JSON.stringify(filteredData, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

// Convert data to Excel format (basic CSV with .xlsx extension)
export function exportToExcel({ data, columns, options }: ExportData): void {
  // For now, export as CSV with Excel-friendly format
  const exportData = options.selectedOnly ? data : data;
  const filename = options.filename?.replace(/\.[^/.]+$/, '') + '.xlsx' || 'export.xlsx';
  
  // Get visible columns only
  const visibleColumns = columns.filter(col => !col.hidden);
  
  // Create Excel-friendly CSV content
  let csvContent = '';
  
  // Add BOM for proper UTF-8 encoding in Excel
  csvContent += '\uFEFF';
  
  // Add headers if requested
  if (options.includeHeaders !== false) {
    const headers = visibleColumns.map(col => col.label);
    csvContent += headers.join('\t') + '\n';
  }
  
  // Add data rows with tab separation for Excel
  exportData.forEach(row => {
    const values = visibleColumns.map(col => {
      let value = row[col.key];
      
      // Handle different data types for Excel
      if (value === null || value === undefined) {
        return '';
      }
      
      if (typeof value === 'object') {
        if (value instanceof Date) {
          value = value.toLocaleDateString();
        } else if (Array.isArray(value)) {
          value = value.join('; ');
        } else {
          value = JSON.stringify(value);
        }
      }
      
      return String(value);
    });
    
    csvContent += values.join('\t') + '\n';
  });
  
  // Download as Excel file
  downloadFile(csvContent, filename, 'application/vnd.ms-excel');
}

// Generic download function
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up the URL object
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 100);
}

// Main export function
export function exportData(format: 'csv' | 'json' | 'excel', exportOptions: ExportData): void {
  switch (format) {
    case 'csv':
      exportToCSV(exportOptions);
      break;
    case 'json':
      exportToJSON(exportOptions);
      break;
    case 'excel':
      exportToExcel(exportOptions);
      break;
    default:
      console.error(`Unsupported export format: ${format}`);
  }
}

// Get export filename with timestamp
export function getTimestampedFilename(baseName: string, extension: string): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `${baseName}_${timestamp}.${extension}`;
}

// Validate export options
export function validateExportOptions(options: ExportOptions): string[] {
  const errors: string[] = [];
  
  if (!options.formats || options.formats.length === 0) {
    errors.push('At least one export format must be specified');
  }
  
  const validFormats = ['csv', 'json', 'excel'];
  const invalidFormats = options.formats.filter(format => !validFormats.includes(format));
  if (invalidFormats.length > 0) {
    errors.push(`Invalid export formats: ${invalidFormats.join(', ')}`);
  }
  
  return errors;
}