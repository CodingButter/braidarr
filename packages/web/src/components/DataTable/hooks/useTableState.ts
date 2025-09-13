import { useState, useMemo, useCallback } from 'react';
import { TableState, SortConfig, FilterConfig, PaginationConfig, SelectionConfig } from '../types';

interface UseTableStateOptions<T> {
  data: T[];
  defaultSort?: SortConfig;
  defaultFilters?: FilterConfig;
  defaultPageSize?: number;
  getRowId?: (row: T) => string | number;
}

export function useTableState<T>({
  data,
  defaultSort,
  defaultFilters = {},
  defaultPageSize = 25,
  getRowId = (row, index) => index
}: UseTableStateOptions<T>) {
  const [sort, setSort] = useState<SortConfig | null>(defaultSort || null);
  const [filters, setFilters] = useState<FilterConfig>(defaultFilters);
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: defaultPageSize,
    total: 0
  });
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  // Filter data based on current filters
  const filteredData = useMemo(() => {
    let result = [...data];

    // Text search
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase();
      result = result.filter(row => {
        return Object.values(row as any).some(value => 
          String(value).toLowerCase().includes(searchTerm)
        );
      });
    }

    // Date range filter
    if (filters.dateRange?.start || filters.dateRange?.end) {
      result = result.filter(row => {
        // This would need to be customized based on your date field
        const dateField = (row as any).createdAt || (row as any).date;
        if (!dateField) return true;
        
        const itemDate = new Date(dateField);
        if (filters.dateRange?.start && itemDate < filters.dateRange.start) return false;
        if (filters.dateRange?.end && itemDate > filters.dateRange.end) return false;
        return true;
      });
    }

    // Status filters
    if (filters.status && filters.status.length > 0) {
      result = result.filter(row => {
        const statusField = (row as any).status;
        return statusField && filters.status!.includes(statusField);
      });
    }

    // Custom filters
    if (filters.custom) {
      Object.entries(filters.custom).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          result = result.filter(row => {
            const fieldValue = (row as any)[key];
            if (Array.isArray(value)) {
              return value.includes(fieldValue);
            }
            return fieldValue === value;
          });
        }
      });
    }

    return result;
  }, [data, filters]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sort) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sort.key];
      const bValue = (b as any)[sort.key];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return sort.direction === 'asc' ? -1 : 1;
      if (bValue == null) return sort.direction === 'asc' ? 1 : -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sort.direction === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sort]);

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, pagination.page, pagination.pageSize]);

  // Update pagination total when filtered data changes
  useMemo(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredData.length
    }));
  }, [filteredData.length]);

  // Handlers
  const handleSort = useCallback((newSort: SortConfig | null) => {
    setSort(newSort);
    // Reset to first page when sorting
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilterChange = useCallback((newFilters: FilterConfig) => {
    setFilters(newFilters);
    // Reset to first page when filtering
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handlePaginationChange = useCallback((newPagination: Partial<PaginationConfig>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const handleSelectionChange = useCallback((newSelection: Set<string | number>) => {
    setSelectedRows(newSelection);
  }, []);

  const getSelectedData = useCallback(() => {
    return sortedData.filter(row => selectedRows.has(getRowId(row)));
  }, [sortedData, selectedRows, getRowId]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  const selectAll = useCallback(() => {
    const allIds = new Set(paginatedData.map(row => getRowId(row)));
    setSelectedRows(allIds);
  }, [paginatedData, getRowId]);

  const isAllSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every(row => selectedRows.has(getRowId(row)));
  }, [paginatedData, selectedRows, getRowId]);

  const isPartiallySelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    const selectedCount = paginatedData.filter(row => selectedRows.has(getRowId(row))).length;
    return selectedCount > 0 && selectedCount < paginatedData.length;
  }, [paginatedData, selectedRows, getRowId]);

  const tableState: TableState<T> = {
    data: paginatedData,
    filteredData,
    loading,
    error,
    sort,
    filters,
    pagination,
    selection: {
      mode: 'multiple',
      selectedRows,
      onSelectionChange: handleSelectionChange,
      getRowId
    }
  };

  return {
    tableState,
    handlers: {
      handleSort,
      handleFilterChange,
      handlePaginationChange,
      handleSelectionChange,
      clearSelection,
      selectAll
    },
    computed: {
      isAllSelected,
      isPartiallySelected,
      selectedData: getSelectedData(),
      hasSelection: selectedRows.size > 0
    },
    setters: {
      setLoading,
      setError
    }
  };
}