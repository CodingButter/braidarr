export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  render?: (value: any, row: T, column: TableColumn<T>) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
  sticky?: boolean;
  hidden?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  search?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
  status?: string[];
  custom?: Record<string, any>;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

export interface SelectionConfig<T = any> {
  mode: 'none' | 'single' | 'multiple';
  selectedRows: Set<string | number>;
  onSelectionChange: (selectedRows: Set<string | number>, selectedData: T[]) => void;
  getRowId: (row: T) => string | number;
}

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'danger' | 'warning' | 'success';
  disabled?: boolean;
  onClick: (selectedRows: any[]) => void;
}

export interface ExportOptions {
  formats: ('csv' | 'json' | 'excel')[];
  filename?: string;
  includeHeaders?: boolean;
  selectedOnly?: boolean;
}

export interface TableState<T = any> {
  data: T[];
  filteredData: T[];
  loading: boolean;
  error?: string;
  sort: SortConfig | null;
  filters: FilterConfig;
  pagination: PaginationConfig;
  selection: SelectionConfig<T>;
}

export interface CellRendererProps<T = any> {
  value: any;
  row: T;
  column: TableColumn<T>;
  rowIndex: number;
  columnIndex: number;
}

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

export interface ProgressBarProps {
  value: number;
  max?: number;
  showText?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  className?: string;
  
  // Sorting
  sortable?: boolean;
  defaultSort?: SortConfig;
  onSort?: (sort: SortConfig | null) => void;
  
  // Filtering
  filterable?: boolean;
  filters?: FilterConfig;
  onFilterChange?: (filters: FilterConfig) => void;
  
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPaginationChange?: (pagination: PaginationConfig) => void;
  
  // Selection
  selectable?: boolean;
  selectionMode?: 'single' | 'multiple';
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selectedRows: Set<string | number>, selectedData: T[]) => void;
  getRowId?: (row: T) => string | number;
  
  // Bulk actions
  bulkActions?: BulkAction[];
  
  // Export
  exportable?: boolean;
  exportOptions?: ExportOptions;
  
  // Responsive
  responsive?: boolean;
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  
  // Customization
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T, index: number) => void;
  onRowDoubleClick?: (row: T, index: number) => void;
  
  // Virtual scrolling
  virtual?: boolean;
  rowHeight?: number;
  containerHeight?: number;
}